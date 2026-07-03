/**
 * 라이선스 키 오프라인 검증 (Ed25519, @noble/ed25519).
 * WebCrypto에 의존하지 않도록 @noble/hashes의 sha512로 동기 검증을 구성한다.
 *
 * 키 포맷: ISA-<base64url(JSON payload)>-<base64url(signature)>
 * payload: { product: "isa-refund", plan: "premium", issuedTo?: string, exp?: "YYYY-MM-DD" }
 * 서명 대상: base64url(payload) 문자열의 UTF-8 바이트
 */

import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { LICENSE_PUBLIC_KEY_HEX } from './publicKey';
import { LICENSE_PREFIX, PRODUCT_ID } from '../config';

// 동기 검증을 위한 sha512 주입 (WebCrypto 불필요 — 모든 브라우저/환경에서 동작)
ed.etc.sha512Sync = (...m: Uint8Array[]) => sha512(ed.etc.concatBytes(...m));

export interface LicensePayload {
  product: string;
  plan: string;
  issuedTo?: string;
  exp?: string; // YYYY-MM-DD
  issuedAt?: string;
}

export interface VerifyResult {
  ok: boolean;
  payload?: LicensePayload;
  reason?: string;
}

function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function verifyLicense(rawKey: string): VerifyResult {
  const key = rawKey.trim().replace(/\s+/g, '');
  // 주의: base64url 문자열 자체에 '-'가 포함될 수 있으므로 단순 split('-') 금지.
  // Ed25519 서명(64바이트)의 base64url 길이는 항상 86자 — 끝에서 고정 길이로 분리한다.
  const m = key.match(
    new RegExp(`^${LICENSE_PREFIX}-([A-Za-z0-9_-]+)-([A-Za-z0-9_-]{86})$`),
  );
  if (!m) {
    return { ok: false, reason: `키 형식이 올바르지 않습니다. ${LICENSE_PREFIX}- 로 시작하는 전체 키를 빠짐없이 붙여넣으세요.` };
  }
  const [, payloadB64, sigB64] = m;

  let payload: LicensePayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(payloadB64)));
  } catch {
    return { ok: false, reason: '키 본문을 해석할 수 없습니다. 복사가 누락되지 않았는지 확인하세요.' };
  }

  let valid = false;
  try {
    const msg = new TextEncoder().encode(payloadB64);
    valid = ed.verify(b64urlToBytes(sigB64), msg, hexToBytes(LICENSE_PUBLIC_KEY_HEX));
  } catch {
    valid = false;
  }
  if (!valid) return { ok: false, reason: '서명 검증에 실패했습니다. 정식 발급된 키인지 확인하세요.' };

  if (payload.product !== PRODUCT_ID) {
    return { ok: false, reason: '다른 제품의 라이선스 키입니다.' };
  }
  if (payload.exp) {
    const today = new Date().toISOString().slice(0, 10);
    if (today > payload.exp) {
      return { ok: false, reason: `만료된 키입니다 (만료일 ${payload.exp}).` };
    }
  }
  return { ok: true, payload };
}

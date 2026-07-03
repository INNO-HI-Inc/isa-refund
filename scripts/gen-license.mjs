#!/usr/bin/env node
/**
 * 이사정산소 라이선스 키 발급 도구 (Ed25519 오프라인 서명)
 *
 *   node scripts/gen-license.mjs init
 *     → licenses/keypair.json 생성 (gitignore됨)
 *     → 공개키를 src/license/publicKey.ts 에 자동 기록
 *
 *   node scripts/gen-license.mjs issue --to "홍길동" [--exp 2027-12-31] [--plan premium]
 *     → 라이선스 키 1개 출력 (구매자 이메일로 전달)
 *
 * 키 포맷: ISA-<base64url(JSON payload)>-<base64url(signature)>
 * 서명 대상: base64url(payload) 문자열의 UTF-8 바이트
 */

import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KEYPAIR_PATH = path.join(ROOT, 'licenses', 'keypair.json');
const PUBKEY_TS = path.join(ROOT, 'src', 'license', 'publicKey.ts');

const PRODUCT = 'isa-refund';
const PREFIX = 'ISA';

const args = process.argv.slice(2);
const cmd = args[0];

function getFlag(name) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}

function hex(bytes) {
  return Buffer.from(bytes).toString('hex');
}

function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (cmd === 'init') {
  if (existsSync(KEYPAIR_PATH) && !args.includes('--force')) {
    die(
      `이미 키쌍이 존재합니다: ${KEYPAIR_PATH}\n` +
        '  덮어쓰면 기존에 발급한 모든 키가 무효화됩니다. 정말 재생성하려면 --force 를 붙이세요.',
    );
  }
  const priv = ed.utils.randomPrivateKey();
  const pub = ed.getPublicKey(priv);
  mkdirSync(path.dirname(KEYPAIR_PATH), { recursive: true });
  writeFileSync(
    KEYPAIR_PATH,
    JSON.stringify(
      { privateKeyHex: hex(priv), publicKeyHex: hex(pub), createdAt: new Date().toISOString() },
      null,
      2,
    ),
  );

  // src/license/publicKey.ts 갱신
  const ts = readFileSync(PUBKEY_TS, 'utf8');
  const next = ts.replace(/'[0-9a-f]{64}'/, `'${hex(pub)}'`);
  if (next === ts && !ts.includes(hex(pub))) {
    die('publicKey.ts 에서 공개키 상수를 찾지 못했습니다. 파일 형식을 확인하세요.');
  }
  writeFileSync(PUBKEY_TS, next);

  console.log('✓ 키쌍 생성 완료');
  console.log(`  개인키: ${KEYPAIR_PATH}  (절대 커밋/공유 금지 — .gitignore 처리됨)`);
  console.log(`  공개키: ${hex(pub)}`);
  console.log(`  → src/license/publicKey.ts 에 기록했습니다. 앱을 다시 빌드하세요.`);
  process.exit(0);
}

if (cmd === 'issue') {
  if (!existsSync(KEYPAIR_PATH)) {
    die('키쌍이 없습니다. 먼저 실행하세요: node scripts/gen-license.mjs init');
  }
  const { privateKeyHex, publicKeyHex } = JSON.parse(readFileSync(KEYPAIR_PATH, 'utf8'));
  const priv = Uint8Array.from(Buffer.from(privateKeyHex, 'hex'));

  const payload = {
    product: PRODUCT,
    plan: getFlag('plan') ?? 'premium',
    issuedAt: new Date().toISOString().slice(0, 10),
  };
  const to = getFlag('to');
  if (to) payload.issuedTo = to;
  const exp = getFlag('exp');
  if (exp) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(exp)) die('--exp 형식은 YYYY-MM-DD 입니다.');
    payload.exp = exp;
  }

  const payloadB64 = b64url(JSON.stringify(payload));
  const sig = ed.sign(new TextEncoder().encode(payloadB64), priv);
  const key = `${PREFIX}-${payloadB64}-${b64url(sig)}`;

  // 자체 검증 (발급 즉시 공개키로 재확인)
  const ok = ed.verify(sig, new TextEncoder().encode(payloadB64), Uint8Array.from(Buffer.from(publicKeyHex, 'hex')));
  if (!ok) die('자체 검증 실패 — 키쌍 파일이 손상되었을 수 있습니다.');

  console.log('✓ 라이선스 키 발급 완료 (검증 통과)');
  console.log(`  대상: ${to ?? '(무기명)'} · 플랜: ${payload.plan} · 만료: ${exp ?? '없음'}`);
  console.log('\n──────── 아래 한 줄 전체를 구매자에게 전달 ────────\n');
  console.log(key);
  console.log('\n────────────────────────────────────────────────');
  process.exit(0);
}

console.log(`이사정산소 라이선스 도구

사용법:
  node scripts/gen-license.mjs init                          키쌍 생성 + 공개키 소스 반영
  node scripts/gen-license.mjs issue --to "홍길동"           키 발급
  node scripts/gen-license.mjs issue --to "홍길동" --exp 2027-12-31
`);
process.exit(cmd ? 1 : 0);

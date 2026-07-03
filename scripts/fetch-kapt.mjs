#!/usr/bin/env node
/**
 * K-apt 공공데이터 → public/data/ 정적 JSON 재생성 파이프라인
 *
 * 사용하는 공공데이터포털(data.go.kr) API — 2026-07 기준 엔드포인트 실측 확인:
 *
 *  1) 공동주택 단지 목록제공 서비스 (data.go.kr 데이터셋 15057332)
 *     GET https://apis.data.go.kr/1613000/AptListService3/getTotalAptList3
 *     params: serviceKey, pageNo, numOfRows
 *     items: kaptCode, kaptName, as1(시도), as2(시군구), as3(읍면동), as4(리), bjdCode
 *
 *  2) 공동주택 기본 정보제공 서비스 (데이터셋 15058453)
 *     GET https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusBassInfoV4
 *     params: serviceKey, kaptCode
 *     item: kaptAddr, doroJuso, kaptMarea(관리비부과면적㎡), kaptdaCnt(세대수) 등
 *
 *  3) 공동주택관리비(장기수선충당금)정보서비스 (데이터셋 15059160)
 *     GET https://apis.data.go.kr/1613000/AptRepairsCostServiceV2/getHsmpMonthFeeInfoV2
 *     params: serviceKey, kaptCode, searchDate(YYYYMM)
 *     item: kaptCode, kaptName, sLevy(단지 전체 월부과액, 원)
 *
 *  ㎡당 단가 = sLevy ÷ kaptMarea
 *
 * 실행:
 *   DATA_GO_KR_KEY=발급받은키 node scripts/fetch-kapt.mjs [옵션]
 *
 * 옵션:
 *   --sido "서울특별시"   해당 시도만 수집 (기본: 전체)
 *   --limit 300           수집할 단지 수 제한 (기본 300, 0 = 무제한)
 *   --months 24           수집할 최근 개월 수 (기본 24)
 *   --delay 120           API 호출 간격 ms (기본 120)
 *
 * 참고: 단지 1곳당 (1 + months)회 호출. 개발계정 일일 트래픽(10,000회)을 넘지 않게
 *       --sido / --limit 로 나눠서 여러 날에 걸쳐 수집하세요. 기존 샤드는 보존됩니다.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const SHARD_DIR = path.join(DATA_DIR, 'complexes');

const KEY = process.env.DATA_GO_KR_KEY;

if (!KEY) {
  console.log(`
┌─────────────────────────────────────────────────────────────┐
│  DATA_GO_KR_KEY 환경변수가 설정되어 있지 않습니다.           │
└─────────────────────────────────────────────────────────────┘

전국 실데이터를 채우려면 (무료, 10분 소요):

  1. https://www.data.go.kr 회원가입 후 로그인
  2. 아래 3개 API를 각각 검색해서 [활용신청] (자동 즉시승인)
     · 공동주택 단지 목록제공 서비스
     · 공동주택 기본 정보제공 서비스
     · 공동주택관리비(장기수선충당금)정보서비스
  3. 마이페이지에서 일반 인증키(Decoding) 복사
  4. 실행:
     DATA_GO_KR_KEY="발급키" node scripts/fetch-kapt.mjs --sido "서울특별시"

키를 GitHub 저장소 Secrets(DATA_GO_KR_KEY)에 넣으면 매월 1일
자동으로 데이터가 갱신됩니다 (.github/workflows/refresh-data.yml).

지금은 번들된 샘플 데이터로 앱이 동작합니다.
`);
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : dflt;
};

const SIDO = flag('sido', '');
const LIMIT = parseInt(flag('limit', '300'), 10);
const MONTHS = parseInt(flag('months', '24'), 10);
const DELAY = parseInt(flag('delay', '120'), 10);

const BASE = 'https://apis.data.go.kr/1613000';
const EP = {
  list: `${BASE}/AptListService3/getTotalAptList3`,
  basis: `${BASE}/AptBasisInfoServiceV4/getAphusBassInfoV4`,
  levy: `${BASE}/AptRepairsCostServiceV2/getHsmpMonthFeeInfoV2`,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** serviceKey가 이미 URL 인코딩된 형태(%2B 등 포함)면 그대로, 아니면 인코딩 */
const keyParam = KEY.includes('%') ? KEY : encodeURIComponent(KEY);

async function call(url, params, attempt = 0) {
  const qs = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  const full = `${url}?serviceKey=${keyParam}&${qs}`;
  try {
    const res = await fetch(full, { headers: { Accept: 'application/json' } });
    const text = await res.text();
    return parseResponse(text);
  } catch (e) {
    if (attempt < 2) {
      await sleep(800 * (attempt + 1));
      return call(url, params, attempt + 1);
    }
    throw e;
  }
}

/** JSON 우선, XML 응답도 허용하는 관용 파서 */
function parseResponse(text) {
  const t = text.trim();
  if (t.startsWith('{')) {
    const j = JSON.parse(t);
    return j.response ?? j;
  }
  if (t.startsWith('<')) {
    // 게이트웨이 오류 응답 (OpenAPI_ServiceResponse)
    const errCode = pick(t, 'returnReasonCode') || pick(t, 'resultCode');
    const errMsg = pick(t, 'returnAuthMsg') || pick(t, 'errMsg') || pick(t, 'resultMsg');
    if (t.includes('OpenAPI_ServiceResponse')) {
      throw new Error(`API 게이트웨이 오류 [${errCode}] ${errMsg} — 키/활용신청 상태를 확인하세요.`);
    }
    // 정상 XML 응답을 최소 파싱
    const header = { resultCode: pick(t, 'resultCode'), resultMsg: pick(t, 'resultMsg') };
    const items = [...t.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => xmlObj(m[1]));
    return {
      header,
      body: {
        items: items.length ? items : undefined,
        item: items.length === 1 ? items[0] : undefined,
        totalCount: Number(pick(t, 'totalCount') || 0),
      },
    };
  }
  throw new Error(`해석할 수 없는 응답: ${t.slice(0, 120)}`);
}

function pick(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : '';
}

function xmlObj(inner) {
  const obj = {};
  for (const m of inner.matchAll(/<(\w+)>([\s\S]*?)<\/\1>/g)) obj[m[1]] = m[2].trim();
  return obj;
}

/** JSON/XML 모두에서 단일 item 꺼내기 (body.item 또는 body.items.item 형태 허용) */
function getItem(resp) {
  const body = resp?.body ?? {};
  if (body.item && !Array.isArray(body.item)) return body.item;
  if (Array.isArray(body.item)) return body.item[0];
  const it = body.items?.item ?? body.items;
  if (Array.isArray(it)) return it[0];
  if (it && typeof it === 'object') return it;
  return {};
}

function assertOk(resp, label) {
  const code = resp?.header?.resultCode;
  if (code !== undefined && String(code) !== '00' && String(code) !== '0') {
    throw new Error(`${label} 실패 [${code}] ${resp?.header?.resultMsg ?? ''}`);
  }
}

function lastMonths(n) {
  const out = [];
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1); // 지난달부터 (당월 데이터는 아직 미공개)
  for (let i = 0; i < n; i++) {
    out.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

async function fetchAllComplexes() {
  const rows = 1000;
  let page = 1;
  let total = Infinity;
  const all = [];
  while ((page - 1) * rows < total) {
    const resp = await call(EP.list, { pageNo: page, numOfRows: rows });
    assertOk(resp, '단지 목록 조회');
    const body = resp.body ?? {};
    total = Number(body.totalCount ?? 0);
    let items = body.items ?? [];
    if (!Array.isArray(items)) items = items.item ? [items.item].flat() : [];
    all.push(...items);
    process.stdout.write(`\r단지 목록 수집 중… ${all.length}/${total}`);
    page += 1;
    await sleep(DELAY);
  }
  console.log('');
  return all;
}

async function main() {
  console.log(`\nK-apt 데이터 파이프라인 시작 (sido=${SIDO || '전체'}, limit=${LIMIT || '무제한'}, months=${MONTHS})\n`);
  mkdirSync(SHARD_DIR, { recursive: true });

  let complexes = await fetchAllComplexes();
  if (SIDO) complexes = complexes.filter((c) => (c.as1 ?? '').includes(SIDO));
  console.log(`대상 단지: ${complexes.length}곳${SIDO ? ` (${SIDO})` : ''}`);

  // 이미 실데이터 샤드가 있는 단지는 뒤로 미뤄 신규 우선 수집
  const existing = new Set(
    readdirSync(SHARD_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, '')),
  );
  complexes.sort((a, b) => (existing.has(a.kaptCode) ? 1 : 0) - (existing.has(b.kaptCode) ? 1 : 0));
  if (LIMIT > 0) complexes = complexes.slice(0, LIMIT);

  const months = lastMonths(MONTHS);
  let written = 0;
  let skipped = 0;
  let failed = 0;

  for (const [i, c] of complexes.entries()) {
    const tag = `[${i + 1}/${complexes.length}] ${c.kaptName} (${c.kaptCode})`;
    try {
      const basisResp = await call(EP.basis, { kaptCode: c.kaptCode });
      assertOk(basisResp, '기본정보');
      const info = getItem(basisResp);
      const marea = Number(info.kaptMarea ?? 0);
      await sleep(DELAY);

      if (!marea || marea <= 0) {
        skipped += 1;
        console.log(`${tag} — 관리비부과면적 없음, 건너뜀`);
        continue;
      }

      const rates = {};
      for (const ym of months) {
        try {
          const levyResp = await call(EP.levy, { kaptCode: c.kaptCode, searchDate: ym });
          assertOk(levyResp, '장충금');
          const item = getItem(levyResp);
          const sLevy = Number(item.sLevy ?? 0);
          if (sLevy > 0) {
            const key = `${ym.slice(0, 4)}-${ym.slice(4)}`;
            rates[key] = Math.round((sLevy / marea) * 10) / 10; // 원/㎡, 소수 1자리
          }
        } catch {
          /* 해당 월 데이터 없음 — 무시 */
        }
        await sleep(DELAY);
      }

      if (Object.keys(rates).length === 0) {
        skipped += 1;
        console.log(`${tag} — 장충금 공개 데이터 없음, 건너뜀`);
        continue;
      }

      const shard = {
        kaptCode: c.kaptCode,
        kaptName: c.kaptName,
        addr: info.doroJuso || info.kaptAddr || [c.as1, c.as2, c.as3, c.as4].filter(Boolean).join(' '),
        source: 'kapt',
        updatedAt: new Date().toISOString().slice(0, 10),
        marea,
        rates,
      };
      writeFileSync(path.join(SHARD_DIR, `${c.kaptCode}.json`), JSON.stringify(shard));
      written += 1;
      console.log(`${tag} — ✓ ${Object.keys(rates).length}개월 수집`);
    } catch (e) {
      failed += 1;
      console.log(`${tag} — ✗ ${e.message}`);
      if (failed > 20 && written === 0) {
        console.error('\n연속 실패가 많습니다. 서비스키·활용신청 상태를 확인하세요.');
        process.exit(1);
      }
    }
  }

  rebuildIndex();
  console.log(`\n완료: 신규/갱신 ${written}곳, 건너뜀 ${skipped}곳, 실패 ${failed}곳`);
}

/** public/data/complexes/*.json 을 스캔해 검색 인덱스 재생성 (샘플 샤드 포함) */
function rebuildIndex() {
  const files = readdirSync(SHARD_DIR).filter((f) => f.endsWith('.json'));
  const complexes = [];
  for (const f of files) {
    try {
      const d = JSON.parse(readFileSync(path.join(SHARD_DIR, f), 'utf8'));
      complexes.push({ code: d.kaptCode, name: d.kaptName, addr: d.addr, src: d.source });
    } catch {
      /* 손상 파일 무시 */
    }
  }
  // 실데이터 우선, 이름순
  complexes.sort((a, b) => (a.src === b.src ? a.name.localeCompare(b.name, 'ko') : a.src === 'kapt' ? -1 : 1));
  const index = {
    generatedAt: new Date().toISOString(),
    note: 'src=sample 항목은 실측이 아닌 예시 단가입니다.',
    complexes,
  };
  writeFileSync(path.join(DATA_DIR, 'index.json'), JSON.stringify(index));
  console.log(`index.json 재생성: 총 ${complexes.length}개 단지 (실데이터 ${complexes.filter((c) => c.src === 'kapt').length})`);
}

main().catch((e) => {
  console.error(`\n치명적 오류: ${e.message}`);
  process.exit(1);
});

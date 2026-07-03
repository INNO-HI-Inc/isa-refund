/** 정적 JSON 데이터 로더 (public/data/) */

import type { RateTable } from './calc';

export interface ComplexIndexItem {
  code: string;
  name: string;
  addr: string;
  src: 'sample' | 'kapt';
}

export interface ComplexIndex {
  generatedAt: string;
  note?: string;
  complexes: ComplexIndexItem[];
}

export interface ComplexDetail {
  kaptCode: string;
  kaptName: string;
  addr: string;
  source: 'sample' | 'kapt';
  updatedAt: string;
  /** 관리비부과면적(㎡) — K-apt 기본정보의 kaptMarea */
  marea?: number;
  /** "YYYY-MM" → 원/㎡ 월 단가 */
  rates: RateTable;
}

const base = import.meta.env.BASE_URL; // './'

let indexCache: ComplexIndex | null = null;

export async function loadIndex(): Promise<ComplexIndex> {
  if (indexCache) return indexCache;
  const res = await fetch(`${base}data/index.json`);
  if (!res.ok) throw new Error(`index.json 로드 실패 (${res.status})`);
  indexCache = (await res.json()) as ComplexIndex;
  return indexCache;
}

const detailCache = new Map<string, ComplexDetail>();

export async function loadComplex(code: string): Promise<ComplexDetail> {
  const hit = detailCache.get(code);
  if (hit) return hit;
  const res = await fetch(`${base}data/complexes/${encodeURIComponent(code)}.json`);
  if (!res.ok) throw new Error(`단지 데이터 로드 실패 (${res.status})`);
  const d = (await res.json()) as ComplexDetail;
  detailCache.set(code, d);
  return d;
}

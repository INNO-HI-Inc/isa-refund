/** 표시 포맷 유틸 */

export function won(n: number): string {
  return `${Math.round(n).toLocaleString('ko-KR')}원`;
}

export function comma(n: number): string {
  return Math.round(n).toLocaleString('ko-KR');
}

export const PYEONG = 3.305785; // 1평 = 3.305785㎡

export function pyeongToM2(p: number): number {
  return Math.round(p * PYEONG * 100) / 100;
}

export function m2ToPyeong(m2: number): number {
  return Math.round((m2 / PYEONG) * 10) / 10;
}

/** "YYYY-MM-DD" → "2024년 3월 15일" */
export function dateKo(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${y}년 ${m}월 ${d}일`;
}

/** "YYYY-MM" → "2024년 3월" */
export function ymKo(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return `${y}년 ${m}월`;
}

/** 거주기간을 "2년 3개월" 형태로 */
export function durationKo(moveIn: string, moveOut: string): string {
  const a = new Date(moveIn);
  const b = new Date(moveOut);
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() >= a.getDate()) months += 1; // 진행 중인 달 포함(체감 기간)
  if (months < 1) months = 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y > 0 && m > 0) return `약 ${y}년 ${m}개월`;
  if (y > 0) return `약 ${y}년`;
  return `약 ${m}개월`;
}

export function todayISO(): string {
  const d = new Date();
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

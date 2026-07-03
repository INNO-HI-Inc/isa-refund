/**
 * 장기수선충당금 환급액 계산 엔진.
 *
 * - 데이터 모드: 단지의 월별 ㎡당 부과 단가 × 전용면적 × 거주 개월(일할계산 포함)
 * - 수동 모드: 관리비 고지서의 월 장기수선충당금 금액 × 거주 개월(일할계산 포함)
 *
 * 데이터에 없는 달은 가장 가까운 달의 단가로 추정하고 estimated로 표시한다.
 */

export interface RateTable {
  /** "YYYY-MM" → 원/㎡ (월 단가) */
  [ym: string]: number;
}

export interface MonthRow {
  ym: string; // "YYYY-MM"
  occupiedDays: number;
  daysInMonth: number;
  /** 해당 월 만액 기준 금액 (원) */
  monthlyFull: number;
  /** 일할계산 반영 금액 (원) */
  amount: number;
  /** 단가가 데이터에 없어 인접 월 단가로 추정했는지 */
  estimated: boolean;
  /** 데이터 모드일 때 적용 단가 (원/㎡) */
  rate?: number;
}

export interface CalcResult {
  total: number;
  rows: MonthRow[];
  totalDays: number;
  monthCount: number;
  avgMonthly: number;
  estimatedMonths: number;
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate(); // m: 1~12
}

function ymKey(y: number, m: number): string {
  return `${y}-${String(m).padStart(2, '0')}`;
}

/** 데이터에 없는 달이면 가장 가까운 달의 단가를 반환 */
function nearestRate(rates: RateTable, ym: string): { rate: number; exact: boolean } | null {
  if (rates[ym] !== undefined) return { rate: rates[ym], exact: true };
  const keys = Object.keys(rates).sort();
  if (keys.length === 0) return null;
  let best = keys[0];
  let bestDist = Infinity;
  const target = ymToNum(ym);
  for (const k of keys) {
    const d = Math.abs(ymToNum(k) - target);
    if (d < bestDist) {
      bestDist = d;
      best = k;
    }
  }
  return { rate: rates[best], exact: false };
}

function ymToNum(ym: string): number {
  const [y, m] = ym.split('-').map(Number);
  return y * 12 + (m - 1);
}

export interface CalcParams {
  moveIn: string; // YYYY-MM-DD
  moveOut: string; // YYYY-MM-DD (퇴거예정일, 해당일 포함)
  mode: 'data' | 'manual';
  /** 데이터 모드: 전용면적 ㎡ */
  areaM2?: number;
  /** 데이터 모드: 월별 단가표 */
  rates?: RateTable;
  /** 수동 모드: 고지서상 월 장기수선충당금 (원) */
  manualMonthly?: number;
}

export function calculate(p: CalcParams): CalcResult {
  const start = new Date(p.moveIn + 'T00:00:00');
  const end = new Date(p.moveOut + 'T00:00:00');
  const rows: MonthRow[] = [];
  let total = 0;
  let totalDays = 0;
  let estimatedMonths = 0;

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return { total: 0, rows: [], totalDays: 0, monthCount: 0, avgMonthly: 0, estimatedMonths: 0 };
  }

  let y = start.getFullYear();
  let m = start.getMonth() + 1;
  const endY = end.getFullYear();
  const endM = end.getMonth() + 1;

  while (y < endY || (y === endY && m <= endM)) {
    const dim = daysInMonth(y, m);
    const from = y === start.getFullYear() && m === start.getMonth() + 1 ? start.getDate() : 1;
    const to = y === endY && m === endM ? end.getDate() : dim;
    const occupied = to - from + 1;
    const ym = ymKey(y, m);

    let monthlyFull = 0;
    let estimated = false;
    let rate: number | undefined;

    if (p.mode === 'manual') {
      monthlyFull = p.manualMonthly ?? 0;
    } else {
      const found = p.rates ? nearestRate(p.rates, ym) : null;
      if (found) {
        rate = found.rate;
        estimated = !found.exact;
        monthlyFull = found.rate * (p.areaM2 ?? 0);
      }
    }

    const amount = Math.round((monthlyFull * occupied) / dim);
    if (estimated) estimatedMonths += 1;
    total += amount;
    totalDays += occupied;
    rows.push({ ym, occupiedDays: occupied, daysInMonth: dim, monthlyFull: Math.round(monthlyFull), amount, estimated, rate });

    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }

  return {
    total,
    rows,
    totalDays,
    monthCount: rows.length,
    avgMonthly: rows.length ? Math.round(total / rows.length) : 0,
    estimatedMonths,
  };
}

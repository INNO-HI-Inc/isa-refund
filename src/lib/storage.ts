/** localStorage 저장/복원 (모든 입력·결과 유지) */

export interface CalcState {
  mode: 'data' | 'manual';
  complex?: { code: string; name: string; addr: string; src: 'sample' | 'kapt' };
  manualName?: string;
  manualMonthly?: number;
  areaM2?: number;
  areaUnit: 'm2' | 'py';
  moveIn: string;
  moveOut: string;
  savedAt?: string;
}

const KEY = {
  calc: 'isa:calc',
  docs: 'isa:docs',
  checklist: 'isa:checklist',
};

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 저장 불가 환경 무시 */
  }
}

export function loadCalcState(): CalcState | null {
  return read<CalcState>(KEY.calc);
}

export function saveCalcState(s: CalcState): void {
  write(KEY.calc, { ...s, savedAt: new Date().toISOString() });
}

export interface DocFields {
  senderName: string;
  senderAddr: string;
  senderPhone: string;
  receiverName: string;
  receiverAddr: string;
  aptLabel: string; // 단지·동호수
  leaseFrom: string;
  leaseTo: string;
  amount: number;
  dueDate: string;
  bank: string;
}

export function loadDocFields(): Partial<DocFields> {
  return read<Partial<DocFields>>(KEY.docs) ?? {};
}

export function saveDocFields(f: Partial<DocFields>): void {
  write(KEY.docs, { ...loadDocFields(), ...f });
}

export function loadChecklist(): Record<string, boolean> {
  return read<Record<string, boolean>>(KEY.checklist) ?? {};
}

export function saveChecklist(v: Record<string, boolean>): void {
  write(KEY.checklist, v);
}

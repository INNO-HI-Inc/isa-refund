import { useEffect, useState } from 'react';
import { loadDocFields, saveDocFields, type DocFields } from './storage';
import { todayISO } from './format';

const DEFAULTS: DocFields = {
  senderName: '',
  senderAddr: '',
  senderPhone: '',
  receiverName: '',
  receiverAddr: '',
  aptLabel: '',
  leaseFrom: '',
  leaseTo: '',
  amount: 0,
  dueDate: '',
  bank: '',
};

/** 서류 공통 입력값 (localStorage 자동 저장/복원) */
export function useDocFields() {
  const [f, setF] = useState<DocFields>(() => {
    const stored = loadDocFields();
    const merged = { ...DEFAULTS, ...stored };
    if (!merged.dueDate) {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      merged.dueDate = d.toISOString().slice(0, 10);
    }
    return merged;
  });

  useEffect(() => {
    saveDocFields(f);
  }, [f]);

  const set = <K extends keyof DocFields>(key: K, value: DocFields[K]) =>
    setF((prev) => ({ ...prev, [key]: value }));

  return { f, set, today: todayISO() };
}

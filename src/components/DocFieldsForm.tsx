import type { DocFields } from '../lib/storage';

/** 내용증명/지급명령 공통 입력 폼 */
export default function DocFieldsForm({
  f,
  set,
  withDue = true,
}: {
  f: DocFields;
  set: <K extends keyof DocFields>(key: K, value: DocFields[K]) => void;
  withDue?: boolean;
}) {
  return (
    <div className="card card-pad no-print" style={{ marginTop: 18 }}>
      <div style={{ display: 'grid', gap: 0, gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', columnGap: 14 }}>
        <div className="field">
          <label className="field-label">발신인(세입자) 이름</label>
          <input className="input" value={f.senderName} onChange={(e) => set('senderName', e.target.value)} placeholder="홍길동" />
        </div>
        <div className="field">
          <label className="field-label">발신인 연락처</label>
          <input className="input num" value={f.senderPhone} onChange={(e) => set('senderPhone', e.target.value)} placeholder="010-0000-0000" inputMode="tel" />
        </div>
      </div>
      <div className="field">
        <label className="field-label">발신인 현재 주소</label>
        <input className="input" value={f.senderAddr} onChange={(e) => set('senderAddr', e.target.value)} placeholder="이사 온 곳 주소" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', columnGap: 14 }}>
        <div className="field">
          <label className="field-label">수신인(집주인) 이름</label>
          <input className="input" value={f.receiverName} onChange={(e) => set('receiverName', e.target.value)} placeholder="김소유" />
        </div>
        <div className="field">
          <label className="field-label">임차했던 곳 (단지·동호수)</label>
          <input className="input" value={f.aptLabel} onChange={(e) => set('aptLabel', e.target.value)} placeholder="○○아파트 101동 1001호" />
        </div>
      </div>
      <div className="field">
        <label className="field-label">수신인 주소</label>
        <input className="input" value={f.receiverAddr} onChange={(e) => set('receiverAddr', e.target.value)} placeholder="집주인 주소 (계약서 기재 주소)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', columnGap: 14 }}>
        <div className="field">
          <label className="field-label">임대차 시작일</label>
          <input type="date" className="input num" value={f.leaseFrom} onChange={(e) => set('leaseFrom', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">임대차 종료일</label>
          <input type="date" className="input num" value={f.leaseTo} onChange={(e) => set('leaseTo', e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', columnGap: 14 }}>
        <div className="field" style={{ marginBottom: withDue ? 22 : 8 }}>
          <label className="field-label">청구 금액 (원)</label>
          <input
            className="input num"
            inputMode="numeric"
            value={f.amount ? f.amount.toLocaleString('ko-KR') : ''}
            onChange={(e) => set('amount', parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
            placeholder="계산 결과가 자동 입력돼요"
          />
        </div>
        {withDue && (
          <div className="field">
            <label className="field-label">지급 기한</label>
            <input type="date" className="input num" value={f.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
          </div>
        )}
      </div>
      <div className="field" style={{ marginBottom: 4 }}>
        <label className="field-label">입금 계좌 (선택)</label>
        <input className="input" value={f.bank} onChange={(e) => set('bank', e.target.value)} placeholder="○○은행 000-0000-0000 (예금주 홍길동)" />
      </div>
    </div>
  );
}

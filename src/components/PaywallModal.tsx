import { useState } from 'react';
import { PAYMENT_LINK, PREMIUM_PRICE } from '../config';
import { useLicense } from '../license/LicenseContext';
import { comma } from '../lib/format';

/** 구매 안내 + 라이선스 키 입력 모달 */
export default function PaywallModal({ onClose }: { onClose: () => void }) {
  const { activate } = useLicense();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const tryActivate = () => {
    const r = activate(key);
    if (r.ok) {
      setDone(true);
      setError('');
      setTimeout(onClose, 900);
    } else {
      setError(r.reason ?? '키를 확인할 수 없습니다.');
    }
  };

  return (
    <div className="modal-veil no-print" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="badge badge-blue">프리미엄 · 서류 패키지</span>
            <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', margin: '12px 0 4px' }}>
              돌려받는 데 필요한 서류,
              <br />한 번에 전부
            </h3>
            <p style={{ fontSize: 14, color: 'var(--ink-500)' }}>
              1회 구매 · 기기당 평생 사용 · 라이선스 키 방식
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div style={{ margin: '20px 0 6px', display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="num" style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em' }}>
            {comma(PREMIUM_PRICE)}원
          </span>
          <span style={{ fontSize: 13, color: 'var(--ink-400)' }}>부가세 포함 · 1회 결제</span>
        </div>

        <table className="cmp" style={{ margin: '14px 0 20px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>기능</th>
              <th>무료</th>
              <th style={{ color: 'var(--blue)' }}>프리미엄</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>환급액 계산 + 월별 내역</td>
              <td className="yes">✓</td>
              <td className="yes">✓</td>
            </tr>
            <tr>
              <td>집주인에게 보낼 문자 템플릿</td>
              <td className="yes">✓</td>
              <td className="yes">✓</td>
            </tr>
            <tr>
              <td>내용증명 (완성본 + 인쇄/PDF)</td>
              <td className="no">—</td>
              <td className="yes">✓</td>
            </tr>
            <tr>
              <td>지급명령 신청서 초안</td>
              <td className="no">—</td>
              <td className="yes">✓</td>
            </tr>
            <tr>
              <td>이사 정산 종합 체크리스트</td>
              <td className="no">—</td>
              <td className="yes">✓</td>
            </tr>
          </tbody>
        </table>

        <a className="btn btn-primary btn-lg btn-full" href={PAYMENT_LINK}>
          구매하기 — {comma(PREMIUM_PRICE)}원
        </a>
        <p style={{ fontSize: 12.5, color: 'var(--ink-400)', textAlign: 'center', marginTop: 10 }}>
          결제 확인 후 이메일로 라이선스 키를 보내드립니다.
        </p>

        <div style={{ borderTop: '1px solid var(--ink-50)', marginTop: 22, paddingTop: 20 }}>
          <label className="field-label" htmlFor="pw-license">이미 키가 있으신가요?</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="pw-license"
              className="input"
              style={{ height: 46, fontSize: 14 }}
              placeholder="ISA-…"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              spellCheck={false}
            />
            <button className="btn btn-line btn-md" style={{ flexShrink: 0 }} onClick={tryActivate}>
              등록
            </button>
          </div>
          {error && <p style={{ fontSize: 13, color: 'var(--red)', marginTop: 8 }}>{error}</p>}
          {done && <p style={{ fontSize: 13, color: 'var(--green)', marginTop: 8 }}>프리미엄이 활성화되었습니다.</p>}
        </div>
      </div>
    </div>
  );
}

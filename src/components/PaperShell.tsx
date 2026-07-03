import { useState, type ReactNode } from 'react';
import PaywallModal from './PaywallModal';
import { useLicense } from '../license/LicenseContext';
import { comma } from '../lib/format';
import { PREMIUM_PRICE } from '../config';

/**
 * 서류 미리보기 래퍼.
 * 무료 사용자: 흐림 처리 + 잠금 안내. 프리미엄: 선명한 문서 + 인쇄/PDF 버튼.
 */
export default function PaperShell({ children, docName }: { children: ReactNode; docName: string }) {
  const { licensed } = useLicense();
  const [paywall, setPaywall] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 12px' }} className="no-print">
        <span className="badge badge-gray">미리보기</span>
        <button
          className="btn btn-primary btn-md"
          onClick={() => {
            if (licensed) window.print();
            else setPaywall(true);
          }}
        >
          {licensed ? '인쇄 / PDF 저장' : '잠금 해제하고 인쇄'}
        </button>
      </div>

      <div className="paper-frame">
        <div className={`paper ${licensed ? '' : 'paper-locked'}`} aria-hidden={!licensed}>
          {children}
        </div>
        {!licensed && (
          <div className="lock-veil no-print">
            <div className="lock-card">
              <div style={{ fontSize: 28 }}>🔒</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: '8px 0 6px', letterSpacing: '-0.02em' }}>
                {docName} 완성본은
                <br />프리미엄에서 열려요
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.6, marginBottom: 16 }}>
                입력한 내용이 그대로 반영된 문서를
                <br />
                인쇄·PDF로 저장할 수 있어요.
              </p>
              <button className="btn btn-primary btn-md btn-full" onClick={() => setPaywall(true)}>
                {comma(PREMIUM_PRICE)}원에 전체 서류 잠금해제
              </button>
            </div>
          </div>
        )}
      </div>

      {paywall && <PaywallModal onClose={() => setPaywall(false)} />}
    </>
  );
}

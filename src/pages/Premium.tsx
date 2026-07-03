import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLicense } from '../license/LicenseContext';
import { PAYMENT_LINK, PREMIUM_PRICE, CONTACT_EMAIL } from '../config';
import { comma } from '../lib/format';

export default function Premium() {
  const { licensed, payload, activate, deactivate } = useLicense();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  const tryActivate = () => {
    const r = activate(key);
    if (r.ok) {
      setOk(true);
      setError('');
      setKey('');
    } else {
      setOk(false);
      setError(r.reason ?? '키를 확인할 수 없습니다.');
    }
  };

  return (
    <div className="container">
      <div style={{ padding: '40px 0 10px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>프리미엄 — 서류 패키지</h1>
        <p style={{ fontSize: 14.5, color: 'var(--ink-500)', marginTop: 8 }}>
          계산은 평생 무료. 서류가 필요할 때만 한 번 결제하세요.
        </p>
      </div>

      {licensed ? (
        <div className="card card-pad fade-in" style={{ borderColor: 'var(--green)', marginBottom: 20 }}>
          <span className="badge badge-green">활성화됨</span>
          <h2 style={{ fontSize: 19, fontWeight: 800, margin: '10px 0 4px' }}>
            프리미엄을 이용 중입니다{payload?.issuedTo ? ` — ${payload.issuedTo}님` : ''}
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--ink-500)', marginBottom: 16 }}>
            내용증명, 지급명령 신청서, 전체 체크리스트와 인쇄/PDF 저장이 모두 열려 있어요.
            {payload?.exp ? ` (만료일 ${payload.exp})` : ' (기간 제한 없음)'}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to="/docs" className="btn btn-primary btn-md">서류 만들러 가기</Link>
            <button className="btn btn-ghost btn-md" onClick={deactivate}>이 기기에서 키 제거</button>
          </div>
        </div>
      ) : (
        <>
          <div className="card fade-in" style={{ overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '26px 24px 20px', background: 'linear-gradient(135deg,#0e3f92,#1b64da)', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span className="num" style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em' }}>
                  {comma(PREMIUM_PRICE)}원
                </span>
                <span style={{ fontSize: 13, opacity: 0.8 }}>1회 결제 · 기간 제한 없음</span>
              </div>
              <p style={{ fontSize: 13.5, opacity: 0.85, marginTop: 6 }}>
                내용증명 우체국 발송비 몇 번이면 나오는 금액. 변호사 없이 서류를 완성하세요.
              </p>
            </div>
            <div style={{ padding: '8px 16px 16px' }}>
              <table className="cmp">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>기능</th>
                    <th>무료</th>
                    <th style={{ color: 'var(--blue)' }}>프리미엄</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>환급액 계산 (데이터/수동)</td><td className="yes">✓</td><td className="yes">✓</td></tr>
                  <tr><td>월별 산출 내역 · 법적 근거</td><td className="yes">✓</td><td className="yes">✓</td></tr>
                  <tr><td>집주인 문자 템플릿</td><td className="yes">✓</td><td className="yes">✓</td></tr>
                  <tr><td>내용증명 완성본</td><td className="no">흐림</td><td className="yes">✓</td></tr>
                  <tr><td>지급명령 신청서 초안</td><td className="no">흐림</td><td className="yes">✓</td></tr>
                  <tr><td>종합 체크리스트 전체</td><td className="no">3개만</td><td className="yes">✓</td></tr>
                  <tr><td>인쇄 · PDF 저장</td><td className="no">—</td><td className="yes">✓</td></tr>
                </tbody>
              </table>
              <a className="btn btn-primary btn-lg btn-full" style={{ marginTop: 14 }} href={PAYMENT_LINK}>
                구매하기 — {comma(PREMIUM_PRICE)}원
              </a>
              <p style={{ fontSize: 12.5, color: 'var(--ink-400)', textAlign: 'center', marginTop: 10 }}>
                결제 확인 후 라이선스 키를 이메일로 보내드립니다 · 문의 {CONTACT_EMAIL}
              </p>
            </div>
          </div>

          <div className="card card-pad fade-in-1">
            <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>라이선스 키 등록</h2>
            <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 14 }}>
              이메일로 받은 키를 붙여넣으세요. 검증은 이 브라우저 안에서만 이루어지고, 어디로도 전송되지 않아요.
            </p>
            <textarea
              className="input"
              rows={3}
              placeholder="ISA-…"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              spellCheck={false}
              style={{ fontSize: 13, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
            />
            {error && <p style={{ fontSize: 13, color: 'var(--red)', marginTop: 8 }}>{error}</p>}
            {ok && <p style={{ fontSize: 13, color: 'var(--green)', marginTop: 8 }}>프리미엄이 활성화되었습니다!</p>}
            <button className="btn btn-primary btn-md btn-full" style={{ marginTop: 12 }} onClick={tryActivate} disabled={!key.trim()}>
              키 등록하기
            </button>
          </div>
        </>
      )}

      <div className="card card-pad" style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>자주 묻는 질문</h3>
        <div style={{ fontSize: 13.5, color: 'var(--ink-600)', lineHeight: 1.8 }}>
          <p><b>Q. 환불되나요?</b><br />서류를 인쇄(잠금해제 사용)하기 전이라면 7일 내 전액 환불해 드립니다. 이메일로 연락 주세요.</p>
          <p style={{ marginTop: 10 }}><b>Q. 다른 기기에서도 쓸 수 있나요?</b><br />네, 같은 키를 다른 기기 브라우저에 등록하면 됩니다. 키는 본인 사용 범위 내에서 자유롭게 쓰세요.</p>
          <p style={{ marginTop: 10 }}><b>Q. 서버에 내 정보가 저장되나요?</b><br />아니요. 이 서비스는 서버가 없는 정적 웹앱입니다. 모든 입력과 키는 사용자의 브라우저(localStorage)에만 저장됩니다.</p>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CountUp from '../components/CountUp';
import CopyButton from '../components/CopyButton';
import PaywallModal from '../components/PaywallModal';
import { loadCalcState, saveDocFields } from '../lib/storage';
import { loadComplex, type ComplexDetail } from '../lib/data';
import { calculate, type CalcResult } from '../lib/calc';
import { won, comma, dateKo, ymKo, durationKo, m2ToPyeong } from '../lib/format';
import { LEGAL_CLAUSES, SPECIAL_TERMS_NOTE } from '../lib/legal';
import { useLicense } from '../license/LicenseContext';

export default function Result() {
  const nav = useNavigate();
  const state = useMemo(loadCalcState, []);
  const { licensed } = useLicense();
  const [detail, setDetail] = useState<ComplexDetail | null>(null);
  const [loadFail, setLoadFail] = useState(false);
  const [showRows, setShowRows] = useState(false);
  const [paywall, setPaywall] = useState(false);

  useEffect(() => {
    if (!state) {
      nav('/calc', { replace: true });
      return;
    }
    if (state.mode === 'data' && state.complex) {
      loadComplex(state.complex.code)
        .then(setDetail)
        .catch(() => setLoadFail(true));
    }
  }, [state, nav]);

  const result: CalcResult | null = useMemo(() => {
    if (!state) return null;
    if (state.mode === 'manual') {
      return calculate({
        mode: 'manual',
        manualMonthly: state.manualMonthly,
        moveIn: state.moveIn,
        moveOut: state.moveOut,
      });
    }
    if (!detail) return null;
    return calculate({
      mode: 'data',
      rates: detail.rates,
      areaM2: state.areaM2,
      moveIn: state.moveIn,
      moveOut: state.moveOut,
    });
  }, [state, detail]);

  // 서류 폼에 금액/기간 미리 채워두기
  useEffect(() => {
    if (result && state) {
      saveDocFields({
        amount: result.total,
        leaseFrom: state.moveIn,
        leaseTo: state.moveOut,
        aptLabel: state.mode === 'data' ? state.complex?.name ?? '' : state.manualName ?? '',
      });
    }
  }, [result, state]);

  if (!state) return null;

  const placeName = state.mode === 'data' ? state.complex?.name ?? '' : state.manualName || '우리 집';
  const isSample = state.mode === 'data' && state.complex?.src === 'sample';

  if (state.mode === 'data' && loadFail) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="card card-pad">
          <h2 style={{ fontSize: 19, fontWeight: 800 }}>단지 데이터를 불러오지 못했어요</h2>
          <p style={{ fontSize: 14, color: 'var(--ink-500)', margin: '10px 0 18px' }}>
            네트워크 상태를 확인하거나, 관리비 고지서 금액으로 직접 계산해 보세요.
          </p>
          <Link to="/calc" className="btn btn-primary btn-md">다시 계산하기</Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container" style={{ paddingTop: 60, textAlign: 'center', color: 'var(--ink-400)', fontSize: 14 }}>
        계산 중…
      </div>
    );
  }

  const sms = buildSms(placeName, state.moveIn, state.moveOut, result.total);

  return (
    <div className="container">
      <div style={{ padding: '34px 0 18px', textAlign: 'center' }} className="fade-in">
        <span className="badge badge-blue">예상 환급액</span>
        <div className="big-money" style={{ marginTop: 14 }}>
          <CountUp value={result.total} />
          <span className="won">원</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink-500)', marginTop: 10 }}>
          {placeName} · {durationKo(state.moveIn, state.moveOut)} 거주 기준
        </p>
        {isSample && (
          <p style={{ fontSize: 12.5, color: 'var(--amber)', marginTop: 8 }}>
            ⚠ 이 단지는 <b>샘플 단가</b>로 계산되었습니다. 실측치가 아니며, 실제 금액은 관리사무소
            납부확인서로 확인하세요.
          </p>
        )}
      </div>

      {/* 정산 영수증 */}
      <div className="receipt fade-in-1" style={{ marginBottom: 16 }}>
        <div className="receipt-head">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 700, letterSpacing: '0.08em' }}>
                이사정산소 · 정산 내역서
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, marginTop: 3 }}>{placeName}</div>
            </div>
            {isSample ? (
              <span className="badge badge-amber">샘플 데이터</span>
            ) : state.mode === 'data' ? (
              <span className="badge badge-green">K-apt 공공데이터</span>
            ) : (
              <span className="badge badge-gray">고지서 직접 입력</span>
            )}
          </div>
        </div>
        <div className="receipt-body">
          <div className="receipt-row">
            <span className="k">거주기간</span>
            <span className="v num">
              {dateKo(state.moveIn)} ~ {dateKo(state.moveOut)}
            </span>
          </div>
          <div className="receipt-row">
            <span className="k">정산 개월수</span>
            <span className="v num">{result.monthCount}개월 ({comma(result.totalDays)}일)</span>
          </div>
          {state.mode === 'data' && state.areaM2 && (
            <div className="receipt-row">
              <span className="k">전용면적</span>
              <span className="v num">
                {state.areaM2}㎡ ({m2ToPyeong(state.areaM2)}평)
              </span>
            </div>
          )}
          {state.mode === 'manual' && state.manualMonthly && (
            <div className="receipt-row">
              <span className="k">월 부과액 (고지서)</span>
              <span className="v num">{won(state.manualMonthly)}</span>
            </div>
          )}
          <div className="receipt-row">
            <span className="k">월평균 부담액</span>
            <span className="v num">{won(result.avgMonthly)}</span>
          </div>
          {result.estimatedMonths > 0 && (
            <div className="receipt-row">
              <span className="k">단가 추정 적용</span>
              <span className="v num" style={{ color: 'var(--amber)' }}>{result.estimatedMonths}개월 *</span>
            </div>
          )}
          <div className="receipt-total">
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-600)' }}>돌려받을 금액</span>
            <span className="num" style={{ fontSize: 24, fontWeight: 800, color: 'var(--blue)' }}>
              {won(result.total)}
            </span>
          </div>
        </div>
      </div>

      <button className="btn btn-line btn-md btn-full fade-in-2" onClick={() => setShowRows(!showRows)}>
        {showRows ? '월별 내역 접기 ⌃' : `월별 내역 ${result.monthCount}건 펼치기 ⌄`}
      </button>

      {showRows && (
        <div className="card fade-in" style={{ marginTop: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>월</th>
                  {state.mode === 'data' && <th className="r">단가(원/㎡)</th>}
                  <th className="r">거주일</th>
                  <th className="r">금액</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => (
                  <tr key={r.ym}>
                    <td className="num">
                      {ymKo(r.ym)}
                      {r.estimated && <span style={{ color: 'var(--amber)' }}> *</span>}
                    </td>
                    {state.mode === 'data' && <td className="r num">{r.rate !== undefined ? comma(r.rate) : '—'}</td>}
                    <td className="r num">
                      {r.occupiedDays}/{r.daysInMonth}
                    </td>
                    <td className="r num" style={{ fontWeight: 700 }}>{comma(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.estimatedMonths > 0 && (
            <p style={{ fontSize: 12, color: 'var(--ink-400)', padding: '10px 14px', borderTop: '1px solid var(--ink-25)' }}>
              * 표시 월은 공개 데이터가 없어 인접 월 단가로 추정한 값이에요.
            </p>
          )}
        </div>
      )}

      {/* 문자 템플릿 */}
      <section style={{ marginTop: 36 }} className="fade-in-2">
        <h2 className="sect-title" style={{ fontSize: 19 }}>1단계 — 집주인에게 문자 보내기 <span className="badge badge-green" style={{ verticalAlign: 'middle' }}>무료</span></h2>
        <p className="sect-sub">대부분 이 문자 한 통이면 끝나요. 그대로 복사해서 보내세요.</p>
        <div className="card card-pad">
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--ink-700)', whiteSpace: 'pre-wrap' }}>{sms}</p>
          <div style={{ marginTop: 16 }}>
            <CopyButton text={sms} label="문자 내용 복사하기" />
          </div>
        </div>
      </section>

      {/* 법적 근거 */}
      <section style={{ marginTop: 36 }} className="fade-in-3">
        <h2 className="sect-title" style={{ fontSize: 19 }}>법적 근거</h2>
        <p className="sect-sub">집주인이 물어보면 이 조문을 보여 주세요.</p>
        <div style={{ display: 'grid', gap: 10 }}>
          {LEGAL_CLAUSES.map((c) => (
            <div key={c.title} className="card card-pad" style={{ padding: 18 }}>
              <span className="badge badge-blue">{c.title}</span>
              <p style={{ fontSize: 13.5, color: 'var(--ink-600)', marginTop: 10, lineHeight: 1.7 }}>“{c.text}”</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-400)', marginTop: 12, lineHeight: 1.7 }}>{SPECIAL_TERMS_NOTE}</p>
      </section>

      {/* 프리미엄 CTA */}
      <section style={{ marginTop: 36 }}>
        <div
          className="card card-pad"
          style={{ background: 'linear-gradient(135deg, #0e3f92 0%, #1b64da 70%, #2e7bf0 100%)', border: 0, color: '#fff' }}
        >
          <span className="badge" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>
            2단계 — 안 주고 버티면
          </span>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: '12px 0 6px', letterSpacing: '-0.02em' }}>
            내용증명 · 지급명령 신청서를
            <br />내 정보로 완성해 드려요
          </h3>
          <p style={{ fontSize: 13.5, opacity: 0.85, lineHeight: 1.7 }}>
            계산된 금액 {won(result.total)}이 서류에 자동으로 들어가요. 인쇄해서 우체국·법원에 바로 제출.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <Link to="/docs" className="btn btn-lg" style={{ background: '#fff', color: 'var(--blue-deep)' }}>
              서류 만들러 가기
            </Link>
            {!licensed && (
              <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,.14)', color: '#fff' }} onClick={() => setPaywall(true)}>
                프리미엄 알아보기
              </button>
            )}
          </div>
        </div>
      </section>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <Link to="/calc" className="btn btn-ghost btn-md">조건 바꿔서 다시 계산</Link>
      </div>

      {paywall && <PaywallModal onClose={() => setPaywall(false)} />}
    </div>
  );
}

function buildSms(place: string, moveIn: string, moveOut: string, total: number): string {
  return (
    `안녕하세요 사장님, ${place} 세입자입니다.\n\n` +
    `이사 정산 관련으로 연락드립니다. 거주기간(${dateKo(moveIn)}~${dateKo(moveOut)}) 동안 ` +
    `관리비에 포함해 제가 대신 납부한 장기수선충당금이 약 ${won(total)}입니다.\n\n` +
    `장기수선충당금은 공동주택관리법 제30조에 따라 소유자가 부담하는 비용이라, ` +
    `같은 법 시행령 제31조 제8항에 따라 보증금 반환 시 함께 정산 부탁드립니다.\n\n` +
    `정확한 금액은 관리사무소 납부확인서 기준으로 정산하면 됩니다. 감사합니다.`
  );
}

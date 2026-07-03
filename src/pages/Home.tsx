import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LEGAL_CLAUSES, LEGAL_DISCLAIMER } from '../lib/legal';

const FAQS: { q: string; a: string }[] = [
  {
    q: '장기수선충당금이 뭔가요?',
    a: '아파트·오피스텔의 엘리베이터 교체, 외벽 도색, 배관 보수 같은 큰 공사에 대비해 매달 적립하는 돈입니다. 관리비 고지서에 "장기수선충당금" 항목으로 붙어 나오기 때문에, 세입자도 매달 자기도 모르게 내고 있는 경우가 대부분입니다.',
  },
  {
    q: '왜 세입자가 돌려받을 수 있나요?',
    a: '공동주택관리법 제30조 제1항은 장기수선충당금을 "주택의 소유자로부터 징수"하도록 정하고 있습니다. 즉 원래 집주인이 내야 할 돈입니다. 같은 법 시행령 제31조 제8항은 세입자가 대신 납부한 경우 소유자가 그 금액을 반환하도록 명시하고 있어, 이사 나갈 때 그동안 낸 금액 전부를 청구할 수 있습니다.',
  },
  {
    q: '얼마나 돌려받을 수 있나요?',
    a: '단지·면적에 따라 다르지만 보통 ㎡당 월 100~250원 수준입니다. 전용 84㎡에서 2년 거주했다면 대략 30~60만원. 4년 이상 거주했다면 100만원을 넘는 경우도 있습니다. 정확한 금액은 관리사무소에서 납부확인서를 발급받아 확정합니다.',
  },
  {
    q: '집주인이 거부하면 어떻게 하나요?',
    a: '1단계로 문자·전화로 정중히 요청하고, 안 되면 내용증명을 보내 공식적으로 청구 사실을 남깁니다. 그래도 지급하지 않으면 법원에 지급명령을 신청할 수 있습니다. 지급명령은 소송보다 훨씬 간단하고 비용도 저렴하며, 상대가 2주 내 이의하지 않으면 확정판결과 같은 효력이 생깁니다. 이사정산소 프리미엄에서 내용증명과 지급명령 신청서 초안을 만들 수 있습니다.',
  },
  {
    q: '이미 이사 나왔는데 늦었나요?',
    a: '아닙니다. 반환청구권은 일반 민사채권으로 소멸시효가 10년입니다(민법 제162조 제1항). 임대차가 끝난 지 10년이 지나지 않았다면 지금이라도 청구할 수 있습니다.',
  },
  {
    q: '못 돌려받는 경우도 있나요?',
    a: '임대차계약서에 "장기수선충당금은 임차인이 부담한다"는 특약이 있으면 반환이 어려울 수 있습니다(관련 규정은 강행규정이 아니라는 것이 법원의 태도입니다). 또한 오피스텔 등 공동주택관리법 적용 대상이 아닌 건물은 관리규약에 따라 다를 수 있습니다. 계산 전에 계약서 특약사항을 꼭 확인하세요.',
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="hero-eyebrow fade-in">세입자 10명 중 9명이 놓치는 돈</span>
          <h1 className="fade-in-1">
            이사 나갈 때,
            <br />
            <span className="u">돌려받을 돈</span>이 있습니다
          </h1>
          <p className="lede fade-in-2">
            관리비에 몰래 껴 있던 장기수선충당금 — 법적으로 집주인이 내야 할 돈입니다. 단지 이름과
            거주기간만 입력하면 3초 만에 계산해 드립니다.
          </p>
          <div className="fade-in-3" style={{ marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/calc" className="btn btn-primary btn-lg">
              내 환급액 계산하기
            </Link>
            <Link to="/docs" className="btn btn-ghost btn-lg">
              반환 서류 만들기
            </Link>
          </div>

          <div className="stat-strip fade-in-3">
            <div className="stat-cell">
              <div className="sv num">30~60만원</div>
              <div className="sk">2년 거주 시 통상 환급액</div>
            </div>
            <div className="stat-cell">
              <div className="sv num">10년</div>
              <div className="sk">청구 가능한 소멸시효</div>
            </div>
            <div className="stat-cell">
              <div className="sv">법으로 보장</div>
              <div className="sk">공동주택관리법 시행령 §31⑧</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 0' }}>
        <div className="container">
          <h2 className="sect-title">딱 3단계면 끝나요</h2>
          <p className="sect-sub">계산은 무료입니다. 회원가입도 없습니다.</p>
          <div style={{ display: 'grid', gap: 12 }}>
            <div className="how-card">
              <div className="how-num">1</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15.5 }}>단지 검색 + 면적·거주기간 입력</div>
                <p style={{ fontSize: 13.5, color: 'var(--ink-500)', marginTop: 3 }}>
                  단지가 목록에 없으면 관리비 고지서의 월 금액으로 직접 계산할 수 있어요.
                </p>
              </div>
            </div>
            <div className="how-card">
              <div className="how-num">2</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15.5 }}>예상 환급액과 법적 근거 확인</div>
                <p style={{ fontSize: 13.5, color: 'var(--ink-500)', marginTop: 3 }}>
                  월별 산출 내역과 인용할 법 조문, 집주인에게 바로 보낼 문자 템플릿까지 무료로 드려요.
                </p>
              </div>
            </div>
            <div className="how-card">
              <div className="how-num">3</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15.5 }}>거부하면? 서류로 청구</div>
                <p style={{ fontSize: 13.5, color: 'var(--ink-500)', marginTop: 3 }}>
                  내용증명 → 지급명령 신청서까지, 인쇄해서 바로 쓸 수 있는 완성 문서를 만들어 드려요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 0', background: 'var(--ink-25)' }}>
        <div className="container">
          <h2 className="sect-title">법이 그렇게 정해 두었습니다</h2>
          <p className="sect-sub">앱 곳곳에서 인용하는 조문 원문입니다.</p>
          <div style={{ display: 'grid', gap: 12 }}>
            {LEGAL_CLAUSES.map((c) => (
              <div key={c.title} className="card card-pad">
                <span className="badge badge-blue">{c.title}</span>
                <p style={{ fontSize: 14.5, color: 'var(--ink-700)', margin: '12px 0 8px', lineHeight: 1.75 }}>
                  “{c.text}”
                </p>
                <p style={{ fontSize: 13, color: 'var(--ink-400)' }}>→ {c.point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '36px 0 8px' }}>
        <div className="container">
          <h2 className="sect-title">자주 묻는 질문</h2>
          <p className="sect-sub">모르면 못 받는 돈이라, 자세히 적어 두었어요.</p>
          <div>
            {FAQS.map((f, i) => (
              <div key={f.q} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <span className="arr">⌄</span>
                </button>
                <div className="faq-a">
                  <div className="faq-a-in">{f.a}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-300)', marginTop: 24, lineHeight: 1.7 }}>{LEGAL_DISCLAIMER}</p>
        </div>
      </section>
    </>
  );
}

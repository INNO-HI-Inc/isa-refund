import { useState } from 'react';
import { Link } from 'react-router-dom';
import PaywallModal from '../components/PaywallModal';
import { useLicense } from '../license/LicenseContext';
import { loadChecklist, saveChecklist } from '../lib/storage';
import { comma } from '../lib/format';
import { PREMIUM_PRICE } from '../config';

interface CkItem {
  id: string;
  title: string;
  desc: string;
  money?: string;
}

const SECTIONS: { name: string; items: CkItem[] }[] = [
  {
    name: '돌려받을 돈',
    items: [
      {
        id: 'ltr',
        title: '장기수선충당금 반환 청구',
        desc: '관리사무소에서 납부확인서를 발급받아 집주인에게 청구하세요. 이 앱의 계산 결과와 문자 템플릿을 활용하면 됩니다.',
        money: '통상 수십만 원',
      },
      {
        id: 'deposit-mgmt',
        title: '관리비예치금(선수관리비) 확인',
        desc: '입주 시 관리비예치금을 세입자가 냈다면 퇴거 시 돌려받아야 합니다. 원칙적으로 소유자가 부담하는 돈입니다(공동주택관리법 제24조). 관리사무소에 납부자 명의를 확인하세요.',
        money: '수만~수십만 원',
      },
      {
        id: 'deposit',
        title: '보증금 반환 일정 확정',
        desc: '이사 당일 잔금과 동시에 받는 것이 원칙. 지연되면 임차권등기명령을 검토하세요. 보증금을 받기 전에는 절대 전출·짐 빼기를 먼저 하지 마세요.',
      },
    ],
  },
  {
    name: '정산할 요금',
    items: [
      {
        id: 'mgmt-fee',
        title: '관리비 일할정산',
        desc: '퇴거일 기준으로 관리사무소에 중간 정산을 요청하세요. 이사 당일 정산서를 받아 집주인·부동산과 공유하면 분쟁이 없습니다.',
      },
      {
        id: 'gas',
        title: '도시가스 전출 신고',
        desc: '이사 2~3일 전 지역 도시가스사에 전화해 이사 당일 계량기 확인·정산을 예약하세요. 밸브 잠금까지 해줍니다.',
      },
      {
        id: 'elec',
        title: '전기요금 정산 (한전 123)',
        desc: '국번 없이 123으로 전화해 이사 당일 계량기 지침으로 즉시 정산할 수 있습니다. 관리비에 포함된 단지는 관리사무소 정산으로 충분합니다.',
      },
      {
        id: 'water',
        title: '수도요금 정산 (지역 상수도사업본부 120)',
        desc: '아파트는 대부분 관리비 포함이지만, 개별 계량 주택·오피스텔은 별도 정산이 필요합니다.',
      },
      {
        id: 'internet',
        title: '인터넷·TV 이전 또는 해지',
        desc: '이전 설치는 1~2주 전 예약이 안전합니다. 약정 해지 위약금과 이전설치비를 비교해 보세요.',
      },
    ],
  },
  {
    name: '행정 처리',
    items: [
      {
        id: 'move-report',
        title: '전입신고 (이사 후 14일 이내)',
        desc: '정부24 또는 주민센터에서. 보증금이 있다면 확정일자와 함께 대항력 유지에 필수입니다.',
      },
      {
        id: 'mail',
        title: '우편물 주거이전 서비스',
        desc: '인터넷우체국에서 신청하면 3개월간 새 주소로 우편물을 전달해 줍니다 (1회 연장 가능).',
      },
      {
        id: 'addr-change',
        title: '주소 변경 일괄 처리',
        desc: '은행·카드·보험 주소는 정부24 “주소변경 원스톱 서비스” 또는 각 금융앱에서 한 번에 바꿀 수 있습니다.',
      },
      {
        id: 'parking',
        title: '차량 등록지·아파트 주차 등록 정리',
        desc: '기존 단지 주차 등록 해지, 새 단지 등록. 자동이체 중인 주차비가 있는지 확인하세요.',
      },
    ],
  },
];

const FREE_VISIBLE = 3;

export default function DocChecklist() {
  const { licensed } = useLicense();
  const [checked, setChecked] = useState<Record<string, boolean>>(loadChecklist);
  const [paywall, setPaywall] = useState(false);

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    saveChecklist(next);
  };

  const allItems = SECTIONS.flatMap((s) => s.items);
  const doneCount = allItems.filter((i) => checked[i.id]).length;

  let renderedCount = 0;

  return (
    <div className="container">
      <div style={{ paddingTop: 28 }} className="no-print">
        <Link to="/docs" className="btn btn-ghost btn-sm">← 서류 목록</Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 6px' }}>이사 정산 종합 체크리스트</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-500)' }}>
          이사 때 챙길 돈과 행정 처리 {allItems.length}가지. 체크 상태는 자동 저장됩니다.
        </p>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 8, background: 'var(--ink-50)', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                width: `${(doneCount / allItems.length) * 100}%`,
                height: '100%',
                background: 'var(--blue)',
                borderRadius: 99,
                transition: 'width .4s cubic-bezier(.22,1,.36,1)',
              }}
            />
          </div>
          <span className="num" style={{ fontSize: 13, fontWeight: 800, color: 'var(--blue)' }}>
            {doneCount}/{allItems.length}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        {SECTIONS.map((sec) => (
          <section key={sec.name} style={{ marginTop: 26 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink-400)', letterSpacing: '0.04em', marginBottom: 10 }}>
              {sec.name}
            </h2>
            {sec.items.map((item) => {
              renderedCount += 1;
              const gated = !licensed && renderedCount > FREE_VISIBLE;
              return (
                <div
                  key={item.id}
                  className={`check-item ${checked[item.id] ? 'done' : ''}`}
                  style={gated ? { filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' } : undefined}
                  onClick={() => !gated && toggle(item.id)}
                  role="checkbox"
                  aria-checked={!!checked[item.id]}
                  tabIndex={gated ? -1 : 0}
                  onKeyDown={(e) => {
                    if (!gated && (e.key === ' ' || e.key === 'Enter')) {
                      e.preventDefault();
                      toggle(item.id);
                    }
                  }}
                >
                  <span className="ck-box">✓</span>
                  <span style={{ flex: 1 }}>
                    <span className="ck-title">{item.title}</span>
                    {item.money && (
                      <span className="badge badge-green" style={{ marginLeft: 8, verticalAlign: 'middle' }}>
                        {item.money}
                      </span>
                    )}
                    <div className="ck-desc">{item.desc}</div>
                  </span>
                </div>
              );
            })}
          </section>
        ))}
      </div>

      {!licensed && (
        <div className="card card-pad no-print" style={{ marginTop: 24, textAlign: 'center' }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>
            나머지 {allItems.length - FREE_VISIBLE}개 항목은 프리미엄에서
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--ink-500)', margin: '8px 0 16px' }}>
            내용증명·지급명령 신청서와 함께 전체 체크리스트가 열립니다.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => setPaywall(true)}>
            {comma(PREMIUM_PRICE)}원에 전체 잠금해제
          </button>
        </div>
      )}

      {licensed && (
        <div style={{ marginTop: 24, textAlign: 'center' }} className="no-print">
          <button className="btn btn-line btn-md" onClick={() => window.print()}>
            체크리스트 인쇄하기
          </button>
        </div>
      )}

      {paywall && <PaywallModal onClose={() => setPaywall(false)} />}
    </div>
  );
}

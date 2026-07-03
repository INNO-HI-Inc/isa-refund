import { Link } from 'react-router-dom';
import { useLicense } from '../license/LicenseContext';

const DOCS = [
  {
    to: '/docs/demand',
    title: '내용증명',
    desc: '반환 청구 사실을 공식 기록으로 남기는 문서. 우체국에서 3부 발송하면 대부분 여기서 해결됩니다.',
    tag: '가장 많이 사용',
  },
  {
    to: '/docs/order',
    title: '지급명령 신청서',
    desc: '법원에 제출하는 약식 절차 초안. 소송보다 빠르고 저렴하며, 이의 없으면 판결과 같은 효력.',
    tag: '내용증명 이후',
  },
  {
    to: '/docs/checklist',
    title: '이사 정산 종합 체크리스트',
    desc: '장충금 외에도 선수관리비·관리비 일할정산·도시가스·수도·우편물까지, 이사 때 챙길 돈 전부.',
    tag: '이사 전 필수',
  },
];

export default function Docs() {
  const { licensed } = useLicense();

  return (
    <div className="container">
      <div style={{ padding: '40px 0 8px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>서류 만들기</h1>
        <p style={{ fontSize: 14.5, color: 'var(--ink-500)', margin: '8px 0 4px' }}>
          정중한 요청으로 안 되면, 서류가 말하게 하세요.
        </p>
        {licensed ? (
          <span className="badge badge-green">프리미엄 활성화됨</span>
        ) : (
          <span className="badge badge-gray">무료: 흐림 미리보기 · 프리미엄: 완성본 + 인쇄</span>
        )}
      </div>

      <div style={{ display: 'grid', gap: 14, marginTop: 20 }}>
        {DOCS.map((d, i) => (
          <Link key={d.to} to={d.to} className={`card card-pad fade-in-${i + 1}`} style={{ display: 'block' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <span className="badge badge-blue">{d.tag}</span>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: '10px 0 6px', letterSpacing: '-0.02em' }}>{d.title}</h2>
                <p style={{ fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.65 }}>{d.desc}</p>
              </div>
              <span style={{ color: 'var(--ink-300)', fontSize: 20, marginTop: 4 }}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

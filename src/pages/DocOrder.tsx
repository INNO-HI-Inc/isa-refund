import { Link } from 'react-router-dom';
import PaperShell from '../components/PaperShell';
import DocFieldsForm from '../components/DocFieldsForm';
import { useDocFields } from '../lib/useDocFields';
import { won, dateKo } from '../lib/format';

const or = (v: string, ph: string) => (v.trim() ? v : ph);

export default function DocOrder() {
  const { f, set, today } = useDocFields();

  return (
    <div className="container">
      <div style={{ paddingTop: 28 }} className="no-print">
        <Link to="/docs" className="btn btn-ghost btn-sm">← 서류 목록</Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 6px' }}>지급명령 신청서 초안</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.7 }}>
          지급명령은 재판 없이 서류만으로 진행되는 약식 절차입니다. 채무자(집주인)가 송달받고 2주 내
          이의하지 않으면 확정판결과 같은 효력이 생깁니다. 전자소송(ecfs.scourt.go.kr)으로도 신청할 수 있어요.
        </p>
      </div>

      <DocFieldsForm f={f} set={set} withDue={false} />

      <PaperShell docName="지급명령 신청서">
        <h2>지급명령신청서</h2>

        <p className="paper-meta"><b>채권자</b> {or(f.senderName, '(세입자 성명)')}</p>
        <p className="paper-meta"><b>주소</b> {or(f.senderAddr, '(세입자 현재 주소)')}</p>
        <p className="paper-meta"><b>연락처</b> {or(f.senderPhone, '(연락처)')}</p>
        <p className="paper-meta" style={{ marginTop: 10 }}><b>채무자</b> {or(f.receiverName, '(집주인 성명)')}</p>
        <p className="paper-meta"><b>주소</b> {or(f.receiverAddr, '(집주인 주소)')}</p>

        <h3>청구취지</h3>
        <p>채무자는 채권자에게 아래 청구금액을 지급하라는 명령을 구합니다.</p>
        <ol>
          <li>
            금 {f.amount ? won(f.amount) : '(금액)원'} 및 이에 대하여 지급명령정본이 송달된 다음 날부터 다 갚는
            날까지 소송촉진 등에 관한 특례법이 정한 연 12%의 비율로 계산한 지연손해금
          </li>
          <li>독촉절차 비용</li>
        </ol>

        <h3>청구원인</h3>
        <ol>
          <li>
            채권자는 {f.leaseFrom ? dateKo(f.leaseFrom) : '(임대차 시작일)'}부터 {f.leaseTo ? dateKo(f.leaseTo) : '(임대차 종료일)'}까지
            채무자 소유의 {or(f.aptLabel, '(단지·동호수)')}를 임차하여 거주하였습니다.
          </li>
          <li>
            채권자는 위 임대차 기간 동안 관리비에 포함하여 부과된 장기수선충당금 합계
            금 {f.amount ? won(f.amount) : '(금액)원'}을 채무자를 대신하여 납부하였습니다.
          </li>
          <li>
            공동주택관리법 제30조 제1항에 따라 장기수선충당금의 납부 의무자는 주택의 소유자이고,
            같은 법 시행령 제31조 제8항에 따라 소유자는 사용자가 대신 납부한 장기수선충당금을
            반환하여야 합니다.
          </li>
          <li>
            채권자는 임대차 종료 후 채무자에게 위 금액의 반환을 청구하였으나 채무자는 정당한 이유 없이
            지급하지 아니하고 있으므로, 이 사건 신청에 이르렀습니다.
          </li>
        </ol>

        <h3>첨부서류</h3>
        <ol>
          <li>임대차계약서 사본 1통</li>
          <li>장기수선충당금 납부확인서 (관리사무소 발급) 1통</li>
          <li>내용증명 우편 사본 1통 (발송한 경우)</li>
          <li>부동산등기사항전부증명서 1통 (소유자 확인용)</li>
        </ol>

        <p className="paper-date">{dateKo(today)}</p>
        <p className="sig">채권자 {or(f.senderName, '(성명)')} (인)</p>
        <p className="center" style={{ marginTop: 28, fontWeight: 800 }}>
          ○○지방법원 귀중
        </p>
      </PaperShell>

      <div className="card card-pad no-print" style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>제출 안내</h3>
        <ol style={{ fontSize: 13.5, color: 'var(--ink-600)', lineHeight: 1.8, listStyle: 'decimal', paddingLeft: 18 }}>
          <li>관할: 채무자(집주인) 주소지를 관할하는 지방법원. 법원명은 인쇄 후 기재하세요.</li>
          <li>비용: 인지대는 일반 소송의 1/10 수준 + 송달료. 수십만 원대 청구라면 보통 2만원 안팎입니다.</li>
          <li>대법원 전자소송 사이트에서 “지급명령(독촉) 신청”으로 온라인 제출도 가능합니다.</li>
          <li>채무자가 이의신청하면 통상의 민사소송(소액사건)으로 전환됩니다. 이 경우 법률구조공단(132) 상담을 권합니다.</li>
        </ol>
      </div>
    </div>
  );
}

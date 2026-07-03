import { Link } from 'react-router-dom';
import PaperShell from '../components/PaperShell';
import DocFieldsForm from '../components/DocFieldsForm';
import { useDocFields } from '../lib/useDocFields';
import { won, dateKo } from '../lib/format';

const or = (v: string, ph: string) => (v.trim() ? v : ph);

export default function DocDemand() {
  const { f, set, today } = useDocFields();

  return (
    <div className="container">
      <div style={{ paddingTop: 28 }} className="no-print">
        <Link to="/docs" className="btn btn-ghost btn-sm">← 서류 목록</Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 6px' }}>내용증명 — 장기수선충당금 반환 청구</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.7 }}>
          같은 문서를 3부 인쇄해 우체국에 가져가면 됩니다(1부 발송·1부 우체국 보관·1부 본인 보관).
          발송 기록 자체가 강력한 심리적 압박이 됩니다.
        </p>
      </div>

      <DocFieldsForm f={f} set={set} />

      <PaperShell docName="내용증명">
        <h2>내 용 증 명</h2>

        <p className="paper-meta"><b>제목</b> 장기수선충당금 반환 청구의 건</p>
        <p className="paper-meta" style={{ marginTop: 18 }}><b>수신인</b> {or(f.receiverName, '(집주인 성명)')}</p>
        <p className="paper-meta"><b>주소</b> {or(f.receiverAddr, '(집주인 주소)')}</p>
        <p className="paper-meta" style={{ marginTop: 10 }}><b>발신인</b> {or(f.senderName, '(세입자 성명)')}</p>
        <p className="paper-meta"><b>주소</b> {or(f.senderAddr, '(세입자 현재 주소)')}</p>
        <p className="paper-meta"><b>연락처</b> {or(f.senderPhone, '(연락처)')}</p>

        <h3>1. 임대차 관계</h3>
        <p>
          발신인은 {f.leaseFrom ? dateKo(f.leaseFrom) : '(임대차 시작일)'}부터 {f.leaseTo ? dateKo(f.leaseTo) : '(임대차 종료일)'}까지
          수신인 소유의 {or(f.aptLabel, '(단지·동호수)')}에 관하여 임대차계약을 체결하고 거주하였습니다.
        </p>

        <h3>2. 청구의 법적 근거</h3>
        <p>
          공동주택관리법 제30조 제1항은 “관리주체는 장기수선계획에 따라 공동주택의 주요 시설의 교체 및 보수에
          필요한 장기수선충당금을 해당 주택의 소유자로부터 징수하여 적립하여야 한다”라고 규정하고 있으며,
          같은 법 시행령 제31조 제8항은 “공동주택의 소유자는 장기수선충당금을 사용자가 대신하여 납부한
          경우에는 그 금액을 반환하여야 한다”라고 규정하고 있습니다.
        </p>
        <p>
          발신인은 위 임대차 기간 동안 관리비에 포함된 장기수선충당금을 수신인을 대신하여 납부하였는바,
          수신인은 위 규정에 따라 이를 반환할 의무가 있습니다.
        </p>

        <h3>3. 청구 금액 및 지급 요청</h3>
        <p>
          발신인이 위 기간 동안 대신 납부한 장기수선충당금은 합계 금 {f.amount ? won(f.amount) : '(금액)원'}입니다
          (정확한 금액은 관리사무소 발급 납부확인서 기준으로 정산할 수 있습니다).
        </p>
        <p>
          이에 {f.dueDate ? dateKo(f.dueDate) : '(지급 기한)'}까지 위 금액을 아래 계좌로 지급하여 주시기 바랍니다.
        </p>
        <p className="paper-meta"><b>입금계좌</b> {or(f.bank, '(은행 · 계좌번호 · 예금주)')}</p>

        <h3>4. 기한 내 미지급 시</h3>
        <p>
          위 기한까지 지급되지 아니할 경우 발신인은 부득이 법원에 지급명령 신청 등 법적 절차를 진행할 예정이며,
          이 경우 지연손해금 및 절차 비용이 추가로 청구될 수 있음을 알려드립니다.
        </p>

        <p className="paper-date">{dateKo(today)}</p>
        <p className="sig">위 발신인 {or(f.senderName, '(성명)')} (인)</p>
      </PaperShell>

      <div className="card card-pad no-print" style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>발송 방법</h3>
        <ol style={{ fontSize: 13.5, color: 'var(--ink-600)', lineHeight: 1.8, listStyle: 'decimal', paddingLeft: 18 }}>
          <li>이 문서를 3부 인쇄합니다 (내용은 3부 모두 동일해야 함).</li>
          <li>우체국 창구에서 “내용증명으로 보내주세요”라고 하면 됩니다. 비용은 수천 원 수준.</li>
          <li>인터넷우체국(epost.go.kr)에서도 온라인 발송이 가능합니다.</li>
          <li>발송 전 관리사무소에서 <b>장기수선충당금 납부확인서</b>를 발급받아 두세요 (시행령 제31조 제9항에 따라 관리주체는 지체 없이 발급할 의무가 있습니다).</li>
        </ol>
      </div>
    </div>
  );
}

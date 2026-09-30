<div align="center">

# 이사정산소

**이사 나갈 때 돌려받을 장기수선충당금 자동 계산 + 반환 청구 서류 생성**

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![서버 없음](https://img.shields.io/badge/%EC%84%9C%EB%B2%84-%EC%97%86%EC%9D%8C-2EA44F?style=flat-square)

<a href="https://inno-hi-inc.github.io/isa-refund/"><img src="docs/hero.jpg" alt="이사정산소 데스크톱 첫 화면" width="74%"></a>&nbsp;<a href="https://inno-hi-inc.github.io/isa-refund/"><img src="docs/mobile.jpg" alt="이사정산소 모바일 첫 화면" width="21.5%"></a>

**[바로 써보기](https://inno-hi-inc.github.io/isa-refund/)**

</div>

---

이사 나가는 세입자가 집주인에게 돌려받아야 할 **장기수선충당금**을 자동 계산하고,
반환 요청 문자 → 내용증명 → 지급명령 신청서까지 만들어 주는 완전 정적 웹앱입니다.

"아파트 이름 + 전용면적 + 거주기간 입력 → 3초 만에 '돌려받을 돈 47만원'"

## 왜 이 돈을 돌려받을 수 있나

- **공동주택관리법 제30조 제1항** — 장기수선충당금은 *주택의 소유자*로부터 징수한다.
- **같은 법 시행령 제31조 제8항** — 소유자는 *사용자(세입자)가 대신 납부한 경우 그 금액을 반환*하여야 한다.
- **같은 시행령 제31조 제9항** — 관리주체는 사용자가 요구하면 *납부확인서를 지체 없이 발급*해야 한다.
- 소멸시효는 일반 민사채권과 같은 **10년**(민법 제162조 제1항).

## 기능

| 기능 | 무료 | 프리미엄 (9,900원, 1회) |
|---|---|---|
| 단지 검색(초성 지원) + 환급액 계산 | ✓ | ✓ |
| 수동 모드(고지서 금액 직접 입력) | ✓ | ✓ |
| 월별 산출 내역 · 법적 근거 · 문자 템플릿 | ✓ | ✓ |
| 내용증명 / 지급명령 신청서 완성본 + 인쇄·PDF | 흐림 미리보기 | ✓ |
| 이사 정산 종합 체크리스트 | 3개 항목 | 전체 |

모든 입력·결과·라이선스는 브라우저 localStorage에만 저장됩니다. 서버가 없습니다.

## 로컬 실행

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ 생성 (tsc 타입체크 포함)
npm run preview
```

## 배포 (GitHub Pages)

1. GitHub 저장소 생성 후 push (기본 브랜치 `main`).
2. 저장소 **Settings → Pages → Source: GitHub Actions** 선택.
3. `main`에 push하면 `.github/workflows/deploy.yml`이 자동으로 빌드·배포합니다.
   (`vite.config.ts`의 `base: './'` + HashRouter로 하위 경로에서도 안전)

## 데이터 파이프라인 (K-apt 공공데이터)

번들에는 서울·경기 유명 단지 15곳의 **샘플 단가**(실측 아님, UI에 "샘플 데이터" 배지 표시)가
들어 있습니다. 전국 실데이터는 공공데이터포털 키 1개로 채울 수 있습니다.

1. [data.go.kr](https://www.data.go.kr) 가입 → 아래 3개 API **활용신청** (자동 즉시승인, 무료)
   - 공동주택 단지 목록제공 서비스 (`AptListService3`)
   - 공동주택 기본 정보제공 서비스 (`AptBasisInfoServiceV4`)
   - 공동주택관리비(장기수선충당금)정보서비스 (`AptRepairsCostServiceV2`)
2. 마이페이지에서 인증키 복사 후:

```bash
DATA_GO_KR_KEY="발급키" node scripts/fetch-kapt.mjs --sido "서울특별시" --limit 300
```

- 단지 1곳당 `1 + months`회 호출 → 개발계정 일일 트래픽(10,000회) 안에서
  `--sido`/`--limit`로 나눠 수집하세요. 기존 샤드는 보존되고 신규 단지가 우선 수집됩니다.
- ㎡당 단가는 `장충금 월부과액(sLevy) ÷ 관리비부과면적(kaptMarea)`으로 계산합니다.
- GitHub 저장소 **Secrets에 `DATA_GO_KR_KEY`** 를 넣으면 매월 1일
  `.github/workflows/refresh-data.yml`이 자동 갱신·커밋합니다 (키가 없으면 스킵하고 성공 처리).

## 라이선스 키 발급 (판매자용)

Ed25519 오프라인 서명 방식 — 검증은 브라우저 안에서만 이루어지며 서버가 필요 없습니다.

```bash
# 1) 최초 1회: 키쌍 생성 (+ 공개키가 src/license/publicKey.ts 에 자동 반영)
node scripts/gen-license.mjs init

# 2) 판매할 때마다: 키 발급
node scripts/gen-license.mjs issue --to "홍길동"
node scripts/gen-license.mjs issue --to "홍길동" --exp 2027-12-31   # 만료일 지정
```

- 개인키는 `licenses/keypair.json`에만 저장되며 `.gitignore`로 커밋이 차단됩니다.
  **이 파일을 잃어버리면 새 키를 발급할 수 없으니 안전한 곳에 백업하세요.**
- 키 포맷: `ISA-<base64url(payload)>-<base64url(signature)>`
- 운영 절차·가격·환불 정책은 [SALES.md](./SALES.md) 참고.

## 기술 스택

Vite + React 18 + TypeScript · HashRouter · @noble/ed25519 (WebCrypto 미사용) ·
Pretendard · 완전 정적(서버 없음)

## 법적 고지

이 서비스는 일반 정보 제공 도구이며 법률 자문이 아닙니다. 계산 결과는 추정치이고,
실제 반환 금액은 관리사무소 발급 납부확인서로 확정됩니다. 임대차계약서에 임차인 부담
특약이 있으면 반환이 제한될 수 있습니다.

---

<div align="center">
<sub>Made by <a href="https://github.com/khwee2000">김민수 (@khwee2000)</a> · <a href="https://github.com/INNO-HI-Inc">INNO-HI</a></sub>
</div>

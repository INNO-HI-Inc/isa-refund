/** 한글 초성 검색 유틸 */

const CHO = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;

/** 문자열을 초성 문자열로 변환 ("헬리오시티" → "ㅎㄹㅇㅅㅌ") */
export function toChosung(s: string): string {
  let out = '';
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (code >= HANGUL_BASE && code <= HANGUL_END) {
      out += CHO[Math.floor((code - HANGUL_BASE) / 588)];
    } else {
      out += ch;
    }
  }
  return out;
}

/** 쿼리가 초성으로만 이루어져 있는지 */
export function isChosungQuery(q: string): boolean {
  return /^[ㄱ-ㅎ]+$/.test(q.replace(/\s/g, ''));
}

function norm(s: string): string {
  return s.replace(/\s/g, '').toLowerCase();
}

/** 단지명/주소에 대해 일반 검색 + 초성 검색을 모두 지원 */
export function matches(query: string, name: string, addr: string): boolean {
  const q = norm(query);
  if (!q) return false;
  if (isChosungQuery(q)) {
    return toChosung(norm(name)).includes(q);
  }
  return norm(name).includes(q) || norm(addr).includes(q);
}

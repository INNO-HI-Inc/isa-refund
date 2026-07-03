import { useEffect, useMemo, useRef, useState } from 'react';
import { loadIndex, type ComplexIndexItem } from '../lib/data';
import { matches } from '../lib/chosung';

/** 단지 검색 자동완성 (초성 검색 지원) */
export default function ComplexSearch({
  onSelect,
  onManual,
}: {
  onSelect: (c: ComplexIndexItem) => void;
  onManual: () => void;
}) {
  const [items, setItems] = useState<ComplexIndexItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadIndex()
      .then((idx) => {
        setItems(idx.complexes);
        setLoaded(true);
      })
      .catch(() => {
        setLoadError(true);
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const results = useMemo(() => {
    const query = q.trim();
    if (!query) return [];
    return items.filter((c) => matches(query, c.name, c.addr)).slice(0, 20);
  }, [q, items]);

  const select = (c: ComplexIndexItem) => {
    setQ(c.name);
    setOpen(false);
    onSelect(c);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHi((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHi((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[hi]) select(results[hi]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="search-wrap" ref={wrapRef}>
      <input
        className="input"
        placeholder="단지명 검색 — 초성도 돼요 (예: ㅎㄹㅇㅅㅌ)"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setHi(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        autoComplete="off"
        inputMode="search"
        aria-label="아파트 단지 검색"
      />
      {open && q.trim() && (
        <div className="search-list">
          {!loaded && <div className="search-empty">단지 목록을 불러오는 중…</div>}
          {loaded && loadError && (
            <div className="search-empty">
              단지 데이터를 불러오지 못했어요.
              <br />
              아래의 직접 입력 모드를 이용해 주세요.
            </div>
          )}
          {loaded && !loadError && results.length === 0 && (
            <div className="search-empty">
              검색 결과가 없어요.
              <br />
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={onManual}>
                고지서 금액으로 직접 계산하기
              </button>
            </div>
          )}
          {results.map((c, i) => (
            <button
              type="button"
              key={c.code}
              className={`search-item ${i === hi ? 'hi' : ''}`}
              onMouseEnter={() => setHi(i)}
              onClick={() => select(c)}
            >
              <span>
                <span className="si-name">{c.name}</span>
                <div className="si-addr">{c.addr}</div>
              </span>
              {c.src === 'sample' && <span className="badge badge-amber">샘플 데이터</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

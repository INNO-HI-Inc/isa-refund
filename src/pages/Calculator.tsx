import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplexSearch from '../components/ComplexSearch';
import { loadCalcState, saveCalcState, type CalcState } from '../lib/storage';
import { m2ToPyeong, pyeongToM2, durationKo } from '../lib/format';
import type { ComplexIndexItem } from '../lib/data';

const AREA_PRESETS = [59.9, 74.9, 84.9, 101.9, 114.9];

export default function Calculator() {
  const nav = useNavigate();
  const saved = useMemo(loadCalcState, []);

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'data' | 'manual'>(saved?.mode ?? 'data');
  const [complex, setComplex] = useState<CalcState['complex']>(saved?.complex);
  const [manualName, setManualName] = useState(saved?.manualName ?? '');
  const [manualMonthly, setManualMonthly] = useState<string>(
    saved?.manualMonthly ? String(saved.manualMonthly) : '',
  );
  const [areaUnit, setAreaUnit] = useState<'m2' | 'py'>(saved?.areaUnit ?? 'm2');
  const [areaText, setAreaText] = useState<string>(() => {
    if (!saved?.areaM2) return '';
    return saved.areaUnit === 'py' ? String(m2ToPyeong(saved.areaM2)) : String(saved.areaM2);
  });
  const [moveIn, setMoveIn] = useState(saved?.moveIn ?? '');
  const [moveOut, setMoveOut] = useState(saved?.moveOut ?? '');

  // 저장된 상태가 step1을 이미 채웠다면 step2부터
  useEffect(() => {
    if (saved && (saved.complex || saved.manualMonthly)) setStep(2);
  }, [saved]);

  const areaM2 = useMemo(() => {
    const v = parseFloat(areaText);
    if (!isFinite(v) || v <= 0) return undefined;
    return areaUnit === 'py' ? pyeongToM2(v) : Math.round(v * 100) / 100;
  }, [areaText, areaUnit]);

  const manualWon = useMemo(() => {
    const v = parseInt(manualMonthly.replace(/[^0-9]/g, ''), 10);
    return isFinite(v) && v > 0 ? v : undefined;
  }, [manualMonthly]);

  const dateValid = !!moveIn && !!moveOut && moveOut > moveIn;
  const step2Done = dateValid && (mode === 'manual' || !!areaM2);

  const selectComplex = (c: ComplexIndexItem) => {
    setComplex({ code: c.code, name: c.name, addr: c.addr, src: c.src });
    setMode('data');
    setStep(2);
  };

  const goManual = () => {
    setMode('manual');
    setComplex(undefined);
  };

  const submit = () => {
    if (!step2Done) return;
    const state: CalcState = {
      mode,
      complex: mode === 'data' ? complex : undefined,
      manualName: mode === 'manual' ? manualName || '우리 집' : undefined,
      manualMonthly: mode === 'manual' ? manualWon : undefined,
      areaM2: mode === 'data' ? areaM2 : undefined,
      areaUnit,
      moveIn,
      moveOut,
    };
    saveCalcState(state);
    nav('/result');
  };

  return (
    <div className="container">
      <div className="steps no-print">
        <div className={`step-dot ${step === 1 ? 'on' : 'done'}`}>
          <i>{step > 1 ? '✓' : '1'}</i> 단지 선택
        </div>
        <div className="step-bar">
          <em style={{ transform: step > 1 ? 'scaleX(1)' : 'scaleX(0)' }} />
        </div>
        <div className={`step-dot ${step === 2 ? 'on' : ''}`}>
          <i>2</i> 면적·기간
        </div>
        <div className="step-bar">
          <em style={{ transform: 'scaleX(0)' }} />
        </div>
        <div className="step-dot">
          <i>₩</i> 결과
        </div>
      </div>

      {step === 1 && (
        <div className="fade-in">
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>
            어느 단지에 사셨나요?
          </h1>
          <p style={{ fontSize: 14.5, color: 'var(--ink-500)', marginBottom: 24 }}>
            단지별 ㎡당 장기수선충당금 단가로 계산해 드려요.
          </p>

          <ComplexSearch onSelect={selectComplex} onManual={goManual} />

          <div style={{ margin: '26px 0 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--ink-50)' }} />
            <span style={{ fontSize: 12.5, color: 'var(--ink-300)', fontWeight: 600 }}>또는</span>
            <div style={{ flex: 1, height: 1, background: 'var(--ink-50)' }} />
          </div>

          <div
            className="card card-pad"
            style={mode === 'manual' ? { borderColor: 'var(--blue)', boxShadow: '0 0 0 3px rgba(27,100,218,.1)' } : undefined}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15.5 }}>고지서 금액으로 직접 입력</div>
                <p style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 3 }}>
                  단지가 목록에 없어도 괜찮아요. 관리비 고지서의 “장기수선충당금” 월 금액을 넣으면 돼요.
                </p>
              </div>
              {mode !== 'manual' && (
                <button className="btn btn-line btn-sm" onClick={goManual}>
                  선택
                </button>
              )}
            </div>
            {mode === 'manual' && (
              <div style={{ marginTop: 16 }}>
                <div className="field">
                  <label className="field-label" htmlFor="mn-name">단지·건물 이름 (선택)</label>
                  <input
                    id="mn-name"
                    className="input"
                    placeholder="예) 행복오피스텔 302호"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                  />
                </div>
                <div className="field" style={{ marginBottom: 8 }}>
                  <label className="field-label" htmlFor="mn-won">월 장기수선충당금 (원)</label>
                  <input
                    id="mn-won"
                    className="input num"
                    placeholder="예) 18,500"
                    inputMode="numeric"
                    value={manualMonthly ? Number(manualMonthly.replace(/[^0-9]/g, '') || 0).toLocaleString('ko-KR') : ''}
                    onChange={(e) => setManualMonthly(e.target.value)}
                  />
                  <p className="field-hint">
                    관리비 고지서 하단 항목에서 확인할 수 있어요. 금액이 달마다 다르면 최근 금액을 넣으세요.
                  </p>
                </div>
                <button className="btn btn-primary btn-md btn-full" disabled={!manualWon} onClick={() => setStep(2)}>
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="fade-in">
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 18 }} onClick={() => setStep(1)}>
            ← 단지 다시 선택
          </button>

          <div className="card card-pad" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>
                {mode === 'data' ? complex?.name : manualName || '직접 입력'}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-400)', marginTop: 2 }}>
                {mode === 'data' ? complex?.addr : manualWon ? `월 ${manualWon.toLocaleString('ko-KR')}원 기준` : ''}
              </div>
            </div>
            {mode === 'data' && complex?.src === 'sample' && <span className="badge badge-amber">샘플 데이터</span>}
            {mode === 'manual' && <span className="badge badge-gray">직접 입력</span>}
          </div>

          {mode === 'data' && (
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="field-label" style={{ marginBottom: 0 }} htmlFor="area-in">전용면적</label>
                <div className="seg" role="tablist" aria-label="면적 단위">
                  <button className={areaUnit === 'm2' ? 'on' : ''} onClick={() => setAreaUnit('m2')}>
                    ㎡
                  </button>
                  <button className={areaUnit === 'py' ? 'on' : ''} onClick={() => setAreaUnit('py')}>
                    평
                  </button>
                </div>
              </div>
              <input
                id="area-in"
                className="input num"
                placeholder={areaUnit === 'm2' ? '예) 84.9' : '예) 25.7'}
                inputMode="decimal"
                value={areaText}
                onChange={(e) => setAreaText(e.target.value)}
              />
              {areaM2 && (
                <p className="field-hint">
                  = 전용 {areaM2}㎡ ({m2ToPyeong(areaM2)}평) 기준으로 계산해요. 등기부·계약서의 전용면적을 넣으세요.
                </p>
              )}
              <div className="chips">
                {AREA_PRESETS.map((a) => {
                  const label = areaUnit === 'm2' ? `${a}㎡` : `${m2ToPyeong(a)}평`;
                  const on = areaM2 !== undefined && Math.abs(areaM2 - a) < 0.01;
                  return (
                    <button
                      key={a}
                      className={`chip ${on ? 'on' : ''}`}
                      onClick={() => setAreaText(areaUnit === 'm2' ? String(a) : String(m2ToPyeong(a)))}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="field">
            <label className="field-label" htmlFor="mv-in">입주일</label>
            <input id="mv-in" type="date" className="input num" value={moveIn} max={moveOut || undefined} onChange={(e) => setMoveIn(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="mv-out">퇴거(예정)일</label>
            <input id="mv-out" type="date" className="input num" value={moveOut} min={moveIn || undefined} onChange={(e) => setMoveOut(e.target.value)} />
            {dateValid && <p className="field-hint">거주기간 {durationKo(moveIn, moveOut)} — 첫 달과 마지막 달은 일수로 나눠 계산(일할계산)해요.</p>}
            {!!moveIn && !!moveOut && !dateValid && (
              <p className="field-hint" style={{ color: 'var(--red)' }}>퇴거일이 입주일보다 뒤여야 해요.</p>
            )}
          </div>

          <button className="btn btn-primary btn-lg btn-full" disabled={!step2Done} onClick={submit}>
            환급액 계산하기
          </button>
        </div>
      )}
    </div>
  );
}

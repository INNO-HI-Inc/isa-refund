import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { verifyLicense, type LicensePayload } from './verify';

const STORAGE_KEY = 'isa:license';

interface LicenseCtx {
  licensed: boolean;
  payload: LicensePayload | null;
  activate: (key: string) => { ok: boolean; reason?: string };
  deactivate: () => void;
}

const Ctx = createContext<LicenseCtx>({
  licensed: false,
  payload: null,
  activate: () => ({ ok: false, reason: 'not ready' }),
  deactivate: () => {},
});

function loadStored(): { licensed: boolean; payload: LicensePayload | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { licensed: false, payload: null };
    const r = verifyLicense(raw);
    return r.ok ? { licensed: true, payload: r.payload ?? null } : { licensed: false, payload: null };
  } catch {
    return { licensed: false, payload: null };
  }
}

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadStored);

  const activate = useCallback((key: string) => {
    const r = verifyLicense(key);
    if (r.ok) {
      try {
        localStorage.setItem(STORAGE_KEY, key.trim());
      } catch {
        /* ignore */
      }
      setState({ licensed: true, payload: r.payload ?? null });
      return { ok: true };
    }
    return { ok: false, reason: r.reason };
  }, []);

  const deactivate = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setState({ licensed: false, payload: null });
  }, []);

  const value = useMemo(
    () => ({ licensed: state.licensed, payload: state.payload, activate, deactivate }),
    [state, activate, deactivate],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLicense(): LicenseCtx {
  return useContext(Ctx);
}

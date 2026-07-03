import { NavLink, Link, Outlet } from 'react-router-dom';
import { LEGAL_DISCLAIMER } from '../lib/legal';

export default function Layout() {
  return (
    <div className="shell">
      <header className="hd no-print">
        <div className="hd-in">
          <Link to="/" className="brand">
            <span className="brand-mark">₩</span>
            이사정산소
          </Link>
          <nav>
            <NavLink to="/calc" className={({ isActive }) => (isActive ? 'on' : '')}>
              계산하기
            </NavLink>
            <NavLink to="/docs" className={({ isActive }) => (isActive ? 'on' : '')}>
              서류 만들기
            </NavLink>
            <NavLink to="/premium" className={({ isActive }) => (isActive ? 'on' : '')}>
              프리미엄
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="page">
        <Outlet />
      </main>

      <footer className="ft no-print">
        <div className="ft-in">
          <div className="ft-brand">₩ 이사정산소</div>
          <p>{LEGAL_DISCLAIMER}</p>
          <p style={{ marginTop: 10 }}>
            단지별 단가 데이터 출처: 국토교통부 공동주택관리정보시스템(K-apt) 공공데이터 · 일부 단지는 샘플
            데이터로 표시됩니다.
          </p>
        </div>
      </footer>
    </div>
  );
}

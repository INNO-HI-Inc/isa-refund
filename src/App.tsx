import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Result from './pages/Result';
import Docs from './pages/Docs';
import DocDemand from './pages/DocDemand';
import DocOrder from './pages/DocOrder';
import DocChecklist from './pages/DocChecklist';
import Premium from './pages/Premium';
import { LicenseProvider } from './license/LicenseContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <LicenseProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/calc" element={<Calculator />} />
            <Route path="/result" element={<Result />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/docs/demand" element={<DocDemand />} />
            <Route path="/docs/order" element={<DocOrder />} />
            <Route path="/docs/checklist" element={<DocChecklist />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </HashRouter>
    </LicenseProvider>
  );
}

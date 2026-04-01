import { Route, Routes } from 'react-router-dom';
import DoacaoModal from './components/DoacaoModal';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import Header from './components/Header';
import HistoricoPage from './pages/HistoricoPage';
import HomePage from './pages/HomePage';
import ResumoIRPage from './pages/ResumoIRPage';
import { isLocalStorageAvailable } from './services/localStorage';

const storageAvailable = isLocalStorageAvailable();

export default function App() {
  return (
    <div className="min-h-screen bg-background bg-hero-glow text-foreground dark:bg-hero-glow-dark">
      <div className="flex min-h-screen flex-col">
        <Header />
        {!storageAvailable && (
          <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-300">
            O armazenamento do navegador está bloqueado. As operações não serão salvas. Verifique as
            configurações de cookies ou tente em outra aba.
          </div>
        )}
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-6 pt-8 sm:px-6 lg:px-8">
          <main className="flex-1 py-8">
            <Routes>
              <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
              <Route path="/historico" element={<ErrorBoundary><HistoricoPage /></ErrorBoundary>} />
              <Route path="/resumo-ir" element={<ErrorBoundary><ResumoIRPage /></ErrorBoundary>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
      <DoacaoModal />
    </div>
  );
}

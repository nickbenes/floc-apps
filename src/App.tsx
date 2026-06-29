import { useEffect, useState } from 'react';
import { db } from './db';

function App() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  useEffect(() => {
    db.open()
      .then(() => setDbStatus('ok'))
      .catch(() => setDbStatus('error'));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center font-sans">
      <h1 className="text-3xl font-semibold text-slate-900 mb-2">FLoC Apps</h1>
      <p className="text-slate-500 mb-8">
        Architecture scaffold (FR-025) — no features yet. Todos is the first module to land.
      </p>
      <p className="text-sm text-slate-400">
        IndexedDB data layer (Dexie):{' '}
        {dbStatus === 'checking' && 'checking…'}
        {dbStatus === 'ok' && <span className="text-emerald-600">connected ✓</span>}
        {dbStatus === 'error' && <span className="text-red-600">failed</span>}
      </p>
    </div>
  );
}

export default App;

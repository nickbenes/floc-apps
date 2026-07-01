import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Minimal SVG illustrations for each app — lo-fi / cartoonish style

function TodosIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Paper */}
      <rect x="14" y="10" width="52" height="60" rx="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2"/>
      {/* Lines */}
      <line x1="26" y1="28" x2="54" y2="28" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round"/>
      <line x1="26" y1="38" x2="54" y2="38" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round"/>
      <line x1="26" y1="48" x2="48" y2="48" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round"/>
      {/* Checkbox done */}
      <rect x="18" y="24" width="6" height="6" rx="1" fill="#0f172a"/>
      <polyline points="19.5,27 21,28.5 23,25.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Checkbox done */}
      <rect x="18" y="34" width="6" height="6" rx="1" fill="#0f172a"/>
      <polyline points="19.5,37 21,38.5 23,35.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Checkbox empty */}
      <rect x="18" y="44" width="6" height="6" rx="1" fill="white" stroke="#94a3b8" strokeWidth="1.5"/>
    </svg>
  );
}

function ActivitySheetsIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Paper */}
      <rect x="12" y="10" width="56" height="60" rx="5" fill="#faf5ff" stroke="#c4b5fd" strokeWidth="2"/>
      {/* Grid */}
      <rect x="20" y="24" width="40" height="32" rx="2" fill="white" stroke="#ddd6fe" strokeWidth="1.5"/>
      {/* Grid lines vertical */}
      <line x1="32" y1="24" x2="32" y2="56" stroke="#ddd6fe" strokeWidth="1"/>
      <line x1="44" y1="24" x2="44" y2="56" stroke="#ddd6fe" strokeWidth="1"/>
      {/* Grid lines horizontal */}
      <line x1="20" y1="33" x2="60" y2="33" stroke="#ddd6fe" strokeWidth="1"/>
      <line x1="20" y1="42" x2="60" y2="42" stroke="#ddd6fe" strokeWidth="1"/>
      {/* Header row fill */}
      <rect x="20" y="24" width="40" height="9" rx="2" fill="#ede9fe"/>
      {/* A couple of checkmarks in the grid */}
      <text x="34.5" y="40" fontSize="7" fill="#7c3aed" fontFamily="monospace">✓</text>
      <text x="46.5" y="49" fontSize="7" fill="#7c3aed" fontFamily="monospace">✓</text>
      {/* Pencil */}
      <g transform="translate(52,8) rotate(35)">
        <rect x="-2" y="0" width="4" height="14" rx="1" fill="#fbbf24"/>
        <polygon points="-2,14 2,14 0,18" fill="#f87171"/>
        <rect x="-2" y="0" width="4" height="3" rx="1" fill="#d1d5db"/>
      </g>
    </svg>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const APPS = [
  {
    to: '/todos',
    label: 'Todos',
    description: 'Your list, on your device.',
    bg: 'bg-slate-900',
    textColor: 'text-white',
    descColor: 'text-slate-400',
    illustration: <TodosIllustration />,
    illustrationBg: 'bg-slate-800',
  },
  {
    to: '/activity-sheets',
    label: 'Activity Sheets',
    description: 'Logic puzzles by grade and theme.',
    bg: 'bg-violet-600',
    textColor: 'text-white',
    descColor: 'text-violet-200',
    illustration: <ActivitySheetsIllustration />,
    illustrationBg: 'bg-violet-500',
  },
];

export default function HomePage() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Install button — top-right corner, only visible when installable */}
      {installPrompt && !installed && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 bg-white border border-slate-200 shadow-md rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:shadow-lg transition-shadow"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-violet-600">
              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z"/>
              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"/>
            </svg>
            Add to Home Screen
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">FLoC</h1>
          <p className="text-slate-500 text-sm mt-1">Front Lines of Code</p>
          <p className="text-slate-500 text-sm">Your tools. Your data.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          {APPS.map(app => (
            <Link
              key={app.to}
              to={app.to}
              className={`${app.bg} rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow no-underline`}
            >
              <div className={`${app.illustrationBg} rounded-xl w-full aspect-square max-w-[100px] mx-auto p-3`}>
                {app.illustration}
              </div>
              <div>
                <div className={`font-semibold text-base ${app.textColor}`}>{app.label}</div>
                <div className={`text-xs mt-0.5 ${app.descColor}`}>{app.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { useApp } from '@/AppContext';

export function ToastStack() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed bottom-28 sm:bottom-32 right-4 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] sm:w-auto sm:max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} id={t.id} message={t.message} kind={t.kind} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

function ToastItem({
  id,
  message,
  kind,
  onDismiss,
}: {
  id: number;
  message: string;
  kind: 'info' | 'success' | 'warn';
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 3500);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const Icon = kind === 'success' ? CheckCircle2 : kind === 'warn' ? AlertTriangle : Info;
  const color =
    kind === 'success'
      ? 'text-neon-green ring-neon-green/30'
      : kind === 'warn'
        ? 'text-amber-400 ring-amber-400/30'
        : 'text-neon-purple ring-neon-purple/30';

  return (
    <div
      className={`glass-strong flex items-center gap-3 rounded-xl px-4 py-3 shadow-glass animate-slide-up ring-1 ${color}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm text-slate-100">{message}</p>
      <button onClick={() => onDismiss(id)} className="text-slate-400 hover:text-white">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

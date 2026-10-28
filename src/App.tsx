import { useCallback, useEffect, useRef, useState } from 'react';
import { AppContext, type AppContextValue, type Toast } from '@/AppContext';
import { usePlayer } from '@/usePlayer';
import * as db from '@/proxyDatabase';
import type { Track } from '@/types';
import { Header } from '@/components/Header';
import { ListenView } from '@/components/ListenView';
import { CreatorStudio } from '@/components/CreatorStudio';
import { NodeMeshMonitor } from '@/components/NodeMeshMonitor';
import { AudioPlayer } from '@/components/AudioPlayer';
import { SupportModal } from '@/components/SupportModal';
import { ToastStack } from '@/components/ToastStack';

function App() {
  const [view, setView] = useState('listen');
  const [supportTrack, setSupportTrack] = useState<Track | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // seed the db on mount
  useEffect(() => {
    db.loadDb();
  }, []);

  const pushToast = useCallback((message: string, kind: Toast['kind'] = 'info') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, kind }].slice(-4));
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const player = usePlayer();

  const ctxValue: AppContextValue = {
    view,
    setView,
    player,
    toasts,
    pushToast,
    dismissToast,
  };

  return (
    <AppContext.Provider value={ctxValue}>
      <div className="min-h-screen pb-44">
        <Header />
        <main className="animate-fade-in">
          {view === 'listen' && <ListenView onSupport={setSupportTrack} />}
          {view === 'studio' && <CreatorStudio />}
          {view === 'mesh' && <NodeMeshMonitor />}
        </main>
        <AudioPlayer onSupport={() => setSupportTrack(player.state.currentTrack)} />
        <SupportModal track={supportTrack} onClose={() => setSupportTrack(null)} />
        <ToastStack />
      </div>
    </AppContext.Provider>
  );
}

export default App;

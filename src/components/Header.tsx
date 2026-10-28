import { useEffect, useState } from 'react';
import { Activity, Headphones, Mic2, Network, Wallet } from 'lucide-react';
import { useApp } from '@/AppContext';
import * as db from '@/proxyDatabase';
import { shortAddr } from '@/utils';

const TABS = [
  { id: 'listen', label: 'Listen & Discover', icon: Headphones },
  { id: 'studio', label: 'Creator Studio', icon: Mic2 },
  { id: 'mesh', label: 'Node Mesh Monitor', icon: Network },
];

export function Header() {
  const { view, setView } = useApp();
  const [onlineNodes, setOnlineNodes] = useState(0);
  const [totalNodes, setTotalNodes] = useState(0);
  const [balance, setBalance] = useState(0);
  const [addr, setAddr] = useState('');

  useEffect(() => {
    const sync = () => {
      const nodes = db.getNodes();
      setOnlineNodes(nodes.filter((n) => n.status !== 'Degraded').length);
      setTotalNodes(nodes.length);
      setBalance(db.getWallet().balance);
      setAddr(db.getWallet().address);
    };
    sync();
    const unsub = db.subscribe(sync);
    return unsub;
  }, []);

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo + status */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neon-green to-neon-purple shadow-glow-green">
              <Activity className="h-5 w-5 text-base-900" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-lg font-bold leading-none tracking-tight">
                Resonate <span className="text-neon-green">P2P</span>
              </h1>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-green" />
                </span>
                <span className="truncate">
                  Proxy DB Active — {onlineNodes} Nodes Synced
                </span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-base-950/60 p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = view === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-neon-green/20 to-neon-purple/20 text-white shadow-glow-green ring-1 ring-neon-green/40'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Wallet */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-full bg-base-950/70 px-3.5 py-1.5 ring-1 ring-neon-purple/30 shadow-glow-purple">
              <Wallet className="h-4 w-4 text-neon-purple" />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-mono text-[10px] text-slate-400">{shortAddr(addr)}</span>
                <span className="font-display text-sm font-bold text-neon-green">
                  ${balance.toFixed(2)}
                </span>
              </div>
              <div className="sm:hidden font-display text-sm font-bold text-neon-green">
                ${balance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex md:hidden items-center gap-1 pb-3 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-gradient-to-r from-neon-green/20 to-neon-purple/20 text-white ring-1 ring-neon-green/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

import { useEffect, useMemo, useState } from 'react';
import {
  Cpu,
  Gauge,
  Globe2,
  HardDrive,
  Network,
  Radio,
  ShieldCheck,
  Signal,
  Wifi,
} from 'lucide-react';
import * as db from '@/proxyDatabase';
import type { ConsensusLogEntry, MeshNode } from '@/types';
import { formatNum } from '@/utils';

const STATUS_STYLES: Record<MeshNode['status'], string> = {
  Online: 'bg-neon-green text-neon-green',
  Syncing: 'bg-amber-400 text-amber-400',
  Degraded: 'bg-rose-500 text-rose-500',
};

export function NodeMeshMonitor() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      db.tickNodeMesh();
    }, 4000);
    const unsub = db.subscribe(() => setTick((t) => t + 1));
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  const nodes = useMemo(() => db.getNodes(), [tick]);
  const log = useMemo(() => db.getDb().consensusLog, [tick]);

  const totalStorageTB = nodes.reduce((s, n) => s + n.allocatedStorageGB, 0) / 1024;
  const usedStorageTB = nodes.reduce((s, n) => s + n.usedStorageGB, 0) / 1024;
  const totalBandwidth = nodes.reduce((s, n) => s + n.bandwidthMbps, 0);
  const onlinePeers = nodes.filter((n) => n.status !== 'Degraded').length;
  const avgHealth = nodes.length
    ? Math.round(nodes.reduce((s, n) => s + n.healthScore, 0) / nodes.length)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-neon-green text-xs font-mono uppercase tracking-widest">
          <Network className="h-4 w-4" />
          Node Mesh · Live Consensus
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Storage network monitor</h2>
        <p className="mt-1 text-sm text-slate-400 max-w-lg">
          {nodes.length} community-operated nodes pinning content with content-addressed replication.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={HardDrive} label="Allocated Storage" value={`${totalStorageTB.toFixed(1)} TB`} accent="green" />
        <MetricCard icon={Gauge} label="Used Storage" value={`${usedStorageTB.toFixed(1)} TB`} sub={`${Math.round((usedStorageTB / totalStorageTB) * 100)}%`} accent="purple" />
        <MetricCard icon={Wifi} label="Active Peers" value={`${onlinePeers}/${nodes.length}`} accent="green" />
        <MetricCard icon={Signal} label="Total Bandwidth" value={`${(totalBandwidth / 1000).toFixed(1)} Gbps`} accent="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node grid */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-neon-green" />
                Peer Nodes
              </h3>
              <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-neon-green" />
                Avg health {avgHealth}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nodes.map((n) => (
                <NodeCard key={n.nodeId} node={n} />
              ))}
            </div>
          </div>
        </div>

        {/* Consensus log */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-5 h-full flex flex-col">
            <h3 className="font-display font-bold flex items-center gap-2 mb-4">
              <Radio className="h-4 w-4 text-neon-purple animate-pulse" />
              Consensus Log
            </h3>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[520px] pr-1">
              {log.map((entry) => (
                <LogEntry key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NodeCard({ node }: { node: MeshNode }) {
  const dotClass = STATUS_STYLES[node.status];
  const usedPct = Math.round((node.usedStorageGB / node.allocatedStorageGB) * 100);
  const bwPct = Math.min(100, Math.round((node.bandwidthMbps / 1400) * 100));

  return (
    <div className="rounded-xl bg-base-950/50 p-3.5 ring-1 ring-white/5 hover:ring-white/10 transition-all">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs font-bold text-slate-200 truncate">{node.nodeId}</p>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Globe2 className="h-3 w-3" />
            {node.location}
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className={`h-2 w-2 rounded-full ${dotClass} ${node.status === 'Online' ? 'animate-pulse-glow' : ''}`} />
          <span className="text-slate-400">{node.status}</span>
        </span>
      </div>

      {/* Storage bar */}
      <div className="mt-3">
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
          <span>Storage</span>
          <span>{node.usedStorageGB}/{node.allocatedStorageGB} GB</span>
        </div>
        <div className="h-1.5 rounded-full bg-base-700/50 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-green to-neon-greenDim" style={{ width: `${usedPct}%` }} />
        </div>
      </div>

      {/* Bandwidth bar */}
      <div className="mt-2">
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
          <span>Bandwidth</span>
          <span>{node.bandwidthMbps} Mbps</span>
        </div>
        <div className="h-1.5 rounded-full bg-base-700/50 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-purple to-neon-purpleDim" style={{ width: `${bwPct}%` }} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
        <span className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="h-3 w-3 text-neon-green" />
          {node.healthScore}
        </span>
        <span className="flex items-center gap-1 text-slate-400">
          <Cpu className="h-3 w-3" />
          {formatNum(node.pinnedFiles)} pinned
        </span>
        <span className="text-slate-400">{node.uptimePct}% up</span>
      </div>
    </div>
  );
}

function LogEntry({ entry }: { entry: ConsensusLogEntry }) {
  const colorMap = {
    info: 'text-slate-400',
    verify: 'text-neon-green',
    warn: 'text-amber-400',
    sync: 'text-neon-purple',
  };
  const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return (
    <div className="rounded-lg bg-base-950/40 px-3 py-2 ring-1 ring-white/5 animate-fade-in">
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-500">{entry.nodeId}</span>
        <span className="text-slate-600">{time}</span>
      </div>
      <p className={`mt-0.5 text-xs leading-snug ${colorMap[entry.level]}`}>
        <span className="font-mono uppercase text-[9px] mr-1.5 opacity-60">[{entry.level}]</span>
        {entry.message}
      </p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Network;
  label: string;
  value: string;
  sub?: string;
  accent: 'green' | 'purple';
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          accent === 'green' ? 'bg-neon-green/15 text-neon-green' : 'bg-neon-purple/15 text-neon-purple'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 font-display text-xl font-bold">{value}</p>
      <p className="text-xs text-slate-400">
        {label} {sub && <span className="text-slate-500">· {sub}</span>}
      </p>
    </div>
  );
}

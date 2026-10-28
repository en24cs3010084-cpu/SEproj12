import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  DollarSign,
  FileAudio,
  Hash,
  Mic2,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react';
import * as db from '@/proxyDatabase';
import { useApp } from '@/AppContext';
import type { Track } from '@/types';
import { formatNum, formatUSD, shortHash } from '@/utils';

function randomIpfsHash(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 52; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `ipfs://bafybei${s}`;
}

export function CreatorStudio() {
  const { pushToast } = useApp();
  const [tick, setTick] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const unsub = db.subscribe(() => setTick((t) => t + 1));
    return () => {
      unsub();
      for (const url of objectUrlsRef.current.values()) URL.revokeObjectURL(url);
      objectUrlsRef.current.clear();
    };
  }, []);

  const myTracks = useMemo(() => {
    // demo: first seed artist "V0LTAGE" + any uploaded by user (id starts with trk_)
    const all = db.getAllTracks();
    return all.filter((t) => t.artist === 'V0LTAGE' || t.id.startsWith('trk_') && !['trk_nightdrive','trk_plasma','trk_neonguitar','trk_matrix','trk_vinyl','trk_rooftop'].includes(t.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const analytics = useMemo(() => {
    const all = db.getAnalytics();
    return all.find((a) => a.artistId === 'V0LTAGE') ?? all[0];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const file = files[0];
    const okTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/x-flac'];
    const extOk = /\.(mp3|wav|flac)$/i.test(file.name);
    if (!okTypes.includes(file.type) && !extOk) {
      pushToast('Please drop an .mp3, .wav, or .flac file', 'warn');
      return;
    }
    setUploading(true);
    pushToast('Pinning to IPFS mesh…', 'info');
    const audioUrl = URL.createObjectURL(file);
    objectUrlsRef.current.set(file.name, audioUrl);

    // simulate async pin
    await new Promise((r) => setTimeout(r, 700));

    const format = /\.flac$/i.test(file.name) ? 'FLAC' : /\.wav$/i.test(file.name) ? 'WAV' : 'MP3';
    const title = file.name.replace(/\.[^.]+$/, '');
    db.addTrack({
      title,
      artist: 'V0LTAGE',
      coverArt:
        'https://images.pexels.com/photos/31805824/pexels-photo-31805824.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      audioUrl,
      format,
      ipfsHash: randomIpfsHash(),
      daiEnabled: true,
      durationSec: 0,
    });
    db.appendConsensusLog({
      nodeId: 'node-ams-09',
      level: 'sync',
      message: `New upload pinned: ${title} — replicating across 12 nodes`,
    });
    setUploading(false);
    pushToast(`"${title}" uploaded & live on the mesh`, 'success');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-neon-purple text-xs font-mono uppercase tracking-widest">
          <Mic2 className="h-4 w-4" />
          Creator Studio
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">V0LTAGE's dashboard</h2>
      </div>

      {/* Analytics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={TrendingUp}
          label="Monthly Streams"
          value={formatNum(analytics?.monthlyStreams ?? 0)}
          accent="green"
        />
        <StatCard
          icon={DollarSign}
          label="Total Earnings"
          value={formatUSD(analytics?.totalEarnings ?? 0)}
          accent="purple"
        />
        <StatCard
          icon={Activity}
          label="Ad Revenue"
          value={formatUSD(analytics?.adRevenue ?? 0)}
          accent="green"
        />
        <StatCard
          icon={Users}
          label="Direct Tips"
          value={formatUSD(analytics?.directTips ?? 0)}
          accent="purple"
        />
      </div>

      {/* Revenue split bar */}
      <div className="glass rounded-2xl p-5 mb-8">
        <h3 className="font-display font-bold mb-3">Revenue Split</h3>
        <div className="flex h-3 rounded-full overflow-hidden bg-base-950/60 ring-1 ring-white/10">
          <div
            className="bg-gradient-to-r from-neon-green to-neon-greenDim"
            style={{ width: `${pct(analytics?.adRevenue, analytics?.totalEarnings)}%` }}
          />
          <div
            className="bg-gradient-to-r from-neon-purple to-neon-purpleDim"
            style={{ width: `${pct(analytics?.directTips, analytics?.totalEarnings)}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-neon-green" />
            Ads {formatUSD(analytics?.adRevenue ?? 0)} ({pct(analytics?.adRevenue, analytics?.totalEarnings)}%)
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-neon-purple" />
            Direct Tips {formatUSD(analytics?.directTips ?? 0)} ({pct(analytics?.directTips, analytics?.totalEarnings)}%)
          </span>
        </div>
      </div>

      {/* Upload + track management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drag & drop */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`glass rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${
            dragActive ? 'ring-2 ring-neon-green shadow-glow-green scale-[1.01]' : 'ring-1 ring-white/10'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".mp3,.wav,.flac,audio/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-green/20 to-neon-purple/20 ring-1 ring-neon-green/30">
            {uploading ? (
              <Upload className="h-7 w-7 text-neon-green animate-pulse" />
            ) : (
              <FileAudio className="h-7 w-7 text-neon-green" />
            )}
          </div>
          <h3 className="mt-4 font-display text-lg font-bold">
            {uploading ? 'Pinning to mesh…' : 'Drop a track to upload'}
          </h3>
          <p className="mt-1 text-sm text-slate-400 max-w-xs">
            .mp3, .wav, or .flac. Files are stored as a blob and pinned with a generated IPFS CID.
          </p>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="mt-4 rounded-xl bg-gradient-to-r from-neon-green to-neon-purple px-5 py-2.5 font-display font-bold text-base-900 transition-transform hover:scale-105 disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Browse files'}
          </button>
        </div>

        {/* Track list with monetization */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold mb-4">Your Tracks & Monetization</h3>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {myTracks.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No tracks yet. Upload one to get started.</p>
            ) : (
              myTracks.map((t) => (
                <TrackRow key={t.id} track={t} onChange={() => setTick((x) => x + 1)} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackRow({ track, onChange }: { track: Track; onChange: () => void }) {
  const { pushToast } = useApp();
  const [enabled, setEnabled] = useState(track.daiEnabled);

  function toggle() {
    const updated = db.toggleTrackDai(track.id);
    setEnabled(updated?.daiEnabled ?? !enabled);
    pushToast(
      `DAI ${updated?.daiEnabled ? 'enabled' : 'disabled'} for "${track.title}"`,
      updated?.daiEnabled ? 'info' : 'success'
    );
    onChange();
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-base-950/50 p-3 ring-1 ring-white/5">
      <img src={track.coverArt} alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-white/10" />
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm font-bold truncate">{track.title}</p>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <Hash className="h-3 w-3" />
          <span className="truncate">{shortHash(track.ipfsHash)}</span>
          <span className="rounded bg-base-700/40 px-1.5 py-0.5 text-neon-green">{track.format}</span>
        </div>
      </div>
      <button
        onClick={toggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? 'bg-neon-green' : 'bg-base-700'
        }`}
        title="Toggle Dynamic Ad Insertion"
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
      <span className="hidden sm:flex text-[11px] font-medium w-12 justify-end">
        {enabled ? (
          <span className="flex items-center gap-1 text-neon-green">
            <CheckCircle2 className="h-3 w-3" /> DAI
          </span>
        ) : (
          <span className="text-slate-500">Off</span>
        )}
      </span>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  accent: 'green' | 'purple';
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            accent === 'green'
              ? 'bg-neon-green/15 text-neon-green'
              : 'bg-neon-purple/15 text-neon-purple'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function pct(part?: number, total?: number): number {
  const p = part ?? 0;
  const t = total ?? 0;
  if (t <= 0) return 0;
  return Math.round((p / t) * 100);
}

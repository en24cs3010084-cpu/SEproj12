import { useMemo, useState } from 'react';
import { Flag, Headphones, Play, ShieldCheck, Sparkles, Volume2, Wallet } from 'lucide-react';
import * as db from '@/proxyDatabase';
import { useApp } from '@/AppContext';
import type { Track } from '@/types';
import { shortHash } from '@/utils';

export function ListenView({ onSupport }: { onSupport: (t: Track) => void }) {
  const { player, pushToast } = useApp();
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState<'all' | 'flac' | 'supported' | 'ads'>('all');

  const tracks = useMemo(() => {
    let list = db.getVisibleTracks();
    if (filter === 'flac') list = list.filter((t) => t.format === 'FLAC');
    if (filter === 'supported') list = list.filter((t) => db.isSupporter(t.artist));
    if (filter === 'ads') list = list.filter((t) => t.daiEnabled);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, tick]);

  // force re-render when db changes
  useMemo(() => db.subscribe(() => setTick((t) => t + 1)), []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-neon-green text-xs font-mono uppercase tracking-widest">
            <Sparkles className="h-4 w-4" />
            Discover · P2P Seeded
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
            Stream from the <span className="text-neon-green">decentralized</span> mesh
          </h2>
          <p className="mt-1 text-slate-400 text-sm max-w-lg">
            Tracks are pinned across {db.getNodes().length} community nodes. Lossless FLAC playback with optional
            ad-supported streaming.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['all', 'flac', 'supported', 'ads'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-neon-green/15 text-neon-green ring-1 ring-neon-green/40'
                  : 'bg-base-950/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f === 'all' ? 'All Tracks' : f === 'flac' ? 'FLAC Lossless' : f === 'supported' ? 'Ad-Free' : 'Ad-Supported'}
            </button>
          ))}
        </div>
      </div>

      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Headphones className="h-10 w-10 text-slate-600" />
          <p className="mt-3 text-slate-400">No tracks match this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tracks.map((t) => (
            <TrackCard
              key={t.id}
              track={t}
              isCurrent={player.state.currentTrack?.id === t.id}
              isPlaying={player.state.isPlaying && player.state.currentTrack?.id === t.id}
              onPlay={() => player.playTrack(t, tracks)}
              onSupport={() => onSupport(t)}
              onFlag={() => {
                const res = db.flagTrack(t.id);
                if (res.hidden) {
                  pushToast(`"${t.title}" hidden by community moderation`, 'warn');
                } else {
                  pushToast(`Flagged "${t.title}" (${res.track?.flagCount}/3)`, 'warn');
                }
                setTick((x) => x + 1);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TrackCard({
  track,
  isCurrent,
  isPlaying,
  onPlay,
  onSupport,
  onFlag,
}: {
  track: Track;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onSupport: () => void;
  onFlag: () => void;
}) {
  const supported = db.isSupporter(track.artist);

  return (
    <div
      className={`group glass rounded-2xl overflow-hidden transition-all hover:ring-1 hover:ring-neon-green/30 hover:shadow-glow-green ${
        isCurrent ? 'ring-1 ring-neon-green/50 shadow-glow-green' : ''
      }`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={track.coverArt}
          alt={track.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base-900/90 via-transparent to-transparent" />

        {/* badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-base-900/80 px-2 py-1 text-[10px] font-bold tracking-wider text-neon-green ring-1 ring-neon-green/40 backdrop-blur">
            {track.format}
          </span>
          {track.daiEnabled && !supported && (
            <span className="rounded-md bg-neon-purple/20 px-2 py-1 text-[10px] font-bold tracking-wider text-neon-purple ring-1 ring-neon-purple/40 backdrop-blur">
              AD
            </span>
          )}
          {supported && (
            <span className="flex items-center gap-1 rounded-md bg-neon-green/20 px-2 py-1 text-[10px] font-bold tracking-wider text-neon-green ring-1 ring-neon-green/40 backdrop-blur">
              <ShieldCheck className="h-3 w-3" /> AD-FREE
            </span>
          )}
        </div>

        {/* play */}
        <button
          onClick={onPlay}
          className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-neon-green to-neon-purple text-base-900 shadow-glow-green transition-transform hover:scale-110 active:scale-95"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <span className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-base-900" style={{ height: '100%', animation: 'equalize 0.8s ease-in-out infinite' }} />
              <span className="w-1 bg-base-900" style={{ height: '60%', animation: 'equalize 0.8s ease-in-out infinite 0.2s' }} />
              <span className="w-1 bg-base-900" style={{ height: '100%', animation: 'equalize 0.8s ease-in-out infinite 0.4s' }} />
            </span>
          ) : (
            <Play className="h-5 w-5 translate-x-0.5 fill-base-900" />
          )}
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display font-bold leading-tight truncate">{track.title}</h3>
            <p className="text-sm text-slate-400 truncate">{track.artist}</p>
          </div>
          <button
            onClick={onFlag}
            title="Flag for moderation"
            className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span className="truncate">{shortHash(track.ipfsHash)}</span>
          <span className="flex items-center gap-1">
            <Wallet className="h-3 w-3" />
            {track.supportCount} supporters
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <button
            onClick={onSupport}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-base-950/60 py-2 text-xs font-medium text-slate-200 ring-1 ring-white/10 transition-all hover:ring-neon-purple/40 hover:text-neon-purple"
          >
            <Volume2 className="h-3.5 w-3.5" />
            {supported ? 'Supported' : 'Tip to remove ads'}
          </button>
        </div>
      </div>
    </div>
  );
}

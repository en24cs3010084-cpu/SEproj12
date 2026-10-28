import { useEffect, useState } from 'react';
import {
  Mic2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  Radio,
} from 'lucide-react';
import { useApp } from '@/AppContext';
import { formatTime, shortHash } from '@/utils';

export function AudioPlayer({ onSupport }: { onSupport: () => void }) {
  const { player, pushToast } = useApp();
  const { state } = player;
  const [muted, setMuted] = useState(false);
  const [prevVol, setPrevVol] = useState(0.8);

  useEffect(() => {
    if (state.phase === 'ad' && state.currentAd && state.adCountdown === state.currentAd.durationSec) {
      pushToast(`Ad playing — 100% revenue goes to ${state.currentTrack?.artist}`, 'info');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.adCountdown]);

  if (!state.currentTrack && state.phase === 'idle') {
    return null;
  }

  const dur = state.duration || state.currentTrack?.durationSec || 0;
  const progress = dur > 0 ? (state.currentTime / dur) * 100 : 0;
  const showAd = state.phase === 'ad';

  function toggleMute() {
    if (muted) {
      player.setVolume(prevVol);
      setMuted(false);
    } else {
      setPrevVol(state.volume);
      player.setVolume(0);
      setMuted(true);
    }
  }

  const VolIcon = muted || state.volume === 0 ? VolumeX : state.volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Ad banner */}
      {showAd && state.currentAd && (
        <div className="glass-strong border-t border-neon-purple/40 px-4 py-2 animate-slide-up">
          <div className="mx-auto max-w-7xl flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-neon-purple/20 px-3 py-1 ring-1 ring-neon-purple/40">
              <Radio className="h-4 w-4 text-neon-purple animate-pulse" />
              <span className="font-mono text-xs font-bold text-neon-purple">
                AD · {state.adCountdown}s
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 truncate">
                <span className="font-bold text-neon-purple">{state.currentAd.sponsor}:</span>{' '}
                {state.currentAd.headline}
              </p>
              <p className="text-[11px] text-slate-400">
                Ad playing — 100% revenue goes to {state.currentTrack?.artist}
              </p>
            </div>
            <button
              onClick={onSupport}
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-neon-green/15 px-3 py-1.5 text-xs font-bold text-neon-green ring-1 ring-neon-green/40 hover:bg-neon-green/25 transition-colors"
            >
              Tip to skip ads
            </button>
          </div>
        </div>
      )}

      {/* Main player bar */}
      <div className="glass-strong border-t border-white/10 px-3 sm:px-6 py-3">
        <div className="mx-auto max-w-7xl flex items-center gap-3 sm:gap-4">
          {/* Track info */}
          <div className="flex items-center gap-3 min-w-0 w-[40%] sm:w-[28%]">
            {state.currentTrack && (
              <>
                <img
                  src={state.currentTrack.coverArt}
                  alt=""
                  className="h-12 w-12 rounded-lg object-cover ring-1 ring-white/10 shrink-0"
                />
                <div className="min-w-0 hidden sm:block">
                  <p className="font-display text-sm font-bold truncate">{state.currentTrack.title}</p>
                  <p className="text-xs text-slate-400 truncate">{state.currentTrack.artist}</p>
                </div>
                <div className="min-w-0 sm:hidden">
                  <p className="font-display text-xs font-bold truncate">{state.currentTrack.title}</p>
                </div>
              </>
            )}
          </div>

          {/* Controls + progress */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <button
                onClick={player.prev}
                disabled={showAd}
                className="text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                onClick={player.togglePlay}
                disabled={showAd}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon-green to-neon-purple text-base-900 shadow-glow-green transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isPlaying ? (
                  <Pause className="h-5 w-5 fill-base-900" />
                ) : (
                  <Play className="h-5 w-5 translate-x-0.5 fill-base-900" />
                )}
              </button>
              <button
                onClick={player.next}
                disabled={showAd}
                className="text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-9 text-right">{formatTime(state.currentTime)}</span>
              <input
                type="range"
                min={0}
                max={dur || 0}
                step={0.1}
                value={state.currentTime}
                onChange={(e) => player.seek(Number(e.target.value))}
                disabled={showAd}
                className="flex-1 disabled:opacity-40"
                style={{
                  background: `linear-gradient(to right, #22C55E ${progress}%, rgba(148,163,184,0.28) ${progress}%)`,
                  borderRadius: 9999,
                }}
              />
              <span className="w-9">{formatTime(dur)}</span>
            </div>
          </div>

          {/* Visualizer + volume */}
          <div className="hidden lg:flex items-center gap-1 w-32 justify-center">
            {state.visualizerBars.map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-neon-green to-neon-purple transition-all duration-100"
                style={{
                  height: `${Math.max(4, h * 28)}px`,
                  opacity: state.isPlaying ? 0.9 : 0.3,
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 w-[20%] sm:w-[12%] justify-end">
            <button
              onClick={onSupport}
              disabled={!state.currentTrack}
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-base-950/60 px-2.5 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-white/10 hover:ring-neon-purple/40 hover:text-neon-purple transition-all disabled:opacity-50"
            >
              <Mic2 className="h-3.5 w-3.5" />
              Tip
            </button>
            <div className="flex items-center gap-1.5">
              <button onClick={toggleMute} className="text-slate-400 hover:text-white">
                <VolIcon className="h-5 w-5" />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : state.volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  player.setVolume(v);
                  setMuted(v === 0);
                  setPrevVol(v || 0.8);
                }}
                className="w-16 sm:w-20 hidden sm:block"
              />
            </div>
          </div>
        </div>

        {/* mobile visualizer */}
        {state.isPlaying && (
          <div className="flex lg:hidden items-center justify-center gap-0.5 mt-2 h-6">
            {state.visualizerBars.slice(0, 16).map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-neon-green to-neon-purple transition-all duration-100"
                style={{ height: `${Math.max(3, h * 20)}px` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

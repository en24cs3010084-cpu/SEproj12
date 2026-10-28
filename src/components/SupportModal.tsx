import { useEffect, useState } from 'react';
import { Heart, ShieldCheck, X, Zap } from 'lucide-react';
import * as db from '@/proxyDatabase';
import { useApp } from '@/AppContext';
import type { Track } from '@/types';
import { shortHash } from '@/utils';

interface Props {
  track: Track | null;
  onClose: () => void;
}

const AMOUNTS = [1, 3, 5];

export function SupportModal({ track, onClose }: Props) {
  const { pushToast, player } = useApp();
  const [amount, setAmount] = useState(3);
  const [supporting, setSupporting] = useState(false);
  const [alreadySupported, setAlreadySupported] = useState(false);

  useEffect(() => {
    if (track) {
      setAlreadySupported(db.isSupporter(track.artist));
      setSupporting(false);
    }
  }, [track]);

  if (!track) return null;

  function confirmSupport() {
    if (!track) return;
    setSupporting(true);
    db.supportArtist(track.artist, amount, track.artist);
    pushToast(`Ad-free unlocked for ${track.artist}!`, 'success');
    setTimeout(() => {
      setSupporting(false);
      onClose();
    }, 900);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-xl ring-1 ring-white/10">
              <img src={track.coverArt} alt={track.title} className="h-full w-full object-cover" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold leading-tight">{track.title}</h3>
              <p className="text-sm text-slate-400">{track.artist}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-xl bg-neon-green/10 px-3 py-2 ring-1 ring-neon-green/30">
          <ShieldCheck className="h-4 w-4 text-neon-green shrink-0" />
          <p className="text-sm text-neon-green">
            Tip directly to the artist and permanently disable ads for their music.
          </p>
        </div>

        {alreadySupported ? (
          <div className="mt-5 flex flex-col items-center gap-3 rounded-xl bg-base-950/60 p-6 text-center ring-1 ring-white/10">
            <Heart className="h-8 w-8 text-neon-purple fill-neon-purple" />
            <p className="font-display text-base font-bold">You're a Supporter</p>
            <p className="text-sm text-slate-400">
              Ads are already disabled for {track.artist}. Thanks for supporting decentralized music.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                Choose support amount
              </p>
              <div className="grid grid-cols-3 gap-2">
                {AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`rounded-xl py-3 text-center transition-all ${
                      amount === a
                        ? 'bg-gradient-to-br from-neon-green to-neon-purple text-base-900 font-bold shadow-glow-green'
                        : 'bg-base-950/60 text-slate-200 ring-1 ring-white/10 hover:ring-neon-green/40'
                    }`}
                  >
                    <div className="font-display text-lg">${a}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-base-950/50 px-4 py-3 text-sm">
              <span className="text-slate-400">Your balance</span>
              <span className="font-mono font-bold text-neon-green">
                ${db.getWallet().balance.toFixed(2)}
              </span>
            </div>

            <button
              onClick={confirmSupport}
              disabled={supporting || db.getWallet().balance < amount}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-green to-neon-purple py-3.5 font-display font-bold text-base-900 transition-all hover:shadow-glow-green disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {supporting ? (
                <>
                  <Zap className="h-5 w-5 animate-pulse" />
                  Processing on-chain…
                </>
              ) : (
                <>
                  <Heart className="h-5 w-5" />
                  Support ${amount} & Remove Ads
                </>
              )}
            </button>
            {db.getWallet().balance < amount && (
              <p className="mt-2 text-center text-xs text-amber-400">
                Insufficient balance for this tip amount.
              </p>
            )}
          </>
        )}

        <p className="mt-4 text-center font-mono text-[11px] text-slate-500">
          CID {shortHash(track.ipfsHash)} · 100% revenue to artist
        </p>
      </div>
    </div>
  );
}

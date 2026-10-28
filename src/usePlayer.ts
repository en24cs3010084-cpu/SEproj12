import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AdCreative, Track } from './types';
import * as db from './proxyDatabase';

export type PlayerPhase = 'idle' | 'ad' | 'track';

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  phase: PlayerPhase;
  currentTime: number;
  duration: number;
  volume: number;
  currentAd: AdCreative | null;
  adCountdown: number;
  visualizerBars: number[];
}

const BARS = 28;

function randomBars(active: boolean): number[] {
  return Array.from({ length: BARS }, () => (active ? 0.18 + Math.random() * 0.82 : 0.08));
}

export function usePlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current && typeof Audio !== 'undefined') {
    audioRef.current = new Audio();
    audioRef.current.preload = 'metadata';
  }

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<PlayerPhase>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [currentAd, setCurrentAd] = useState<AdCreative | null>(null);
  const [adCountdown, setAdCountdown] = useState(0);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(() => randomBars(false));

  const adTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const adIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const visualizerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const audio = audioRef.current!;

  /* ---- visualizer animation ---- */
  useEffect(() => {
    if (visualizerRef.current) clearInterval(visualizerRef.current);
    if (isPlaying) {
      visualizerRef.current = setInterval(() => {
        setVisualizerBars(randomBars(true));
      }, 90);
    } else {
      setVisualizerBars(randomBars(false));
    }
    return () => {
      if (visualizerRef.current) clearInterval(visualizerRef.current);
    };
  }, [isPlaying]);

  /* ---- volume ---- */
  useEffect(() => {
    if (audio) audio.volume = volume;
  }, [audio, volume]);

  /* ---- audio element event listeners ---- */
  useEffect(() => {
    if (!audio) return;
    const onTime = () => {
      if (phase === 'track') setCurrentTime(audio.currentTime);
    };
    const onDur = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      if (phase === 'track') handleTrackEnd();
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('durationchange', onDur);
    audio.addEventListener('loadedmetadata', onDur);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('durationchange', onDur);
      audio.removeEventListener('loadedmetadata', onDur);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio, phase, queueIndex, queue]);

  function cleanupAd() {
    if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
    if (adIntervalRef.current) clearInterval(adIntervalRef.current);
    adTimeoutRef.current = null;
    adIntervalRef.current = null;
  }

  function playTrackAudio(track: Track) {
    setPhase('track');
    setCurrentAd(null);
    setAdCountdown(0);
    audio.src = track.audioUrl;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().catch(() => {
      setIsPlaying(false);
    });
    db.recordStreamPlay(track.artist, false);
  }

  function startAdThenTrack(track: Track, ad: AdCreative) {
    cleanupAd();
    setPhase('ad');
    setCurrentAd(ad);
    setAdCountdown(ad.durationSec);
    // play ad audio
    audio.src = ad.audioUrl;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().catch(() => {});
    db.recordStreamPlay(track.artist, true);

    adIntervalRef.current = setInterval(() => {
      setAdCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    adTimeoutRef.current = setTimeout(() => {
      cleanupAd();
      playTrackAudio(track);
    }, ad.durationSec * 1000);
  }

  const playTrack = useCallback(
    (track: Track, q?: Track[]) => {
      if (q && q.length) {
        setQueue(q);
        const idx = q.findIndex((t) => t.id === track.id);
        setQueueIndex(idx >= 0 ? idx : 0);
      } else if (!queue.length) {
        setQueue([track]);
        setQueueIndex(0);
      }

      setCurrentTrack(track);
      // DAI check: ad enabled AND user not a supporter
      const supported = db.isSupporter(track.artist);
      if (track.daiEnabled && !supported) {
        const ads = db.getAds();
        const ad = ads[Math.floor(Math.random() * ads.length)];
        startAdThenTrack(track, ad);
      } else {
        playTrackAudio(track);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queue]
  );

  function handleTrackEnd() {
    const next = queue[queueIndex + 1];
    if (next) {
      setQueueIndex((i) => i + 1);
      playTrack(next, queue);
    } else {
      setIsPlaying(false);
      setPhase('idle');
      setCurrentTrack(null);
      setCurrentTime(0);
      setDuration(0);
    }
  }

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    if (phase === 'ad') return; // can't skip ads
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [audio, currentTrack, phase]);

  const seek = useCallback(
    (time: number) => {
      if (phase !== 'track') return;
      audio.currentTime = time;
      setCurrentTime(time);
    },
    [audio, phase]
  );

  const next = useCallback(() => {
    if (phase === 'ad') return;
    const t = queue[queueIndex + 1];
    if (t) {
      setQueueIndex((i) => i + 1);
      playTrack(t, queue);
    }
  }, [phase, queue, queueIndex, playTrack]);

  const prev = useCallback(() => {
    if (phase === 'ad') return;
    if (audio.currentTime > 3 && phase === 'track') {
      audio.currentTime = 0;
      return;
    }
    const t = queue[queueIndex - 1];
    if (t) {
      setQueueIndex((i) => i - 1);
      playTrack(t, queue);
    }
  }, [audio, phase, queue, queueIndex, playTrack]);

  // re-evaluate ad-free when user supports an artist mid-playback
  useEffect(() => {
    const unsub = db.subscribe(() => {
      if (currentTrack && phase === 'ad') {
        if (db.isSupporter(currentTrack.artist)) {
          cleanupAd();
          playTrackAudio(currentTrack);
        }
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack, phase]);

  useEffect(() => {
    return () => {
      cleanupAd();
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  return useMemo(
    () => ({
      state: {
        currentTrack,
        queue,
        queueIndex,
        isPlaying,
        phase,
        currentTime,
        duration,
        volume,
        currentAd,
        adCountdown,
        visualizerBars,
      },
      playTrack,
      togglePlay,
      seek,
      next,
      prev,
      setVolume,
    }),
    [currentTrack, queue, queueIndex, isPlaying, phase, currentTime, duration, volume, currentAd, adCountdown, visualizerBars, playTrack, togglePlay, seek, next, prev]
  );
}

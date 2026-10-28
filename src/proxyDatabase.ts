import type {
  AdCreative,
  ArtistAnalytics,
  ArtistId,
  ConsensusLogEntry,
  MeshNode,
  ProxyDatabase,
  Track,
  WalletState,
} from './types';

const STORAGE_KEY = 'resonate_p2p_db_v1';
const DB_VERSION = 1;

/* ----------------------------- Seed Dataset ----------------------------- */

const SEED_TRACKS: Track[] = [
  {
    id: 'trk_nightdrive',
    title: 'Nightdrive 2089',
    artist: 'V0LTAGE',
    coverArt:
      'https://images.pexels.com/photos/6199739/pexels-photo-6199739.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    format: 'FLAC',
    ipfsHash: 'ipfs://bafybeih7q3d2xow4r5n6spm8kt9jxvz3mqwqrp4h8e6f7d8c9a0b1c2d3e4f5',
    daiEnabled: true,
    flagCount: 0,
    supportCount: 24,
    durationSec: 372,
    uploadedAt: '2026-09-14T10:00:00Z',
  },
  {
    id: 'trk_plasma',
    title: 'Plasma Arc',
    artist: 'Null Pointer',
    coverArt:
      'https://images.pexels.com/photos/33596415/pexels-photo-33596415.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    format: 'FLAC',
    ipfsHash: 'ipfs://bafybeic9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7',
    daiEnabled: true,
    flagCount: 0,
    supportCount: 12,
    durationSec: 426,
    uploadedAt: '2026-09-22T18:30:00Z',
  },
  {
    id: 'trk_neonguitar',
    title: 'Neon Cathedral',
    artist: 'Static Saint',
    coverArt:
      'https://images.pexels.com/photos/33418887/pexels-photo-33418887.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    format: 'MP3',
    ipfsHash: 'ipfs://bafybeid8e6f7d8c9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3',
    daiEnabled: false,
    flagCount: 0,
    supportCount: 58,
    durationSec: 348,
    uploadedAt: '2026-10-02T09:15:00Z',
  },
  {
    id: 'trk_matrix',
    title: 'Green Matrix Falls',
    artist: 'CryptoCat',
    coverArt:
      'https://images.pexels.com/photos/26765065/pexels-photo-26765065.png?auto=compress&cs=tinysrgb&h=650&w=940',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    format: 'FLAC',
    ipfsHash: 'ipfs://bafybeie4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2',
    daiEnabled: true,
    flagCount: 0,
    supportCount: 7,
    durationSec: 295,
    uploadedAt: '2026-10-10T22:45:00Z',
  },
  {
    id: 'trk_vinyl',
    title: 'Analog Dreams',
    artist: 'DJ Padriñán',
    coverArt:
      'https://images.pexels.com/photos/5764281/pexels-photo-5764281.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    format: 'WAV',
    ipfsHash: 'ipfs://bafybeif5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3',
    daiEnabled: false,
    flagCount: 0,
    supportCount: 33,
    durationSec: 401,
    uploadedAt: '2026-10-18T14:20:00Z',
  },
  {
    id: 'trk_rooftop',
    title: 'Rooftop Static',
    artist: 'lo-fi.girl',
    coverArt:
      'https://images.pexels.com/photos/26698229/pexels-photo-26698229.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    format: 'MP3',
    ipfsHash: 'ipfs://bafybeig6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4',
    daiEnabled: true,
    flagCount: 0,
    supportCount: 19,
    durationSec: 318,
    uploadedAt: '2026-10-25T11:05:00Z',
  },
];

const SEED_ANALYTICS: ArtistAnalytics[] = [
  {
    artistId: 'V0LTAGE',
    artistName: 'V0LTAGE',
    monthlyStreams: 18420,
    totalEarnings: 1284.5,
    adRevenue: 712.3,
    directTips: 572.2,
    tracks: 1,
  },
  {
    artistId: 'Null Pointer',
    artistName: 'Null Pointer',
    monthlyStreams: 9240,
    totalEarnings: 642.0,
    adRevenue: 388.5,
    directTips: 253.5,
    tracks: 1,
  },
  {
    artistId: 'lo-fi.girl',
    artistName: 'lo-fi.girl',
    monthlyStreams: 42180,
    totalEarnings: 3120.75,
    adRevenue: 0,
    directTips: 3120.75,
    tracks: 1,
  },
];

const SEED_NODES: MeshNode[] = [
  { nodeId: 'node-fra-01', location: 'Frankfurt, DE', status: 'Online', allocatedStorageGB: 512, usedStorageGB: 318, bandwidthMbps: 920, healthScore: 98, uptimePct: 99.8, pinnedFiles: 1842 },
  { nodeId: 'node-nyc-02', location: 'New York, US', status: 'Online', allocatedStorageGB: 1024, usedStorageGB: 642, bandwidthMbps: 1180, healthScore: 96, uptimePct: 99.5, pinnedFiles: 3210 },
  { nodeId: 'node-sgp-03', location: 'Singapore, SG', status: 'Syncing', allocatedStorageGB: 256, usedStorageGB: 198, bandwidthMbps: 410, healthScore: 87, uptimePct: 98.1, pinnedFiles: 980 },
  { nodeId: 'node-tok-04', location: 'Tokyo, JP', status: 'Online', allocatedStorageGB: 768, usedStorageGB: 501, bandwidthMbps: 880, healthScore: 99, uptimePct: 99.9, pinnedFiles: 2410 },
  { nodeId: 'node-lon-05', location: 'London, UK', status: 'Online', allocatedStorageGB: 384, usedStorageGB: 240, bandwidthMbps: 720, healthScore: 94, uptimePct: 99.2, pinnedFiles: 1560 },
  { nodeId: 'node-sao-06', location: 'São Paulo, BR', status: 'Online', allocatedStorageGB: 256, usedStorageGB: 112, bandwidthMbps: 320, healthScore: 91, uptimePct: 97.4, pinnedFiles: 720 },
  { nodeId: 'node-syd-07', location: 'Sydney, AU', status: 'Online', allocatedStorageGB: 512, usedStorageGB: 388, bandwidthMbps: 640, healthScore: 95, uptimePct: 99.0, pinnedFiles: 1680 },
  { nodeId: 'node-tor-08', location: 'Toronto, CA', status: 'Online', allocatedStorageGB: 640, usedStorageGB: 420, bandwidthMbps: 980, healthScore: 97, uptimePct: 99.6, pinnedFiles: 2090 },
  { nodeId: 'node-ams-09', location: 'Amsterdam, NL', status: 'Online', allocatedStorageGB: 1280, usedStorageGB: 980, bandwidthMbps: 1240, healthScore: 99, uptimePct: 99.9, pinnedFiles: 4120 },
  { nodeId: 'node-par-10', location: 'Paris, FR', status: 'Online', allocatedStorageGB: 384, usedStorageGB: 256, bandwidthMbps: 760, healthScore: 93, uptimePct: 98.8, pinnedFiles: 1410 },
  { nodeId: 'node-seo-11', location: 'Seoul, KR', status: 'Online', allocatedStorageGB: 768, usedStorageGB: 590, bandwidthMbps: 1020, healthScore: 98, uptimePct: 99.7, pinnedFiles: 2680 },
  { nodeId: 'node-mum-12', location: 'Mumbai, IN', status: 'Degraded', allocatedStorageGB: 256, usedStorageGB: 148, bandwidthMbps: 280, healthScore: 74, uptimePct: 95.2, pinnedFiles: 640 },
];

const SEED_ADS: AdCreative[] = [
  {
    id: 'ad_synthwave',
    sponsor: 'Synthwave Records',
    headline: 'New album drop — stream it free on Resonate',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    durationSec: 5,
    cpm: 4.2,
  },
  {
    id: 'ad_headphones',
    sponsor: 'Audiophile Co.',
    headline: 'Hear every detail. Studio-grade headphones.',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    durationSec: 5,
    cpm: 5.8,
  },
  {
    id: 'ad_exchange',
    sponsor: 'NodeStake DAO',
    headline: 'Earn storage rewards — run a Resonate node',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    durationSec: 5,
    cpm: 3.1,
  },
];

const SEED_WALLET: WalletState = {
  address: '0x71C8f3a9d2e6B5c4A1f0E3d7C9b2a8F6e4D14f9',
  balance: 150.0,
  transactions: [
    {
      id: 'tx_seed',
      type: 'payout',
      amount: 150.0,
      from: 'Resonate Treasury',
      memo: 'Node operator storage reward payout',
      timestamp: '2026-10-20T08:00:00Z',
    },
  ],
};

function seedConsensusLog(): ConsensusLogEntry[] {
  const now = Date.now();
  const entries: ConsensusLogEntry[] = [
    { id: 'log1', timestamp: new Date(now - 1000 * 60 * 2).toISOString(), nodeId: 'node-ams-09', level: 'verify', message: 'Verified CID bafy...d3e4f5 — 12/12 chunks matched' },
    { id: 'log2', timestamp: new Date(now - 1000 * 60 * 5).toISOString(), nodeId: 'node-sgp-03', level: 'sync', message: 'Syncing 64 new chunks from node-nyc-02' },
    { id: 'log3', timestamp: new Date(now - 1000 * 60 * 8).toISOString(), nodeId: 'node-nyc-02', level: 'info', message: 'Heartbeat OK — latency 18ms' },
    { id: 'log4', timestamp: new Date(now - 1000 * 60 * 12).toISOString(), nodeId: 'node-mum-12', level: 'warn', message: 'Health score dropped to 74 — bandwidth degraded' },
    { id: 'log5', timestamp: new Date(now - 1000 * 60 * 15).toISOString(), nodeId: 'node-tok-04', level: 'verify', message: 'Verified CID bafy...h7i8j9 — 8/8 chunks matched' },
    { id: 'log6', timestamp: new Date(now - 1000 * 60 * 19).toISOString(), nodeId: 'node-fra-01', level: 'info', message: 'Pinned 42 new tracks uploaded by creator' },
  ];
  return entries;
}

function buildSeedDb(): ProxyDatabase {
  return {
    tracks: SEED_TRACKS.map((t) => ({ ...t })),
    analytics: SEED_ANALYTICS.map((a) => ({ ...a })),
    nodes: SEED_NODES.map((n) => ({ ...n })),
    ads: SEED_ADS.map((a) => ({ ...a })),
    wallet: { ...SEED_WALLET, transactions: [...SEED_WALLET.transactions] },
    consensusLog: seedConsensusLog(),
    supporterArtists: [],
    flaggedTrackIds: [],
    version: DB_VERSION,
  };
}

/* ----------------------------- Persistence ----------------------------- */

function safeParse(raw: string | null): ProxyDatabase | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ProxyDatabase;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.version || parsed.version !== DB_VERSION) return null;
    if (!Array.isArray(parsed.tracks)) return null;
    return parsed;
  } catch {
    return null;
  }
}

let cache: ProxyDatabase | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ----------------------------- Public API ----------------------------- */

export function loadDb(): ProxyDatabase {
  if (cache) return cache;
  let db: ProxyDatabase | null = null;
  try {
    db = safeParse(localStorage.getItem(STORAGE_KEY));
  } catch {
    db = null;
  }
  if (!db) {
    db = buildSeedDb();
    persist(db);
  }
  cache = db;
  return cache;
}

function persist(db: ProxyDatabase) {
  cache = db;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // storage full / unavailable — keep in-memory copy
  }
  emit();
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export function getDb(): ProxyDatabase {
  return loadDb();
}

export function resetDb(): ProxyDatabase {
  const db = buildSeedDb();
  persist(db);
  return db;
}

export function getVisibleTracks(): Track[] {
  const db = getDb();
  return db.tracks.filter((t) => t.flagCount < 3 && !db.flaggedTrackIds.includes(t.id));
}

export function getAllTracks(): Track[] {
  return getDb().tracks;
}

export function addTrack(track: Omit<Track, 'id' | 'uploadedAt' | 'flagCount' | 'supportCount'>): Track {
  const db = getDb();
  const newTrack: Track = {
    ...track,
    id: `trk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    flagCount: 0,
    supportCount: 0,
    uploadedAt: new Date().toISOString(),
  };
  db.tracks = [newTrack, ...db.tracks];
  persist(db);
  return newTrack;
}

export function toggleTrackDai(trackId: string): Track | undefined {
  const db = getDb();
  const t = db.tracks.find((x) => x.id === trackId);
  if (!t) return undefined;
  t.daiEnabled = !t.daiEnabled;
  persist(db);
  return t;
}

export function flagTrack(trackId: string): { track?: Track; hidden: boolean } {
  const db = getDb();
  const t = db.tracks.find((x) => x.id === trackId);
  if (!t) return { hidden: false };
  t.flagCount += 1;
  let hidden = false;
  if (t.flagCount >= 3) {
    if (!db.flaggedTrackIds.includes(t.id)) db.flaggedTrackIds.push(t.id);
    hidden = true;
  }
  persist(db);
  return { track: t, hidden };
}

export function isSupporter(artistId: ArtistId): boolean {
  return getDb().supporterArtists.includes(artistId);
}

export function supportArtist(artistId: string, amount: number, artistName: string): void {
  const db = getDb();
  if (!db.supporterArtists.includes(artistId)) {
    db.supporterArtists.push(artistId);
  }
  // artist support count
  for (const t of db.tracks) {
    if (t.artist === artistId) t.supportCount += 1;
  }
  // analytics
  const a = db.analytics.find((x) => x.artistId === artistId);
  if (a) {
    a.directTips += amount;
    a.totalEarnings += amount;
  }
  // wallet
  db.wallet.balance = Math.max(0, db.wallet.balance - amount);
  db.wallet.transactions.unshift({
    id: `tx_${Date.now().toString(36)}`,
    type: 'support-unlock',
    amount,
    to: artistName,
    memo: `Direct support — ad-free unlock for ${artistName}`,
    timestamp: new Date().toISOString(),
  });
  persist(db);
}

export function recordStreamPlay(artistId: string, adPlayed: boolean): void {
  const db = getDb();
  const a = db.analytics.find((x) => x.artistId === artistId);
  if (!a) return;
  a.monthlyStreams += 1;
  if (adPlayed) {
    a.adRevenue += 0.012;
    a.totalEarnings += 0.012;
  }
  persist(db);
}

export function appendConsensusLog(entry: Omit<ConsensusLogEntry, 'id' | 'timestamp'>): void {
  const db = getDb();
  db.consensusLog.unshift({
    ...entry,
    id: `log_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    timestamp: new Date().toISOString(),
  });
  db.consensusLog = db.consensusLog.slice(0, 60);
  persist(db);
}

export function tickNodeMesh(): void {
  const db = getDb();
  let changed = false;
  for (const n of db.nodes) {
    // jitter bandwidth + used storage
    const bwDelta = Math.round((Math.random() - 0.5) * 60);
    n.bandwidthMbps = Math.max(80, Math.min(1400, n.bandwidthMbps + bwDelta));
    const storeDelta = Math.round((Math.random() - 0.3) * 4);
    n.usedStorageGB = Math.max(0, Math.min(n.allocatedStorageGB, n.usedStorageGB + storeDelta));
    if (n.status === 'Syncing' && Math.random() > 0.7) {
      n.status = 'Online';
      n.healthScore = Math.min(100, n.healthScore + 3);
      changed = true;
    }
    if (n.status === 'Degraded' && Math.random() > 0.85) {
      n.status = 'Online';
      n.healthScore = Math.min(100, n.healthScore + 6);
      changed = true;
    }
  }
  if (changed || Math.random() > 0.5) {
    appendConsensusLog({
      nodeId: db.nodes[Math.floor(Math.random() * db.nodes.length)].nodeId,
      level: Math.random() > 0.7 ? 'verify' : 'info',
      message: `Heartbeat OK — ${db.nodes.length} peers reachable, avg latency ${Math.round(14 + Math.random() * 30)}ms`,
    });
  }
  persist(db);
}

export function getWallet(): WalletState {
  return getDb().wallet;
}

export function getAnalytics(): ArtistAnalytics[] {
  return getDb().analytics;
}

export function getNodes(): MeshNode[] {
  return getDb().nodes;
}

export function getAds(): AdCreative[] {
  return getDb().ads;
}

export { clone };

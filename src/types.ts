export type AudioFormat = 'FLAC' | 'MP3' | 'WAV';

export interface Track {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  audioUrl: string;
  format: AudioFormat;
  ipfsHash: string;
  daiEnabled: boolean;
  flagCount: number;
  supportCount: number;
  durationSec?: number;
  uploadedAt: string;
}

export type ArtistId = string;

export interface ArtistAnalytics {
  artistId: ArtistId;
  artistName: string;
  monthlyStreams: number;
  totalEarnings: number;
  adRevenue: number;
  directTips: number;
  tracks: number;
}

export type NodeStatus = 'Online' | 'Syncing' | 'Degraded';

export interface MeshNode {
  nodeId: string;
  location: string;
  status: NodeStatus;
  allocatedStorageGB: number;
  usedStorageGB: number;
  bandwidthMbps: number;
  healthScore: number;
  uptimePct: number;
  pinnedFiles: number;
}

export interface AdCreative {
  id: string;
  sponsor: string;
  headline: string;
  audioUrl: string;
  durationSec: number;
  cpm: number;
}

export interface WalletTx {
  id: string;
  type: 'tip' | 'ad-revenue' | 'support-unlock' | 'payout';
  amount: number;
  to?: string;
  from?: string;
  memo: string;
  timestamp: string;
}

export interface WalletState {
  address: string;
  balance: number;
  transactions: WalletTx[];
}

export interface ConsensusLogEntry {
  id: string;
  timestamp: string;
  nodeId: string;
  level: 'info' | 'verify' | 'warn' | 'sync';
  message: string;
}

export interface ProxyDatabase {
  tracks: Track[];
  analytics: ArtistAnalytics[];
  nodes: MeshNode[];
  ads: AdCreative[];
  wallet: WalletState;
  consensusLog: ConsensusLogEntry[];
  supporterArtists: ArtistId[];
  flaggedTrackIds: string[];
  version: number;
}

export type StickerStatus = 'missing' | 'owned' | 'duplicate';
export type PanelId = 'album' | 'missing' | 'duplicates' | 'exchange';
export type ExchangeStep = 'form' | 'review';

export interface Sticker {
  id: string;
  code: string;
  section: string;
  teamCode: string;
  number: number;
  status: StickerStatus;
  duplicateCount: number;
  updatedAt?: string;
}

export interface StoredSticker {
  id: string;
  status: StickerStatus;
  duplicateCount?: number;
  updatedAt?: string;
}

export interface StoredUser {
  passwordHash?: string;
}

export interface StickerGroup {
  label: string;
  numbers: number[];
}

export interface ParsedStickerList {
  missingIds: Set<string>;
  duplicateIds: Set<string>;
  recognizedCount: number;
}

export interface ExchangePreview {
  partnerName: string;
  partnerGives: Sticker[];
  userGives: Sticker[];
  parsedCount: number;
  text: string;
}

export interface AlbumSection {
  name: string;
  stickers: Sticker[];
  owned: number;
  duplicate: number;
  missing: number;
}

import { Injectable } from '@angular/core';
import { Sticker, StickerGroup } from './app.models';

const TEAM_EMOJIS: Record<string, string> = {
  MEX: '🇲🇽',
  RSA: '🇿🇦',
  KOR: '🇰🇷',
  CZE: '🇨🇿',
  CAN: '🇨🇦',
  BIH: '🇧🇦',
  QAT: '🇶🇦',
  SUI: '🇨🇭',
  BRA: '🇧🇷',
  MAR: '🇲🇦',
  HAI: '🇭🇹',
  SCO: '🏴',
  USA: '🇺🇸',
  PAR: '🇵🇾',
  AUS: '🇦🇺',
  TUR: '🇹🇷',
  GER: '🇩🇪',
  CUW: '🇨🇼',
  CIV: '🇨🇮',
  ECU: '🇪🇨',
  NED: '🇳🇱',
  JPN: '🇯🇵',
  SWE: '🇸🇪',
  TUN: '🇹🇳',
  BEL: '🇧🇪',
  EGY: '🇪🇬',
  IRN: '🇮🇷',
  NZL: '🇳🇿',
  ESP: '🇪🇸',
  CPV: '🇨🇻',
  KSA: '🇸🇦',
  URU: '🇺🇾',
  FRA: '🇫🇷',
  SEN: '🇸🇳',
  IRQ: '🇮🇶',
  NOR: '🇳🇴',
  ARG: '🇦🇷',
  ALG: '🇩🇿',
  AUT: '🇦🇹',
  JOR: '🇯🇴',
  POR: '🇵🇹',
  COD: '🇨🇩',
  UZB: '🇺🇿',
  COL: '🇨🇴',
  ENG: '🏴',
  CRO: '🇭🇷',
  GHA: '🇬🇭',
  PAN: '🇵🇦',
  'CC-LAM': '🌎'
};

@Injectable({ providedIn: 'root' })
export class StickerFormatService {
  formatStickerList(title: string, stickers: Sticker[]): string {
    const rows = this.formatStickerRows(stickers, true);

    if (!rows) {
      return '';
    }

    return `${title}:\n\n${rows}`;
  }

  formatStickerRows(stickers: Sticker[], includeEmoji: boolean, highlightNumberOne = false): string {
    return this.groupStickerRows(stickers, includeEmoji)
      .map((group) =>
        `${group.label}: ${group.numbers.map((number) => this.formatStickerNumber(number, highlightNumberOne)).join(', ')}`
      )
      .join('\n');
  }

  groupStickerRows(stickers: Sticker[], includeEmoji: boolean): StickerGroup[] {
    const grouped = new Map<string, StickerGroup>();

    for (const sticker of stickers) {
      const label = this.downloadLabel(sticker, includeEmoji);
      const key = `${sticker.section}:${label}`;
      const group = grouped.get(key) ?? { label, numbers: [] };

      group.numbers.push(sticker.number);
      grouped.set(key, group);
    }

    return Array.from(grouped.values());
  }

  private formatStickerNumber(number: number, highlightNumberOne: boolean): string {
    return highlightNumberOne && number === 1 ? '1 ⭐' : String(number);
  }

  private downloadLabel(sticker: Sticker, includeEmoji: boolean): string {
    if (sticker.section === 'FIFA World Cup 2026') {
      return includeEmoji ? 'FWC 🏆' : 'FWC';
    }

    if (sticker.section === 'FIFA World Cup History') {
      return includeEmoji ? 'FWC 📜' : 'FWC';
    }

    const emoji = TEAM_EMOJIS[sticker.teamCode];
    return includeEmoji && emoji ? `${sticker.teamCode} ${emoji}` : sticker.teamCode;
  }
}

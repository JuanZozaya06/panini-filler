import { inject, Injectable } from '@angular/core';
import { ALBUM_CATALOG, StickerDefinition } from './album-catalog';
import { ExchangePreview, ParsedStickerList, Sticker } from './app.models';
import { StickerFormatService } from './sticker-format.service';

@Injectable({ providedIn: 'root' })
export class ExchangeService {
  private readonly formatter = inject(StickerFormatService);

  buildExchangePreview(partnerName: string, sourceText: string, missingStickers: Sticker[], duplicateStickers: Sticker[]): ExchangePreview {
    const normalizedPartnerName = partnerName.trim();
    const parsedList = this.parseExternalStickerList(sourceText);
    const partnerCandidates = missingStickers.filter((sticker) => parsedList.duplicateIds.has(sticker.id));
    const userCandidates = duplicateStickers.filter((sticker) => parsedList.missingIds.has(sticker.id));
    const { partnerGives, userGives } = this.balanceExchangeLists(partnerCandidates, userCandidates);
    const titleName = normalizedPartnerName || 'la otra persona';
    const partnerRows = this.formatter.formatStickerRows(partnerGives, true, true) || 'Nada por ahora';
    const userRows = this.formatter.formatStickerRows(userGives, true, true) || 'Nada por ahora';
    const text = normalizedPartnerName || partnerGives.length || userGives.length
      ? `Cambio con ${titleName}\n\n${titleName} me da (${partnerGives.length}):\n${partnerRows}\n\nYo le doy (${userGives.length}):\n${userRows}`
      : '';

    return {
      partnerName: normalizedPartnerName,
      partnerGives,
      userGives,
      parsedCount: parsedList.recognizedCount,
      text
    };
  }

  private balanceExchangeLists(
    partnerCandidates: Sticker[],
    userCandidates: Sticker[]
  ): Pick<ExchangePreview, 'partnerGives' | 'userGives'> {
    const targetCount = Math.min(partnerCandidates.length, userCandidates.length);

    if (!targetCount) {
      return { partnerGives: [], userGives: [] };
    }

    const partnerOneCount = this.balancedStickerOneCount(partnerCandidates, userCandidates, targetCount);
    const userOneCount = this.balancedStickerOneCount(userCandidates, partnerCandidates, targetCount);

    return {
      partnerGives: this.selectBalancedStickers(partnerCandidates, targetCount, partnerOneCount),
      userGives: this.selectBalancedStickers(userCandidates, targetCount, userOneCount)
    };
  }

  private balancedStickerOneCount(stickers: Sticker[], oppositeStickers: Sticker[], targetCount: number): number {
    const oneCount = this.stickerOneCount(stickers);
    const oppositeOneCount = this.stickerOneCount(oppositeStickers);
    const otherCount = stickers.length - oneCount;
    const preferredOneCount = Math.min(oneCount, oppositeOneCount, targetCount);
    const requiredOneCount = Math.max(0, targetCount - otherCount);

    return Math.min(Math.max(preferredOneCount, requiredOneCount), oneCount, targetCount);
  }

  private stickerOneCount(stickers: Sticker[]): number {
    return stickers.filter((sticker) => sticker.number === 1).length;
  }

  private selectBalancedStickers(stickers: Sticker[], targetCount: number, oneCount: number): Sticker[] {
    const otherCount = targetCount - oneCount;
    let selectedOnes = 0;
    let selectedOthers = 0;

    return stickers.filter((sticker) => {
      if (sticker.number === 1) {
        if (selectedOnes >= oneCount) {
          return false;
        }

        selectedOnes += 1;
        return true;
      }

      if (selectedOthers >= otherCount) {
        return false;
      }

      selectedOthers += 1;
      return true;
    });
  }

  private parseExternalStickerList(text: string): ParsedStickerList {
    const missingIds = new Set<string>();
    const duplicateIds = new Set<string>();
    let currentList: 'missing' | 'duplicates' | '' = '';
    let recognizedCount = 0;

    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      const normalizedLine = line
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

      if (!line) {
        continue;
      }

      if (normalizedLine === 'me faltan' || normalizedLine.startsWith('me faltan:')) {
        currentList = 'missing';
        continue;
      }

      if (normalizedLine === 'repetidas' || normalizedLine.startsWith('repetidas:')) {
        currentList = 'duplicates';
        continue;
      }

      if (!currentList || !line.includes(':')) {
        continue;
      }

      const separatorIndex = line.indexOf(':');
      const label = line.slice(0, separatorIndex);
      const values = line.slice(separatorIndex + 1);
      const teamCode = this.extractTeamCode(label);

      if (!teamCode || !values) {
        continue;
      }

      const numberMatches = values.replace(/\([^)]*\)/g, '').match(/\b\d{1,2}\b/g) ?? [];

      for (const numberText of numberMatches) {
        const sticker = this.findStickerByTeamAndNumber(teamCode, Number(numberText));

        if (!sticker) {
          continue;
        }

        if (currentList === 'missing') {
          missingIds.add(sticker.id);
        } else {
          duplicateIds.add(sticker.id);
        }

        recognizedCount += 1;
      }
    }

    return { missingIds, duplicateIds, recognizedCount };
  }

  private extractTeamCode(label: string): string {
    const normalizedLabel = label.toUpperCase();

    if (normalizedLabel.includes('CC-LAM')) {
      return 'CC-LAM';
    }

    return normalizedLabel.match(/[A-Z]{3}/)?.[0] ?? '';
  }

  private findStickerByTeamAndNumber(teamCode: string, number: number): StickerDefinition | undefined {
    return ALBUM_CATALOG.find((sticker) => sticker.teamCode === teamCode && sticker.number === number);
  }
}

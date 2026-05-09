export interface StickerDefinition {
  id: string;
  code: string;
  section: string;
  teamCode: string;
  number: number;
}

interface TeamDefinition {
  code: string;
  name: string;
}

const introStickers: StickerDefinition[] = [
  { id: '00', code: '00', section: 'FIFA World Cup 2026', teamCode: 'FWC', number: 0 },
  ...Array.from({ length: 8 }, (_, index) => ({
    id: `FWC${index + 1}`,
    code: `FWC${index + 1}`,
    section: 'FIFA World Cup 2026',
    teamCode: 'FWC',
    number: index + 1
  }))
];

const historyStickers: StickerDefinition[] = Array.from({ length: 11 }, (_, index) => ({
  id: `FWC${index + 9}`,
  code: `FWC${index + 9}`,
  section: 'FIFA World Cup History',
  teamCode: 'FWC',
  number: index + 9
}));

const teams: TeamDefinition[] = [
  { code: 'MEX', name: 'Mexico' },
  { code: 'RSA', name: 'South Africa' },
  { code: 'KOR', name: 'South Korea' },
  { code: 'CZE', name: 'Czechia' },
  { code: 'CAN', name: 'Canada' },
  { code: 'BIH', name: 'Bosnia and Herzegovina' },
  { code: 'QAT', name: 'Qatar' },
  { code: 'SUI', name: 'Switzerland' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'MAR', name: 'Morocco' },
  { code: 'HAI', name: 'Haiti' },
  { code: 'SCO', name: 'Scotland' },
  { code: 'USA', name: 'USA' },
  { code: 'PAR', name: 'Paraguay' },
  { code: 'AUS', name: 'Australia' },
  { code: 'TUR', name: 'Türkiye' },
  { code: 'GER', name: 'Germany' },
  { code: 'CUW', name: 'Curacao' },
  { code: 'CIV', name: 'Ivory Coast' },
  { code: 'ECU', name: 'Ecuador' },
  { code: 'NED', name: 'Netherlands' },
  { code: 'JPN', name: 'Japan' },
  { code: 'SWE', name: 'Sweden' },
  { code: 'TUN', name: 'Tunisia' },
  { code: 'BEL', name: 'Belgium' },
  { code: 'EGY', name: 'Egypt' },
  { code: 'IRN', name: 'Iran' },
  { code: 'NZL', name: 'New Zealand' },
  { code: 'ESP', name: 'Spain' },
  { code: 'CPV', name: 'Cape Verde' },
  { code: 'KSA', name: 'Saudi Arabia' },
  { code: 'URU', name: 'Uruguay' },
  { code: 'FRA', name: 'France' },
  { code: 'SEN', name: 'Senegal' },
  { code: 'IRQ', name: 'Iraq' },
  { code: 'NOR', name: 'Norway' },
  { code: 'ARG', name: 'Argentina' },
  { code: 'ALG', name: 'Algeria' },
  { code: 'AUT', name: 'Austria' },
  { code: 'JOR', name: 'Jordan' },
  { code: 'POR', name: 'Portugal' },
  { code: 'COD', name: 'Congo DR' },
  { code: 'UZB', name: 'Uzbekistan' },
  { code: 'COL', name: 'Colombia' },
  { code: 'ENG', name: 'England' },
  { code: 'CRO', name: 'Croatia' },
  { code: 'GHA', name: 'Ghana' },
  { code: 'PAN', name: 'Panama' }
];

export const ALBUM_CATALOG: StickerDefinition[] = [
  ...introStickers,
  ...teams.flatMap((team) =>
    Array.from({ length: 20 }, (_, index) => ({
      id: team.code === 'KSA' && index === 11 ? 'KAS12' : `${team.code}${index + 1}`,
      code: team.code === 'KSA' && index === 11 ? 'KAS12' : `${team.code}${index + 1}`,
      section: team.name,
      teamCode: team.code,
      number: index + 1
    }))
  ),
  ...historyStickers
];

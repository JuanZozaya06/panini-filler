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

const cocaColaStickers: StickerDefinition[] = Array.from({ length: 14 }, (_, index) => ({
  id: `CC-LAM${index + 1}`,
  code: `CC-LAM${index + 1}`,
  section: 'Coca-Cola / Latinoamérica',
  teamCode: 'CC-LAM',
  number: index + 1
}));

const teams: TeamDefinition[] = [
  { code: 'MEX', name: 'México' },
  { code: 'RSA', name: 'Sudáfrica' },
  { code: 'KOR', name: 'Corea del Sur' },
  { code: 'CZE', name: 'Chequia' },
  { code: 'CAN', name: 'Canadá' },
  { code: 'BIH', name: 'Bosnia y Herzegovina' },
  { code: 'QAT', name: 'Qatar' },
  { code: 'SUI', name: 'Suiza' },
  { code: 'BRA', name: 'Brasil' },
  { code: 'MAR', name: 'Marruecos' },
  { code: 'HAI', name: 'Haití' },
  { code: 'SCO', name: 'Escocia' },
  { code: 'USA', name: 'USA' },
  { code: 'PAR', name: 'Paraguay' },
  { code: 'AUS', name: 'Australia' },
  { code: 'TUR', name: 'Türkiye' },
  { code: 'GER', name: 'Alemania' },
  { code: 'CUW', name: 'Curazao' },
  { code: 'CIV', name: 'Costa de Marfil' },
  { code: 'ECU', name: 'Ecuador' },
  { code: 'NED', name: 'Países Bajos' },
  { code: 'JPN', name: 'Japón' },
  { code: 'SWE', name: 'Suecia' },
  { code: 'TUN', name: 'Túnez' },
  { code: 'BEL', name: 'Bélgica' },
  { code: 'EGY', name: 'Egipto' },
  { code: 'IRN', name: 'Irán' },
  { code: 'NZL', name: 'Nueva Zelanda' },
  { code: 'ESP', name: 'España' },
  { code: 'CPV', name: 'Cabo Verde' },
  { code: 'KSA', name: 'Arabia Saudita' },
  { code: 'URU', name: 'Uruguay' },
  { code: 'FRA', name: 'Francia' },
  { code: 'SEN', name: 'Senegal' },
  { code: 'IRQ', name: 'Irak' },
  { code: 'NOR', name: 'Noruega' },
  { code: 'ARG', name: 'Argentina' },
  { code: 'ALG', name: 'Argelia' },
  { code: 'AUT', name: 'Austria' },
  { code: 'JOR', name: 'Jordania' },
  { code: 'POR', name: 'Portugal' },
  { code: 'COD', name: 'RD del Congo' },
  { code: 'UZB', name: 'Uzbekistán' },
  { code: 'COL', name: 'Colombia' },
  { code: 'ENG', name: 'Inglaterra' },
  { code: 'CRO', name: 'Croacia' },
  { code: 'GHA', name: 'Ghana' },
  { code: 'PAN', name: 'Panamá' }
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
  ...historyStickers,
  ...cocaColaStickers
];

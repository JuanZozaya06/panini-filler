import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    window.history.replaceState({}, '', '/');

    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should start with all stickers missing', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.stickers().length).toBe(994);
    expect(app.missingStickers().length).toBe(994);
  });

  it('should count duplicate stickers as owned for progress', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.stickers.update((stickers) =>
      stickers.map((sticker) => {
        if (sticker.id === 'MEX1') {
          return { ...sticker, status: 'owned', duplicateCount: 0 };
        }

        if (sticker.id === 'MEX2') {
          return { ...sticker, status: 'duplicate', duplicateCount: 1 };
        }

        return sticker;
      })
    );

    expect(app.ownedStickers().map((sticker) => sticker.id)).toContain('MEX1');
    expect(app.ownedStickers().map((sticker) => sticker.id)).toContain('MEX2');
    expect(app.ownedStickers().length).toBe(2);
  });

  it('should filter album sections with the album search query', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.albumQuery.set('MEX1');

    expect(app.filteredAlbumStickers().map((sticker) => sticker.id)).toEqual([
      'MEX1',
      'MEX10',
      'MEX11',
      'MEX12',
      'MEX13',
      'MEX14',
      'MEX15',
      'MEX16',
      'MEX17',
      'MEX18',
      'MEX19'
    ]);
    expect(app.sections().map((section) => section.name)).toEqual(['México']);
  });

  it('should render the login title first', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Gestiona tu álbum');
  });

  it('should normalize usernames to lowercase firestore-safe ids', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance as unknown as {
      normalizeUserId: (value: string) => string;
    };

    expect(app.normalizeUserId(' Nidito/Profile#1 ')).toBe('nidito-profile-1');
  });

  it('should format downloaded sticker lists grouped with country references', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance as unknown as {
      formatStickerList: (
        title: string,
        stickers: Array<{
          id: string;
          code: string;
          section: string;
          teamCode: string;
          number: number;
          status: 'missing' | 'owned' | 'duplicate';
          duplicateCount: number;
        }>
      ) => string;
    };

    expect(
      app.formatStickerList('Repetidas', [
        {
          id: 'FWC2',
          code: 'FWC2',
          section: 'FIFA World Cup 2026',
          teamCode: 'FWC',
          number: 2,
          status: 'duplicate',
          duplicateCount: 1
        },
        {
          id: 'FWC13',
          code: 'FWC13',
          section: 'FIFA World Cup History',
          teamCode: 'FWC',
          number: 13,
          status: 'duplicate',
          duplicateCount: 1
        },
        {
          id: 'MEX7',
          code: 'MEX7',
          section: 'MÃ©xico',
          teamCode: 'MEX',
          number: 7,
          status: 'duplicate',
          duplicateCount: 1
        },
        {
          id: 'MEX11',
          code: 'MEX11',
          section: 'MÃ©xico',
          teamCode: 'MEX',
          number: 11,
          status: 'duplicate',
          duplicateCount: 1
        }
      ])
    ).toBe('Repetidas:\n\nFWC 🏆: 2\nFWC 📜: 13\nMEX 🇲🇽: 7, 11');
  });

  it('should build a shared user id from the share query parameter', () => {
    window.history.replaceState({}, '', '/?share=Zozi%2FProfile%231');

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance as unknown as {
      readSharedUserId: () => string;
    };

    expect(app.readSharedUserId()).toBe('zozi-profile-1');
  });

  it('should generate an exchange preview from a Figuritas App list', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const myMissing = new Set(['KOR1', 'CZE10', 'COD3']);
    const myDuplicates = new Set(['MEX12', 'RSA9', 'KAS12']);

    app.stickers.set(
      app.stickers().map((sticker) => {
        if (myMissing.has(sticker.id)) {
          return { ...sticker, status: 'missing', duplicateCount: 0 };
        }

        if (myDuplicates.has(sticker.id)) {
          return { ...sticker, status: 'duplicate', duplicateCount: 1 };
        }

        return { ...sticker, status: 'owned', duplicateCount: 0 };
      })
    );
    app.exchangePartnerName.set('Daniela');
    app.exchangeSourceText.set(`Figuritas App - Lista
Me faltan
MEX 🇲🇽: 12
RSA 🇿🇦: 9
KSA 🇸🇦: 12

Repetidas
KOR 🇰🇷: 1
CZE 🇨🇿: 10
COD 🇨🇩: 3 (×2), 7`);

    const preview = app.exchangePreview();

    expect(preview.partnerGives.map((sticker) => sticker.id)).toEqual(['KOR1', 'CZE10', 'COD3']);
    expect(preview.userGives.map((sticker) => sticker.id)).toEqual(['MEX12', 'RSA9', 'KAS12']);
    expect(preview.text).toContain('Cambio con Daniela');
    expect(preview.text).toContain('Daniela me da (3):');
    expect(preview.text).toContain('Yo le doy (3):');
    expect(preview.text).toContain('KOR 🇰🇷: 1 ⭐');
  });

  it('should move between exchange form and review after generating a preview', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.exchangePartnerName.set('Daniela');
    app.exchangeSourceText.set(`Me faltan
MEX 🇲🇽: 12

Repetidas
KOR 🇰🇷: 1`);
    app.generateExchangePreview();

    expect(app.exchangeStep()).toBe('review');
    expect(app.exchangeDraft()?.text).toContain('Cambio con Daniela');

    app.returnToExchangeForm();

    expect(app.exchangeStep()).toBe('form');
    expect(app.exchangePartnerName()).toBe('Daniela');
    expect(app.exchangeSourceText()).toContain('MEX');
  });

  it('should balance exchange previews by quantity and sticker number one count', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const myMissing = new Set(['KOR1', 'CZE1', 'COD3', 'PAN7']);
    const myDuplicates = new Set(['MEX1', 'RSA9', 'CAN10']);

    app.stickers.set(
      app.stickers().map((sticker) => {
        if (myMissing.has(sticker.id)) {
          return { ...sticker, status: 'missing', duplicateCount: 0 };
        }

        if (myDuplicates.has(sticker.id)) {
          return { ...sticker, status: 'duplicate', duplicateCount: 1 };
        }

        return { ...sticker, status: 'owned', duplicateCount: 0 };
      })
    );
    app.exchangePartnerName.set('Daniela');
    app.exchangeSourceText.set(`Me faltan
MEX 🇲🇽: 1
RSA 🇿🇦: 9
CAN 🇨🇦: 10

Repetidas
KOR 🇰🇷: 1
CZE 🇨🇿: 1
COD 🇨🇩: 3
PAN 🇵🇦: 7`);

    const preview = app.exchangePreview();

    expect(preview.partnerGives.map((sticker) => sticker.id)).toEqual(['KOR1', 'COD3', 'PAN7']);
    expect(preview.userGives.map((sticker) => sticker.id)).toEqual(['MEX1', 'RSA9', 'CAN10']);
    expect(preview.partnerGives.length).toBe(preview.userGives.length);
    expect(preview.partnerGives.filter((sticker) => sticker.number === 1).length).toBe(1);
    expect(preview.userGives.filter((sticker) => sticker.number === 1).length).toBe(1);
    expect(preview.text).toContain('KOR 🇰🇷: 1 ⭐');
    expect(preview.text).toContain('MEX 🇲🇽: 1 ⭐');
  });

  it('should avoid sticker number one when the other side has none available', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const myMissing = new Set(['KOR1', 'CZE10', 'COD3']);
    const myDuplicates = new Set(['MEX12', 'RSA9']);

    app.stickers.set(
      app.stickers().map((sticker) => {
        if (myMissing.has(sticker.id)) {
          return { ...sticker, status: 'missing', duplicateCount: 0 };
        }

        if (myDuplicates.has(sticker.id)) {
          return { ...sticker, status: 'duplicate', duplicateCount: 1 };
        }

        return { ...sticker, status: 'owned', duplicateCount: 0 };
      })
    );
    app.exchangePartnerName.set('Daniela');
    app.exchangeSourceText.set(`Me faltan
MEX 🇲🇽: 12
RSA 🇿🇦: 9

Repetidas
KOR 🇰🇷: 1
CZE 🇨🇿: 10
COD 🇨🇩: 3`);

    const preview = app.exchangePreview();

    expect(preview.partnerGives.map((sticker) => sticker.id)).toEqual(['CZE10', 'COD3']);
    expect(preview.userGives.map((sticker) => sticker.id)).toEqual(['MEX12', 'RSA9']);
    expect(preview.partnerGives.filter((sticker) => sticker.number === 1).length).toBe(0);
    expect(preview.userGives.filter((sticker) => sticker.number === 1).length).toBe(0);
  });
});

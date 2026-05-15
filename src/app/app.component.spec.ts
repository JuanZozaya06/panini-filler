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
});

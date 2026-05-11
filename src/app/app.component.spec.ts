import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
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
    expect(app.stickers().length).toBe(1012);
    expect(app.missingStickers().length).toBe(1012);
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
});

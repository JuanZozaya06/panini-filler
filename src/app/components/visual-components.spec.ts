import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlbumHeroComponent } from './album-hero/album-hero.component';
import { ExchangePanelComponent } from './exchange-panel/exchange-panel.component';
import { LoginPanelComponent } from './login-panel/login-panel.component';
import { PanelTabsComponent } from './panel-tabs/panel-tabs.component';
import { SharedAlbumViewComponent } from './shared-album-view/shared-album-view.component';

describe('Visual components', () => {
  async function createComponent<T>(component: Type<T>): Promise<ComponentFixture<T>> {
    await TestBed.configureTestingModule({
      imports: [component]
    }).compileComponents();

    return TestBed.createComponent(component);
  }

  it('renders the album hero with styled summary cards', async () => {
    const fixture = await createComponent(AlbumHeroComponent);
    fixture.componentRef.setInput('userId', 'zozi');
    fixture.componentRef.setInput('ownedCount', 182);
    fixture.componentRef.setInput('totalCount', 994);
    fixture.componentRef.setInput('completedPercent', 18);
    fixture.componentRef.setInput('duplicateCopies', 37);
    fixture.componentRef.setInput('duplicateGroups', 35);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    const summary = compiled.querySelector('.summary');
    const shareButton = compiled.querySelector<HTMLButtonElement>('.logout-icon-button');

    expect(title?.textContent).toContain('Mi álbum 2026');
    expect(summary?.children.length).toBe(3);
    expect(getComputedStyle(summary as Element).display).toBe('grid');
    expect(getComputedStyle(shareButton as Element).borderRadius).toBe('50%');
  });

  it('renders panel tabs as equal controls', async () => {
    const fixture = await createComponent(PanelTabsComponent);
    fixture.componentRef.setInput('activePanel', 'exchange');
    fixture.componentRef.setInput('sectionCount', 51);
    fixture.componentRef.setInput('missingCount', 812);
    fixture.componentRef.setInput('duplicateCopies', 37);
    fixture.componentRef.setInput('duplicateGroups', 35);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const tabs = compiled.querySelector('.panel-tabs');
    const buttons = compiled.querySelectorAll('button');

    expect(buttons.length).toBe(4);
    expect(buttons[3].classList).toContain('active');
    expect(getComputedStyle(tabs as Element).display).toBe('grid');
    expect(getComputedStyle(buttons[0]).borderRadius).toBe('8px');
  });

  it('renders the exchange form with custom input and button styles', async () => {
    const fixture = await createComponent(ExchangePanelComponent);
    fixture.componentRef.setInput('exchangeStep', 'form');
    fixture.componentRef.setInput('partnerName', 'Daniela');
    fixture.componentRef.setInput('sourceText', '');
    fixture.componentRef.setInput('feedback', '');
    fixture.componentRef.setInput('hasPreview', false);
    fixture.componentRef.setInput('isApplying', false);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector<HTMLInputElement>('.list-search');
    const textarea = compiled.querySelector<HTMLTextAreaElement>('.exchange-textarea');
    const button = compiled.querySelector<HTMLButtonElement>('.exchange-primary-button');

    expect(compiled.querySelector('h2')?.textContent).toContain('Generar cambio');
    expect(input?.value).toBe('Daniela');
    expect(getComputedStyle(textarea as Element).borderRadius).toBe('8px');
    expect(getComputedStyle(button as Element).backgroundColor).toBe('rgb(23, 32, 38)');
  });

  it('renders the login panel with its own form styles', async () => {
    const fixture = await createComponent(LoginPanelComponent);
    fixture.componentRef.setInput('loginName', 'zozi');
    fixture.componentRef.setInput('loginPassword', '');
    fixture.componentRef.setInput('isLoggingIn', false);
    fixture.componentRef.setInput('loginError', '');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector<HTMLInputElement>('.username-input');
    const button = compiled.querySelector<HTMLButtonElement>('.login-form button');

    expect(compiled.querySelector('h1')?.textContent).toContain('Gestiona tu álbum');
    expect(input?.value).toBe('zozi');
    expect(getComputedStyle(button as Element).backgroundColor).toBe('rgb(23, 32, 38)');
    expect(getComputedStyle(button as Element).borderRadius).toBe('8px');
  });

  it('renders the shared album view with summary and grouped lists', async () => {
    const fixture = await createComponent(SharedAlbumViewComponent);
    fixture.componentRef.setInput('sharedUserId', 'zozi');
    fixture.componentRef.setInput('missingCount', 12);
    fixture.componentRef.setInput('duplicateCopies', 4);
    fixture.componentRef.setInput('completedPercent', 88);
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('loginError', '');
    fixture.componentRef.setInput('missingGroups', [{ label: 'MEX', numbers: [1, 2] }]);
    fixture.componentRef.setInput('duplicateGroups', [{ label: 'ARG', numbers: [3] }]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const summary = compiled.querySelector('.summary');
    const rows = compiled.querySelectorAll('.shared-country-row');

    expect(compiled.querySelector('h1')?.textContent).toContain('Álbum de zozi');
    expect(summary?.children.length).toBe(3);
    expect(rows.length).toBe(2);
    expect(getComputedStyle(summary as Element).display).toBe('grid');
  });
});

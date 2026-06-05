import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  setDoc,
  writeBatch
} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { environment } from '../environments/environment';
import { ALBUM_CATALOG, StickerDefinition } from './album-catalog';
import {
  ExchangePreview,
  ExchangeStep,
  PanelId,
  Sticker,
  StickerStatus,
  StoredSticker,
  StoredUser
} from './app.models';
import { AlbumHeroComponent } from './components/album-hero/album-hero.component';
import { ExchangePanelComponent } from './components/exchange-panel/exchange-panel.component';
import { LoginPanelComponent } from './components/login-panel/login-panel.component';
import { PanelTabsComponent } from './components/panel-tabs/panel-tabs.component';
import { SharedAlbumViewComponent } from './components/shared-album-view/shared-album-view.component';
import { ExchangeService } from './exchange.service';
import { StickerFormatService } from './sticker-format.service';

const STATUS_LABELS: Record<StickerStatus, string> = {
  missing: 'Falta',
  owned: 'Tengo',
  duplicate: 'Repetida'
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AlbumHeroComponent,
    LoginPanelComponent,
    PanelTabsComponent,
    SharedAlbumViewComponent,
    ExchangePanelComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly firestore = inject(Firestore, { optional: true });
  private readonly exchangeService = inject(ExchangeService);
  private readonly stickerFormatter = inject(StickerFormatService);
  private readonly albumId = 'world-cup-2026';
  private stickersSubscription?: Subscription;
  private stickerFeedbackTimeout?: ReturnType<typeof setTimeout>;

  readonly statusLabels = STATUS_LABELS;
  readonly syncState = signal(environment.firebase.enabled ? '' : 'Firebase sin configurar');
  readonly loginName = signal('');
  readonly loginPassword = signal('');
  readonly currentUserId = signal('');
  readonly sharedUserId = signal('');
  readonly loginError = signal('');
  readonly isLoggingIn = signal(false);
  readonly isSaving = signal(false);
  readonly isLoadingSharedAlbum = signal(false);
  readonly albumQuery = signal('');
  readonly missingQuery = signal('');
  readonly duplicateQuery = signal('');
  readonly exchangePartnerName = signal('');
  readonly exchangeSourceText = signal('');
  readonly exchangeFeedback = signal('');
  readonly exchangeHasPreview = signal(false);
  readonly exchangeDraft = signal<ExchangePreview | null>(null);
  readonly exchangeStep = signal<ExchangeStep>('form');
  readonly copyFeedback = signal('');
  readonly shareFeedback = signal('');
  readonly activePanel = signal<PanelId>('album');
  readonly isApplyingExchange = signal(false);
  readonly recentlyChangedStickerId = signal('');
  readonly isSharedView = computed(() => !!this.sharedUserId());

  readonly stickers = signal<Sticker[]>(this.buildInitialStickers());

  readonly missingStickers = computed(() =>
    this.stickers().filter((sticker) => sticker.status === 'missing')
  );
  readonly ownedStickers = computed(() =>
    this.stickers().filter((sticker) => sticker.status !== 'missing')
  );
  readonly duplicateStickers = computed(() =>
    this.stickers().filter((sticker) => sticker.status === 'duplicate')
  );
  readonly filteredAlbumStickers = computed(() =>
    this.filterStickers(this.stickers(), this.albumQuery())
  );
  readonly filteredMissingStickers = computed(() =>
    this.filterStickers(this.missingStickers(), this.missingQuery())
  );
  readonly filteredDuplicateStickers = computed(() =>
    this.filterStickers(this.duplicateStickers(), this.duplicateQuery())
  );
  readonly duplicateCopies = computed(() =>
    this.duplicateStickers().reduce((total, sticker) => total + sticker.duplicateCount, 0)
  );
  readonly completedPercent = computed(() =>
    Math.round((this.ownedStickers().length / this.stickers().length) * 100)
  );
  readonly formattedMissingList = computed(() =>
    this.formatStickerList('Me faltan', this.missingStickers())
  );
  readonly formattedDuplicateList = computed(() =>
    this.formatStickerList('Repetidas', this.duplicateStickers())
  );
  readonly exchangePreview = computed(() =>
    this.exchangeService.buildExchangePreview(
      this.exchangePartnerName(),
      this.exchangeSourceText(),
      this.missingStickers(),
      this.duplicateStickers()
    )
  );
  readonly sharedMissingGroups = computed(() =>
    this.stickerFormatter.groupStickerRows(this.missingStickers(), false)
  );
  readonly sharedDuplicateGroups = computed(() =>
    this.stickerFormatter.groupStickerRows(this.duplicateStickers(), false)
  );
  readonly sections = computed(() => {
    const grouped = new Map<string, Sticker[]>();

    for (const sticker of this.filteredAlbumStickers()) {
      const group = grouped.get(sticker.section) ?? [];
      group.push(sticker);
      grouped.set(sticker.section, group);
    }

    return Array.from(grouped, ([name, stickers]) => ({
      name,
      stickers,
      owned: stickers.filter((sticker) => sticker.status !== 'missing').length,
      duplicate: stickers.filter((sticker) => sticker.status === 'duplicate').length,
      missing: stickers.filter((sticker) => sticker.status === 'missing').length
    }));
  });

  ngOnInit(): void {
    const sharedUserId = this.readSharedUserId();

    if (sharedUserId) {
      this.sharedUserId.set(sharedUserId);
      this.loadSharedAlbum(sharedUserId);
    }
  }

  ngOnDestroy(): void {
    this.stickersSubscription?.unsubscribe();
    clearTimeout(this.stickerFeedbackTimeout);
  }

  async login(): Promise<void> {
    if (!this.firestore) {
      this.loginError.set('La conexión no está configurada.');
      return;
    }

    const userId = this.normalizeUserId(this.loginName());

    if (!userId) {
      this.loginError.set('Escribe un usuario.');
      return;
    }

    if (!this.loginPassword()) {
      this.loginError.set('Escribe una contraseña.');
      return;
    }

    this.loginError.set('');
    this.isLoggingIn.set(true);
    this.syncState.set('');

    const isAuthenticated = await this.authenticateUser(userId, this.loginPassword()).catch((error) => {
      console.error(error);
      this.loginError.set(this.readableError(error));
      this.syncState.set('No se pudo entrar');
      return false;
    });

    this.isLoggingIn.set(false);

    if (!isAuthenticated) {
      return;
    }

    this.currentUserId.set(userId);
    this.stickers.set(this.buildInitialStickers());
    this.albumQuery.set('');
    this.missingQuery.set('');
    this.duplicateQuery.set('');
    this.copyFeedback.set('');
    this.loginPassword.set('');
    this.stickersSubscription?.unsubscribe();

    this.subscribeToAlbum(userId, `Usuario: ${userId}`);
  }

  logout(): void {
    this.stickersSubscription?.unsubscribe();
    this.currentUserId.set('');
    this.loginPassword.set('');
    this.syncState.set(environment.firebase.enabled ? '' : 'Conexión sin configurar');
    this.stickers.set(this.buildInitialStickers());
    this.albumQuery.set('');
  }

  async cycleStickerStatus(sticker: Sticker): Promise<void> {
    if (sticker.status === 'missing') {
      await this.setStickerStatus(sticker, 'owned');
      return;
    }

    if (sticker.status === 'owned') {
      await this.setStickerStatus(sticker, 'duplicate', 1);
      return;
    }

    await this.incrementDuplicate(sticker);
  }

  async setStickerStatus(sticker: Sticker, status: StickerStatus, duplicateCount?: number): Promise<void> {
    const nextDuplicateCount = duplicateCount ?? (status === 'duplicate' ? Math.max(sticker.duplicateCount, 1) : 0);

    this.stickers.update((stickers) =>
      stickers.map((current) =>
        current.id === sticker.id ? { ...current, status, duplicateCount: nextDuplicateCount } : current
      )
    );
    this.showStickerFeedback(sticker.id);

    const userId = this.currentUserId();

    if (!this.firestore || !userId) {
      return;
    }

    try {
      this.isSaving.set(true);
      await setDoc(
        doc(this.firestore, `${this.stickersPath(userId)}/${sticker.id}`),
        { status, duplicateCount: nextDuplicateCount, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      this.syncState.set('Cambio guardado');
    } catch (error) {
      console.error(error);
      this.loginError.set(this.readableError(error));
      this.syncState.set('No se pudo guardar');
    } finally {
      this.isSaving.set(false);
    }
  }

  async incrementDuplicate(sticker: Sticker, event?: Event): Promise<void> {
    event?.stopPropagation();
    await this.setStickerStatus(sticker, 'duplicate', sticker.duplicateCount + 1);
  }

  async decrementDuplicate(sticker: Sticker, event: Event): Promise<void> {
    event.stopPropagation();
    const nextCount = Math.max(sticker.duplicateCount - 1, 0);
    const nextStatus: StickerStatus = nextCount === 0 ? 'owned' : 'duplicate';

    await this.setStickerStatus(sticker, nextStatus, nextCount);
  }

  async markStickerMissing(sticker: Sticker, event: Event): Promise<void> {
    event.stopPropagation();
    await this.setStickerStatus(sticker, 'missing', 0);
  }

  statusClass(status: StickerStatus): string {
    return `status-${status}`;
  }

  trackStickerId(_: number, sticker: Sticker): string {
    return sticker.id;
  }

  trackSection(_: number, section: { name: string }): string {
    return section.name;
  }

  togglePanel(panel: PanelId): void {
    if (panel === 'exchange' && this.activePanel() !== 'exchange') {
      this.resetExchange();
    }

    this.activePanel.set(panel);
    this.copyFeedback.set('');
    this.exchangeFeedback.set('');
  }

  isCollapsed(panel: PanelId): boolean {
    return this.activePanel() !== panel;
  }

  async copyStickerCodes(type: 'missing' | 'duplicates'): Promise<void> {
    const stickers = type === 'missing' ? this.missingStickers() : this.duplicateStickers();
    const title = type === 'missing' ? 'Me faltan' : 'Repetidas';
    const text = this.formatStickerList(title, stickers);
    const label = type === 'missing' ? 'faltantes' : 'repetidas';

    if (!text) {
      this.copyFeedback.set(`No hay barajitas ${label} para copiar.`);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      this.copyFeedback.set(`Listado de barajitas ${label} copiado al portapapeles.`);
    } catch (error) {
      console.error(error);
      this.copyFeedback.set('No se pudo copiar el listado al portapapeles.');
    }
  }

  updateExchangePartnerName(value: string): void {
    this.exchangePartnerName.set(value);
    this.exchangeHasPreview.set(false);
    this.exchangeDraft.set(null);
    this.exchangeStep.set('form');
    this.exchangeFeedback.set('');
  }

  updateExchangeSourceText(value: string): void {
    this.exchangeSourceText.set(value);
    this.exchangeHasPreview.set(false);
    this.exchangeDraft.set(null);
    this.exchangeStep.set('form');
    this.exchangeFeedback.set('');
  }

  returnToExchangeForm(): void {
    this.exchangeStep.set('form');
    this.exchangeFeedback.set('');
  }

  private resetExchange(): void {
    this.exchangePartnerName.set('');
    this.exchangeSourceText.set('');
    this.exchangeFeedback.set('');
    this.exchangeHasPreview.set(false);
    this.exchangeDraft.set(null);
    this.exchangeStep.set('form');
  }

  private showStickerFeedback(stickerId: string): void {
    clearTimeout(this.stickerFeedbackTimeout);
    this.recentlyChangedStickerId.set('');

    setTimeout(() => {
      this.recentlyChangedStickerId.set(stickerId);
    });

    this.stickerFeedbackTimeout = setTimeout(() => {
      this.recentlyChangedStickerId.set('');
    }, 900);
  }

  generateExchangePreview(): void {
    const preview = this.exchangePreview();

    if (!preview.partnerName) {
      this.exchangeFeedback.set('Escribe el nombre de la persona.');
      this.exchangeHasPreview.set(false);
      return;
    }

    if (!this.exchangeSourceText().trim()) {
      this.exchangeFeedback.set('Pega la lista que te enviaron.');
      this.exchangeHasPreview.set(false);
      return;
    }

    if (!preview.parsedCount) {
      this.exchangeFeedback.set('No encontre barajitas validas en el texto pegado.');
      this.exchangeHasPreview.set(false);
      return;
    }

    this.exchangeHasPreview.set(true);
    this.exchangeDraft.set(preview);
    this.exchangeStep.set('review');
    this.exchangeFeedback.set('');
  }

  async copyExchangeText(): Promise<void> {
    const text = this.exchangeDraft()?.text ?? '';

    if (!text) {
      this.exchangeFeedback.set('Genera un cambio antes de copiar.');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      this.exchangeFeedback.set('Cambio copiado al portapapeles.');
    } catch (error) {
      console.error(error);
      this.exchangeFeedback.set('No se pudo copiar el cambio.');
    }
  }

  async applyExchange(): Promise<void> {
    const userId = this.currentUserId();
    const preview = this.exchangeDraft();

    if (!this.firestore || !userId) {
      this.exchangeFeedback.set('Inicia sesion con Firebase configurado para guardar el cambio.');
      return;
    }

    if (!this.exchangeHasPreview() || !preview) {
      this.exchangeFeedback.set('Genera el cambio antes de guardarlo.');
      return;
    }

    if (!preview.partnerGives.length && !preview.userGives.length) {
      this.exchangeFeedback.set('No hay barajitas para guardar en este cambio.');
      return;
    }

    const currentById = new Map(this.stickers().map((sticker) => [sticker.id, sticker]));
    const nextById = new Map<string, Pick<Sticker, 'status' | 'duplicateCount'>>();

    for (const sticker of preview.partnerGives) {
      nextById.set(sticker.id, { status: 'owned', duplicateCount: 0 });
    }

    for (const sticker of preview.userGives) {
      const currentSticker = currentById.get(sticker.id);

      if (!currentSticker || currentSticker.status !== 'duplicate') {
        continue;
      }

      const nextDuplicateCount = Math.max(currentSticker.duplicateCount - 1, 0);
      nextById.set(sticker.id, {
        status: nextDuplicateCount ? 'duplicate' : 'owned',
        duplicateCount: nextDuplicateCount
      });
    }

    if (!nextById.size) {
      this.exchangeFeedback.set('No hay cambios aplicables en tu album.');
      return;
    }

    const now = new Date().toISOString();
    const batch = writeBatch(this.firestore);
    const tradeRef = doc(collection(this.firestore, this.tradesPath(userId)));

    for (const [stickerId, nextSticker] of nextById) {
      batch.set(
        doc(this.firestore, `${this.stickersPath(userId)}/${stickerId}`),
        { ...nextSticker, updatedAt: now },
        { merge: true }
      );
    }

    batch.set(tradeRef, {
      partnerName: preview.partnerName,
      partnerGives: this.stickersForStorage(preview.partnerGives),
      userGives: this.stickersForStorage(preview.userGives),
      sourceText: this.exchangeSourceText(),
      summaryText: preview.text,
      createdAt: now
    });

    try {
      this.isApplyingExchange.set(true);
      await batch.commit();
      this.stickers.update((stickers) =>
        stickers.map((sticker) => {
          const nextSticker = nextById.get(sticker.id);

          return nextSticker ? { ...sticker, ...nextSticker, updatedAt: now } : sticker;
        })
      );
      this.exchangeFeedback.set('Cambio guardado y album actualizado.');
      this.syncState.set('Cambio guardado');
      this.activePanel.set('album');
      this.exchangeStep.set('form');
    } catch (error) {
      console.error(error);
      this.exchangeFeedback.set(this.readableError(error));
      this.syncState.set('No se pudo guardar el cambio');
    } finally {
      this.isApplyingExchange.set(false);
    }
  }

  async copyShareLink(): Promise<void> {
    const userId = this.currentUserId();

    if (!userId) {
      return;
    }

    const url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set('share', userId);

    try {
      await navigator.clipboard.writeText(url.toString());
      this.shareFeedback.set('Enlace para compartir copiado.');
    } catch (error) {
      console.error(error);
      this.shareFeedback.set('No se pudo copiar el enlace.');
    }
  }

  returnToLogin(): void {
    this.stickersSubscription?.unsubscribe();
    this.sharedUserId.set('');
    this.stickers.set(this.buildInitialStickers());
    this.albumQuery.set('');
    this.loginError.set('');
    this.syncState.set(environment.firebase.enabled ? '' : 'Firebase sin configurar');
    window.history.replaceState({}, '', window.location.pathname);
  }

  private filterStickers(stickers: Sticker[], query: string): Sticker[] {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return stickers;
    }

    return stickers.filter((sticker) =>
      `${sticker.code} ${sticker.section} ${sticker.teamCode}`.toLowerCase().includes(normalizedQuery)
    );
  }

  private formatStickerList(title: string, stickers: Sticker[]): string {
    return this.stickerFormatter.formatStickerList(title, stickers);
  }

  private stickersForStorage(stickers: Sticker[]): Array<Pick<Sticker, 'id' | 'code' | 'teamCode' | 'number'>> {
    return stickers.map((sticker) => ({
      id: sticker.id,
      code: sticker.code,
      teamCode: sticker.teamCode,
      number: sticker.number
    }));
  }

  private loadSharedAlbum(userId: string): void {
    if (!this.firestore) {
      this.loginError.set('La conexión no está configurada.');
      return;
    }

    this.isLoadingSharedAlbum.set(true);
    this.loginError.set('');
    this.stickers.set(this.buildInitialStickers());
    this.subscribeToAlbum(userId, `Álbum compartido por ${userId}`, () => {
      this.isLoadingSharedAlbum.set(false);
    });
  }

  private subscribeToAlbum(userId: string, syncMessage: string, onLoaded?: () => void): void {
    if (!this.firestore) {
      return;
    }

    this.stickersSubscription?.unsubscribe();
    this.stickersSubscription = collectionData(collection(this.firestore, this.stickersPath(userId)), { idField: 'id' })
      .subscribe({
        next: (storedStickers) => {
          const byId = new Map(
            (storedStickers as StoredSticker[]).map((sticker) => [sticker.id, sticker])
          );

          this.stickers.update((stickers) =>
            stickers.map((sticker) => ({
              ...sticker,
              status: byId.get(sticker.id)?.status ?? 'missing',
              duplicateCount: byId.get(sticker.id)?.duplicateCount ?? 0,
              updatedAt: byId.get(sticker.id)?.updatedAt
            }))
          );
          this.syncState.set(syncMessage);
          onLoaded?.();
        },
        error: (error) => {
          console.error(error);
          this.loginError.set(this.readableError(error));
          this.syncState.set('No se pudieron cargar las barajitas');
          onLoaded?.();
        }
      });
  }

  private async authenticateUser(userId: string, password: string): Promise<boolean> {
    if (!this.firestore) {
      return false;
    }

    const userRef = doc(this.firestore, `users/${userId}`);
    const userSnapshot = await getDoc(userRef);
    const passwordHash = await this.hashPassword(password);

    if (userSnapshot.exists()) {
      const user = userSnapshot.data() as StoredUser;

      if (user.passwordHash && user.passwordHash !== passwordHash) {
        this.loginError.set('La combinación de usuario y contraseña no coincide.');
        this.syncState.set('');
        return false;
      }
    }

    await this.ensureUserDocuments(userId, passwordHash);
    return true;
  }

  private async ensureUserDocuments(userId: string, passwordHash: string): Promise<void> {
    if (!this.firestore) {
      return;
    }

    const now = new Date().toISOString();

    await setDoc(
      doc(this.firestore, `users/${userId}`),
      {
        id: userId,
        name: userId,
        passwordHash,
        createdAt: now,
        updatedAt: now
      },
      { merge: true }
    );

    await setDoc(
      doc(this.firestore, `users/${userId}/albums/${this.albumId}`),
      {
        id: this.albumId,
        name: 'Album Manager 2026',
        totalStickers: ALBUM_CATALOG.length,
        updatedAt: now
      },
      { merge: true }
    );
  }

  private stickersPath(userId: string): string {
    return `users/${userId}/albums/${this.albumId}/stickers`;
  }

  private tradesPath(userId: string): string {
    return `users/${userId}/albums/${this.albumId}/trades`;
  }

  private readSharedUserId(): string {
    return this.normalizeUserId(new URLSearchParams(window.location.search).get('share') ?? '');
  }

  private normalizeUserId(value: string): string {
    return value.trim().toLowerCase().replace(/[/.#[\]]/g, '-');
  }

  private readableError(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('permission-denied') || message.includes('Missing or insufficient permissions')) {
      return 'No tienes permiso para leer o guardar. Revisa las reglas de la base de datos.';
    }

    if (message.includes('unavailable') || message.includes('network')) {
      return 'No hay conexión. Intenta de nuevo.';
    }

    return 'No se pudo completar la accion. Intenta de nuevo.';
  }

  private async hashPassword(password: string): Promise<string> {
    const bytes = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);

    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private buildInitialStickers(): Sticker[] {
    return ALBUM_CATALOG.map((sticker: StickerDefinition) => ({
      ...sticker,
      status: 'missing',
      duplicateCount: 0
    }));
  }
}

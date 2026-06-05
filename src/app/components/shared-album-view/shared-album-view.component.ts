import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StickerGroup } from '../../app.models';

@Component({
  selector: 'app-shared-album-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shared-album-view.component.html',
  styleUrls: ['./shared-album-view.component.scss']
})
export class SharedAlbumViewComponent {
  @Input({ required: true }) sharedUserId = '';
  @Input({ required: true }) missingCount = 0;
  @Input({ required: true }) duplicateCopies = 0;
  @Input({ required: true }) completedPercent = 0;
  @Input({ required: true }) isLoading = false;
  @Input() loginError = '';
  @Input() missingGroups: StickerGroup[] = [];
  @Input() duplicateGroups: StickerGroup[] = [];

  @Output() back = new EventEmitter<void>();

  trackStickerGroup(_: number, group: StickerGroup): string {
    return group.label;
  }
}

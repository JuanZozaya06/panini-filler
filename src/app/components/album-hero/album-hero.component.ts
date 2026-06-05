import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-album-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './album-hero.component.html',
  styleUrls: ['./album-hero.component.scss']
})
export class AlbumHeroComponent {
  @Input({ required: true }) userId = '';
  @Input({ required: true }) ownedCount = 0;
  @Input({ required: true }) totalCount = 0;
  @Input({ required: true }) completedPercent = 0;
  @Input({ required: true }) duplicateCopies = 0;
  @Input({ required: true }) duplicateGroups = 0;
  @Input() shareFeedback = '';

  @Output() share = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PanelId } from '../../app.models';

@Component({
  selector: 'app-panel-tabs',
  standalone: true,
  templateUrl: './panel-tabs.component.html',
  styleUrls: ['./panel-tabs.component.scss']
})
export class PanelTabsComponent {
  @Input({ required: true }) activePanel: PanelId = 'album';
  @Input({ required: true }) sectionCount = 0;
  @Input({ required: true }) missingCount = 0;
  @Input({ required: true }) duplicateCopies = 0;
  @Input({ required: true }) duplicateGroups = 0;

  @Output() selected = new EventEmitter<PanelId>();
}

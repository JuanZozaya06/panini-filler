import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExchangePreview, ExchangeStep } from '../../app.models';

@Component({
  selector: 'app-exchange-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exchange-panel.component.html',
  styleUrls: ['./exchange-panel.component.scss']
})
export class ExchangePanelComponent {
  @Input({ required: true }) exchangeStep: ExchangeStep = 'form';
  @Input({ required: true }) partnerName = '';
  @Input({ required: true }) sourceText = '';
  @Input({ required: true }) feedback = '';
  @Input({ required: true }) hasPreview = false;
  @Input({ required: true }) isApplying = false;
  @Input() draft: ExchangePreview | null = null;

  @Output() partnerNameChange = new EventEmitter<string>();
  @Output() sourceTextChange = new EventEmitter<string>();
  @Output() generate = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  @Output() copy = new EventEmitter<void>();
  @Output() apply = new EventEmitter<void>();
}

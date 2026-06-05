import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-panel.component.html',
  styleUrls: ['./login-panel.component.scss']
})
export class LoginPanelComponent {
  @Input({ required: true }) loginName = '';
  @Input({ required: true }) loginPassword = '';
  @Input({ required: true }) isLoggingIn = false;
  @Input() loginError = '';

  @Output() loginNameChange = new EventEmitter<string>();
  @Output() loginPasswordChange = new EventEmitter<string>();
  @Output() login = new EventEmitter<void>();
}

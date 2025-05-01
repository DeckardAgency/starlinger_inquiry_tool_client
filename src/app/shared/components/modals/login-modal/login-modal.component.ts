import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" class="modal-overlay" (click)="closeOnBackdrop($event)" [@fadeAnimation]>
      <div class="modal-container" [@slideAnimation]>
        <div class="modal-logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Logo SVG - Replace with your company logo -->
            <path d="M24 12.5L35.5 24L24 35.5L12.5 24L24 12.5Z" fill="#DC2626" />
            <path d="M24 5L41 24L24 43L7 24L24 5Z" stroke="#DC2626" stroke-width="2" />
          </svg>
          <div class="modal-logo-text">Starlinger</div>
        </div>

        <div class="modal-header">
          <h2 class="modal-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M17.5 10C17.5 8.01088 16.7098 6.10322 15.3033 4.6967C13.8968 3.29018 11.9891 2.5 10 2.5C7.92829 2.50789 5.89081 3.32602 4.38333 4.78333L2.5 6.66667M2.5 6.66667V2.5M2.5 6.66667H6.66667M2.5 10C2.5 11.9891 3.29018 13.8968 4.6967 15.3033C6.10322 16.7098 8.01088 17.5 10 17.5C12.0717 17.4921 14.1092 16.674 15.6167 15.2167L17.5 13.3333M17.5 13.3333H13.3333M17.5 13.3333V17.5" stroke="#DC2626" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Log in to Textile Inquiry Tool
          </h2>
        </div>

        <div class="modal-content">
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div class="form-group">
              <label for="username">Username or Email <span class="required">(Required)</span></label>
              <input type="text" id="username" name="username" [(ngModel)]="username" required class="form-control">
            </div>

            <div class="form-group">
              <label for="password">Password <span class="required">(Required)</span></label>
              <div class="password-input-wrapper">
                <input [type]="showPassword ? 'text' : 'password'" id="password" name="password" [(ngModel)]="password" required class="form-control">
                <button type="button" class="toggle-password" (click)="togglePasswordVisibility()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path *ngIf="!showPassword" d="M9.99996 11.6667C10.9205 11.6667 11.6666 10.9205 11.6666 10C11.6666 9.07952 10.9205 8.33333 9.99996 8.33333C9.07944 8.33333 8.33329 9.07952 8.33329 10C8.33329 10.9205 9.07944 11.6667 9.99996 11.6667Z" stroke="#71717A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path *ngIf="!showPassword" d="M17.5 10C15.8693 13.0975 13.1693 15 10 15C6.83067 15 4.13067 13.0975 2.5 10C4.13067 6.9025 6.83067 5 10 5C13.1693 5 15.8693 6.9025 17.5 10Z" stroke="#71717A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path *ngIf="showPassword" d="M3.33329 3.33334L16.6666 16.6667M12.0758 12.0833C11.4796 12.63 10.7144 12.9067 9.93942 12.845C9.16444 12.7834 8.44574 12.3881 7.93829 11.7467C7.43085 11.1053 7.1729 10.2787 7.21309 9.44334C7.25328 8.60795 7.58835 7.82159 8.15829 7.24167M15.775 15.775C14.3285 16.9215 12.5142 17.5396 10.6666 17.5C5.83329 17.5 2.08329 14.1667 1.66663 10C1.86273 8.91985 2.26786 7.89508 2.85829 7L15.775 15.775Z" stroke="#71717A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div *ngIf="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <div class="form-options">
              <div class="remember-me">
                <input type="checkbox" id="remember" [(ngModel)]="rememberMe" name="rememberMe">
                <label for="remember">Remember me</label>
              </div>
              <a href="javascript:void(0)" class="reset-password" (click)="resetPassword()">Reset password</a>
            </div>

            <button type="submit" class="login-button" [disabled]="isLoading">
              <span *ngIf="isLoading">Logging in...</span>
              <span *ngIf="!isLoading">
                Log in
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3.75 10H16.25M16.25 10L11.25 5M16.25 10L11.25 15" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-container {
      background: #FFFFFF;
      border-radius: 0.375rem;
      width: 90%;
      max-width: 440px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .modal-logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #222222;
      color: white;
      padding: 20px 0;
    }

    .modal-logo-text {
      font-size: 1.5rem;
      font-weight: 500;
      margin-top: 8px;
    }

    .modal-header {
      padding: 20px 24px 0;
    }

    .modal-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.125rem;
      font-weight: 500;
      margin: 0;
      color: #18181B;
    }

    .modal-content {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      color: #52525B;
      margin-bottom: 6px;
    }

    .required {
      color: #71717A;
      font-size: 0.75rem;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      font-size: 0.875rem;
      border: 1px solid #E4E4E7;
      border-radius: 4px;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #DC2626;
    }

    .password-input-wrapper {
      position: relative;
    }

    .toggle-password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
    }

    .error-message {
      background-color: #fdeded;
      border-left: 4px solid #f44336;
      color: #d32f2f;
      padding: 12px;
      margin-bottom: 20px;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      color: #52525B;
    }

    .reset-password {
      font-size: 0.875rem;
      color: #DC2626;
      text-decoration: none;
    }

    .login-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background-color: #DC2626;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 12px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .login-button:hover {
      background-color: #B91C1C;
    }

    .login-button:disabled {
      background-color: #f87171;
      cursor: not-allowed;
    }

    @media screen and (max-width: 480px) {
      .modal-container {
        width: 95%;
      }
    }
  `],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-50px)', opacity: 0 }),
        animate('300ms 100ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(-50px)', opacity: 0 }))
      ])
    ])
  ]
})
export class LoginModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() loginSuccess = new EventEmitter<boolean>();

  username = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  errorMessage = '';
  isLoading = false;
  returnUrl = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    // Reset form state
    this.username = '';
    this.password = '';
    this.errorMessage = '';
    this.isLoading = false;
  }

  closeOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.loginSuccess.emit(true);
          this.close();
          // Optionally redirect to returnUrl
          // this.router.navigate([this.returnUrl]);
        } else {
          this.errorMessage = 'Invalid email or password';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred. Please try again.';
        console.error('Login error:', error);
      }
    });
  }

  resetPassword(): void {
    // Implement password reset functionality or navigate to reset page
    console.log('Password reset requested');
    // Optionally, you can navigate to a reset password page
    // this.router.navigate(['/reset-password']);
  }
}

import { Component, ChangeDetectorRef } from '@angular/core'; // 🌟 1. Added
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule} from '@angular/router';
import { AuthModel } from '../../models/auth/auth.model';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: '../../views/auth/register.html',
  styleUrl: '../../views/auth/register.css',
})
export class Register {
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  role = '';
  email = '';
  password = '';
  confirmPassword = ''; 
  errorMessage = '';
  isVerifying = false;
  otpCode = '';
  registeredEmail = '';

  // 🌟 2. Inject cdr
  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    if (!this.role || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = "Passwords do not match.";
      return;
    }

    this.isLoading = true;

    const registerData = {
      role: this.role,
      email: this.email,
      password: this.password,
      confirm_password: this.confirmPassword 
    };

    this.http.post(`${environment.apiUrl}/register`, registerData).subscribe({
      next: (response: any) => {
        // 🌟 Do NOT navigate away. Show the OTP screen instead!
        this.isLoading = false;
        this.isVerifying = true;
        this.registeredEmail = this.email; 
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Register API Error:", error);
        this.errorMessage = error?.error?.message || 'Registration failed.';
        this.isLoading = false; 
        this.cdr.detectChanges(); // 🌟 3. Force UI to redraw!
      }
    });
  }

  onVerify(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    this.isLoading = true;

    this.http.post(`${environment.apiUrl}/verify-otp`, { email: this.registeredEmail, otp: this.otpCode }).subscribe({
      next: () => {
        alert('Email verified successfully! You can now log in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Invalid OTP.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
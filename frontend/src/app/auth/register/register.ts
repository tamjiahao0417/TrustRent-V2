import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false; // 🌟 NEW: Tracks if registration is processing

  role = '';
  email = '';
  password = '';
  confirmPassword = ''; 
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  togglePassword() { 
    this.showPassword = !this.showPassword; 
  }

  toggleConfirmPassword() { 
    this.showConfirmPassword = !this.showConfirmPassword; 
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    if (!this.role || !this.email || !this.password || !this.confirmPassword) return;

    if (this.password !== this.confirmPassword) {
      this.errorMessage = "Passwords do not match.";
      return;
    }

    this.isLoading = true; // 🌟 Start loading spinner

    const registerData = {
      role: this.role,
      email: this.email,
      password: this.password,
      confirm_password: this.confirmPassword 
    };

    this.http.post('http://localhost:8000/api/register', registerData).subscribe({
      next: (response: any) => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Registration failed.';
        this.isLoading = false; // 🌟 Stop spinner on error
      }
    });
  }
}
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule], 
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  showPassword = false;
  isLoading = false; // 🌟 NEW: Tracks if the login is processing
  
  email = '';
  password = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    
    if (!this.email || !this.password) return;
    
    this.isLoading = true; // 🌟 Start loading spinner

    const loginData = {
      email: this.email,
      password: this.password
    };

    this.http.post('http://localhost:8000/api/login', loginData).subscribe({
      next: (response: any) => {
        localStorage.setItem('user_role', response.user.role);
        localStorage.setItem('user_name', response.user.name || response.user.email.split('@')[0]);
        localStorage.setItem('user_id', response.user.id);
        localStorage.setItem('user_email', response.user.email);

        this.router.navigate(['/dashboard']); 
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Login failed. Please try again.';
        this.isLoading = false; // 🌟 Stop loading spinner on error
      }
    });
  }
}
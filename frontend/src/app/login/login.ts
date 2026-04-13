import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  // imports: [FormsModule, CommonModule] allows us to use [(ngModel)] and *ngIf in the HTML
  imports: [FormsModule, CommonModule], 
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  showPassword = false;
  
  // These variables will "hold" what you type into the boxes
  email = '';
  password = '';
  errorMessage = '';

  // We 'inject' the tools we need: http for the request, router for navigation
  constructor(private http: HttpClient, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    const loginData = {
      email: this.email,
      password: this.password
    };

    this.http.post('http://localhost:8000/api/login', loginData).subscribe({
      next: (response: any) => {
        console.log('Login Success!', response);

        // 1. Save user data to localStorage
        localStorage.setItem('user_role', response.user.role);
        localStorage.setItem('user_name', response.user.name || response.user.email.split('@')[0]);
        localStorage.setItem('user_id', response.user.id);
        
        // ADD THIS MISSING LINE RIGHT HERE:
        localStorage.setItem('user_email', response.user.email);

        // 2. Redirect to the shared dashboard route
        this.router.navigate(['/dashboard']); 
      },
      error: (error) => {
        console.error('Login Error:', error);
        this.errorMessage = error.error.message || 'Login failed. Please try again.';
      }
    });
  }
}
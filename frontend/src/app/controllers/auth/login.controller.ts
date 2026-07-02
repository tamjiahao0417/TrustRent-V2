import { Component, ChangeDetectorRef } from '@angular/core'; // 🌟 1. Added ChangeDetectorRef
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

import { AuthModel } from '../../models/auth/auth.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule], 
  templateUrl: '../../views/auth/login.html',
  styleUrl: '../../views/auth/login.css',
})
export class Login {
  showPassword = false;
  isLoading = false; 
  
  email = '';
  password = '';
  errorMessage = '';

  // 🌟 2. Inject ChangeDetectorRef (cdr) here
  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }
    
    this.isLoading = true; 

    const loginData = {
      email: this.email,
      password: this.password
    };

    this.http.post(`${environment.apiUrl}/login`, loginData).subscribe({
      next: (response: any) => {
        if (response && response.user) {
            
            // 🌟 FIX 1: Turn off the loading spinner!
            this.isLoading = false;
            
            // 🌟 FIX 2: Change 'token' to 'auth_token' so the AuthGuard can see it!
            localStorage.setItem('auth_token', response.token); 

            localStorage.setItem('user_role', response.user.role);
            localStorage.setItem('user_name', response.user.name || response.user.email.split('@')[0]);
            localStorage.setItem('user_id', response.user.id);
            localStorage.setItem('user_email', response.user.email);
    
            this.router.navigate(['/dashboard']); 
        } else {
            this.errorMessage = response.message || 'Invalid credentials.';
            this.isLoading = false;
            this.cdr.detectChanges(); 
        }
      },
      error: (error) => {
        console.error("Login API Error:", error);
        
        // 🌟 Handle specific backend error codes
        if (error.status === 403) {
            // Displays the specific suspension message from Laravel
            this.errorMessage = error.error.message || 'Your account has been suspended.';
        } else if (error.status === 401) {
            this.errorMessage = 'Incorrect email or password.';
        } else {
            this.errorMessage = 'An error occurred during login. Please try again.';
        }
        
        this.isLoading = false; 
        this.cdr.detectChanges(); // Force UI to show the error message!
      }
    });
  }
}
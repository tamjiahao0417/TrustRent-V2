import { Component, ChangeDetectorRef } from '@angular/core'; // 🌟 1. Added ChangeDetectorRef
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
    
    if (!this.email || !this.password) return;
    
    this.isLoading = true; 

    const loginData = {
      email: this.email,
      password: this.password
    };

    this.http.post('http://localhost:8000/api/login', loginData).subscribe({
      next: (response: any) => {
        if (response && response.user) {
            localStorage.setItem('user_role', response.user.role);
            localStorage.setItem('user_name', response.user.name || response.user.email.split('@')[0]);
            localStorage.setItem('user_id', response.user.id);
            localStorage.setItem('user_email', response.user.email);
    
            this.router.navigate(['/dashboard']); 
        } else {
            this.errorMessage = response.message || 'Invalid credentials.';
            this.isLoading = false;
            this.cdr.detectChanges(); // 🌟 3. Force UI to redraw!
        }
      },
      error: (error) => {
        console.error("Login API Error:", error);
        this.errorMessage = error?.error?.message || 'Login failed. Please check your email and password.';
        this.isLoading = false; 
        this.cdr.detectChanges(); // 🌟 4. Force UI to redraw here too!
      }
    });
  }
}
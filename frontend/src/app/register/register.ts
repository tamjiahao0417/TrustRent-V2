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
  // Visibility toggles
  showPassword = false;
  showConfirmPassword = false;

  // Form Data - Ensure 'confirmPassword' is added here!
  role = '';
  email = '';
  password = '';
  confirmPassword = ''; // This was the missing link
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

    // Check if passwords match locally before even calling the server
    if (this.password !== this.confirmPassword) {
      this.errorMessage = "Passwords do not match.";
      return;
    }

    const registerData = {
      role: this.role,
      email: this.email,
      password: this.password,
      confirm_password: this.confirmPassword // Match the key Laravel expects
    };

    this.http.post('http://localhost:8000/api/register', registerData).subscribe({
      next: (response: any) => {
        console.log('Registration Success:', response);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration Error:', error);
        this.errorMessage = error.error.message || 'Registration failed.';
      }
    });
  }
}
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // 1. Check if the token exists in the browser's local storage
    const token = localStorage.getItem('auth_token');

    if (token) {
      // 2. If token exists, let them access the page
      return true; 
    } else {
      // 3. If no token, redirect them to the login page
      this.router.navigate(['/login']);
      return false;
    }
  }
}
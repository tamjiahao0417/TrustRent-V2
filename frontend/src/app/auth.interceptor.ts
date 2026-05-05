import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // 🌟 Clone the request to automatically attach the session cookie!
  const securedReq = req.clone({
    withCredentials: true
  });

  // Pass the SECURED request forward, and watch for errors
  return next(securedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // 🌟 Check for BOTH dead sessions (401) and Suspended accounts (403)
      if (error.status === 401 || error.status === 403) {
        console.warn(`Auth Error (${error.status}): Kicking back to login...`);
        
        // If it's specifically a suspension, show an alert before redirecting
        if (error.status === 403) {
            alert('Your account has been suspended. You have been logged out.');
        }

        // Wipe the memory and redirect
        localStorage.clear();
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};
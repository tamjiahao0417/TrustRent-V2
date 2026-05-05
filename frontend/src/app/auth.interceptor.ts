import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // 🌟 1. Grab the token from memory
  const token = localStorage.getItem('token');

  // 🌟 2. Clone the request and AUTOMATICALLY staple the token to it!
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
  }

  // 🌟 3. Send the SECURED request forward, then watch for errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // If Laravel rejects the token (401) or user is suspended (403)
      if (error.status === 401 || error.status === 403) {
        console.warn(`Auth Error (${error.status}): Kicking back to login...`);
        
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
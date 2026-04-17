import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // 🌟 NEW: Clone the request to automatically attach the session cookie!
  const securedReq = req.clone({
    withCredentials: true
  });

  // Pass the SECURED request forward, and watch for errors
  return next(securedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If Laravel says the session is dead (401 error)
      if (error.status === 401) {
        console.warn('Session expired! Kicking back to login...');
        localStorage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
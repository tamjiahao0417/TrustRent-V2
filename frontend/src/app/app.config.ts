import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
// 🌟 1. Import these two tools for the HTTP client
import { provideHttpClient, withInterceptors } from '@angular/common/http'; 
// 🌟 2. Import your new interceptor
import { authInterceptor } from './auth.interceptor'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    // 🌟 3. Tell your HttpClient to use the interceptor!
    provideHttpClient(
      withInterceptors([authInterceptor]) 
    )
  ]
};
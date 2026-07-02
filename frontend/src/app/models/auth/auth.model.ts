import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthModel {
  constructor(private http: HttpClient) {}

  verifyOtp(data: {email: string, otp: string}) {
    return this.http.post(`${environment.apiUrl}/verify-otp`, data);
  }

  resendOtp(data: {email: string}) {
    return this.http.post(`${environment.apiUrl}/resend-otp`, data);
  }
  
  loginUser(loginData: any) {
    // 🌟 The Model handles the API communication
    return this.http.post(`${environment.apiUrl}/login`, loginData);
  }

  registerUser(registerData: any) {
    return this.http.post(`${environment.apiUrl}/register`, registerData);
  }
}
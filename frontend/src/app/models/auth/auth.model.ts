import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthModel {
  constructor(private http: HttpClient) {}

  loginUser(loginData: any) {
    // 🌟 The Model handles the API communication
    return this.http.post('http://localhost:8000/api/login', loginData);
  }

  registerUser(registerData: any) {
    return this.http.post('http://localhost:8000/api/register', registerData);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileModel {
  private apiUrl = 'http://localhost:8000/api/profile';

  constructor(private http: HttpClient) {}

  // 🌟 ADDED: Centralized header management for Sanctum Auth
  private getHeaders() {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  }

  // Fetch the latest profile data with auth headers
  getProfile(email: string | null): Observable<any> {
    return this.http.get(`${this.apiUrl}?email=${email}`, { headers: this.getHeaders() });
  }

  // 🌟 FIX: Changed from .put to .post to match your api.php file!
  // 🌟 FIX: Added the auth headers so Laravel accepts the request!
  updateProfile(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload, { headers: this.getHeaders() });
  }
}
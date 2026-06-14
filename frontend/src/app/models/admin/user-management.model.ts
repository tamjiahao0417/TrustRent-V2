import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = 'http://localhost:8000/api/users';

  constructor(private http: HttpClient) {}

  // Centralized header management
  private getHeaders() {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  }

  // Model Method 1: Fetch all users
  getUsers() {
    const bypassCache = new Date().getTime();
    return this.http.get(`${this.apiUrl}?t=${bypassCache}`);
  }

  // Model Method 2: Update user status
  updateUserStatus(userId: number, action: 'suspend' | 'activate') {
    return this.http.patch(`${this.apiUrl}/${userId}/${action}`, {}, { headers: this.getHeaders() });
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileModel {
  private apiUrl = 'http://localhost:8000/api/profile';

  constructor(private http: HttpClient) {}

  // Fetch the latest profile data from the database
  getProfile(email: string | null): Observable<any> {
    return this.http.get(`${this.apiUrl}?email=${email}`);
  }

  // Save the updated profile information
  updateProfile(payload: any): Observable<any> {
    return this.http.put(this.apiUrl, payload);
  }
}
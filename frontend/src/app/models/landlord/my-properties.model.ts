import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MyPropertiesModel {
  private apiUrl = 'http://localhost:8000/api/properties';

  constructor(private http: HttpClient) {}

  // Fetch all properties belonging to a specific user
  getUserProperties(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?user_id=${userId}`);
  }
}
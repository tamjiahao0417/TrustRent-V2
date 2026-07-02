import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MyPropertiesModel {
  private apiUrl = `${environment.apiUrl}/my-properties`;

  constructor(private http: HttpClient) {}

  // Fetch all properties belonging to a specific user
  getUserProperties(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?user_id=${userId}`);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ViewPropertyModel {
  private apiUrl = `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient) {}

  // Fetch specific property details
  getProperty(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/view/${id}`); 
  }

  // Delete property listing
  deleteProperty(id: string, userId: string | null): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}?user_id=${userId}`);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditPropertyModel {
  private apiUrl = 'http://localhost:8000/api/properties';

  constructor(private http: HttpClient) {}

  // Fetch the current property details
  getProperty(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Submit the updated property (FormData includes files, so we use POST)
  updateProperty(id: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}`, formData);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EditPropertyModel {
  private apiUrl = `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient) {}

  // 🌟 FIX: Fetch the current property details using the PUBLIC route
  getProperty(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/view/${id}`);
  }

  // Submit the updated property (FormData includes files, so we use POST)
  // 🌟 Leave this exactly as it is (it correctly uses the SECURE route to save data)
  updateProperty(id: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}`, formData);
  }
}
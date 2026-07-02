import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EditRentalRequestModel {
  private apiUrl = `${environment.apiUrl}/rental-requests`;

  constructor(private http: HttpClient) {}

  // Fetch the existing rental request details
  getRentalRequest(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Submit the updated rental request data
  updateRentalRequest(id: string, updateData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, updateData);
  }
}
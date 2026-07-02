import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PropertyListingsModel {
  private apiUrl = `${environment.apiUrl}/properties/feed`;

  constructor(private http: HttpClient) {}

  // Fetch all property listings
  getAllProperties(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
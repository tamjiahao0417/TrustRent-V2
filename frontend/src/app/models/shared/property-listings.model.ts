import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PropertyListingsModel {
  private apiUrl = 'http://localhost:8000/api/properties/all';

  constructor(private http: HttpClient) {}

  // Fetch all property listings
  getAllProperties(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
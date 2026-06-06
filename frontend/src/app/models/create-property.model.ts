import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreatePropertyModel {
  private apiUrl = 'http://localhost:8000/api/properties';

  constructor(private http: HttpClient) {}

  // Sends the FormData (which includes text fields and images) to the backend
  createProperty(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
}
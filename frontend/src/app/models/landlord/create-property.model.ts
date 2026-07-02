import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CreatePropertyModel {
  private apiUrl = `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient) {}

  // Sends the FormData (which includes text fields and images) to the backend
  createProperty(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
}
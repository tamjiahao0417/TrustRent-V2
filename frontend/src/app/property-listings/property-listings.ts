import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-property-listings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './property-listings.html',
  styleUrl: './property-listings.css'
})
export class PropertyListings implements OnInit {
  properties: any[] = [];
  isLoading: boolean = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Fetch ALL properties from our new endpoint
    this.http.get('http://localhost:8000/api/properties/all').subscribe({
      next: (data: any) => {
        this.properties = data;
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Failed to load listings', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
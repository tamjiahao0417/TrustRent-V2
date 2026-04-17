import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // 🌟 1. Import FormsModule
import { LoadingSpinnerComponent } from '../../loading-spinner.component';


@Component({
  selector: 'app-my-properties',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent], // 🌟 2. Add it here
  templateUrl: './my-properties.html',
  styleUrl: './my-properties.css'
})
export class MyProperties implements OnInit {
  properties: any[] = [];
  filteredProperties: any[] = []; // 🌟 3. Array for search results
  isLoading: boolean = true;

  // 🌟 4. State variables for inputs
  searchText: string = '';
  showFilters: boolean = false;
  maxPrice: number | null = null;
  minRooms: number | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    const userId = localStorage.getItem('user_id');
    
    this.http.get(`http://localhost:8000/api/properties?user_id=${userId}`).subscribe({
      next: (data: any) => {
        this.properties = data;
        this.filteredProperties = data; // 🌟 5. Show all properties initially
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Failed to load properties', err);
        this.isLoading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  // 🌟 6. The function that filters the list instantly
  applyFilters() {
    this.filteredProperties = this.properties.filter(prop => {
      
      const searchLower = this.searchText ? this.searchText.toLowerCase() : '';
      const matchesSearch = !this.searchText || 
        (prop.title && prop.title.toLowerCase().includes(searchLower)) ||
        (prop.address && prop.address.toLowerCase().includes(searchLower)) ||
        (prop.location && prop.location.toLowerCase().includes(searchLower));

      const matchesPrice = !this.maxPrice || Number(prop.price) <= this.maxPrice;
      const matchesRooms = !this.minRooms || Number(prop.rooms) >= this.minRooms;

      return matchesSearch && matchesPrice && matchesRooms;
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
}
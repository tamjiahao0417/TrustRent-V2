import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // 🌟 1. Import FormsModule
import { LoadingSpinnerComponent } from '../../loading-spinner.component'; // Adjust path if needed

@Component({
  selector: 'app-property-listings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
    templateUrl: './property-listings.html',
  styleUrl: './property-listings.css'
})
export class PropertyListings implements OnInit {
  properties: any[] = [];
  filteredProperties: any[] = []; // 🌟 3. Create a separate array for search results
  isLoading: boolean = true;

  // 🌟 4. State variables for inputs
  searchText: string = '';
  showFilters: boolean = false;
  maxPrice: number | null = null;
  minRooms: number | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.http.get('http://localhost:8000/api/properties/all').subscribe({
      next: (data: any) => {
        this.properties = data;
        this.filteredProperties = data; // 🌟 5. Show all properties initially
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

  // 🌟 6. The function that filters the list instantly
  applyFilters() {
    this.filteredProperties = this.properties.filter(prop => {
      
      // Check Search Box (matches title, address, or location)
      const searchLower = this.searchText.toLowerCase();
      const matchesSearch = !this.searchText || 
        (prop.title?.toLowerCase().includes(searchLower) ||
         prop.address?.toLowerCase().includes(searchLower) ||
         prop.location?.toLowerCase().includes(searchLower));

      // Check Max Price
      const matchesPrice = !this.maxPrice || prop.price <= this.maxPrice;

      // Check Min Rooms
      const matchesRooms = !this.minRooms || prop.rooms >= this.minRooms;

      // Return true only if it matches ALL active filters
      return matchesSearch && matchesPrice && matchesRooms;
    });
  }

  // Toggle the filter menu visibility
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
}
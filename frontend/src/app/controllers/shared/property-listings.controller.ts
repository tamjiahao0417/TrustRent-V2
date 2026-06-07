import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import your spinner (Adjust path if needed depending on your root setup)
import { LoadingSpinnerComponent } from '../../loading-spinner.component'; 

// Import your newly created Model from the shared folder
import { PropertyListingsModel } from '../../models/shared/property-listings.model';

@Component({
  selector: 'app-property-listings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/property-listings.html',
  styleUrl: '../../views/shared/property-listings.css'
})
export class PropertyListingsController implements OnInit {
  properties: any[] = [];
  filteredProperties: any[] = []; 
  isLoading: boolean = true;

  searchText: string = '';
  showFilters: boolean = false;
  maxPrice: number | null = null;
  minRooms: number | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private propertiesModel: PropertyListingsModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    // Use the Model to fetch the listings
    this.propertiesModel.getAllProperties().subscribe({
      next: (data: any) => {
        this.properties = data;
        this.filteredProperties = data; 
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Failed to load listings', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    this.filteredProperties = this.properties.filter(prop => {
      const searchLower = this.searchText.toLowerCase();
      const matchesSearch = !this.searchText || 
        (prop.title?.toLowerCase().includes(searchLower) ||
         prop.address?.toLowerCase().includes(searchLower) ||
         prop.location?.toLowerCase().includes(searchLower));

      const matchesPrice = !this.maxPrice || prop.price <= this.maxPrice;
      const matchesRooms = !this.minRooms || prop.rooms >= this.minRooms;

      return matchesSearch && matchesPrice && matchesRooms;
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
}
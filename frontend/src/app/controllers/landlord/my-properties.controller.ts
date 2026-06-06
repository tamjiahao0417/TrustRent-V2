import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../loading-spinner.component';

// Import your newly created Model
import { MyPropertiesModel } from '../../models/landlord/my-properties.model';

@Component({
  selector: 'app-my-properties',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  // Pointing to the new views folder
  templateUrl: '../../views/landlord/my-properties.html',
  styleUrl: '../../views/landlord/my-properties.css'
})
export class MyPropertiesController implements OnInit {
  properties: any[] = [];
  filteredProperties: any[] = []; 
  isLoading: boolean = true;

  searchText: string = '';
  showFilters: boolean = false;
  maxPrice: number | null = null;
  minRooms: number | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private propertiesModel: MyPropertiesModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    const userId = localStorage.getItem('user_id');
    
    if (userId) {
      // Use the Model to fetch data
      this.propertiesModel.getUserProperties(userId).subscribe({
        next: (data: any) => {
          this.properties = data;
          this.filteredProperties = data; 
          this.isLoading = false;
          this.cdr.detectChanges(); 
        },
        error: (err: any) => {
          console.error('Failed to load properties', err);
          this.isLoading = false;
          this.cdr.detectChanges(); 
        }
      });
    } else {
      this.isLoading = false;
    }
  }

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
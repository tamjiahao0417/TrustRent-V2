import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import the spinner (Adjust path if needed depending on your root setup)
import { LoadingSpinnerComponent } from '../../loading-spinner.component'; 

// Import your newly created Model from the shared folder
import { RentalRequestsModel } from '../../models/shared/rental-requests.model';

@Component({
  selector: 'app-rental-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/rental-requests.html',
  styleUrl: '../../views/shared/rental-requests.css'
})
export class RentalRequestsController implements OnInit {
  requests: any[] = [];
  filteredRequests: any[] = []; 
  
  userRole: string | null = '';
  isLoading: boolean = true; 
  searchText: string = '';      

  constructor(
    private cdr: ChangeDetectorRef,
    private requestsModel: RentalRequestsModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role');
    this.loadRequests();
  }

  loadRequests() {
    const userId = localStorage.getItem('user_id');
    
    if (userId && this.userRole) {
      // Use the Model to fetch data
      this.requestsModel.getRequests(userId, this.userRole).subscribe({
        next: (data: any) => {
          this.requests = data;
          this.filteredRequests = [...data]; 
          
          this.isLoading = false; 
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error loading requests', err);
          this.isLoading = false; 
          this.cdr.detectChanges();
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  // The live filter function
  applyFilters() {
    const search = this.searchText.toLowerCase();

    this.filteredRequests = this.requests.filter(req => {
      return !this.searchText || 
        (req.property?.title && req.property.title.toLowerCase().includes(search)) ||
        (req.landlord?.name && req.landlord.name.toLowerCase().includes(search)) ||
        (req.tenant?.name && req.tenant.name.toLowerCase().includes(search)) ||
        (req.status && req.status.toLowerCase().includes(search));
    });
  }
}
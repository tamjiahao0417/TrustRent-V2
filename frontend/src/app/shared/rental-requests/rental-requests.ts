import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 🌟 Added for search
import { LoadingSpinnerComponent } from '../../loading-spinner.component'; // 🌟 Added Spinner (adjust path if needed)

@Component({
  selector: 'app-rental-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent], // 🌟 Added to imports
  templateUrl: './rental-requests.html',
  styleUrl: './rental-requests.css' 
})
export class RentalRequests implements OnInit {
  requests: any[] = [];
  filteredRequests: any[] = []; // 🌟 Array for search results
  
  userRole: string | null = '';
  isLoading: boolean = true;    // 🌟 Loading state
  searchText: string = '';      // 🌟 Search input state

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role');
    this.loadRequests();
  }

  loadRequests() {
    const userId = localStorage.getItem('user_id');
    this.http.get(`http://localhost:8000/api/rental-requests?user_id=${userId}&role=${this.userRole}`)
      .subscribe({
        next: (data: any) => {
          this.requests = data;
          this.filteredRequests = [...data]; // 🌟 Populate filtered array initially
          
          this.isLoading = false; // 🌟 Hide spinner
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading requests', err);
          this.isLoading = false; // 🌟 Hide spinner on error
          this.cdr.detectChanges();
        }
      });
  }

  // 🌟 The live filter function
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
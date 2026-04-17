import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 🌟 Added for search
import { LoadingSpinnerComponent } from '../../loading-spinner.component'; // 🌟 Import Spinner

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent], // 🌟 Add to imports
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.css'
})
export class Maintenance implements OnInit {
  issues: any[] = [];
  filteredIssues: any[] = []; // 🌟 Array for search results
  
  userRole = localStorage.getItem('user_role') || localStorage.getItem('role');
  userId = localStorage.getItem('user_id');

  isLoading: boolean = true; // 🌟 Loading state
  searchQuery: string = '';  // 🌟 Search input state

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchIssues();
  }

  fetchIssues() {
    this.http.get(`http://localhost:8000/api/maintenance?user_id=${this.userId}&role=${this.userRole}`).subscribe({
      next: (data: any) => {
        this.issues = data;
        this.filteredIssues = [...data]; // 🌟 Populate filtered array
        
        this.isLoading = false; // 🌟 Hide spinner
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API Error:', err);
        this.isLoading = false; // 🌟 Hide spinner on error
        this.cdr.detectChanges();
      }
    });
  }

  // 🌟 The live filter function
  filterIssues() {
    if (!this.searchQuery) {
      this.filteredIssues = this.issues;
    } else {
      const lowerQuery = this.searchQuery.toLowerCase();
      this.filteredIssues = this.issues.filter(issue => 
        (issue.status && issue.status.toLowerCase().includes(lowerQuery)) ||
        (issue.category && issue.category.toLowerCase().includes(lowerQuery)) ||
        (issue.urgency && issue.urgency.toLowerCase().includes(lowerQuery)) ||
        (issue.property_address && issue.property_address.toLowerCase().includes(lowerQuery))
      );
    }
  }

  // Dynamic classes for your status pills based on your CSS
  getStatusClass(status: string): string {
    if (status === 'In Progress') return 'status-progress';
    if (status === 'Closed' || status === 'Resolved') return 'status-closed';
    return 'status-open';
  }
}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import the spinner (Adjust path if needed depending on your root setup)
import { LoadingSpinnerComponent } from '../../loading-spinner.component'; 

// Import your newly created Model from the shared folder
import { MaintenanceModel } from '../../models/shared/maintenance.model';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/maintenance.html',
  styleUrl: '../../views/shared/maintenance.css'
})
export class MaintenanceController implements OnInit {
  issues: any[] = [];
  filteredIssues: any[] = []; 
  
  userRole = localStorage.getItem('user_role') || localStorage.getItem('role') || '';
  userId = localStorage.getItem('user_id') || '';

  isLoading: boolean = true; 
  searchQuery: string = '';  

  constructor(
    private cdr: ChangeDetectorRef,
    private maintenanceModel: MaintenanceModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    this.fetchIssues();
  }

  fetchIssues() {
    if (!this.userId || !this.userRole) {
      this.isLoading = false;
      return;
    }

    // Use the Model to fetch data
    this.maintenanceModel.getIssues(this.userId, this.userRole).subscribe({
      next: (data: any) => {
        this.issues = data;
        this.filteredIssues = [...data]; 
        
        this.isLoading = false; 
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('API Error:', err);
        this.isLoading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  // The live filter function
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
    if (status === 'Resolved') return 'status-resolved';
    if (status === 'Closed') return 'status-closed';
    return 'status-open'; // Default for "Open" or unknown statuses
  }
}
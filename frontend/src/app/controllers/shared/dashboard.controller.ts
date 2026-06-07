import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 

// Import your newly created Model from the shared folder
import { DashboardModel } from '../../models/shared/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/dashboard.html',
  styleUrl: '../../views/shared/dashboard.css'
})
export class DashboardController implements OnInit {
  userRole: string = '';
  userName: string = '';
  userId: string = '';
  
  dbData: any = null;
  isLoading: boolean = true;

  constructor(
    private cdr: ChangeDetectorRef,
    private dashboardModel: DashboardModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role') || '';
    this.userName = localStorage.getItem('user_name') || 'User';
    this.userId = localStorage.getItem('user_id') || '';

    if (this.userId && this.userRole) {
      // Use the Model to fetch the stats
      this.dashboardModel.getDashboardStats(this.userId, this.userRole).subscribe({
        next: (response: any) => {
          this.dbData = response || {};
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Failed to load dashboard:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  // --- Utility functions for HTML template ---
  getFeatures(featuresStr: string): string[] {
    if (!featuresStr) return [];
    try {
      return JSON.parse(featuresStr);
    } catch {
      return featuresStr.split(',').map(f => f.trim());
    }
  }

  isExpiringSoon(endDate: string): boolean {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  }
}
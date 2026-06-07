import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import your new Model
import { ReportsListModel } from '../../models/shared/reports-list.model';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: '../../views/shared/reports-list.html',
  styleUrl: '../../views/shared/reports-list.css'
})
export class ReportsListController implements OnInit {
  reports: any[] = [];
  filteredReports: any[] = [];
  
  searchQuery: string = '';
  activeTab: string = 'All';
  tabs: string[] = ['All', 'Open', 'Resolved', 'Request More', 'warn', 'Invalid'];

  constructor(
    private cdr: ChangeDetectorRef,
    private reportsListModel: ReportsListModel // INJECTING MODEL
  ) {}

  ngOnInit() {
    this.fetchReports();
  }

  fetchReports() {
    // Use the Model to fetch data
    this.reportsListModel.getAllReports().subscribe({
      next: (data: any) => {
        this.reports = data;
        this.filteredReports = [...this.reports];
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error fetching reports', err)
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.applyFilters();
  }

  applyFilters() {
    let temp = this.reports;

    // 1. Filter by Tab
    if (this.activeTab !== 'All') {
      temp = temp.filter(r => r.status === this.activeTab);
    }

    // 2. Filter by Search Query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      temp = temp.filter(r => 
        (r.reference_id?.toLowerCase().includes(q)) ||
        (r.issue_type?.toLowerCase().includes(q)) ||
        (r.related_user?.name?.toLowerCase().includes(q)) ||
        (r.reporter?.name?.toLowerCase().includes(q))
      );
    }

    this.filteredReports = temp;
  }
}
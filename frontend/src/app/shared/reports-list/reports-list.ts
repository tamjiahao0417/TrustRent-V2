import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reports-list.html',
  styleUrl: './reports-list.css'
})
export class ReportsListComponent implements OnInit {
  reports: any[] = [];
  filteredReports: any[] = [];
  
  searchQuery: string = '';
  activeTab: string = 'All';
  tabs: string[] = ['All', 'Open', 'Resolved', 'Request More', 'warn', 'Invalid'];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchReports();
  }

  fetchReports() {
    this.http.get('http://localhost:8000/api/reports').subscribe({
      next: (data: any) => {
        this.reports = data;
        this.filteredReports = [...this.reports];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching reports', err)
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
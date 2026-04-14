import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.css'
})
export class Maintenance implements OnInit {
  issues: any[] = [];
  userRole = localStorage.getItem('user_role') || localStorage.getItem('role');
  userId = localStorage.getItem('user_id');

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchIssues();
  }

  fetchIssues() {
    this.http.get(`http://localhost:8000/api/maintenance?user_id=${this.userId}&role=${this.userRole}`).subscribe({
      next: (data: any) => {
        this.issues = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('API Error:', err)
    });
  }

  // Dynamic classes for your status pills based on your CSS
  getStatusClass(status: string): string {
    if (status === 'In Progress') return 'status-progress';
    if (status === 'Closed' || status === 'Resolved') return 'status-closed';
    return 'status-open';
  }
}
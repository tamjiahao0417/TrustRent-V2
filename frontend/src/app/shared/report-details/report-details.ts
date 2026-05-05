import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-details.html',
  styleUrl: './report-details.css'
})
export class ReportDetailsComponent implements OnInit {
  report: any = null;
  userRole: string = '';
  newStatus: string = '';
  statusOptions = ['Open', 'Resolved', 'Request More', 'warn', 'Invalid'];

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient, 
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role') || '';
    const id = this.route.snapshot.paramMap.get('id');
    
    this.http.get(`http://localhost:8000/api/reports/${id}`).subscribe({
      next: (data: any) => {
        this.report = data;
        this.newStatus = this.report.status; // Set dropdown to current status
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API Error:', err);
        alert('Failed to load report details.');
      }
    });
  }

  updateStatus() {
    this.http.patch(`http://localhost:8000/api/reports/${this.report.id}/status`, { status: this.newStatus }).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.report.status = this.newStatus;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Failed to update status.');
        console.error(err);
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
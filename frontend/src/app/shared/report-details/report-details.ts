import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // 🌟 Added Router & RouterModule
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // 🌟 Added RouterModule for [routerLink]
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
    private cdr: ChangeDetectorRef,
    private router: Router // 🌟 Injected Router
  ) {}

  // 🌟 Inside ReportDetailsComponent class:
  reportAttachments: string[] = []; // Add this variable

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role') || '';
    const id = this.route.snapshot.paramMap.get('id');
    
    this.http.get(`http://localhost:8000/api/reports/${id}`).subscribe({
      next: (data: any) => {
        this.report = data;
        this.newStatus = this.report.status;
        
        // 🌟 Safely parse the JSON array of images
        if (this.report.attachment_path) {
            try {
                this.reportAttachments = JSON.parse(this.report.attachment_path);
            } catch (e) {
                this.reportAttachments = [this.report.attachment_path];
            }
        } else {
            this.reportAttachments = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => { alert('Failed to load report details.'); }
    });
  }

  isImage(path: string): boolean {
    return path.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null;
  }

  fullScreenImage: string | null = null;
  openFullScreen(url: string) { this.fullScreenImage = url; this.cdr.detectChanges(); }
  closeFullScreen() { this.fullScreenImage = null; this.cdr.detectChanges(); }
  
  updateStatus() {
    this.http.patch(`http://localhost:8000/api/reports/${this.report.id}/status`, { status: this.newStatus }).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.report.status = this.newStatus;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Update Error:', err);
        alert('Failed to update status.');
      }
    });
  }

  // 🌟 NEW: Delete Function
  // Inside report-details.ts
// Inside report-details.ts
deleteReport() {
  if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      // No need to pass user_id in the URL query if you are using 'auth:sanctum'
      this.http.delete(`http://localhost:8000/api/reports/${this.report.id}`).subscribe({
          next: () => {
              alert('Report deleted successfully.');
              this.router.navigate(['/reports']);
          },
          error: (err) => {
              console.error('Delete Error:', err);
              alert('Failed to delete report: ' + err.error.message);
          }
      });
  }
}

  goBack() {
    this.location.back();
  }
}
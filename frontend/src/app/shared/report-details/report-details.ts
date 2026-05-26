import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './report-details.html',
  styleUrl: './report-details.css'
})
export class ReportDetailsComponent implements OnInit {
  report: any = null;
  userRole: string = '';
  
  newStatus: string = '';
  adminComment: string = ''; 
  statusOptions = ['Open', 'Resolved', 'Request More', 'Warn', 'Invalid'];
  
  parsedMedia: string[] = []; 
  fullScreenImage: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient, 
    private location: Location,
    private cdr: ChangeDetectorRef,
    private router: Router 
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role') || '';
    const id = this.route.snapshot.paramMap.get('id');
    
    this.http.get(`http://localhost:8000/api/reports/${id}`).subscribe({
      next: (data: any) => {
        this.report = data;
        
        // Handle Casing correctly
        this.newStatus = this.report.status;
        if (this.newStatus && this.newStatus.toLowerCase() === 'warn') {
            this.newStatus = 'Warn'; 
        }
        
        this.adminComment = this.report.admin_comment || ''; 
        
        const rawAttachments = this.report.attachment_path || this.report.attachments || this.report.media_path;

        if (rawAttachments) {
          try {
            let parsed = typeof rawAttachments === 'string' 
              ? JSON.parse(rawAttachments) 
              : rawAttachments;
              
            this.parsedMedia = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            console.error('Error parsing attachments', e);
            this.parsedMedia = [rawAttachments];
          }
        } else {
            this.parsedMedia = [];
        }

        this.cdr.detectChanges();
      },
      error: () => { alert('Failed to load report details.'); }
    });
  }

  isImage(path: string): boolean {
    return path.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null;
  }

  isVideo(url: string): boolean {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  }

  openImage(url: string) { this.fullScreenImage = url; this.cdr.detectChanges(); }
  closeImage() { this.fullScreenImage = null; this.cdr.detectChanges(); }

  // 🌟 NEW: Safe status checker
  isClosed(): boolean {
    if (!this.report || !this.report.status) return false;
    const s = this.report.status.toLowerCase();
    return s === 'resolved' || s === 'invalid';
  }
  
  updateStatus() {
    if (this.isClosed()) {
        alert('This report is already closed and cannot be modified.');
        return;
    }

    const isClosing = this.newStatus === 'Resolved' || this.newStatus === 'Invalid';
    if (!this.adminComment && isClosing) {
        return alert('Please enter a resolution comment before closing the report.');
    }

    const payload = {
        status: this.newStatus,
        admin_comment: this.adminComment 
    };

    this.http.patch(`http://localhost:8000/api/reports/${this.report.id}/status`, payload).subscribe({
      next: (res: any) => {
        alert(res.message || 'Status and comments updated successfully!');
        this.report.status = this.newStatus;
        this.report.admin_comment = this.adminComment; 
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Update Error:', err);
        alert('Failed to update status.');
      }
    });
  }

  deleteReport() {
    if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
        this.http.delete(`http://localhost:8000/api/reports/${this.report.id}`).subscribe({
            next: () => {
                alert('Report deleted successfully.');
                this.router.navigate(['/reports']);
            },
            error: (err) => {
                console.error('Delete Error:', err);
                alert('Failed to delete the report.');
            }
        });
    }
  }

  goBack() {
    this.location.back();
  }

  // 🌟 FIX: Bulletproof UI helpers so the banner colors never disappear
  getStatusClass(status: string): string {
    if (!status) return 'status-waiting';
    const s = status.toLowerCase();
    if (s === 'open') return 'status-needs-seal';
    if (s === 'resolved') return 'status-active';
    if (s === 'invalid') return 'status-closed';
    return 'status-waiting';
  }

  getStatusIcon(status: string): string {
    if (!status) return 'fa-circle-info';
    const s = status.toLowerCase();
    if (s === 'open') return 'fa-circle-exclamation';
    if (s === 'resolved') return 'fa-circle-check';
    if (s === 'invalid') return 'fa-ban';
    return 'fa-circle-info';
  }
}
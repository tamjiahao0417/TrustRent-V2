import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import your Model
import { ReportDetailsModel } from '../../models/shared/report-details.model';

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: '../../views/shared/report-details.html',
  styleUrl: '../../views/shared/report-details.css'
})
export class ReportDetailsController implements OnInit {
  report: any = null;
  userRole: string = '';
  
  newStatus: string = '';
  adminComment: string = ''; 
  
  statusOptions = ['Open', 'Investigating', 'Resolved', 'Dismissed'];

  parsedMedia: string[] = [];
  fullScreenImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private reportDetailsModel: ReportDetailsModel // INJECTING MODEL
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role') || '';
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.reportDetailsModel.getReport(id).subscribe({
        next: (data: any) => {
          this.report = data;
          this.newStatus = this.report.status;
          this.adminComment = this.report.admin_comment || '';
          
          const rawAttachments = this.report.attachment_path || this.report.attachments || this.report.media_path;
          if (rawAttachments) {
            try {
              let parsed = typeof rawAttachments === 'string' ? JSON.parse(rawAttachments) : rawAttachments;
              this.parsedMedia = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              this.parsedMedia = [rawAttachments];
            }
          }
          this.cdr.detectChanges();
        },
        error: () => alert('Failed to load report details.')
      });
    }
  }

  isImage(path: string): boolean { return path.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null; }
  isVideo(url: string): boolean { return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null; }
  openImage(url: string) { this.fullScreenImage = url; this.cdr.detectChanges(); }
  closeImage() { this.fullScreenImage = null; this.cdr.detectChanges(); }

  isClosed(): boolean {
    if (!this.report || !this.report.status) return false;
    const s = this.report.status.toLowerCase();
    
    // We removed:  || s === 'resolved'
    return s === 'dismissed'; 
  }
  
  updateStatus() {
    if (this.isClosed()) return alert('This report is already closed.');
    
    // 3. Force admin to leave a comment if they are closing the ticket
    if (!this.adminComment && (this.newStatus === 'Resolved' || this.newStatus === 'Dismissed')) {
        return alert('Please enter a resolution comment before closing the ticket.');
    }

    this.reportDetailsModel.updateStatus(this.report.id, {
      status: this.newStatus,
      admin_comment: this.adminComment 
  }).subscribe({
    next: (res: any) => {
      alert(res.message || 'Updated successfully!');
      this.report.status = this.newStatus;
      this.report.admin_comment = this.adminComment; 
      this.cdr.detectChanges();
    },
    // 🌟 CHANGED: This will now print the exact Laravel crash reason to your console!
    error: (err: any) => {
      console.error("Backend Error Details:", err.error);
      alert(`Error: ${err.error?.message || 'Failed to update status'}`);
    }
  }); 
  }

  deleteReport() {
    if (confirm('Are you sure you want to delete this report?')) {
        this.reportDetailsModel.deleteReport(this.report.id).subscribe({
            next: () => {
                alert('Report deleted successfully.');
                this.router.navigate(['/reports']);
            },
            error: () => alert('Failed to delete the report.')
        });
    }
  }

  goBack() { this.location.back(); }

  getStatusClass(status: string): string {
    if (!status) return 'status-waiting';
    const s = status.toLowerCase();
    if (s === 'open') return 'status-needs-seal';
    if (s === 'investigating') return 'status-investigating';
    if (s === 'resolved') return 'status-active';
    if (s === 'dismissed') return 'status-closed';
    return 'status-waiting';
  }

  // 5. Update the UI Icons
  getStatusIcon(status: string): string {
    if (!status) return 'fa-circle-info';
    const s = status.toLowerCase();
    if (s === 'open') return 'fa-circle-exclamation';
    if (s === 'investigating') return 'fa-magnifying-glass';
    if (s === 'resolved') return 'fa-circle-check';
    if (s === 'dismissed') return 'fa-ban';
    return 'fa-circle-info';
  }
}
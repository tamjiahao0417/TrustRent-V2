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
  statusOptions = ['Open', 'Resolved', 'Request More', 'Warn', 'Invalid'];
  
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
    return s === 'resolved' || s === 'invalid';
  }
  
  updateStatus() {
    if (this.isClosed()) return alert('This report is already closed.');
    if (!this.adminComment && (this.newStatus === 'Resolved' || this.newStatus === 'Invalid')) {
        return alert('Please enter a resolution comment before closing.');
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
      error: () => alert('Failed to update status.')
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
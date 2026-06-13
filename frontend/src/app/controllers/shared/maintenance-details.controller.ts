import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import your newly created Model from the shared folder
import { MaintenanceDetailsModel } from '../../models/shared/maintenance-details.model';

@Component({
  selector: 'app-maintenance-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/maintenance-details.html',
  styleUrl: '../../views/shared/maintenance-details.css'
})
export class MaintenanceDetailsController implements OnInit {
  issue: any = null;
  userRole = localStorage.getItem('user_role') || localStorage.getItem('role');
  userId = localStorage.getItem('user_id');
  
  updateData = { status: '', latest_update: '' };
  
  errorMessage: string = ''; 
  parsedMedia: string[] = [];
  fullScreenImage: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private location: Location,
    private cdr: ChangeDetectorRef,
    private maintenanceDetailsModel: MaintenanceDetailsModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Use the Model to fetch the issue
      this.maintenanceDetailsModel.getIssue(id).subscribe({
        next: (data: any) => {
          this.issue = data;
          this.updateData.status = this.issue.status;

          if (this.issue.media_path) {
            try {
              this.parsedMedia = JSON.parse(this.issue.media_path);
            } catch (e) {
              this.parsedMedia = [this.issue.media_path];
            }
          }
          this.cdr.detectChanges();
        }
      });
    }
  }

  isVideo(url: string): boolean {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  }

  openImage(url: string) {
    this.fullScreenImage = url;
    this.cdr.detectChanges();
  }

  closeImage() {
    this.fullScreenImage = null;
    this.cdr.detectChanges();
  }

  editIssue() {
    this.router.navigate(['/edit-maintenance', this.issue.id]);
  }

  deleteIssue() {
    if (confirm('Are you sure you want to delete this issue?')) {
      // Use the Model to delete
      this.maintenanceDetailsModel.deleteIssue(this.issue.id, this.userId).subscribe({
        next: () => this.router.navigate(['/maintenance']),
        error: () => alert('Failed to delete. Ensure the issue is still Open.')
      });
    }
  }

  updateStatus() {
    if (this.issue.status === 'Closed') {
        alert('This issue is already closed and cannot be modified.');
        return;
    }

    if (!this.updateData.latest_update) return alert('Please enter a status update message.');
    
    // Use the Model to update the status
    this.maintenanceDetailsModel.updateStatus(this.issue.id, this.updateData).subscribe({
      next: () => {
        alert('Status updated successfully!');
        this.ngOnInit(); // Refresh the page data
      },
      // 🌟 NEW: Added an error handler so it doesn't fail silently!
      error: (err) => {
        console.error("Status Update Error:", err);
        alert('Failed to update status. Check the console for details.');
      }
    });
  }

  goBack() { this.location.back(); }
}
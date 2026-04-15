import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-maintenance-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './maintenance-details.html',
  styleUrl: './maintenance-details.css'
})
export class MaintenanceDetails implements OnInit {
  issue: any = null;
  userRole = localStorage.getItem('user_role') || localStorage.getItem('role');
  
  // For Landlord Updates
  updateData = { status: '', latest_update: '' };

  // 🌟 New: Array to hold parsed media URLs and Modal State
  parsedMedia: string[] = [];
  fullScreenImage: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient, 
    private location: Location,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get(`http://localhost:8000/api/maintenance/${id}`).subscribe({
      next: (data: any) => {
        this.issue = data;
        this.updateData.status = this.issue.status;

        // 🌟 Safely parse the JSON string of media paths into an array
        if (this.issue.media_path) {
          try {
            this.parsedMedia = JSON.parse(this.issue.media_path);
          } catch (e) {
            // Fallback just in case there's an old issue with only 1 string URL
            this.parsedMedia = [this.issue.media_path];
          }
        }

        this.cdr.detectChanges();
      }
    });
  }

  // 🌟 Helper method to determine if we should show <video> or <img>
  isVideo(url: string): boolean {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  }

  // 🌟 Modal Controls
  openImage(url: string) {
    this.fullScreenImage = url;
    this.cdr.detectChanges();
  }

  closeImage() {
    this.fullScreenImage = null;
    this.cdr.detectChanges();
  }

  editIssue() {
    // This will send the user to an edit page (e.g., http://localhost:4200/edit-maintenance/5)
    this.router.navigate(['/edit-maintenance', this.issue.id]);
  }

  deleteIssue() {
    if (confirm('Are you sure you want to delete this issue?')) {
      const userId = localStorage.getItem('user_id');
      this.http.delete(`http://localhost:8000/api/maintenance/${this.issue.id}?user_id=${userId}`).subscribe({
        next: () => this.router.navigate(['/maintenance']),
        error: () => alert('Failed to delete. Ensure the issue is still Open.')
      });
    }
  }

  updateStatus() {
    if (!this.updateData.latest_update) return alert('Please enter a status update message.');
    
    this.http.put(`http://localhost:8000/api/maintenance/${this.issue.id}/status`, this.updateData).subscribe({
      next: () => {
        alert('Status updated successfully!');
        this.ngOnInit(); // Refresh the page data
      }
    });
  }

  goBack() { this.location.back(); }
}
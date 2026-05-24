import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-report.html',
  styleUrl: './edit-report.css'
})
export class EditReportComponent implements OnInit {
  reportId: string | null = null;
  reportData: any = null; 
  isSubmitting: boolean = false;
  errorMessage: string = '';

  // 🌟 Arrays for Multiple Images
  existingMedia: string[] = []; 
  selectedFiles: File[] = []; 
  previewMedia: { url: string, type: string }[] = []; 
  fullScreenImage: string | null = null;

  issueTypes = ['Plumbing', 'Payment Error', 'Inappropriate content', 'Harassment', 'Spam', 'Bug', 'Other'];

  constructor(
    private route: ActivatedRoute, private http: HttpClient,
    private router: Router, private location: Location, private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.reportId = this.route.snapshot.paramMap.get('id');

    this.http.get(`http://localhost:8000/api/reports/${this.reportId}`).subscribe({
      next: (data: any) => {
        if (data.status !== 'Open') {
          alert('This report is already being processed and can no longer be edited.');
          this.router.navigate(['/reports/details', this.reportId]);
          return;
        }

        this.reportData = {
          issue_type: data.issue_type,
          description: data.description,
          related_user_id: data.related_user_id || ''
        };

        // 🌟 Parse existing images correctly
        if (data.attachment_path) {
          try {
            this.existingMedia = JSON.parse(data.attachment_path);
          } catch (e) {
            this.existingMedia = [data.attachment_path];
          }
        }
        
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load the report details.';
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      const maxSizeInBytes = 5 * 1024 * 1024; // 🌟 5MB limit in bytes

      for (let file of files) {
        
        // Check if it's an image
        if (!file.type.startsWith('image/')) {
           alert(`"${file.name}" is not a valid image file.`);
           continue;
        }

        // 🌟 NEW: Check file size BEFORE adding it
        if (file.size > maxSizeInBytes) {
           alert(`"${file.name}" is too large! The maximum file size is 5MB.`);
           continue; // Skip this file
        }

        this.selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewMedia.push({ url: e.target.result, type: file.type });
          this.cdr.detectChanges(); 
        };
        reader.readAsDataURL(file);
      }
      event.target.value = ''; // Reset the input
    }
  }

  removeNewImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewMedia.splice(index, 1);
    this.cdr.detectChanges();
  }

  removeExistingImage(index: number) {
    this.existingMedia.splice(index, 1);
    this.cdr.detectChanges();
  }

  openImage(url: string) { this.fullScreenImage = url; this.cdr.detectChanges(); }
  openExistingImage(url: string) { this.fullScreenImage = 'http://localhost:8000/storage/' + url; this.cdr.detectChanges(); }
  closeImage() { this.fullScreenImage = null; this.cdr.detectChanges(); }

  submitUpdate() {
    this.errorMessage = '';
    if (!this.reportData.issue_type || !this.reportData.description) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('_method', 'PUT'); 
    formData.append('issue_type', this.reportData.issue_type);
    formData.append('description', this.reportData.description);
    
    if (this.reportData.related_user_id) {
      formData.append('related_user_id', this.reportData.related_user_id);
    }
    
    formData.append('existing_media', JSON.stringify(this.existingMedia));

    this.selectedFiles.forEach((file) => {
      formData.append('attachment[]', file, file.name);
    });

    this.http.post(`http://localhost:8000/api/reports/${this.reportId}`, formData).subscribe({
      next: () => {
        alert('Report updated successfully!');
        this.router.navigate(['/reports/details', this.reportId]);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Update failed.';
        this.cdr.detectChanges();
      }
    });
  }

  goBack() { this.location.back(); }
}
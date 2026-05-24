import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-report-issue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-issue.html',
  styleUrl: './report-issue.css'
})
export class ReportIssueComponent {
  issueData = { issue_type: '', description: '', related_user_id: '' };
  
  // 🌟 Upgraded to Arrays
  selectedFiles: File[] = [];
  previewMedia: { url: string, type: string }[] = []; 
  
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  fullScreenImage: string | null = null;

  issueTypes = ['Plumbing', 'Payment Error', 'Inappropriate content', 'Harassment', 'Spam', 'Bug', 'Other'];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {}

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
           continue; // Skip this file and move to the next one
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

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewMedia.splice(index, 1);
    this.cdr.detectChanges();
  }

  openImage(url: string) { this.fullScreenImage = url; this.cdr.detectChanges(); }
  closeImage() { this.fullScreenImage = null; this.cdr.detectChanges(); }

  submitReport() {
    this.errorMessage = '';
    
    if (!this.issueData.issue_type || !this.issueData.description) {
      this.errorMessage = 'Please complete all required fields before submitting.';
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('issue_type', this.issueData.issue_type);
    formData.append('description', this.issueData.description);
    
    if (this.issueData.related_user_id) {
      formData.append('related_user_id', this.issueData.related_user_id);
    }
    
    // 🌟 Append multiple files
    this.selectedFiles.forEach((file) => {
      formData.append('attachment[]', file, file.name);
    });

    this.http.post('http://localhost:8000/api/reports', formData).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        alert(`Report submitted successfully!`);
        this.router.navigate(['/reports']); 
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Submission failed. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
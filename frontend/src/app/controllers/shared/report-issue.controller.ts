import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Import the new Model
import { ReportIssueModel } from '../../models/shared/report-issue.model';

@Component({
  selector: 'app-report-issue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: '../../views/shared/report-issue.html',
  styleUrl: '../../views/shared/report-issue.css'
})
export class ReportIssueController {
  issueData = { issue_type: '', description: ''};
  
  selectedFiles: File[] = [];
  previewMedia: { url: string, type: string }[] = []; 
  
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  fullScreenImage: string | null = null;

  issueTypes = ['Plumbing', 'Payment Error', 'Inappropriate content', 'Harassment', 'Spam', 'Bug', 'Other'];

  constructor(
    private reportModel: ReportIssueModel, // INJECTING THE MODEL
    private cdr: ChangeDetectorRef, 
    private router: Router, 
    private locationService: Location
  ) {}

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB limit

      for (let file of files) {
        if (file.size > maxSizeInBytes) {
          alert(`File ${file.name} is too large. Max 5MB.`);
          continue;
        }

        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewMedia.push({ url: e.target.result, type: file.type });
          this.cdr.detectChanges(); 
        };
        reader.readAsDataURL(file);
      }
      event.target.value = ''; 
    }
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewMedia.splice(index, 1);
    this.cdr.detectChanges();
  }

  openImage(url: string) { this.fullScreenImage = url; this.cdr.detectChanges(); }
  closeImage() { this.fullScreenImage = null; this.cdr.detectChanges(); }
  goBack() { this.locationService.back(); }

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
    
    this.selectedFiles.forEach((file) => {
      formData.append('attachment[]', file, file.name);
    });

    // Use the Model to submit
    this.reportModel.submitReport(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert(`Report submitted successfully!`);
        this.router.navigate(['/reports']); 
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to submit report. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
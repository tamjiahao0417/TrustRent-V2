import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Import your newly created Model from the shared folder
import { EditReportModel } from '../../models/shared/edit-report.model';

@Component({
  selector: 'app-edit-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/edit-report.html',
  styleUrl: '../../views/shared/edit-report.css'
})
export class EditReportController implements OnInit {
  reportId: string | null = null;
  reportData: any = null; 
  isSubmitting: boolean = false;
  errorMessage: string = '';

  // Arrays for Multiple Images
  existingMedia: string[] = []; 
  selectedFiles: File[] = []; 
  previewMedia: { url: string, type: string }[] = []; 
  fullScreenImage: string | null = null;

  issueTypes = ['Plumbing', 'Payment Error', 'Inappropriate content', 'Harassment', 'Spam', 'Bug', 'Other'];

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private location: Location, 
    private cdr: ChangeDetectorRef,
    private editReportModel: EditReportModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    this.reportId = this.route.snapshot.paramMap.get('id');

    if (this.reportId) {
      // Use the Model to fetch the report
      this.editReportModel.getReport(this.reportId).subscribe({
        next: (data: any) => {
          if (data.status !== 'Open') {
            alert('Only Open reports can be edited.');
            this.router.navigate(['/reports']);
            return;
          }

          this.reportData = data;

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
          this.errorMessage = 'Failed to load report details.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  goBack() { 
    this.location.back(); 
  }

  // --- MEDIA HANDLING LOGIC ---
  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      for (let file of files) {
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

  removeExistingImage(index: number) {
    this.existingMedia.splice(index, 1);
    this.cdr.detectChanges();
  }

  removeNewImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewMedia.splice(index, 1);
    this.cdr.detectChanges();
  }

  openImage(url: string) { 
    this.fullScreenImage = url; 
    this.cdr.detectChanges(); 
  }
  
  openExistingImage(url: string) { 
    this.fullScreenImage = 'http://localhost:8000/storage/' + url; 
    this.cdr.detectChanges(); 
  }
  
  closeImage() { 
    this.fullScreenImage = null; 
    this.cdr.detectChanges(); 
  }

  // --- SUBMISSION ---
  submitUpdate() {
    this.errorMessage = '';
    if (!this.reportData.issue_type || !this.reportData.description) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    if (!this.reportId) return;

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

    // Use the Model to submit the update
    this.editReportModel.updateReport(this.reportId, formData).subscribe({
      next: () => {
        alert('Report updated successfully!');
        this.router.navigate(['/reports/details', this.reportId]);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to update report.';
        this.cdr.detectChanges();
      }
    });
  }
}
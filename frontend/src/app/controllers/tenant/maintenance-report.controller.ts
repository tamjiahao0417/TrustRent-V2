import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import your newly created Model from the tenant folder
import { MaintenanceReportModel } from '../../models/tenant/maintenance-report.model';

@Component({
  selector: 'app-maintenance-report',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  // Pointing to the new views folder
  templateUrl: '../../views/tenant/maintenance-report.html',
  styleUrl: '../../views/tenant/maintenance-report.css'
})
export class MaintenanceReportController implements OnInit {
  userId = localStorage.getItem('user_id');
  activeProperties: any[] = [];
  
  reportData: any = {
    selected_property: '', 
    category: '',
    urgency: '',
    description: ''
  };

  selectedFiles: File[] = [];
  previewMedia: { url: string, type: string }[] = []; 
  fullScreenImage: string | null = null;

  isLoading = false;

  constructor(
    private location: Location,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private maintenanceModel: MaintenanceReportModel // INJECTING THE MODEL HERE
  ) {}
 
  ngOnInit() {
    if (this.userId) {
      // Use the Model to fetch active properties
      this.maintenanceModel.getActiveProperties(this.userId).subscribe({
        next: (data: any) => {
          this.activeProperties = data;
          this.cdr.detectChanges();
        },
        error: () => alert('Failed to load active properties.')
      });
    }
  }

  openImage(url: string) {
    this.fullScreenImage = url;
    this.cdr.detectChanges();
  }

  closeImage() {
    this.fullScreenImage = null;
    this.cdr.detectChanges();
  }

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

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewMedia.splice(index, 1);
    this.cdr.detectChanges();
  }

  submitReport() {
    if (!this.reportData.selected_property || !this.reportData.category || !this.reportData.urgency || !this.reportData.description) {
      return alert('Please fill in all required fields.');
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('tenant_id', this.userId!);
    formData.append('landlord_id', this.reportData.selected_property.landlord_id);
    formData.append('property_id', this.reportData.selected_property.property_id);
    formData.append('category', this.reportData.category);
    formData.append('urgency', this.reportData.urgency);
    formData.append('description', this.reportData.description);
    
    this.selectedFiles.forEach((file) => {
      formData.append('media[]', file, file.name);
    });

    // Use the Model to submit the report
    this.maintenanceModel.submitReport(formData).subscribe({
      next: () => {
        alert('Maintenance issue reported successfully!');
        this.router.navigate(['/maintenance']);
      },
      error: (err: any) => {
        console.error('API Error:', err);
        alert('Failed to submit report. Check console.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack() { 
    this.location.back(); 
  }
}
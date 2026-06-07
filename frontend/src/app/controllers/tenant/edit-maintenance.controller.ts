import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import your newly created Model from the tenant folder
import { EditMaintenanceModel } from '../../models/tenant/edit-maintenance.model';

@Component({
  selector: 'app-edit-maintenance',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  // Pointing to the new views folder
  templateUrl: '../../views/tenant/edit-maintenance.html',
  styleUrl: '../../views/tenant/edit-maintenance.css'
})
export class EditMaintenanceController implements OnInit {
  issueId: string | null = null;
  userId = localStorage.getItem('user_id');
  activeProperties: any[] = [];
  isLoading = false;

  reportData: any = {
    selected_property: '', 
    category: '',
    urgency: '',
    description: ''
  };

  // Media Arrays
  existingMedia: string[] = []; 
  selectedFiles: File[] = []; 
  previewMedia: { url: string, type: string }[] = []; 
  fullScreenImage: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private location: Location,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private maintenanceModel: EditMaintenanceModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    this.issueId = this.route.snapshot.paramMap.get('id');
    
    if (this.userId && this.issueId) {
      // 1. Fetch properties first using the Model
      this.maintenanceModel.getMaintenanceProperties(this.userId).subscribe({
        next: (props: any) => {
          this.activeProperties = props;
          
          // 2. Fetch the current issue data using the Model
          this.maintenanceModel.getMaintenanceIssue(this.issueId!).subscribe({
            next: (data: any) => {
              this.reportData.category = data.category;
              this.reportData.urgency = data.urgency;
              this.reportData.description = data.description;

              // Pre-select the correct property in the dropdown
              const matchedProperty = this.activeProperties.find(p => p.property_id === data.property_id);
              if (matchedProperty) {
                this.reportData.selected_property = matchedProperty;
              }

              // Parse existing media
              if (data.media_path) {
                try {
                  this.existingMedia = JSON.parse(data.media_path);
                } catch (e) {
                  this.existingMedia = [data.media_path];
                }
              }
              this.cdr.detectChanges();
            }
          });
        }
      });
    }
  }

  // --- MEDIA HANDLING LOGIC ---
  isVideo(url: string): boolean {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  }

  openImage(url: string) { this.fullScreenImage = url; this.cdr.detectChanges(); }
  closeImage() { this.fullScreenImage = null; this.cdr.detectChanges(); }

  removeExistingImage(index: number) {
    this.existingMedia.splice(index, 1);
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

  removeNewImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewMedia.splice(index, 1);
    this.cdr.detectChanges();
  }

  // --- SUBMISSION ---
  submitUpdate() {
    if (!this.reportData.selected_property || !this.reportData.category || !this.reportData.urgency || !this.reportData.description) {
      return alert('Please fill in all required fields.');
    }

    if (!this.issueId) return;

    this.isLoading = true;

    const formData = new FormData();
    formData.append('_method', 'PUT'); 
    formData.append('user_id', this.userId!);
    formData.append('landlord_id', this.reportData.selected_property.landlord_id);
    formData.append('property_id', this.reportData.selected_property.property_id);
    formData.append('category', this.reportData.category);
    formData.append('urgency', this.reportData.urgency);
    formData.append('description', this.reportData.description);
    
    formData.append('existing_media', JSON.stringify(this.existingMedia));

    this.selectedFiles.forEach((file) => {
      formData.append('media[]', file, file.name);
    });

    // Use the Model to submit the update
    this.maintenanceModel.updateMaintenanceIssue(this.issueId, formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges(); 
        
        alert('Issue updated successfully!');
        this.router.navigate(['/maintenance/details', this.issueId]); 
      },
      error: (err: any) => {
        console.error('API Error:', err);
        alert('Failed to update issue.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack() { 
    this.location.back(); 
  }
}
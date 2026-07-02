import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
// Import your newly created Model
import { EditPropertyModel } from '../../models/landlord/edit-property.model';

@Component({
  selector: 'app-edit-property',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  // Pointing to the new views folder
  templateUrl: '../../views/landlord/edit-property.html',
  styleUrl: '../../views/landlord/edit-property.css'
})
export class EditPropertyController implements OnInit {
  propertyId: string | null = null;
  property: any = null; 
  storageUrl = environment.storageUrl;
  existingImages: string[] = [];
  selectedFiles: File[] = [];
  previewUrls: string[] = []; 
  fullScreenImage: string | null = null; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private propertyModel: EditPropertyModel // INJECTING THE MODEL HERE
  ) {}

  openImage(url: string) {
    this.fullScreenImage = url;
    this.cdr.detectChanges(); 
  }

  closeImage() {
    this.fullScreenImage = null;
    this.cdr.detectChanges(); 
  }

  ngOnInit() {
    this.propertyId = this.route.snapshot.paramMap.get('id');
    
    if (this.propertyId) {
      // Use the Model to fetch the property
      this.propertyModel.getProperty(this.propertyId).subscribe({
        next: (data: any) => {
          this.property = data;
          this.existingImages = data.images ? [...data.images] : [];
          this.cdr.detectChanges(); 
        },
        error: (err: any) => console.error('Failed to load', err)
      });
    }
  }

  removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
    this.cdr.detectChanges();
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];

      for (let file of files) {
        this.selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
          this.cdr.detectChanges(); 
        };
        reader.readAsDataURL(file);
      }
      
      event.target.value = ''; 
    }
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1); 
    this.previewUrls.splice(index, 1);   
    this.cdr.detectChanges(); 
  }

  allowNumbersOnly(event: KeyboardEvent) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  formatPhone() {
    if (!this.property.phone_number) return;
    
    let val = this.property.phone_number.replace(/\D/g, '');
    
    if (val.length > 11) val = val.slice(0, 11);
    
    if (val.length > 3) {
      val = val.slice(0, 3) + '-' + val.slice(3);
    }
    
    this.property.phone_number = val;
  }
  
  updateProperty() {
    if (!this.propertyId) return;

    const formData = new FormData();
    const userId = localStorage.getItem('user_id');
    
    formData.append('user_id', userId || '');
    formData.append('title', this.property.title);
    formData.append('description', this.property.description);
    formData.append('location', this.property.location);
    formData.append('price', this.property.price?.toString() || '0');
    formData.append('rooms', this.property.rooms?.toString() || '0');
    formData.append('address', this.property.address);
    formData.append('phone_number', this.property.phone_number);

    this.existingImages.forEach(img => {
      formData.append('existing_images[]', img);
    });

    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach(file => {
        formData.append('property_images[]', file, file.name);
      });
    }

    // Use the Model to submit the data
    this.propertyModel.updateProperty(this.propertyId, formData).subscribe({
      next: () => {
        alert('Property updated successfully!');
        this.router.navigate(['/properties/view', this.propertyId]);
      },
      error: (err: any) => alert('Failed to update property.')
    });
  }
}
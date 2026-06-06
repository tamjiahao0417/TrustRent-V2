import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Import the new Model
import { CreatePropertyModel } from '../../models/landlord/create-property.model';

@Component({
  selector: 'app-create-property',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  // Pointing to the new views folder
  templateUrl: '../../views/landlord/create-property.html',
  styleUrl: '../../views/landlord/create-property.css'
})
export class CreatePropertyController {
  property: any = {
    title: '',
    description: '',
    location: '',
    price: null,
    rooms: null,
    address: '',
    phone_number: ''
  };

  selectedFiles: File[] = [];
  previewUrls: string[] = []; 
  isSubmitting: boolean = false;
  fullScreenImage: string | null = null; 

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private propertyModel: CreatePropertyModel // INJECTING THE MODEL HERE
  ) {}

  openImage(url: string) {
    this.fullScreenImage = url;
    this.cdr.detectChanges(); 
  }

  closeImage() {
    this.fullScreenImage = null;
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
  
  onSubmit() {
    this.isSubmitting = true;
    const formData = new FormData();
    const userId = localStorage.getItem('user_id');

    if (!userId) {
      alert("Error: You must be logged in to create a property.");
      this.isSubmitting = false;
      return;
    }

    formData.append('user_id', userId);
    formData.append('title', this.property.title);
    formData.append('description', this.property.description);
    formData.append('location', this.property.location);
    formData.append('price', this.property.price?.toString() || '0');
    formData.append('rooms', this.property.rooms?.toString() || '0');
    formData.append('address', this.property.address);
    formData.append('phone_number', this.property.phone_number);

    this.selectedFiles.forEach((file) => {
      formData.append('property_images[]', file, file.name);
    });

    // Use the Model to submit the data
    this.propertyModel.createProperty(formData).subscribe({
      next: () => {
        alert('Property listed successfully!');
        this.isSubmitting = false;
        this.router.navigate(['/my-properties']);
      },
      error: (err: any) => {
        alert('Failed to create property. See console for details.');
        console.error(err);
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
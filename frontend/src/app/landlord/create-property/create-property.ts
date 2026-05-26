import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-property',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-property.html',
  styleUrl: './create-property.css'
})
export class CreateProperty {
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
  previewUrls: string[] = []; // Matches your HTML
  isSubmitting: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // ADD THESE 3 THINGS:
  fullScreenImage: string | null = null; 

  openImage(url: string) {
    this.fullScreenImage = url;
    this.cdr.detectChanges(); // Tell Angular to show the popup
  }

  closeImage() {
    this.fullScreenImage = null;
    this.cdr.detectChanges(); // Tell Angular to hide the popup
  }
  
  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];

      // Loop through new files and add them to our arrays
      for (let file of files) {
        this.selectedFiles.push(file); // Save the actual file for Laravel

        // Create the preview for Angular
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
          this.cdr.detectChanges(); // Instantly draw the new thumbnail
        };
        reader.readAsDataURL(file);
      }
      
      // Clear the input value so the user can select the same file again if they want
      event.target.value = ''; 
    }
  }

  // Matches the (click)="removeImage(i)" in your HTML
  removeImage(index: number) {
    this.selectedFiles.splice(index, 1); // Remove the file
    this.previewUrls.splice(index, 1);   // Remove the preview
    this.cdr.detectChanges(); // Instantly remove it from the screen
  }

  // Blocks typing letters on the keyboard
  allowNumbersOnly(event: KeyboardEvent) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // Formats into 019-2229393
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

    // Append all remaining files
    this.selectedFiles.forEach((file) => {
      formData.append('property_images[]', file, file.name);
    });

    this.http.post('http://localhost:8000/api/properties', formData).subscribe({
      next: (response: any) => {
        alert('Property listed successfully!');
        this.isSubmitting = false;
        this.router.navigate(['/my-properties']);
      },
      error: (err) => {
        alert('Failed to create property. See console for details.');
        console.error(err);
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
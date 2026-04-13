import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-property',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-property.html',
  styleUrl: './create-property.css' // We will add the CSS next
})
export class CreateProperty {
  property: any = {
    title: '', description: '', location: '', 
    price: null, rooms: null, address: '', phone_number: ''
  };

  // The "Memory Box" for our files and their visual previews
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  isSubmitting: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  onFileSelect(event: any) {
    const files = Array.from(event.target.files as FileList);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        // Prevent duplicate files by checking name and size
        if (!this.selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
          this.selectedFiles.push(file);
          
          // Generate the preview URL for the UI
          const reader = new FileReader();
          reader.onload = (e: any) => this.previewUrls.push(e.target.result);
          reader.readAsDataURL(file);
        }
      }
    });
    
    // Reset the input so you can select the same file again if you delete it
    event.target.value = '';
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  onSubmit() {
    if (this.selectedFiles.length === 0) {
      alert('Please upload at least one image.');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    const userId = localStorage.getItem('user_id');

    if (!userId) {
      alert('You must be logged in to create a property.');
      return;
    }

    formData.append('user_id', userId);
    
    // Append standard text fields
    Object.keys(this.property).forEach(key => {
      formData.append(key, this.property[key]);
    });

    // Append multiple files
    this.selectedFiles.forEach((file, index) => {
      formData.append(`property_images[${index}]`, file);
    });

    this.http.post('http://localhost:8000/api/properties', formData).subscribe({
      next: () => {
        alert('Property listed successfully!');
        this.router.navigate(['/my-properties']); // Go back to the list
      },
      error: (err) => {
        alert('Failed to create property. ' + (err.error?.message || ''));
        this.isSubmitting = false;
      }
    });
  }
}
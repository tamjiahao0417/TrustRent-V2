import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-property',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-property.html',
  styleUrl: './edit-property.css'
})
export class EditProperty implements OnInit {
  propertyId: string | null = null;
  property: any = null; 
  
  // The arrays to hold our new files and previews
  existingImages: string[] = [];
  selectedFiles: File[] = [];
  previewUrls: string[] = []; 

  constructor(
    private route: ActivatedRoute,
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

  ngOnInit() {
    this.propertyId = this.route.snapshot.paramMap.get('id');
    this.http.get(`http://localhost:8000/api/properties/${this.propertyId}`).subscribe({
      next: (data: any) => {
        this.property = data;
        // 2. Load the existing images into our new array
        this.existingImages = data.images ? [...data.images] : [];
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Failed to load', err)
    });
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

  updateProperty() {
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

    // 4. ADD THIS: Tell Laravel which old images we decided to KEEP
    this.existingImages.forEach(img => {
      formData.append('existing_images[]', img);
    });

    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach(file => {
        formData.append('property_images[]', file, file.name);
      });
    }

    this.http.post(`http://localhost:8000/api/properties/${this.propertyId}`, formData).subscribe({
      next: () => {
        alert('Property updated successfully!');
        this.router.navigate(['/properties/view', this.propertyId]);
      },
      error: (err) => alert('Failed to update property.')
    });
  }
}
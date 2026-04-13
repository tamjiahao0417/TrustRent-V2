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
  property: any = null; // Starts null so the form waits to render
  selectedFiles: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.propertyId = this.route.snapshot.paramMap.get('id');
    
    // Fetch the existing data to pre-fill the form
    this.http.get(`http://localhost:8000/api/properties/${this.propertyId}`).subscribe({
      next: (data: any) => {
        this.property = data;
        this.cdr.detectChanges(); // Force screen update!
      },
      error: (err) => console.error('Failed to load', err)
    });
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  updateProperty() {
    const formData = new FormData();
    const userId = localStorage.getItem('user_id');
    
    formData.append('user_id', userId || '');
    formData.append('title', this.property.title);
    formData.append('description', this.property.description);
    formData.append('location', this.property.location);
    formData.append('price', this.property.price);
    formData.append('rooms', this.property.rooms);
    formData.append('address', this.property.address);
    formData.append('phone_number', this.property.phone_number);

    // Append new files ONLY if they selected some
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
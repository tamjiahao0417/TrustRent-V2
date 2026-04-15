import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-maintenance-report',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './maintenance-report.html',
  styleUrl: './maintenance-report.css'
})
export class MaintenanceReport implements OnInit {
  userId = localStorage.getItem('user_id');
  activeProperties: any[] = [];
  
  reportData: any = {
    selected_property: '', 
    category: '',
    urgency: '',
    description: ''
  };

  // 🌟 Upgraded to Arrays for Multiple Files
  selectedFiles: File[] = [];
  previewMedia: { url: string, type: string }[] = []; 
  fullScreenImage: string | null = null;

  isLoading = false;

  constructor(
    private http: HttpClient, 
    private location: Location,
    private router: Router,
    private cdr: ChangeDetectorRef  
  ) {}
 
  ngOnInit() {
    this.http.get(`http://localhost:8000/api/maintenance-properties?user_id=${this.userId}`)
      .subscribe({
        next: (data: any) => {
          this.activeProperties = data;
          this.cdr.detectChanges();
        },
        error: () => alert('Failed to load active properties.')
      });
  }

  openImage(url: string) {
    this.fullScreenImage = url;
    this.cdr.detectChanges();
  }

  closeImage() {
    this.fullScreenImage = null;
    this.cdr.detectChanges();
  }

  // 🌟 Loops through multiple files and generates previews
  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];

      for (let file of files) {
        this.selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Save both the url and the type (image vs video)
          this.previewMedia.push({ url: e.target.result, type: file.type });
          this.cdr.detectChanges(); 
        };
        reader.readAsDataURL(file);
      }
      
      event.target.value = ''; // Reset input
    }
  }

  // 🌟 Removes specific file by index
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
    
    // 🌟 Append ALL selected files as an array
    this.selectedFiles.forEach((file) => {
      formData.append('media[]', file, file.name);
    });

    this.http.post('http://localhost:8000/api/maintenance', formData).subscribe({
      next: () => {
        alert('Maintenance issue reported successfully!');
        this.router.navigate(['/maintenance']);
      },
      error: (err) => {
        console.error('API Error:', err);
        alert('Failed to submit report. Check console.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack() { this.location.back(); }
}
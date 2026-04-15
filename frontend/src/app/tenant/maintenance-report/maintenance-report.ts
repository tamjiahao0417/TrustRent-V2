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
  
  // Holds the text data
  reportData: any = {
    selected_property: '', // This will hold the full property object so we can get both IDs
    category: '',
    urgency: '',
    description: ''
  };

  // Holds the actual file object
  selectedFile: File | null = null;
  fileName: string = '';

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
        error: () => {
          alert('Failed to load active properties.');
        }
      });
  }

  // Triggered when the user picks a file
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileName = file.name;
    }
  }

  submitReport() {
    if (!this.reportData.selected_property || !this.reportData.category || !this.reportData.urgency || !this.reportData.description) {
      return alert('Please fill in all required fields.');
    }

    this.isLoading = true;

    // 🌟 1. Create FormData because we are sending a file!
    const formData = new FormData();
    formData.append('tenant_id', this.userId!);
    formData.append('landlord_id', this.reportData.selected_property.landlord_id);
    formData.append('property_id', this.reportData.selected_property.property_id);
    formData.append('category', this.reportData.category);
    formData.append('urgency', this.reportData.urgency);
    formData.append('description', this.reportData.description);
    
    // Append the file if one was selected
    if (this.selectedFile) {
      formData.append('media', this.selectedFile);
    }

    // 🌟 2. Send to Laravel
    this.http.post('http://localhost:8000/api/maintenance', formData).subscribe({
      next: () => {
        alert('Maintenance issue reported successfully!');
        this.router.navigate(['/maintenance']);
      },
      error: (err) => {
        console.error('API Error:', err);
        alert('Failed to submit report. Check console.');
        this.isLoading = false;
      }
    });
  }

  goBack() { this.location.back(); }
}
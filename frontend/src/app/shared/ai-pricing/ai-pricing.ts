import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ai-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-pricing.html',
  styleUrl: './ai-pricing.css'
})
export class AiPricing implements OnInit {
  userRole = localStorage.getItem('user_role') || localStorage.getItem('role');
  userId = localStorage.getItem('user_id');
  
  myProperties: any[] = [];
  selectedProperty: any = '';

  formData: any = {
    location: '', type: '', size: null, rooms: null, furnishing: '', features: ''
  };

  isLoading = false;
  aiResult: any = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (this.userRole === 'landlord') {
      this.http.get(`http://localhost:8000/api/ai/properties/${this.userId}`).subscribe({
        next: (data: any) => {
          this.myProperties = data;
          this.cdr.detectChanges(); 
        }
      });
    }
  }

  autoFillForm() {
    if (this.selectedProperty) {
      this.formData.location = this.selectedProperty.address; // Adjust based on your DB columns
      this.formData.type = this.selectedProperty.type || 'Condominium';
      this.formData.size = this.selectedProperty.rooms * 300; // Formula from your PHP
      this.formData.rooms = this.selectedProperty.rooms;
      this.formData.features = this.selectedProperty.description;
    }
  }

  getPrediction() {
    // 🌟 1. Print the data to the console so we can see exactly what Angular sees!
    console.log("Form Data Submitted:", this.formData);

    // 🌟 2. Break down the alerts so it tells you EXACTLY which field is missing
    if (!this.formData.location) return alert("Missing: Property Location");
    if (!this.formData.type) return alert("Missing: Property Type");
    if (!this.formData.size) return alert("Missing: Size (sq ft)");
    if (!this.formData.rooms) return alert("Missing: Number of Bedrooms");
    if (!this.formData.furnishing) return alert("Missing: Furnishing Status");

    this.isLoading = true;
    this.aiResult = null;
    this.cdr.detectChanges();

    this.http.post('http://localhost:8000/api/ai/predict', this.formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.aiResult = res.data;
        } else {
          // 🌟 Catch the Google High Demand error and make it friendly
          let errorMsg = res.error;
          if (typeof errorMsg === 'string' && errorMsg.includes('high demand')) {
             alert("The AI server is currently too busy. Please wait a few seconds and try again!");
          } else {
             alert("AI Service Error: The system is temporarily unavailable. Please try again later.");
          }
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert("The AI service is currently unreachable.");
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
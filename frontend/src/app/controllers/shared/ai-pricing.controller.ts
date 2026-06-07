import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import your newly created Model from the shared folder
import { AiPricingModel } from '../../models/shared/ai-pricing.model';

@Component({
  selector: 'app-ai-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/ai-pricing.html',
  styleUrl: '../../views/shared/ai-pricing.css'
})
export class AiPricingController implements OnInit {
  userRole = localStorage.getItem('user_role') || localStorage.getItem('role');
  userId = localStorage.getItem('user_id');
  
  myProperties: any[] = [];
  selectedProperty: any = '';

  formData: any = {
    location: '', type: '', size: null, rooms: null, furnishing: '', features: ''
  };

  isLoading = false;
  aiResult: any = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private aiPricingModel: AiPricingModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    if (this.userRole === 'landlord' && this.userId) {
      // Use the Model to fetch the landlord's properties
      this.aiPricingModel.getLandlordProperties(this.userId).subscribe({
        next: (data: any) => {
          this.myProperties = data;
          this.cdr.detectChanges(); 
        }
      });
    }
  }

  autoFillForm() {
    if (this.selectedProperty) {
      this.formData.location = this.selectedProperty.address; 
      this.formData.type = this.selectedProperty.type || 'Condominium';
      this.formData.size = this.selectedProperty.rooms * 300; 
      this.formData.rooms = this.selectedProperty.rooms;
      this.formData.features = this.selectedProperty.description;
    }
  }

  getPrediction() {
    console.log("Form Data Submitted:", this.formData);

    if (!this.formData.location) return alert("Missing: Property Location");
    if (!this.formData.type) return alert("Missing: Property Type");
    if (!this.formData.size) return alert("Missing: Size (sq ft)");
    if (!this.formData.rooms) return alert("Missing: Number of Bedrooms");
    if (!this.formData.furnishing) return alert("Missing: Furnishing Status");

    this.isLoading = true;
    this.aiResult = null;
    this.cdr.detectChanges();

    // Use the Model to get the prediction
    this.aiPricingModel.getPrediction(this.formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.aiResult = res.data;
        } else {
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
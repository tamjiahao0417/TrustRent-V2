import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ai-matching',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ai-matching.html',
  styleUrl: './ai-matching.css'
})
export class AiMatchingComponent implements OnInit {
  userRole: string = 'tenant'; // Default

  // For Tenants
  preferences = { budget_min: 500, budget_max: 2000, location: '', features: [] as string[] };
  
  // For Landlords
  propertyDetails = { price: 1200, location: '', features: [] as string[] };

  availableFeatures = ['Furnished', 'Pet-friendly', 'Parking', 'Gym', 'Pool', 'Balcony'];
  
  matches: any[] = [];
  isLoading = false;
  hasSearched = false;
  errorMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // 🌟 Detect role on page load
    this.userRole = localStorage.getItem('user_role') || 'tenant';
  }

  toggleFeature(feature: string) {
    const targetArr = this.userRole === 'tenant' ? this.preferences.features : this.propertyDetails.features;
    const index = targetArr.indexOf(feature);
    if (index > -1) {
      targetArr.splice(index, 1);
    } else {
      targetArr.push(feature);
    }
  }

  findMatches() {
    this.errorMessage = '';
    this.isLoading = true;
    this.hasSearched = false;

    // 🌟 DYNAMIC LOGIC: Choose endpoint based on role
    const endpoint = this.userRole === 'tenant' 
        ? 'http://localhost:8000/api/ai/match' 
        : 'http://localhost:8000/api/ai/match-tenants';

    const payload = this.userRole === 'tenant' ? this.preferences : this.propertyDetails;

    // Basic Validation
    if (!payload.location) {
      this.errorMessage = 'Please provide a location to get accurate matches.';
      this.isLoading = false;
      return;
    }

    this.http.post(endpoint, payload).subscribe({
      next: (response: any) => {
        this.matches = response.matches || [];
        this.isLoading = false;
        this.hasSearched = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Matching feature is currently unavailable. Please try again later.';
        this.cdr.detectChanges();
      }
    });
  }

  resetSearch() {
    this.hasSearched = false;
    this.matches = [];
  }
}
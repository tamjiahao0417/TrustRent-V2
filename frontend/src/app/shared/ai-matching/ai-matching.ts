import { Component, ChangeDetectorRef } from '@angular/core';
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
export class AiMatchingComponent {
  // NF2: User Rental Profile / Preferences
  preferences = {
    budget_min: 500,
    budget_max: 2000,
    location: '',
    features: [] as string[]
  };

  availableFeatures = ['Furnished', 'Pet-friendly', 'Parking', 'Gym', 'Pool', 'Balcony'];
  
  matches: any[] = [];
  isLoading = false;
  hasSearched = false;
  errorMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  toggleFeature(feature: string) {
    const index = this.preferences.features.indexOf(feature);
    if (index > -1) {
      this.preferences.features.splice(index, 1);
    } else {
      this.preferences.features.push(feature);
    }
  }

  findMatches() {
    this.errorMessage = '';
    
    // EF1: Incomplete Profile Check (Handled both frontend & backend)
    if (!this.preferences.location || !this.preferences.budget_min || !this.preferences.budget_max) {
      this.errorMessage = 'Please complete your rental profile (budget and location) to get match recommendations.';
      return;
    }

    this.isLoading = true;
    this.hasSearched = false;

    // NF3: AI Engine analyzes listings
    this.http.post('http://localhost:8000/api/ai/match', this.preferences).subscribe({
      next: (response: any) => {
        // NF4 & NF5: System generates sorted list
        this.matches = response.matches || [];
        this.isLoading = false;
        this.hasSearched = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        // EF2: Service unavailable or Backend validation failed
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
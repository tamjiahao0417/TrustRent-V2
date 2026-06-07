import { Component, ChangeDetectorRef, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router'; 

// Import your newly created Model from the shared folder
import { AiMatchingModel } from '../../models/shared/ai-matching.model';

@Component({
  selector: 'app-ai-matching',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/ai-matching.html',
  styleUrl: '../../views/shared/ai-matching.css'
})
export class AiMatchingController implements OnInit {
  userRole: string = 'tenant';

  preferences = { budget_min: 500, budget_max: 2000, location: '', features: [] as string[] };
  propertyDetails = { price: 1200, location: '', features: [] as string[] };
  availableFeatures = ['Furnished', 'Pet-friendly', 'Parking', 'Gym', 'Pool', 'Balcony'];
  
  matches: any[] = [];
  isLoading = false;
  hasSearched = false;
  errorMessage = '';

  constructor(
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private zone: NgZone,
    private aiMatchingModel: AiMatchingModel // INJECTING THE MODEL HERE
  ) {}

  viewDetails(propertyId: number | string) {
    this.router.navigate(['/properties/view', propertyId]);
  }

  ngOnInit() {
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

    const payload = this.userRole === 'tenant' ? this.preferences : this.propertyDetails;

    if (!payload.location) {
      this.errorMessage = 'Please provide a location to get accurate matches.';
      this.isLoading = false;
      return;
    }

    // Determine which Model method to use based on the user's role
    const matchRequest$ = this.userRole === 'tenant' 
      ? this.aiMatchingModel.findPropertyMatchesForTenant(payload)
      : this.aiMatchingModel.findTenantMatchesForLandlord(payload);

    matchRequest$.subscribe({
      next: (response: any) => {
        this.zone.run(() => {
            let fetchedMatches = response.matches || [];
            
            fetchedMatches.forEach((match: any) => {
                let imgData = match.image_path || match.images; 
                
                if (typeof imgData === 'string') {
                    try { 
                        match.images = JSON.parse(imgData); 
                    } catch(e) { 
                        match.images = []; 
                    }
                } else if (Array.isArray(imgData)) {
                    match.images = imgData;
                } else {
                    match.images = [];
                }
            });

            this.matches = fetchedMatches;
            this.isLoading = false;
            this.hasSearched = true;
            this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.zone.run(() => {
            this.isLoading = false;
            this.errorMessage = err.error?.message || 'Matching feature is currently unavailable. Please try again later.';
            this.cdr.detectChanges();
        });
      }
    });
  }

  resetSearch() {
    this.hasSearched = false;
    this.matches = [];
  }
}
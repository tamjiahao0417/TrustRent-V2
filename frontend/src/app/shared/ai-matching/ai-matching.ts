import { Component, ChangeDetectorRef, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router'; 

@Component({
  selector: 'app-ai-matching',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ai-matching.html',
  styleUrl: './ai-matching.css'
})
export class AiMatchingComponent implements OnInit {
  userRole: string = 'tenant';

  preferences = { budget_min: 500, budget_max: 2000, location: '', features: [] as string[] };
  propertyDetails = { price: 1200, location: '', features: [] as string[] };
  availableFeatures = ['Furnished', 'Pet-friendly', 'Parking', 'Gym', 'Pool', 'Balcony'];
  
  matches: any[] = [];
  isLoading = false;
  hasSearched = false;
  errorMessage = '';

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef, 
    private router: Router, // Ensure Router is here
    private zone: NgZone
) {}

  // Inside ai-matching.ts
  viewDetails(propertyId: number | string) {
    // 🌟 MUST match the path in app.routes.ts ('properties/view/:id')
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

    const endpoint = this.userRole === 'tenant' 
        ? 'http://localhost:8000/api/ai/match' 
        : 'http://localhost:8000/api/ai/match-tenants';

    const payload = this.userRole === 'tenant' ? this.preferences : this.propertyDetails;

    if (!payload.location) {
      this.errorMessage = 'Please provide a location to get accurate matches.';
      this.isLoading = false;
      return;
    }

    this.http.post(endpoint, payload).subscribe({
      next: (response: any) => {
        // 🌟 Wrap the response in zone.run() to instantly refresh the page
        this.zone.run(() => {
            let fetchedMatches = response.matches || [];
            
            // 🌟 FIX 2: Check for 'image_path' from DB and parse it properly!
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
      error: (err) => {
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
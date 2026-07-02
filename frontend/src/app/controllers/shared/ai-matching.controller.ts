import { Component, ChangeDetectorRef, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router'; 
import { environment } from '../../../environments/environment';

import { AiMatchingModel } from '../../models/shared/ai-matching.model';

@Component({
  selector: 'app-ai-matching',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: '../../views/shared/ai-matching.html',
  styleUrl: '../../views/shared/ai-matching.css'
})
export class AiMatchingController implements OnInit {
  userRole: string = 'tenant';
  userId = localStorage.getItem('user_id');

  // Tenant search form
  preferences = { budget_min: 500, budget_max: 2000, location: '', features: [] as string[] };
  availableFeatures = ['Furnished', 'Pet-friendly', 'Parking', 'Gym', 'Pool', 'Balcony'];
  storageUrl = environment.storageUrl;
  // Landlord property selector
  myProperties: any[] = [];
  selectedProperty: any = ''; 

  matches: any[] = [];
  isLoading = false;
  hasSearched = false;
  errorMessage = '';

  constructor(
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private zone: NgZone,
    private aiMatchingModel: AiMatchingModel
  ) {}

  viewDetails(propertyId: number | string) {
    this.router.navigate(['/properties/view', propertyId]);
  }

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role') || 'tenant';
    
    // 🌟 Load Landlord's Properties for the Dropdown!
    if (this.userRole === 'landlord' && this.userId) {
      this.aiMatchingModel.getLandlordProperties(this.userId).subscribe({
        next: (data: any) => {
          this.myProperties = data;
          this.cdr.detectChanges();
        }
      });
    }
  }

  toggleFeature(feature: string) {
    const targetArr = this.preferences.features;
    const index = targetArr.indexOf(feature);
    if (index > -1) targetArr.splice(index, 1);
    else targetArr.push(feature);
  }

  findMatches(): void {
    this.errorMessage = '';
    
    // 🌟 Security Checks!
    if (this.userRole === 'tenant' && !this.preferences.location) {
      this.errorMessage = 'Please provide a location to get accurate matches.';
      return; // 🌟 FIX: Separated the return statement
    }
    
    if (this.userRole === 'landlord' && !this.selectedProperty) {
      this.errorMessage = 'Please select a property to find tenants for.';
      return; // 🌟 FIX: Separated the return statement
    }

    this.isLoading = true;
    this.hasSearched = false;

    // 🌟 If Landlord, send the ENTIRE selected property object to the AI!
    const payload = this.userRole === 'tenant' ? this.preferences : this.selectedProperty;
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
                    try { match.images = JSON.parse(imgData); } catch(e) { match.images = []; }
                } else if (Array.isArray(imgData)) match.images = imgData;
                else match.images = [];
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
            this.errorMessage = err.error?.message || 'Matching feature is currently unavailable.';
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
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Import your new Model
import { ViewPropertyModel } from '../../models/shared/view-property.model';

@Component({
  selector: 'app-view-property',
  standalone: true,
  imports: [CommonModule, RouterModule],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/view-property.html',
  styleUrl: '../../views/shared/view-property.css'
})
export class ViewPropertyController implements OnInit {
  property: any = null;
  currentUserId: string | null = null;
  userRole: string | null = null;
  fullScreenImage: string | null = null;

  hasError: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private propertyModel: ViewPropertyModel // INJECTING MODEL
  ) {}

  ngOnInit() {
    this.currentUserId = localStorage.getItem('user_id');
    this.userRole = localStorage.getItem('user_role');

    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.propertyModel.getProperty(id).subscribe({
        next: (data: any) => {
          this.property = data;
          this.hasError = false; // Reset error state on success
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          // Keep your background log
          console.error('Failed to load property details', err);
          
          // 🌟 ADDED: Update the UI state to show the error
          this.hasError = true;
          // Extract the exact error message from your Laravel backend, or use a fallback
          this.errorMessage = err.error?.message || 'Sorry, we couldn\'t find this property. It may have been removed or a network error occurred.';
          
          this.cdr.detectChanges(); // Tell Angular to update the screen
        }
      });
    }
  }

  get isOwner(): boolean {
    if (!this.property || !this.currentUserId) return false;
    return this.property.landlord_id.toString() === this.currentUserId.toString();
  }

  goToBooking() {
    if (this.property && this.property.id) {
      if (this.property.is_rented) {
        alert('This property is already rented and unavailable for booking.');
        return;
      }
      this.router.navigate(['/book-appointment', this.property.id]);
    }
  }
  
  openImage(url: string) {
    this.fullScreenImage = url;
    this.cdr.detectChanges(); 
  }

  closeImage() {
    this.fullScreenImage = null;
    this.cdr.detectChanges(); 
  }

  deleteProperty() {
    if (confirm('Are you sure you want to delete this listing?')) {
      this.propertyModel.deleteProperty(this.property.id, this.currentUserId)
        .subscribe(() => {
          alert('Deleted successfully');
          this.router.navigate(['/my-properties']);
        });
    }
  }
}
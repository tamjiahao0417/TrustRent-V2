import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, UpperCasePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import your newly created Model from the shared folder
import { ProfileModel } from '../../models/shared/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, UpperCasePipe, TitleCasePipe],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/profile.html',
  styleUrl: '../../views/shared/profile.css'
})
export class ProfileController implements OnInit {
  user: any = {};
  originalData: any = {};
  isEditing: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private profileModel: ProfileModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    // 1. INSTANT LOAD: Check if we have the full profile saved in memory
    const cachedProfile = localStorage.getItem('full_profile_cache');
    
    if (cachedProfile) {
      this.user = JSON.parse(cachedProfile);
    } else {
      this.user = {
        name: localStorage.getItem('user_name') || '',
        email: localStorage.getItem('user_email') || '',
        ic: '', phone_number: '', house_address: '', wallet_address: ''
      };
    }

    this.originalData = { ...this.user };

    // 2. BACKGROUND LOAD: Still fetch from Laravel just in case data changed elsewhere
    this.fetchProfile();
  }

  fetchProfile() {
    const currentEmail = localStorage.getItem('user_email');
    
    // Use the Model to fetch data
    this.profileModel.getProfile(currentEmail).subscribe({
      next: (data: any) => {
        Object.assign(this.user, data);
        this.originalData = { ...this.user }; 
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Failed to fetch from DB.', err);
      }
    });
  }

  toggleEdit(mode: boolean) {
    this.isEditing = mode;
    if (!mode) {
      this.user = { ...this.originalData }; 
    }
  }

  saveProfile() {
    const payload = {
      ...this.user,
      original_email: this.originalData.email || localStorage.getItem('user_email')
    };

    // Use the Model to save the update
    this.profileModel.updateProfile(payload).subscribe({
      next: () => {
        this.originalData = { ...this.user }; 
        
        localStorage.setItem('user_email', this.user.email);
        localStorage.setItem('user_name', this.user.name);
        localStorage.setItem('full_profile_cache', JSON.stringify(this.user));
        
        this.isEditing = false;
        this.cdr.detectChanges(); 
        
        setTimeout(() => {
            alert('Profile updated successfully!'); 
        }, 50); 
      },
      error: (err: any) => alert(err.error?.message || 'Validation Error')
    });
  }

  formatIC() {
    if (!this.user.ic) return;
    let val = this.user.ic.replace(/\D/g, '');
    if (val.length > 12) val = val.slice(0, 12);
    
    if (val.length > 6) val = val.slice(0, 6) + '-' + val.slice(6);
    if (val.length > 8) val = val.slice(0, 9) + '-' + val.slice(9);
    this.user.ic = val;
  }

  allowNumbersOnly(event: KeyboardEvent) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  formatPhone() {
    if (!this.user.phone_number) return;
    let val = this.user.phone_number.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 3) {
      val = val.slice(0, 3) + '-' + val.slice(3);
    }
    this.user.phone_number = val;
  }
}
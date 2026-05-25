import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, UpperCasePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, UpperCasePipe, TitleCasePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user: any = {};
  originalData: any = {};
  isEditing: boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // 1. INSTANT LOAD: Check if we have the full profile saved in memory
    const cachedProfile = localStorage.getItem('full_profile_cache');
    
    if (cachedProfile) {
      // If we do, parse the JSON string back into an object and use it instantly!
      this.user = JSON.parse(cachedProfile);
    } else {
      // If not, fallback to the basic login data
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
    
    this.http.get(`http://localhost:8000/api/user/profile?email=${currentEmail}`)
      .subscribe({
        next: (data: any) => {
          // Safely merge the new database data into the EXISTING object
          // This keeps the HTML [(ngModel)] connection perfectly intact
          Object.assign(this.user, data);
          
          this.originalData = { ...this.user }; 
          
          // Force Angular to instantly update the text boxes on the screen
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error('Failed to fetch from DB.', err);
        }
      });
  }

  // Replaces toggleEditMode(isEditing)
  toggleEdit(mode: boolean) {
    this.isEditing = mode;
    if (!mode) {
      // Revert changes if Cancel is clicked
      this.user = { ...this.originalData }; 
    }
  }

  saveProfile() {
    const payload = {
      ...this.user,
      original_email: this.originalData.email || localStorage.getItem('user_email')
    };

    this.http.put('http://localhost:8000/api/user/profile', payload).subscribe({
      next: () => {
        this.originalData = { ...this.user }; 
        
        localStorage.setItem('user_email', this.user.email);
        localStorage.setItem('user_name', this.user.name);
        localStorage.setItem('full_profile_cache', JSON.stringify(this.user));
        
        // 1. Turn off editing mode
        this.isEditing = false;
        
        // 2. Force Angular to instantly hide the input boxes and buttons
        this.cdr.detectChanges(); 
        
        // 3. Wait a tiny fraction of a second for the screen to redraw, THEN show the alert
        setTimeout(() => {
            alert('Profile updated successfully!'); 
        }, 50); 
      },
      error: (err) => alert(err.error?.message || 'Validation Error')
    });
  }

  // Replaces JS formatIC
  formatIC() {
    if (!this.user.ic) return;
    let val = this.user.ic.replace(/\D/g, '');
    if (val.length > 12) val = val.slice(0, 12);
    
    if (val.length > 6) val = val.slice(0, 6) + '-' + val.slice(6);
    if (val.length > 8) val = val.slice(0, 9) + '-' + val.slice(9);
    this.user.ic = val;
  }

  // 🌟 ADD THIS: Completely blocks typing letters on the keyboard
  allowNumbersOnly(event: KeyboardEvent) {
    const charCode = (event.which) ? event.which : event.keyCode;
    // Allow only numbers (ASCII codes 48 to 57)
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // 🌟 UPDATE THIS: Formats into 019-2229393
  formatPhone() {
    if (!this.user.phone_number) return;
    
    // 1. Strip out everything except raw numbers (just in case they paste text)
    let val = this.user.phone_number.replace(/\D/g, '');
    
    // 2. Limit to max 11 digits (Malaysian numbers are usually 10 or 11 digits)
    if (val.length > 11) val = val.slice(0, 11);
    
    // 3. Insert the dash after the first 3 digits (e.g. 019)
    if (val.length > 3) {
      val = val.slice(0, 3) + '-' + val.slice(3);
    }
    
    // 4. Update the input box
    this.user.phone_number = val;
  }
}
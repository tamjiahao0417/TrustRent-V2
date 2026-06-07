import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderModel {

  constructor() {}

  // Currently fetches from local storage, but ready for future API calls!
  getUserName(): string {
    return localStorage.getItem('user_name') || 'User';
  }
}
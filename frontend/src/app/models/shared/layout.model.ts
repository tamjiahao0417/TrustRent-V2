import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutModel {

  constructor() {}

  // Get the saved sidebar state from local storage (defaults to false / open)
  getSidebarState(): boolean {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  }

  // Save the new state so it remembers the user's preference on reload
  setSidebarState(isCollapsed: boolean): void {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
  }
}
import { Routes } from '@angular/router';
import { Login } from './auth/login/login'; 
import { Register } from './auth/register/register';
import { Layout } from './shared/layout/layout';
import { Dashboard } from './landlord/dashboard/dashboard'; // 1. Import your Dashboard component
import { Profile } from './shared/profile/profile'; // Add this line!
import { MyProperties } from './landlord/my-properties/my-properties';
import { CreateProperty } from './landlord/create-property/create-property';
import { ViewProperty } from './shared/view-property/view-property';
import { EditProperty } from './landlord/edit-property/edit-property';
import { PropertyListings } from './shared/property-listings/property-listings';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  
  { 
    path: '', 
    component: Layout,
    children: [
      { path: 'dashboard', component: Dashboard }, // 2. Add this specific line
      { path: 'profile', component: Profile },
      { path: 'my-properties', component: MyProperties },
      { path: 'properties/create', component: CreateProperty },
      { path: 'properties/view/:id', component: ViewProperty },
      { path: 'properties/edit/:id', component: EditProperty },
      { path: 'property-listings', component: PropertyListings },
    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
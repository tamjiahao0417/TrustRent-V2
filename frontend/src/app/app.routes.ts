import { Routes } from '@angular/router';
import { Login } from './login/login'; 
import { Register } from './register/register';
import { Layout } from './layout/layout';
import { Dashboard } from './dashboard/dashboard'; // 1. Import your Dashboard component
import { Profile } from './profile/profile'; // Add this line!
import { MyProperties } from './my-properties/my-properties';
import { CreateProperty } from './create-property/create-property';
import { ViewProperty } from './view-property/view-property';
import { EditProperty } from './edit-property/edit-property';

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
      { path: 'properties/edit/:id', component: EditProperty }
    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
import { Routes } from '@angular/router';
import { Login } from './controllers/auth/login.controller'; 
import { Register } from './controllers/auth/register.controller';
import { Layout } from './shared/layout/layout';
import { Dashboard } from './shared/dashboard/dashboard'; // 1. Import your Dashboard component
import { Profile } from './shared/profile/profile'; // Add this line!
import { MyPropertiesController } from './controllers/landlord/my-properties.controller';
import { CreatePropertyController } from './controllers/landlord/create-property.controller';
import { ViewProperty } from './shared/view-property/view-property';
import { EditPropertyController } from './controllers/landlord/edit-property.controller';
import { PropertyListings } from './shared/property-listings/property-listings';
import { BookAppointment } from './tenant/book-appointment/book-appointment'; // Make sure this path matches your folder structure!
import { MyAppointments } from './shared/my-appointments/my-appointments'; // Make sure this path matches your folder structure!
import { AppointmentDetails } from './shared/appointment-details/appointment-details'; // Make sure this path matches your folder structure!
import { EditAppointment } from './tenant/edit-appointment/edit-appointment'; // Make sure this path matches your folder structure!
import { ApplyPropertyController } from './controllers/tenant/apply-property.controller';
import { RentalRequests } from './shared/rental-requests/rental-requests'; // Make sure this path matches your folder structure!
import { RentalRequestDetails } from './shared/rental-request-details/rental-request-details';
import { EditRentalRequest } from './tenant/edit-rental-request/edit-rental-request';
import { CreateContractController } from './controllers/landlord/create-contract.controller';
import { Contracts } from './shared/contracts/contracts';
import { ContractDetails } from './shared/contract-details/contract-details';
import { EditContractController } from './controllers/landlord/edit-contract.controller';
import { RentPayment } from './tenant/rent-payment/rent-payment';
import { Transactions } from './shared/transactions/transactions';
import { TransactionDetails } from './shared/transaction-details/transaction-details';
import { AiPricing } from './shared/ai-pricing/ai-pricing'; // Adjust path!
import { Maintenance } from './shared/maintenance/maintenance'; // Adjust path!
import { MaintenanceDetails } from './shared/maintenance-details/maintenance-details'; // Adjust path!
import { MaintenanceReport } from './tenant/maintenance-report/maintenance-report'; // Adjust path!
import { EditMaintenance } from './tenant/edit-maintenance/edit-maintenance';
import { Chat } from './shared/chat/chat';
import { UserManagementComponent } from './controllers/admin/user-management.controller';
import { ReportIssueComponent } from './shared/report-issue/report-issue';
import { ReportsListComponent } from './shared/reports-list/reports-list';
import { ReportDetailsComponent } from './shared/report-details/report-details';
import { EditReportComponent } from './shared/edit-report/edit-report';
import { AiMatchingComponent } from './shared/ai-matching/ai-matching';

export const routes: Routes = [ 
  { path: 'login', component: Login },
  { path: 'register', component: Register },  
  
  { 
    path: '', 
    component: Layout,
    children: [
      { path: 'dashboard', component: Dashboard }, // 2. Add this specific line
      { path: 'profile', component: Profile },
      { path: 'my-properties', component: MyPropertiesController },
      { path: 'properties/create', component: CreatePropertyController },
      { path: 'properties/view/:id', component: ViewProperty },
      { path: 'properties/edit/:id', component: EditPropertyController },
      { path: 'property-listings', component: PropertyListings },
      { path: 'book-appointment/:id', component: BookAppointment },
      { path: 'appointments', component: MyAppointments },
      { path: 'appointments/details/:id', component: AppointmentDetails },
      { path: 'appointments/edit/:id', component: EditAppointment },
      { path: 'apply-property/:id', component: ApplyPropertyController },
      { path: 'rental-requests', component: RentalRequests },
      { path: 'rental-requests/details/:id', component: RentalRequestDetails },
      { path: 'rental-requests/edit/:id', component: EditRentalRequest },
      { path: 'contracts/create/:id', component: CreateContractController },
      { path: 'contracts', component: Contracts },
      { path: 'contracts/details/:id', component: ContractDetails },
      { path: 'contracts/edit/:id', component: EditContractController },
      { path: 'rent-payment', component: RentPayment },
      { path: 'transactions', component: Transactions },
      { path: 'transactions/details/:id', component: TransactionDetails },
      { path: 'ai-pricing', component: AiPricing },
      { path: 'maintenance', component: Maintenance },
      { path: 'maintenance/details/:id', component: MaintenanceDetails },
      { path: 'maintenance/report', component: MaintenanceReport },
      { path: 'edit-maintenance/:id', component: EditMaintenance },
      { path: 'chat', component: Chat },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'reports/create', component: ReportIssueComponent },
      { path: 'reports', component: ReportsListComponent },
      { path: 'reports/details/:id', component: ReportDetailsComponent },
      { path: 'reports/edit/:id', component: EditReportComponent },
      { path: 'ai-matching', component: AiMatchingComponent },
    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
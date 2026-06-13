import { Routes } from '@angular/router';
import { AuthGuard } from './auth-guard';
import { Login } from './controllers/auth/login.controller'; 
import { Register } from './controllers/auth/register.controller';
import { LayoutController } from './controllers/shared/layout.controller';
import { DashboardController } from './controllers/shared/dashboard.controller';
import { ProfileController } from './controllers/shared/profile.controller';
import { MyPropertiesController } from './controllers/landlord/my-properties.controller';
import { CreatePropertyController } from './controllers/landlord/create-property.controller';
import { ViewPropertyController } from './controllers/shared/view-property.controller';
import { EditPropertyController } from './controllers/landlord/edit-property.controller';
import { PropertyListingsController } from './controllers/shared/property-listings.controller';
import { BookAppointmentController } from './controllers/tenant/book-appointment.controller';
import { MyAppointmentsController } from './controllers/shared/my-appointments.controller';
import { AppointmentDetailsController } from './controllers/shared/appointment-details.controller';
import { EditAppointmentController } from './controllers/tenant/edit-appointment.controller';
import { ApplyPropertyController } from './controllers/tenant/apply-property.controller';
import { RentalRequestsController } from './controllers/shared/rental-requests.controller';
import { RentalRequestDetailsController } from './controllers/shared/rental-request-details.controller';
import { EditRentalRequestController } from './controllers/tenant/edit-rental-request.controller';
import { CreateContractController } from './controllers/landlord/create-contract.controller';
import { ContractsController } from './controllers/shared/contracts.controller';
import { ContractDetailsController } from './controllers/shared/contract-details.controller';
import { EditContractController } from './controllers/landlord/edit-contract.controller';
import { RentPaymentController } from './controllers/tenant/rent-payment.controller';
import { TransactionsController } from './controllers/shared/transactions.controller';
import { TransactionDetailsController } from './controllers/shared/transaction-details.controller';
import { AiPricingController } from './controllers/shared/ai-pricing.controller';
import { MaintenanceController } from './controllers/shared/maintenance.controller';
import { MaintenanceDetailsController } from './controllers/shared/maintenance-details.controller';
import { MaintenanceReportController } from './controllers/tenant/maintenance-report.controller';
import { EditMaintenanceController } from './controllers/tenant/edit-maintenance.controller';
import { ChatController } from './controllers/shared/chat.controller';
import { UserManagementComponent } from './controllers/admin/user-management.controller';
import { ReportIssueController } from './controllers/shared/report-issue.controller';
import { ReportsListController } from './controllers/shared/reports-list.controller';
import { ReportDetailsController } from './controllers/shared/report-details.controller';
import { EditReportController } from './controllers/shared/edit-report.controller';
import { AiMatchingController } from './controllers/shared/ai-matching.controller';

export const routes: Routes = [ 
  { path: 'login', component: Login },
  { path: 'register', component: Register },  
  
  { 
    path: '', 
    component: LayoutController,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardController }, // 2. Add this specific line
      { path: 'profile', component: ProfileController },
      { path: 'my-properties', component: MyPropertiesController },
      { path: 'properties/create', component: CreatePropertyController },
      { path: 'properties/view/:id', component: ViewPropertyController },
      { path: 'properties/edit/:id', component: EditPropertyController },
      { path: 'property-listings', component: PropertyListingsController },
      { path: 'book-appointment/:id', component: BookAppointmentController },
      { path: 'appointments', component: MyAppointmentsController },
      { path: 'appointments/details/:id', component: AppointmentDetailsController },
      { path: 'appointments/edit/:id', component: EditAppointmentController },
      { path: 'apply-property/:id', component: ApplyPropertyController },
      { path: 'rental-requests', component: RentalRequestsController },
      { path: 'rental-requests/details/:id', component: RentalRequestDetailsController },
      { path: 'rental-requests/edit/:id', component: EditRentalRequestController },
      { path: 'contracts/create/:id', component: CreateContractController },
      { path: 'contracts', component: ContractsController },
      { path: 'contracts/details/:id', component: ContractDetailsController },
      { path: 'contracts/edit/:id', component: EditContractController },
      { path: 'rent-payment', component: RentPaymentController },
      { path: 'transactions', component: TransactionsController },
      { path: 'transactions/details/:id', component: TransactionDetailsController },
      { path: 'ai-pricing', component: AiPricingController },
      { path: 'maintenance', component: MaintenanceController },
      { path: 'maintenance/details/:id', component: MaintenanceDetailsController },
      { path: 'maintenance/report', component: MaintenanceReportController },
      { path: 'edit-maintenance/:id', component: EditMaintenanceController },
      { path: 'chat', component: ChatController },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'reports/create', component: ReportIssueController },
      { path: 'reports', component: ReportsListController },
      { path: 'reports/details/:id', component: ReportDetailsController },
      { path: 'reports/edit/:id', component: EditReportController },
      { path: 'ai-matching', component: AiMatchingController },
    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
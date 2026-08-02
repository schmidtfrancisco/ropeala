import { Routes } from '@angular/router';
import { AuthGuard } from '@auth/guards/auth.guard';
import { isAdminGuard } from '@auth/guards/is-admin.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
    canMatch: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin-dashboard/admin-dashboard.routes'),
    canMatch: [isAdminGuard]
  },
  {
    path: '',
    loadChildren: () => import('./store-front/store-front.routes'),
  },
];

import { Routes } from '@angular/router';
import { AuthGuard } from '@auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
    canMatch: [AuthGuard]
  },
  {
    path: '',
    loadChildren: () => import('./store-front/store-front.routes'),
  },
];

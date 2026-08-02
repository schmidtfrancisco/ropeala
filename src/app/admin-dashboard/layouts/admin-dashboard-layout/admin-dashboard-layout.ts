import { SlicePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'admin-dashboard-layout',
  imports: [RouterOutlet, SlicePipe, RouterLink, RouterLinkActive],
  templateUrl: './admin-dashboard-layout.html',
})
export class AdminDashboardLayout {
  authService = inject(AuthService);
  router = inject(Router);

  user = computed(() => this.authService.user());

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }
}

import { inject } from "@angular/core";
import { CanMatchFn, Route, Router, UrlSegment } from "@angular/router";
import { AuthService } from "@auth/services/auth.service";
import { firstValueFrom } from "rxjs";

const ROLE = 'admin'

export const isAdminGuard: CanMatchFn = async (
  route: Route,
  segments: UrlSegment[]
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = await firstValueFrom(authService.checkStatus());
  
  const user = authService.user();
  if (isAuthenticated && user?.roles.includes(ROLE)) {
    return true;  
  }
  
  router.navigateByUrl('/')
  return false;
};
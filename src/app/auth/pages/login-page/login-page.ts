import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@auth/services/auth.service';
import { FormRequestStatus } from '@shared/interfaces/form-request-status.interface';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.html',
})
export class LoginPage {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  formRequestStatus = signal<FormRequestStatus>({ isLoading: false, error: null });

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    this.formRequestStatus.set({ isLoading: true, error: null });
    if (this.loginForm.invalid) {
      this.formRequestStatus.set({ 
        isLoading: false, 
        error: 'Hay algunos campos inválidos'
      });
      setTimeout(() => {
        this.formRequestStatus.set({ isLoading: false, error: null });
      }, 3000);
      return;
    }

    const { email = '', password = '' } = this.loginForm.value;

    this.authService.login(email!, password!).subscribe(resp => {
      if (resp.success) {
        this.formRequestStatus.set({ isLoading: false, error: null });
        this.router.navigateByUrl('/');
        return;
      }
      
      const errorMessage = resp.error === 'Unauthorized'
        ? 'El correo y/o contraseña son incorrectos'
        : 'Ocurrió un error inesperado';

      this.formRequestStatus.set({ isLoading: false, error: errorMessage });

      setTimeout(() => {
        this.formRequestStatus.set({ isLoading: false, error: null });
      }, 3000);

    })
  }
}

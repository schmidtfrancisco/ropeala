import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NewUser } from '@auth/interfaces/user.interface';
import { AuthService } from '@auth/services/auth.service';
import { FormRequestStatus } from '@shared/interfaces/form-request-status.interface';


@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule],
  templateUrl: './register-page.html',
})
export class RegisterPage {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  formRequestStatus = signal<FormRequestStatus>({ isLoading: false, error: null });

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fullName: ['', [Validators.required, Validators.minLength(3)]]
  });

  onSubmit() {
    this.formRequestStatus.set({ isLoading: true, error: null });
    if (this.registerForm.invalid) {
      this.formRequestStatus.set({ 
        isLoading: false, 
        error: 'Hay algunos campos inválidos'
      });
      setTimeout(() => {
        this.formRequestStatus.set({ isLoading: false, error: null });
      }, 3000);
      return;
    }

    const { email = '', password = '', fullName = '' } = this.registerForm.value;
    const newUser: NewUser = {
      email: email!,
      password: password!,
      fullName: fullName!
    }

    this.authService.register(newUser).subscribe(resp => {
      if (resp.success) {
        this.formRequestStatus.set({ isLoading: false, error: null });
        this.router.navigateByUrl('/');
        
        return;
      }

      this.formRequestStatus.set({ 
        isLoading: false, 
        error: 'Ocurrió un error al crear el usuario' 
      });

      setTimeout(() => {
        this.formRequestStatus.set({ isLoading: false, error: null });
      }, 3000);
    })
  }
}

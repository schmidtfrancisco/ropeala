import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NewUser } from '@auth/interfaces/user.interface';
import { AuthService } from '@auth/services/auth.service';


@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule],
  templateUrl: './register-page.html',
})
export class RegisterPage {
  fb = inject(FormBuilder);
  hasError = signal(false);
  isPosting = signal(false);
  authService = inject(AuthService);
  router = inject(Router);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fullName: ['', [Validators.required, Validators.minLength(3)]]
  });

  onSubmit() {
    this.isPosting.set(true);
    if (this.registerForm.invalid) {
      this.hasError.set(true);
      this.isPosting.set(false);
      setTimeout(() => {
        this.hasError.set(false);
      }, 3000);
      return;
    }

    const { email = '', password = '', fullName = '' } = this.registerForm.value;
    const newUser: NewUser = {
      email: email!,
      password: password!,
      fullName: fullName!
    }

    this.authService.register(newUser).subscribe(isRegistered => {
      if (isRegistered) {
        this.router.navigateByUrl('/');

        this.isPosting.set(false);
        return;
      }

      this.hasError.set(true);
      this.isPosting.set(false);
      setTimeout(() => {
        this.hasError.set(false);
      }, 3000);
    })
  }
}

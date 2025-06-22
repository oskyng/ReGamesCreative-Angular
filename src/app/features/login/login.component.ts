import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { emptyStringValidator } from 'src/app/utils/validator';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
	username = '';
	password = '';

	loginForm!: FormGroup;
	loginMessage: string = '';
	private readonly authSubscription!: Subscription;

	constructor(
		private readonly authService: AuthService,
		private readonly router: Router,
		private readonly fb: FormBuilder
	) { }

	ngOnInit(): void {
		// Inicializa el formulario reactivo para el login
		this.loginForm = this.fb.group({
			username: ['', [Validators.required, emptyStringValidator()]],
			password: ['', [Validators.required, emptyStringValidator()]]
		});

	}

	onSubmit(): void {
		if (this.loginForm.invalid) {
			this.loginForm.markAllAsTouched();
			this.loginMessage = '<div class="alert alert-danger">Por favor, completa todos los campos correctamente.</div>';
			return;
		}

		const { username, password } = this.loginForm.value;
		const result = this.authService.login(username, password);

		if (result.success) {
			this.loginMessage = '<div class="alert alert-success">Inicio de sesión exitoso. Redirigiendo...</div>';
			setTimeout(() => { this.router.navigate(['/mi-biblioteca']); }, 1000);
		} else {
			this.loginMessage = `<div class="alert alert-danger">${result.message}</div>`;
		}
	}

	ngOnDestroy(): void {
		if (this.authSubscription) {
			this.authSubscription.unsubscribe();
		}
	}

}

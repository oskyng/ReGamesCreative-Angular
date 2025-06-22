import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from 'src/app/core/auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { emptyStringValidator, emailValidator, minAgeValidator, passwordStrengthValidator, passwordsMatchValidator } from '../../utils/validator';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
	registerMessage: string = '';
	registerForm!: FormGroup;
	private authSubscription!: Subscription;

	fullName = '';
	username = '';
	email = '';
	birthDay = '';
	password = '';
	confirmPassword = '';
	message = '';
	error = '';

	constructor(
		private readonly authService: AuthService,
		private readonly router: Router,
		private readonly fb: FormBuilder
	) { }

	ngOnInit(): void {
		// Inicializa el formulario reactivo para el registro con validaciones personalizadas
		this.registerForm = this.fb.group({
			fullName: ['', [Validators.required, emptyStringValidator()]],
			username: ['', [Validators.required, emptyStringValidator()]],
			email: ['', [Validators.required, emailValidator()]],
			birthDay: ['', [Validators.required, minAgeValidator(13)]],
			password: ['', [Validators.required, passwordStrengthValidator()]],
			confirmPassword: ['', [Validators.required]]
		}, {
			validators: passwordsMatchValidator('password', 'confirmPassword')
		});

		// Si el usuario ya está logueado, redirige al inicio para evitar que se registre de nuevo
		this.authSubscription = this.authService.currentUser.subscribe(user => {
			if (user) {
				this.router.navigate(['/inicio']);
			}
		});
		console.log(this.registerForm.invalid);
		
	}

	onSubmit(): void {
		if (this.registerForm.invalid) {
			this.registerForm.markAllAsTouched();
			this.registerMessage = '<div class="alert alert-danger">Error al enviar formulario. Por favor, revisa los campos.</div>';
			return;
		}

		const newUser = this.registerForm.value;
		const result = this.authService.register(newUser);

		if (result.success) {
			this.registerMessage = '<div class="alert alert-success">Registro exitoso. Redirigiendo a Login...</div>';
			setTimeout(() => { this.router.navigate(['/login']); }, 1000);
		} else {
			this.registerMessage = `<div class="alert alert-danger">${result.message}</div>`;
		}

	}

	ngOnDestroy(): void {
		if (this.authSubscription) {
			this.authSubscription.unsubscribe();
		}
	}

	private ageCalculate(fecha: string): number {
		const today = new Date();
		const birthDate = new Date(fecha);

		let age = today.getFullYear() - birthDate.getFullYear();
		const month = today.getMonth() - birthDate.getMonth();

		if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}

		return age;
	}
}

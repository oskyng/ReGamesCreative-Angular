import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from 'src/app/core/auth/auth.service';
import { emailValidator, emptyStringValidator, minAgeValidator, passwordStrengthValidator } from 'src/app/utils/validator';

/**
 * @description 
 * Componente para mostrar y permitir la edición del perfil de usuario.
 * @summary 
 * Este componente carga los datos del usuario autenticado, los muestra en un formulario
 * reactivo y permite al usuario actualizar su nombre completo, nombre de usuario y contraseña.
 * Incluye validaciones y mensajes de estado.
 * @usageNotes
 * ```html
 * <app-user-profile></app-user-profile>
 * ```
 */
@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
	currentUser: User | null = null;
	profileForm!: FormGroup;
	profileMessage: string = '';
	private authSubscription!: Subscription;

	constructor(
		private readonly authService: AuthService,
		private readonly fb: FormBuilder,
		private readonly router: Router
	) { }

	ngOnInit(): void {
		// Suscribe al estado del usuario. Cuando cambie, actualiza el formulario.
		this.authSubscription = this.authService.currentUser.subscribe(user => {
			this.currentUser = user;
			if (user) {
				this.initProfileForm(user);
			}
		});
	}

	// Inicializa el formulario de perfil con los datos del usuario actual
	initProfileForm(user: User): void {
		this.profileForm = this.fb.group({
			fullName: [user.fullName, [Validators.required, emptyStringValidator()]],
			username: [user.username, [Validators.required, emptyStringValidator()]],
			email: [{ value: user.email, disabled: true }, [Validators.required, emailValidator()]],
			birthDay: [Date.parse(user.birthDay), [Validators.required, minAgeValidator(13)]],
			password: [user.password, [Validators.required, passwordStrengthValidator()]]
		});
	}

	// Maneja la actualización del perfil
	handleProfileUpdate(): void {
		if (this.profileForm.invalid) {
			this.profileForm.markAllAsTouched();
			this.profileMessage = '<div class="alert alert-danger">Error al actualizar perfil. Por favor, revisa los campos.</div>';
			return;
		}

		if (!this.currentUser) {
			this.profileMessage = '<div class="alert alert-danger">Error: No hay usuario autenticado.</div>';
			return;
		}

		const updatedData: User = {
			fullName: this.profileForm.get('fullName')?.value,
			username: this.profileForm.get('username')?.value,
			email: this.currentUser.email,
			birthDay: this.profileForm.get('birthDay')?.value,
			password: this.profileForm.get('password')?.value,
			role: this.currentUser.role
		};

		const result = this.authService.updateProfile(this.currentUser.username, updatedData);

		if (result.success) {
			this.profileMessage = `<div class="alert alert-success">${result.message}</div>`;
			setTimeout(() => { this.router.navigate(['/inicio']); }, 1000); // Redirige al inicio
		} else {
			this.profileMessage = `<div class="alert alert-danger">${result.message}</div>`;
		}
	}

	// Desuscribe para evitar fugas de memoria
	ngOnDestroy(): void {
		if (this.authSubscription) {
			this.authSubscription.unsubscribe();
		}
	}
}

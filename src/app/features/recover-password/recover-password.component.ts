import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { emailValidator, passwordStrengthValidator, passwordsMatchValidator } from 'src/app/utils/validator';

/**
 * @description 
 * Componente para la recuperación de contraseña de usuarios.
 * @summary 
 * Permite a los usuarios actualizar su contraseña proporcionando su correo electrónico
 * y una nueva contraseña que cumpla con los requisitos de seguridad. Utiliza formularios reactivos
 * y validadores personalizados.
 * @usageNotes
 * ```html
 * <app-recover-password></app-recover-password>
 * ```
 */
@Component({
	selector: 'app-recover-password',
	templateUrl: './recover-password.component.html',
	styleUrls: ['./recover-password.component.css']
})
export class RecoverPasswordComponent implements OnInit, OnDestroy {
	recoveryForm!: FormGroup;
	recoveryMessage: string = '';
	private authSubscription!: Subscription;

	constructor(
		private readonly authService: AuthService,
		private readonly router: Router,
		private readonly fb: FormBuilder
	) { }

	ngOnInit(): void {
		// Inicializa el formulario reactivo para la recuperación de contraseña
		this.recoveryForm = this.fb.group({
			email: ['', [Validators.required, emailValidator()]],
			newPassword: ['', [Validators.required, passwordStrengthValidator()]],
			confirmPassword: ['', [Validators.required]]
		}, {
			validators: passwordsMatchValidator('newPassword', 'confirmPassword')
		});

		// Si el usuario ya está logueado, redirige al inicio
		this.authSubscription = this.authService.currentUser.subscribe(user => {
			if (user) {
				this.router.navigate(['/inicio']);
			}
		});
	}

	onSubmit(): void {
		if (this.recoveryForm.invalid) {
			this.recoveryForm.markAllAsTouched();
			this.recoveryMessage = '<div class="alert alert-danger">Error al enviar formulario. Por favor, revisa los campos.</div>';
			return;
		}

		const { email, newPassword } = this.recoveryForm.value;
		this.authService.updatePassword(email, newPassword).subscribe({
            next: (result) => {
                if (result.success) {
                    this.recoveryMessage = `<div class="alert alert-success">${result.message}</div>`;
                    setTimeout(() => { this.router.navigate(['/login']); }, 1000);
                } else {
                    this.recoveryMessage = `<div class="alert alert-danger">${result.message}</div>`;
                }
            },
            error: (err) => {
                this.recoveryMessage = `<div class="alert alert-danger">Ocurrió un error inesperado al recuperar la contraseña.</div>`;
                console.error(err);
            }
        });
	}

	ngOnDestroy(): void {
		if (this.authSubscription) {
			this.authSubscription.unsubscribe();
		}
	}
}

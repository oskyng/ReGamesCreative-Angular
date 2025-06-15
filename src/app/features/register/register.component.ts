import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from 'src/app/core/auth/auth.service';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.css']
})
export class RegisterComponent {
	fullName = '';
	username = '';
	email = '';
	birthday = '';
	password = '';
	confirmPassword = '';
	message = '';
	error = '';

	constructor(
		private readonly authService: AuthService,
		private readonly router: Router
	) { }

	onSubmit(): void {
		this.message = '';
		this.error = '';

		if (!this.fullName || !this.username || !this.email || !this.birthday || !this.password || !this.confirmPassword) {
			this.error = 'Todos los campos son obligatorios.';
			return;
		}

		const age = this.ageCalculate(this.birthday);
		if (age < 14) {
			this.error = 'Debes tener al menos 14 años para registrarte.';
			return;
		}

		if (this.password.length < 8) {
			this.error = 'La contraseña debe tener al menos 8 caracteres.';
			return;
		}

		if (this.password !== this.confirmPassword) {
			this.error = 'Las contraseñas no coinciden.';
			return;
		}

		const newUser: User = {
			fullName: this.fullName,
			username: this.username,
			email: this.email,
			birthDay: this.birthday,
			password: this.password,
			role: 'normal'
		}

		const result = this.authService.register(newUser);
		if (result.success) {
			this.message = 'Registro exitoso. Redirigiendo a Login...';
			setTimeout(() => {
				this.router.navigate(['/login']);
			}, 1000);
		} else {
			this.error = result.message ?? 'Error al enviar formulario.';
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

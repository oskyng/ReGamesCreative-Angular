import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	username = '';
	password = '';
	message = '';
	error = '';

	constructor(
		private readonly authService: AuthService,
		private readonly router: Router
	) { }

	ngOnInit(): void {
		if (this.authService.getCurrentUser) {
			this.router.navigate(['/home']);
		}
	}

	onSubmit(): void {
		this.message = '';
		this.error = '';

		const result = this.authService.login(this.username, this.password);

		if (result.success) {
			this.message = 'Inicio de sesión exitoso. Redirigiendo...';
			setTimeout(() => {
				this.router.navigate(['/']);
			}, 1000);
		} else {
			this.error = result.message ?? 'Error al iniciar sesion';
		}
	}

}

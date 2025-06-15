import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
	selector: 'app-recover-password',
	templateUrl: './recover-password.component.html',
	styleUrls: ['./recover-password.component.css']
})
export class RecoverPasswordComponent implements OnInit {
	message = '';
	error = '';
	email = '';
	password ='';
	confirmPassword = ''; 

	constructor(
		private readonly authService: AuthService,
		private readonly router: Router
	) { }

	ngOnInit(): void {
		if (this.authService.getCurrentUser) {
			this.router.navigate(['/home']);
		}
	}
	onSubmit(): void { }
}

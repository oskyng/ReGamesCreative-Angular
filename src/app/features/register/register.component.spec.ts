import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
	let component: RegisterComponent;
	let fixture: ComponentFixture<RegisterComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [RegisterComponent],
			imports: [ReactiveFormsModule],
			providers: [{
				provide: Router, useValue: { navigate: () => { } }
			}]
		}).compileComponents();

		fixture = TestBed.createComponent(RegisterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('debería crearse', () => {
		expect(component).toBeTruthy();
	});

	it('debería inicializar el formulario de registro con campos vacíos e inválidos', () => {
		expect(component.registerForm).toBeDefined();
		expect(component.registerForm.controls['fullName'].value).toBe('');
		expect(component.registerForm.controls['username'].value).toBe('');
		expect(component.registerForm.controls['email'].value).toBe('');
		expect(component.registerForm.controls['birthDay'].value).toBe('');
		expect(component.registerForm.controls['password'].value).toBe('');
		expect(component.registerForm.controls['confirmPassword'].value).toBe('');
		expect(component.registerForm.valid).toBeFalse();
	});

	it('debería marcar el formulario como inválido si los campos están vacíos', () => {
		component.registerForm.setValue({
			fullName: '',
			username: '',
			email: '',
			birthDay: '',
			password: '',
			confirmPassword: ''
		});
		expect(component.registerForm.invalid).toBeTrue();
	});

	// Validaciones de Campos Individuales
	it('el nombre completo debería ser requerido', () => {
		const control = component.registerForm.controls['fullName'];
		control.setValue('');
		expect(control.valid).toBeFalse();
		expect(control.errors?.['required']).toBeTrue();
	});

	it('el nombre de usuario debería ser requerido y no solo espacios', () => {
		const control = component.registerForm.controls['username'];
		control.setValue('');
		expect(control.valid).toBeFalse();
		expect(control.errors?.['required']).toBeTrue();
		control.setValue('   ');
		expect(control.valid).toBeFalse();
		expect(control.errors?.['emptyString']).toBeTrue();
	});

	it('el correo electrónico debería ser requerido y tener formato válido', () => {
		const control = component.registerForm.controls['email'];
		control.setValue('');
		expect(control.valid).toBeFalse();
		expect(control.errors?.['required']).toBeTrue();
		control.setValue('invalid-email');
		expect(control.valid).toBeFalse();
		expect(control.errors?.['invalidEmail']).toBeTrue();
		control.setValue('test@example.com');
		expect(control.valid).toBeTrue();
	});

	it('la fecha de nacimiento debería ser requerida y la edad mínima de 13 años', () => {
		const control = component.registerForm.controls['birthDay'];
		control.setValue('');
		expect(control.valid).toBeFalse();
		expect(control.errors?.['required']).toBeTrue();

		// Fecha que hace al usuario menor de 13
		const today = new Date();
		const youngDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
		control.setValue(youngDate.toISOString().split('T')[0]);
		expect(control.valid).toBeFalse();
		expect(control.errors?.['minAge']).toBeTruthy();

		// Fecha que hace al usuario mayor de 13
		const oldEnoughDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
		control.setValue(oldEnoughDate.toISOString().split('T')[0]);
		expect(control.valid).toBeTrue();
	});

	it('la contraseña debería ser requerida y cumplir con la fortaleza', () => {
		const control = component.registerForm.controls['password'];
		control.setValue('');
		expect(control.valid).toBeFalse();
		expect(control.errors?.['required']).toBeTrue();

		control.setValue('short');
		expect(control.valid).toBeFalse();
		expect(control.errors?.['passwordStrength']).toBeTrue();

		control.setValue('Password1');
		expect(control.valid).toBeFalse();
		expect(control.errors?.['passwordStrength']).toBeTrue();

		control.setValue('password123!');
		expect(control.valid).toBeFalse();
		expect(control.errors?.['passwordStrength']).toBeTrue();

		control.setValue('Password1!');
		expect(control.valid).toBeTrue();
	});

	it('la confirmación de contraseña debería ser requerida', () => {
		const control = component.registerForm.controls['confirmPassword'];
		control.setValue('');
		expect(control.valid).toBeFalse();
		expect(control.errors?.['required']).toBeTrue();
	});

	it('las contraseñas deben coincidir', () => {
		component.registerForm.controls['fullName'].setValue('Valid Name');
		component.registerForm.controls['username'].setValue('validuser');
		component.registerForm.controls['email'].setValue('valid@example.com');
		const today = new Date();
		const oldEnoughDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
		component.registerForm.controls['birthDay'].setValue(oldEnoughDate.toISOString().split('T')[0]);

		const passwordControl = component.registerForm.controls['password'];
		const confirmPasswordControl = component.registerForm.controls['confirmPassword'];

		passwordControl.setValue('Password1!');
		confirmPasswordControl.setValue('Password2!');

		expect(component.registerForm.valid).toBeFalse();
		expect(component.registerForm.errors?.['passwordsMismatch']).toBeTrue();

		confirmPasswordControl.setValue('Password1!');
		expect(component.registerForm.valid).toBeTrue();
		expect(component.registerForm.errors?.['passwordsMismatch']).toBeUndefined();
	});
});

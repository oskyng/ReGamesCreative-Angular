import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoverPasswordComponent } from './recover-password.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('RecoverPasswordComponent', () => {
    let component: RecoverPasswordComponent;
    let fixture: ComponentFixture<RecoverPasswordComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RecoverPasswordComponent],
            imports: [ReactiveFormsModule]
        }).compileComponents();

        fixture = TestBed.createComponent(RecoverPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería inicializar el formulario de recuperación con campos vacíos e inválidos', () => {
        expect(component.recoveryForm).toBeDefined();
        expect(component.recoveryForm.controls['email'].value).toBe('');
        expect(component.recoveryForm.controls['newPassword'].value).toBe('');
        expect(component.recoveryForm.controls['confirmPassword'].value).toBe('');
        expect(component.recoveryForm.valid).toBeFalse();
    });

    it('el campo de email debería ser requerido y tener formato válido', () => {
        const control = component.recoveryForm.controls['email'];
        control.setValue('');
        expect(control.valid).toBeFalse();
        expect(control.errors?.['required']).toBeTrue();
        control.setValue('invalid-email');
        expect(control.valid).toBeFalse();
        expect(control.errors?.['invalidEmail']).toBeTrue();
        control.setValue('test@example.com');
        expect(control.valid).toBeTrue();
    });

    it('la nueva contraseña debería ser requerida y cumplir con la fortaleza', () => {
        const control = component.recoveryForm.controls['newPassword'];
        control.setValue('');
        expect(control.valid).toBeFalse();
        expect(control.errors?.['required']).toBeTrue();

        control.setValue('short');
        expect(control.valid).toBeFalse();
        expect(control.errors?.['passwordStrength']).toBeTrue();

        control.setValue('Newpass1'); // No tiene carácter especial
        expect(control.valid).toBeFalse();
        expect(control.errors?.['passwordStrength']).toBeTrue();

        control.setValue('newpass1!'); // No tiene mayúscula
        expect(control.valid).toBeFalse();
        expect(control.errors?.['passwordStrength']).toBeTrue();

        control.setValue('NewPassword1!'); // Válida
        expect(control.valid).toBeTrue();
    });

    it('la confirmación de contraseña debería ser requerida', () => {
        const control = component.recoveryForm.controls['confirmPassword'];
        control.setValue('');
        expect(control.valid).toBeFalse();
        expect(control.errors?.['required']).toBeTrue();
    });

    it('las nuevas contraseñas deben coincidir', () => {
        const emailControl = component.recoveryForm.controls['email'];
        const newPasswordControl = component.recoveryForm.controls['newPassword'];
        const confirmPasswordControl = component.recoveryForm.controls['confirmPassword'];

        emailControl.setValue('valid@example.com');
        newPasswordControl.setValue('NewPassword1!');
        confirmPasswordControl.setValue('DifferentPassword2!');
        component.recoveryForm.updateValueAndValidity();

        expect(component.recoveryForm.valid).toBeFalse();
        expect(component.recoveryForm.errors?.['passwordsMismatch']).toBeTrue();

        confirmPasswordControl.setValue('NewPassword1!');
        component.recoveryForm.updateValueAndValidity();

        expect(component.recoveryForm.valid).toBeTrue();
        expect(component.recoveryForm.errors?.['passwordsMismatch']).toBeUndefined();
    });
});

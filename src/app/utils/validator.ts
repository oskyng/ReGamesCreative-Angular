import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Valida si una cadena está vacía o solo contiene espacios en blanco
export function emptyStringValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isEmpty = (control.value ?? '').trim() === '';
    return isEmpty ? { emptyString: true } : null;
  };
}

// Valida un formato de correo electrónico
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(control.value ?? '');
    return isValid ? null : { invalidEmail: true };
  };
}

// Valida que la edad sea al menos la mínima requerida
export function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();

    const isOldEnough = age > minAge || (age === minAge && (monthDifference > 0 || (monthDifference === 0 && dayDifference >= 0)));
    return isOldEnough ? null : { minAge: { requiredAge: minAge, actualAge: age } };
  };
}

// Valida la fuerza de la contraseña (mínimo 8 caracteres, 1 número, 1 mayúscula, 1 carácter especial)
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    const isValid = passwordRegex.test(control.value ?? '');
    return isValid ? null : { passwordStrength: true };
  };
}

// Valida que dos campos de contraseña coincidan
export function passwordsMatchValidator(passwordControlName: string, confirmPasswordControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordControlName)?.value;
    const confirmPassword = control.get(confirmPasswordControlName)?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordsMismatch: true };
    }
    return null;
  };
}
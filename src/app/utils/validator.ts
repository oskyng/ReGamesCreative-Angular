import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * @description 
 * Validador personalizado para asegurar que un campo de entrada no sea solo una cadena de espacios en blanco.
 * @summary 
 * Retorna un error `emptyString` si el valor del control es una cadena vacía o solo contiene espacios en blanco.
 * @returns {ValidatorFn} Una función validadora.
 * @example
 * ```typescript
 * this.formBuilder.group({
 * username: ['', [Validators.required, emptyStringValidator()]]
 * });
 * ```
 */
export function emptyStringValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isEmpty = (control.value ?? '').trim() === '';
    return isEmpty ? { emptyString: true } : null;
  };
}

/**
 * @description 
 * Validador personalizado para asegurar que una cadena tenga un formato de correo electrónico válido.
 * @summary 
 * Retorna un error `invalidEmail` si el valor del control no coincide con una expresión regular de correo electrónico.
 * @returns {ValidatorFn} Una función validadora.
 * @example
 * ```typescript
 * this.formBuilder.group({
 * email: ['', [Validators.required, emailValidator()]]
 * });
 * ```
 */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(control.value ?? '');
    return isValid ? null : { invalidEmail: true };
  };
}

/**
 * @description 
 * Validador personalizado para asegurar que la fecha de nacimiento indique una edad mínima.
 * @summary 
 * Retorna un error `minAge` si la edad calculada a partir de la fecha es menor que la edad mínima requerida.
 * @param {number} minAge La edad mínima requerida.
 * @returns {ValidatorFn} Una función validadora.
 * @example
 * ```typescript
 * this.formBuilder.group({
 * birthDay: ['', [Validators.required, minAgeValidator(18)]]
 * });
 * ```
 */
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

/**
 * @description 
 * Validador personalizado para asegurar que una contraseña cumpla con ciertos criterios de fortaleza.
 * @summary 
 * Requiere al menos una mayúscula, una minúscula, un número, un carácter especial y una longitud mínima de 8 caracteres.
 * Retorna errores específicos (`noUppercase`, `noLowercase`, `noDigit`, `noSpecialChar`, `minLength`) si no se cumplen los criterios.
 * @returns {ValidatorFn} Una función validadora.
 * @example
 * ```typescript
 * this.formBuilder.group({
 * password: ['', [Validators.required, passwordStrengthValidator()]]
 * });
 * ```
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    const isValid = passwordRegex.test(control.value ?? '');
    return isValid ? null : { passwordStrength: true };
  };
}

/**
 * @description 
 * Validador personalizado de grupo de formularios para asegurar que dos campos de contraseña coincidan.
 * @summary 
 * Retorna un error `passwordsMismatch` en el grupo si los valores de los dos controles especificados no son idénticos.
 * Se debe aplicar al `FormGroup` o `FormBuilder` completo, no a un control individual.
 * @param {string} passwordControlName El nombre del control de la contraseña principal.
 * @param {string} confirmPasswordControlName El nombre del control de la contraseña de confirmación.
 * @returns {ValidatorFn} Una función validadora que se aplica a un `FormGroup`.
 * @example
 * ```typescript
 * this.formBuilder.group({
 * password: ['', Validators.required],
 * confirmPassword: ['', Validators.required]
 * }, { validators: passwordsMatchValidator('password', 'confirmPassword') });
 * ```
 */
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
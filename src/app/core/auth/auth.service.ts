import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Claves de almacenamiento
const AUTH_STORAGE_KEY = 'my_game_library_users';
const CURRENT_USER_KEY = 'my_game_library_currentUser';
const USER_GAMES_KEY = 'my_game_library_userGames';

export interface User {
	fullName: string;
	username: string;
	email: string;
	birthDay: string;
	password: string;
	role: 'admin' | 'normal';
}

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private readonly currentUserSubject: BehaviorSubject<User | null>;
  	public currentUser: Observable<User | null>;

	constructor() {
		this.init();
		const storedUser = localStorage.getItem(CURRENT_USER_KEY);
		this.currentUserSubject = new BehaviorSubject<User | null>(
			storedUser ? JSON.parse(storedUser) : null
		);
		this.currentUser = this.currentUserSubject.asObservable();
	}

	// Inicializa algunos usuarios de prueba
	public init(): void {
		if (!localStorage.getItem(AUTH_STORAGE_KEY)) {
			localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify([
				{
					fullName: "Oscar Sanzana",
					username: 'admin',
					email: "oscar.sanzana.97@gmail.com",
					birthDay: "1997-11-17",
					password: 'Admin123!',
					role: 'admin'
				}
			]));
		}
	}

	// Obtener usuario actual
	public get getCurrentUser(): User | null {
		return this.currentUserSubject.value;
	}

	// Iniciar sesión
  	login(username: string, password: string): { success: boolean; message?: string } {
		const users: User[] = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? '[]');
		const user = users.find(u => u.username === username && u.password === password);
		if (user) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
			this.currentUserSubject.next(user);
            return { success: true };
        }

		return { success: false, message: 'Nombre de usuario o contraseña incorrectos.' };
	}

	// Registrar usuario
	register(newUser: User): { success: boolean; message?: string } {
        const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? '[]');
        if (users.some((u: { username: string; }) => u.username === newUser.username)) {
            return { success: false, message: 'El nombre de usuario ya existe.' };
        }
        users.push(newUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));

        return { success: true, message: 'Registro exitoso. ¡Ahora puedes iniciar sesión!' };
    }

	// Función para actualizar la contrasena de un usuario
	updatePassword (userEmail: string, newPassword: string): { success: boolean; message?: string } {
        let users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? '[]');
        const userIndex = users.findIndex((u: { email: string; }) => u.email === userEmail);

        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado.' };
        }

        users[userIndex].password = newPassword;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));

		const currentUser = this.getCurrentUser;
        if (currentUser && currentUser.email === userEmail) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
        }

        return { success: true, message: 'Contraseña actualizada correctamente. Redirigiendo a Login...' };
    }

	// Función para actualizar el perfil de un usuario
	updateProfile(originalUsername: string, newUserData: User): { success: boolean; message?: string } {
		let users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? '[]');
        const userIndex = users.findIndex((u: { username: string; }) => u.username === originalUsername);

		if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado.' };
        }

		// Si el nuevo nombre de usuario es diferente y ya existe
        if (newUserData.username && newUserData.username !== originalUsername && users.some((u: { username: string; }) => u.username === newUserData.username)) {
            return { success: false, message: 'El nuevo nombre de usuario ya está en uso.' };
        }

		users[userIndex] = { ...users[userIndex], ...newUserData };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
		
		const currentUser = this.getCurrentUser;
        if (currentUser && currentUser.username === originalUsername) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
        }

		return { success: true, message: 'Perfil actualizado correctamente.' };
	}

	logout(): void {
        localStorage.removeItem(CURRENT_USER_KEY);
		this.currentUserSubject.next(null);
    }
}

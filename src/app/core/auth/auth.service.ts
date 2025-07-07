import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, map, Observable, of, tap } from 'rxjs';
import mockUsersDataArray from '../../../assets/mock-users.json';

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
	role: string;
}

const _mockUsers: User[] = JSON.parse(JSON.stringify(mockUsersDataArray));

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private readonly CURRENT_USER_KEY = 'currentUser';
	private readonly currentUserSubject: BehaviorSubject<User | null>;
	public currentUser: Observable<User | null>;

	constructor() {
		this.currentUserSubject = new BehaviorSubject<User | null>(null);
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
	login(username: string, password: string): Observable<{ success: boolean, message: string }> {
		return of(null).pipe(
			delay(500),
			map(() => {
				const user = _mockUsers.find(u => u.username === username && u.password === password);

				if (user) {
					this.currentUserSubject.next(user);
					console.log('[AuthService] Usuario logueado:', user);
					return { success: true, message: 'Inicio de sesión exitoso.' };
				} else {
					return { success: false, message: 'Nombre de usuario o contraseña incorrectos.' };
				}
			})
		);
	}

	// Registrar usuario
	register(newUser: User): Observable<{ success: boolean, message: string }> {
		return of(null).pipe(
			delay(500),
			map(() => {
				if (_mockUsers.some(u => u.username === newUser.username)) {
					return { success: false, message: 'El nombre de usuario ya existe.' };
				}
				if (_mockUsers.some(u => u.email === newUser.email)) {
					return { success: false, message: 'El correo electrónico ya está registrado.' };
				}

				// Por simplicidad, todos los nuevos usuarios son 'user'
				const userToSave: User = { ...newUser, role: 'user' };
				_mockUsers.push(userToSave);
				console.log('[AuthService] Nuevo usuario registrado:', userToSave);
				return { success: true, message: 'Registro exitoso. Ahora puedes iniciar sesión.' };
			})
		);
	}

	// Función para actualizar la contrasena de un usuario
	updatePassword(email: string, newPassword: string): Observable<{ success: boolean, message: string }> {
		return of(null).pipe(
			delay(500),
			map(() => {
				const user = _mockUsers.find(u => u.email === email);

				if (!user) {
					return { success: false, message: 'Correo electrónico no encontrado.' };
				}

				user.password = newPassword;
				// Si el usuario actual es el que se actualizó, también actualiza el BehaviorSubject
				if (this.currentUserSubject.value?.email === email) {
					this.currentUserSubject.next(user);
				}
				console.log('[AuthService] Contraseña actualizada para:', user.username);
				return { success: true, message: 'Contraseña actualizada correctamente. Por favor, inicia sesión con tu nueva contraseña.' };
			})
		);
	}

	// Función para actualizar el perfil de un usuario
	updateProfile(oldUsername: string, updatedUser: User): Observable<{ success: boolean, message: string }> {
		return of(null).pipe(
			delay(500),
			map(() => {
				const index = _mockUsers.findIndex(u => u.username === oldUsername);

				if (index === -1) {
					return { success: false, message: 'Usuario no encontrado.' };
				}

				// Verificar si el nuevo nombre de usuario o email ya están en uso por otro usuario
				if (updatedUser.username !== oldUsername && _mockUsers.some(u => u.username === updatedUser.username)) {
					return { success: false, message: 'El nuevo nombre de usuario ya está en uso.' };
				}
				if (updatedUser.email !== _mockUsers[index].email && _mockUsers.some(u => u.email === updatedUser.email)) {
					return { success: false, message: 'El nuevo correo electrónico ya está en uso.' };
				}

				// Mantener el rol original del usuario
				const userWithOriginalRole: User = { ...updatedUser, role: _mockUsers[index].role };
				_mockUsers[index] = userWithOriginalRole;

				// Si el usuario actual es el que se actualizó, también actualiza el BehaviorSubject
				if (this.currentUserSubject.value?.username === oldUsername) {
					this.currentUserSubject.next(userWithOriginalRole);
				}
				console.log('[AuthService] Perfil de usuario actualizado:', userWithOriginalRole);
				return { success: true, message: 'Perfil actualizado correctamente.' };
			})
		);
	}

	logout(): Observable<void> {
		return of(null).pipe(
			delay(200),
			tap(() => {
				this.currentUserSubject.next(null);
				console.log('[AuthService] Sesión cerrada.');
			}),
			map(() => void 0) // Emite void
		);
	}
}

import { Injectable } from '@angular/core';
const USER_GAMES_KEY = 'my_game_library_userGames';
import * as MOCK_DATA from '../../../assets/mock-user-games.json';
import { Observable, of, delay, map } from 'rxjs';
/**
 * @description 
 * Define la estructura de datos para un videojuego y el servicio para gestionar la biblioteca de juegos del usuario.
 * @summary 
 * Proporciona interfaces para `Achievement` y `Game`, y el `GameService` para operaciones CRUD
 * (añadir, obtener, actualizar, eliminar) sobre los juegos en la biblioteca local del usuario.
 */

/**
 * @interface `Achievement`
 * @description 
 * Representa un logro individual de un videojuego.
 * @property {number} id El ID del logro.
 * @property {string} name El nombre del logro.
 * @property {string} description La descripción del logro.
 * @property {string} image La imagen del logro.
 * @property {string} percent El procentaje del logro
 * @property {boolean} completed Indica si el logro ha sido completado por el usuario.
 */
export interface Achievement {
	id: number;
	name: string;
	description: string;
	image: string;
	percent: string;
	completed: boolean;
}

/**
 * @interface Game
 * @description Representa un videojuego en la aplicación, incluyendo detalles y logros.
 * @property {number} id El identificador único del juego.
 * @property {string} title El título del videojuego.
 * @property {string} description La descripción detallada del juego.
 * @property {string} platform Las plataformas en las que está disponible el juego.
 * @property {string} genre Los géneros a los que pertenece el juego.
 * @property {number} hoursPlayed El número de horas que el usuario ha jugado a este juego.
 * @property {string} image La URL de la imagen de portada del juego.
 * @property {boolean} isFavorite Indica si el usuario ha marcado el juego como favorito.
 * @property {boolean} played Indica si el usuario ha marcado el juego como "jugado".
 * @property {Achievement[]} [achievements] Un array opcional de logros asociados al juego.
 */
export interface Game {
    id: number;
    title: string;
    description: string;
    platform: string;
    genre: string;
    hoursPlayed: number;
    image: string;
    isFavorite: boolean;
    played: boolean;
    achievements?: Achievement[];
}

// Datos mockeados para simular la librería de juegos de los usuarios
const _mockUserGamesData: { [key: string]: Game[] } = JSON.parse(JSON.stringify(MOCK_DATA));

/**
 * @class GameService
 * @description
 * Servicio que gestiona las operaciones de la biblioteca de juegos de los usuarios,
 * persistiendo los datos en el almacenamiento local (localStorage).
 * @summary Ofrece métodos para añadir, obtener, actualizar y eliminar juegos de la biblioteca
 * de un usuario específico, manteniendo la integridad de los datos de la biblioteca.
 * @usageNotes
 * Inyecta este servicio en tus componentes o servicios que necesiten interactuar con la biblioteca de juegos:
 * ```typescript
 * constructor(private gameService: GameService) { }
 * // Para obtener juegos:
 * const userGames = this.gameService.getUserGames('nombreUsuario');
 * // Para añadir un juego:
 * this.gameService.addGame('nombreUsuario', newGame);
 * ```
 */
@Injectable({
	providedIn: 'root'
})
export class GameService {

	constructor() { }

	// Obtiene todos los juegos para un usuario específico
	getUserGames(username: string): Observable<Game[]> {
		return of(null).pipe(
            delay(300),
            map(() => {
                return JSON.parse(JSON.stringify(_mockUserGamesData[username] || []));
            })
        );
	}

	// Guardar todos los juegos para un usuario específico
	private _saveUserGames(username: string, games: Game[]): void {
		_mockUserGamesData[username] = games;
        console.log(`[GameService] Juegos guardados para ${username}:`, _mockUserGamesData[username]);
	}

	// Añadir un nuevo juego a la biblioteca de un usuario
	addGame(username: string, gameData: Partial<Game>): Observable<{ success: boolean, message: string, game?: Game }> {
		return of(null).pipe(
            delay(500), // Simula latencia
            map(() => {
                const userGames = this.getUserGames(username); // Esto ahora devuelve un Observable, pero necesitamos el valor síncrono para la lógica
                // Para obtener el valor síncrono del Observable dentro de otro Observable, se usaría switchMap/mergeMap
                // Pero como este es un mock en memoria, podemos acceder directamente a _mockUserGamesData
                const currentGamesForUser = _mockUserGamesData[username] || [];

                // Genera un ID único simple para el mock, ya que no hay un backend real
                const newGameId = gameData.id || Date.now();

                // Verifica si el juego ya existe en la biblioteca del usuario (por ID)
                const alreadyExists = currentGamesForUser.some(game => game.id === newGameId);

                if (alreadyExists) {
                    return { success: false, message: 'El juego ya está en tu biblioteca.' };
                }

                // Asegura que los logros tengan la propiedad 'completed'
                let initialAchievements: Achievement[] = [];
                if (gameData.achievements && gameData.achievements.length > 0) {
                    initialAchievements = gameData.achievements.map(ach => ({ ...ach, completed: ach.completed ?? false }));
                } else {
                    // Logros por defecto si no se proporcionan
                    initialAchievements = [
                        { id: 1, name: "Completar Tutorial", description: "Completa el tutorial del juego.", image: "https://placehold.co/50x50/374151/D1D5DB?text=Tutorial", percent: "0", completed: false },
                        { id: 2, name: "Derrotar Primer Jefe", description: "Derrota al primer jefe del juego.", image: "https://placehold.co/50x50/374151/D1D5DB?text=Boss", percent: "0", completed: false }
                    ];
                }

                const newGame: Game = {
                    id: newGameId,
                    title: gameData.title ?? 'Juego sin título',
                    description: gameData.description ?? '',
                    platform: gameData.platform ?? 'Desconocida',
                    genre: gameData.genre ?? 'Varios',
                    hoursPlayed: gameData.hoursPlayed ?? 0,
                    image: gameData.image ?? 'https://placehold.co/400x250/374151/D1D5DB?text=No+Image',
                    isFavorite: false,
                    played: false,
                    achievements: initialAchievements
                };

                currentGamesForUser.push(newGame);
                _mockUserGamesData[username] = currentGamesForUser; // Actualiza directamente el mock global
                console.log(`[GameService] "${newGame.title}" añadido correctamente para ${username}.`);
                return { success: true, message: `"${newGame.title}" añadido correctamente.`, game: newGame };
            })
        );
	}

	// Actualiza un juego existente en la biblioteca de un usuario
	updateGame(username: string, updatedGame: Game): Observable<{ success: boolean, message: string }> {
		return of(null).pipe(
            delay(300),
            map(() => {
                let userGames = _mockUserGamesData[username] || [];
                const index = userGames.findIndex(game => game.id === updatedGame.id);

                if (index !== -1) {
                    userGames[index] = { ...userGames[index], ...updatedGame };
                    _mockUserGamesData[username] = userGames;
                    console.log(`[GameService] "${updatedGame.title}" actualizado para ${username}.`);
                    return { success: true, message: `"${updatedGame.title}" actualizado.` };
                }
                return { success: false, message: 'Juego no encontrado en la biblioteca para actualizar.' };
            })
        );
	}

	// Elimina un juego de la biblioteca de un usuario
	deleteGame(username: string, gameId: number): Observable<{ success: boolean, message: string }> {
		return of(null).pipe(
            delay(300),
            map(() => {
                let userGames = _mockUserGamesData[username] || [];
                const initialLength = userGames.length;
                userGames = userGames.filter(game => game.id !== gameId);

                if (userGames.length < initialLength) {
                    _mockUserGamesData[username] = userGames;
                    console.log(`[GameService] Juego con ID ${gameId} eliminado para ${username}.`);
                    return { success: true, message: 'Juego eliminado de la biblioteca.' };
                }
                return { success: false, message: 'Juego no encontrado en la biblioteca para eliminar.' };
            })
        );
	}
}

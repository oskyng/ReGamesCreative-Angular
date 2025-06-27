import { Injectable } from '@angular/core';
const USER_GAMES_KEY = 'my_game_library_userGames';
/**
 * @description 
 * Define la estructura de datos para un videojuego y el servicio para gestionar la biblioteca de juegos del usuario.
 * @summary 
 * Proporciona interfaces para `Achievement` y `Game`, y el `GameService` para operaciones CRUD
 * (añadir, obtener, actualizar, eliminar) sobre los juegos en la biblioteca local del usuario.
 */

/**
 * @interface GameAchievement
 * @description 
 * Representa un logro individual de un videojuego.
 * @property {number} id El ID del logro.
 * @property {string} name El nombre del logro.
 * @property {string} description La descripción del logro.
 * @property {string} image La imagen del logro.
 * @property {string} percent El procentaje del logro
 * @property {boolean} completed Indica si el logro ha sido completado por el usuario.
 */
export interface GameAchievement {
	id: number;
	name: string;
	description: string;
	image: string;
	percent: string;
	completed: boolean;
}

/**
 * @interface Game
 * @description 
 * Representa un videojuego en la aplicación, incluyendo detalles y logros.
 * @property {number} id El identificador único del juego (ID de RAWG).
 * @property {string} title El título del videojuego.
 * @property {string} image La URL de la imagen de portada del juego.
 * @property {string} description La descripción detallada del juego.
 * @property {string} platform Las plataformas en las que está disponible el juego.
 * @property {string} genre Los géneros a los que pertenece el juego.
 * @property {number} hoursPlayed El número de horas que el usuario ha jugado a este juego.
 * @property {boolean} played Indica si el usuario ha marcado el juego como "jugado".
 * @property {boolean} isFavorite Indica si el usuario ha marcado el juego como favorito.
 * @property {GameAchievement[]} [achievements] Un array opcional de logros asociados al juego.
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
	achievements: GameAchievement[];
}

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
	getUserGames(username: string): Game[] {
		const allUserGames: { [key: string]: Game[] } = JSON.parse(localStorage.getItem(USER_GAMES_KEY) ?? '{}');
		return allUserGames[username] ?? [];
	}

	// Guardar todos los juegos para un usuario específico
	private _saveUserGames(username: string, games: Game[]): void {
		const allUserGames: { [key: string]: Game[] } = JSON.parse(localStorage.getItem(USER_GAMES_KEY) ?? '{}');
		allUserGames[username] = games;
		localStorage.setItem(USER_GAMES_KEY, JSON.stringify(allUserGames));
	}
	// Añadir un nuevo juego a la biblioteca de un usuario
	addGame(username: string, gameData: Partial<Game>): { success: boolean, message: string, game?: Game } {
		const userGames = this.getUserGames(username);
		const newGameId = gameData.id ?? Date.now();

		// Verifica si el juego ya existe en la biblioteca del usuario (por título y plataforma)
		const alreadyExists = userGames.some(game =>
			game.title === gameData.title && game.platform === gameData.platform
		);

		if (alreadyExists) {
			return { success: false, message: 'El juego ya está en tu biblioteca.' };
		}

		let initialAchievements: GameAchievement[] = [];
		if (gameData.achievements && gameData.achievements.length > 0) {
			initialAchievements = gameData.achievements.map(ach => ({ ...ach, completed: false }));
		} else {
			initialAchievements = [
				{ id: 101, name: "Completar Tutorial", description: "Completa el tutorial del juego.", image: "", percent: "0%", completed: false },
				{ id: 102, name: "Derrotar Primer Jefe", description: "Derrota al primer jefe del juego.", image: "", percent: "0%", completed: false }
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

		userGames.push(newGame);
		this._saveUserGames(username, userGames);
		return { success: true, message: `"${newGame.title}" añadido correctamente.`, game: newGame };
	}

	// Actualiza un juego existente en la biblioteca de un usuario
	updateGame(username: string, updatedGame: Game): void {
		let userGames = this.getUserGames(username);
		userGames = userGames.map(game =>
			game.id === updatedGame.id ? { ...game, ...updatedGame } : game
		);
		this._saveUserGames(username, userGames);
	}

	// Elimina un juego de la biblioteca de un usuario
	deleteGame(username: string, gameId: number): void {
		let userGames = this.getUserGames(username);
		userGames = userGames.filter(game => game.id !== gameId);
		this._saveUserGames(username, userGames);
	}
}

import { Injectable } from '@angular/core';
const USER_GAMES_KEY = 'my_game_library_userGames';

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
	achievements: Achievement[];
}

interface Achievement {
	name: string;
	completed: boolean
}

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
	addGame(username: string, gameData: Partial<Game>): { success: boolean; message: string, game?: Game } {
		const userGames = this.getUserGames(username);
		const newGameId = gameData.id ?? Date.now();

		// Verifica si el juego ya existe en la biblioteca del usuario (por título y plataforma)
		const alreadyExists = userGames.some(game => game.title.toUpperCase() === gameData.title?.toUpperCase() && game.platform.toUpperCase() === gameData.platform?.toUpperCase());
		if (alreadyExists) {
			return { success: false, message: 'El juego ya está en tu biblioteca.' };
		}

		let gameAchievements = gameData.achievements ?? [];
		if (gameAchievements.length < 2) {
			const defaultAchievement1 = { name: "Completar Nivel 1", completed: false };
			const defaultAchievement2 = { name: "Derrotar Primer Jefe", completed: false };

			if (gameAchievements.length === 0) {
				gameAchievements = [defaultAchievement1, defaultAchievement2];
			} else if (gameAchievements.length === 1) {
				gameAchievements.push(defaultAchievement2);
			}
			const existingNames = new Set(gameAchievements.map(a => a.name));
			if (!existingNames.has(defaultAchievement1.name)) gameAchievements.push(defaultAchievement1);
			if (!existingNames.has(defaultAchievement2.name)) gameAchievements.push(defaultAchievement2);

			gameAchievements = gameAchievements.slice(0, 2);
		}

		const newGame: Game = {
			id: newGameId,
			title: gameData.title ?? 'Untitled Game',
			description: gameData.description ?? '',
			platform: gameData.platform ?? 'Unknown',
			genre: gameData.genre ?? 'Various',
			hoursPlayed: gameData.hoursPlayed ?? 0,
			image: gameData.image ?? 'https://placehold.co/400x250/374151/D1D5DB?text=No+Image',
			isFavorite: false,
			played: false,
			achievements: gameAchievements
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

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { catchError, of, Subscription } from 'rxjs';
import { ApiService } from 'src/app/core/api/api.service';
import { AuthService, User } from 'src/app/core/auth/auth.service';
import { Game, GameService } from 'src/app/core/game/game.service';
import { ConfirmationModalComponent } from 'src/app/shared/confirmation-modal/confirmation-modal.component';
import { GameDetailModalComponent } from 'src/app/shared/game-detail-modal/game-detail-modal.component';

/**
 * @description 
 * Componente para mostrar y gestionar la biblioteca personal de videojuegos del usuario.
 * @summary 
 * Permite a los usuarios ver sus juegos, filtrarlos por estado (jugado/pendiente) y favorito,
 * actualizar horas jugadas, marcar como favorito/no favorito, y eliminar juegos de su biblioteca.
 * También integra modales para ver detalles del juego y confirmar eliminaciones.
 * @usageNotes
 * ```html
 * <app-my-library></app-my-library>
 * ```
 */
@Component({
	selector: 'app-my-library',
	templateUrl: './my-library.component.html',
	styleUrls: ['./my-library.component.css']
})
export class MyLibraryComponent implements OnInit, OnDestroy {
	message = '';
	error = '';

	currentUser: User | null = null;
	allUserGames: Game[] = [];
	filteredGames: Game[] = [];

	searchTerm: string = '';
	selectedStatus: string = '';
	selectedFavorite: string = '';

	selectedGameForModal: Game | null = null;
	gameIdToDelete: number | null = null;

	// Propiedades para el modal de confirmación
	confirmationModalTitle: string = '';
	confirmationModalMessage: string = '';
	confirmationModalConfirmText: string = '';

	private authSubscription!: Subscription;

	@ViewChild(GameDetailModalComponent) gameDetailModal!: GameDetailModalComponent;
	@ViewChild(ConfirmationModalComponent) confirmationModal!: ConfirmationModalComponent;

	constructor(
		private readonly authService: AuthService,
		private readonly gameService: GameService,
		private readonly rawgApiService: ApiService
	) { }

	ngOnInit(): void {
		// Suscribe al estado de autenticación para cargar los juegos del usuario
		this.authSubscription = this.authService.currentUser.subscribe(user => {
			this.currentUser = user;
			if (this.currentUser) {
				this.loadUserGames();
			} else {
				this.allUserGames = [];
				this.filteredGames = [];
			}
		});
	}

	// Carga los juegos del usuario desde el GameService
	loadUserGames(): void {
		if (this.currentUser) {
			this.allUserGames = this.gameService.getUserGames(this.currentUser.username);
			this.filterAndRenderGames();
		}
	}

	// Filtra y renderiza los juegos en la vista
	filterAndRenderGames(): void {
		if (!this.currentUser) {
			this.filteredGames = [];
			return;
		}

		const searchTermLower = this.searchTerm.toLowerCase();
		const selectedStatusValue = this.selectedStatus;
		const selectedFavoriteValue = this.selectedFavorite;

		this.filteredGames = this.allUserGames.filter(game => {
			const matchesSearch = game.title.toLowerCase().includes(searchTermLower) ||
				game.description.toLowerCase().includes(searchTermLower) ||
				game.platform.toLowerCase().includes(searchTermLower) ||
				game.genre.toLowerCase().includes(searchTermLower);

			const matchesStatus = selectedStatusValue === '' ||
				(selectedStatusValue === 'jugado' && game.played) ||
				(selectedStatusValue === 'pendiente' && !game.played);

			const matchesFavorite = selectedFavoriteValue === '' ||
				(selectedFavoriteValue === 'favorito' && game.isFavorite) ||
				(selectedFavoriteValue === 'no-favorito' && !game.isFavorite);

			return matchesSearch && matchesStatus && matchesFavorite;
		});
	}

	// Maneja el toggle de favorito
	handleToggleFavorite(gameId: number): void {
		if (!this.currentUser) { this.error = 'Debes iniciar sesión para marcar favoritos.'; return; }
		const gameToUpdate = this.allUserGames.find(game => game.id === gameId);
		if (gameToUpdate) {
			gameToUpdate.isFavorite = !gameToUpdate.isFavorite;
			this.gameService.updateGame(this.currentUser.username, gameToUpdate);
			this.filterAndRenderGames();
		}
	}

	// Maneja el toggle de jugado/pendiente
	handleTogglePlayed(gameId: number): void {
		if (!this.currentUser) { this.error = 'Debes iniciar sesión para actualizar el estado.'; return; }
		const gameToUpdate = this.allUserGames.find(game => game.id === gameId);
		if (gameToUpdate) {
			gameToUpdate.played = !gameToUpdate.played;
			this.gameService.updateGame(this.currentUser.username, gameToUpdate);
			this.filterAndRenderGames();
		}
	}

	// Maneja la actualización de horas jugadas
	handleUpdateHoursPlayed(gameId: number): void {
		if (!this.currentUser) { this.error = 'Debes iniciar sesión para actualizar las horas.'; return; }
		const gameToUpdate = this.allUserGames.find(game => game.id === gameId);
		if (gameToUpdate) {
			const newHoursStr = prompt(`Introduce las horas jugadas para "${gameToUpdate.title}":`, String(gameToUpdate.hoursPlayed));
			if (newHoursStr !== null) {
				const parsedHours = parseFloat(newHoursStr);
				if (!isNaN(parsedHours) && parsedHours >= 0) {
					gameToUpdate.hoursPlayed = parsedHours;
					this.gameService.updateGame(this.currentUser.username, gameToUpdate);
					this.filterAndRenderGames();
				} else {
					this.error = 'Entrada no válida. Por favor, introduce un número positivo.';
				}
			}
		}
	}

	// Prepara y muestra el modal de confirmación para eliminar un juego
	handleDeleteGameConfirmation(gameId: number): void {
		if (!this.currentUser) {
			this.error = 'Debes iniciar sesión para eliminar juegos.';
			return;
		}
		const gameToDelete = this.allUserGames.find(game => game.id === gameId);
		if (gameToDelete) {
			this.gameIdToDelete = gameId; // Almacena el ID del juego a eliminar
			this.confirmationModalTitle = 'Eliminar Juego';
			this.confirmationModalMessage = `¿Estás seguro de que quieres eliminar "${gameToDelete.title}" de tu biblioteca? Esta acción no se puede deshacer.`;
			this.confirmationModalConfirmText = 'Eliminar';
			this.confirmationModal.show(); // Muestra el modal de confirmación
		}
	}

	// Maneja la respuesta del modal de confirmación
	onDeleteConfirmation(confirmed: boolean): void {
		if (confirmed && this.gameIdToDelete !== null) {
			if (!this.currentUser) { /* Esto no debería pasar si el guardián de arriba funciona */ return; }
			this.gameService.deleteGame(this.currentUser.username, this.gameIdToDelete);
			this.loadUserGames(); // Vuelve a cargar y renderizar los juegos
		}
		this.gameIdToDelete = null; // Limpia el ID del juego a eliminar
	}

	// Abre el modal de detalles del juego utilizando el componente modal hijo
	openGameDetailModal(game: Game): void {
		this.rawgApiService.getGameDetails(game.id).pipe(
			catchError(err => {
				console.error('Error al obtener detalles completos del juego de RAWG API:', err);
				return of(game);
			})
		).subscribe(fullDetailsGame => {
			this.selectedGameForModal = {
				...fullDetailsGame,
				achievements: game.achievements
			};
			if (this.gameDetailModal) {
				this.gameDetailModal.show();
			}
		});
	}

	ngOnDestroy(): void {
		if (this.authSubscription) {
			this.authSubscription.unsubscribe();
		}
	}
}

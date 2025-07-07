import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
	private loadGamesSubscription!: Subscription;

	@ViewChild(GameDetailModalComponent) gameDetailModal!: GameDetailModalComponent;
	@ViewChild(ConfirmationModalComponent) confirmationModal!: ConfirmationModalComponent;

	constructor(
		private readonly authService: AuthService,
		private readonly gameService: GameService,
		private readonly rawgApiService: ApiService,
        private readonly router: Router
	) { }

	ngOnInit(): void {
		this.authSubscription = this.authService.currentUser.subscribe(user => {
			this.currentUser = user;
			if (this.currentUser) {
				this.loadUserGames();
			} else {
				this.allUserGames = [];
				this.filteredGames = [];
                // Redirigir a login si no hay usuario
                this.router.navigate(['/login']);
			}
		});
	}

	// Carga los juegos del usuario desde el GameService
	loadUserGames(): void {
		if (this.currentUser) {
            // Cancelar suscripción anterior si existe
            if (this.loadGamesSubscription) {
                this.loadGamesSubscription.unsubscribe();
            }
            this.loadGamesSubscription = this.gameService.getUserGames(this.currentUser.username).subscribe({
                next: (games) => {
                    this.allUserGames = games;
                    this.filterAndRenderGames();
                },
                error: (err) => {
                    this.error = 'Error al cargar los juegos de tu biblioteca.';
                    console.error(err);
                    this.allUserGames = [];
                    this.filteredGames = [];
                }
            });
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
			const updatedGame = { ...gameToUpdate, isFavorite: !gameToUpdate.isFavorite };
			this.gameService.updateGame(this.currentUser.username, updatedGame).subscribe({
				next: (result) => {
					if(result.success) {
						this.loadUserGames(); // Recarga la lista para reflejar el cambio
					} else {
						this.error = result.message;
					}
				},
				error: (err) => {
					this.error = 'Error al actualizar el favorito.';
					console.error(err);
				}
			});
		}
	}

	// Maneja la actualización de horas jugadas
	handleTogglePlayed(gameId: number): void {
		if (!this.currentUser) { this.error = 'Debes iniciar sesión para actualizar el estado.'; return; }
		const gameToUpdate = this.allUserGames.find(game => game.id === gameId);
		if (gameToUpdate) {
			const updatedGame = { ...gameToUpdate, played: !gameToUpdate.played };
			this.gameService.updateGame(this.currentUser.username, updatedGame).subscribe({
                next: (result) => {
                    if(result.success) {
                        this.loadUserGames(); // Recarga la lista para reflejar el cambio
                    } else {
                        this.error = result.message;
                    }
                },
                error: (err) => {
                    this.error = 'Error al actualizar el estado de jugado.';
                    console.error(err);
                }
            });
		}
	}

	// Prepara y muestra el modal de confirmación para eliminar un juego
	handleUpdateHoursPlayed(gameId: number): void {
		if (!this.currentUser) { this.error = 'Debes iniciar sesión para actualizar las horas.'; return; }
		const gameToUpdate = this.allUserGames.find(game => game.id === gameId);
		if (gameToUpdate) {
			const newHoursStr = prompt(`Introduce las horas jugadas para "${gameToUpdate.title}":`, String(gameToUpdate.hoursPlayed));
			if (newHoursStr !== null) {
				const parsedHours = parseFloat(newHoursStr);
				if (!isNaN(parsedHours) && parsedHours >= 0) {
					const updatedGame = { ...gameToUpdate, hoursPlayed: parsedHours };
					this.gameService.updateGame(this.currentUser.username, updatedGame).subscribe({
                        next: (result) => {
                            if(result.success) {
                                this.loadUserGames(); // Recarga la lista para reflejar el cambio
                            } else {
                                this.error = result.message;
                            }
                        },
                        error: (err) => {
                            this.error = 'Error al actualizar las horas jugadas.';
                            console.error(err);
                        }
                    });
				} else {
					this.error = 'Entrada no válida. Por favor, introduce un número positivo.';
				}
			}
		}
	}

	handleDeleteGameConfirmation(gameId: number): void {
		if (!this.currentUser) {
			this.error = 'Debes iniciar sesión para eliminar juegos.';
			return;
		}
		const gameToDelete = this.allUserGames.find(game => game.id === gameId);
		if (gameToDelete) {
			this.gameIdToDelete = gameId;
			this.confirmationModalTitle = 'Eliminar Juego';
			this.confirmationModalMessage = `¿Estás seguro de que quieres eliminar "${gameToDelete.title}" de tu biblioteca? Esta acción no se puede deshacer.`;
			this.confirmationModalConfirmText = 'Eliminar';
			this.confirmationModal.show();
		}
	}

	// Maneja la respuesta del modal de confirmación
	onDeleteConfirmation(confirmed: boolean): void {
		if (confirmed && this.gameIdToDelete !== null) {
			if (!this.currentUser) { return; }
			this.gameService.deleteGame(this.currentUser.username, this.gameIdToDelete).subscribe({
                next: (result) => {
                    if(result.success) {
                        this.loadUserGames();
                    } else {
                        this.error = result.message;
                    }
                },
                error: (err) => {
                    this.error = 'Error al eliminar el juego.';
                    console.error(err);
                }
            });
		}
		this.gameIdToDelete = null;
	}

	// Abre el modal de detalles del juego utilizando el componente modal hijo
	openGameDetailModal(game: Game): void {
		this.router.navigate(['/juego', game.id]);
	}

	ngOnDestroy(): void {
		if (this.authSubscription) {
			this.authSubscription.unsubscribe();
		}
        if (this.loadGamesSubscription) {
            this.loadGamesSubscription.unsubscribe();
        }
	}
}

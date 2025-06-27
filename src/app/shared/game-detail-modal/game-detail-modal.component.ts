import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Game, GameService } from 'src/app/core/game/game.service';

declare let bootstrap: any;

/**
 * @description 
 * Componente para mostrar un modal con los detalles completos de un videojuego.
 * @summary 
 * Muestra el título, descripción, plataforma, género, horas de juego y una lista de logros.
 * Permite interactuar con el estado de los logros (marcar/desmarcar).
 * @usageNotes
 * ```html
 * <app-game-detail-modal [game]="selectedGame" (achievementUpdated)="onAchievementChange($event)"></app-game-detail-modal>
 * ```
 */
@Component({
	selector: 'app-game-detail-modal',
	templateUrl: './game-detail-modal.component.html',
	styleUrls: ['./game-detail-modal.component.css']
})
export class GameDetailModalComponent {
	message = '';
	error = '';

	/**
	 * @public
	 * @description El objeto Game cuyos detalles se van a mostrar en el modal.
	 */
	@Input() game: Game | null = null;

	/**
	 * @public
	 * @description Emite un objeto con el ID del juego, el índice del logro y el nuevo estado de completado
	 * cuando se actualiza un logro.
	 */
	@Output() achievementUpdated = new EventEmitter<{ gameId: number, achievementIndex: number, completed: boolean }>();

	/**
	 * @public
	 * @description Referencia al elemento nativo del modal en el DOM.
	 */
	@ViewChild('gameDetailModalElement') modalElementRef!: ElementRef;
	
	private bsModal: any;

	/**
	 * @param gameService Servicio para gestionar los juegos y sus logros en la biblioteca del usuario.
	 * @param authService Servicio de autenticación para verificar el usuario actual antes de guardar cambios.
	 */
	constructor(
		private readonly gameService: GameService,
		private readonly authService: AuthService
	) { }

	/**
	 * @lifecycle
	 * @description Hook que se ejecuta después de que la vista del componente ha sido inicializada.
	 * Inicializa la instancia del modal de Bootstrap y añade un listener para limpiar el estado del
	 * juego seleccionado y el backdrop cuando el modal se oculta.
	 * @returns {void}
	 */
	ngAfterViewInit(): void {
		if (this.modalElementRef?.nativeElement) {
			this.bsModal = new bootstrap.Modal(this.modalElementRef.nativeElement);

			this.modalElementRef.nativeElement.addEventListener('hidden.bs.modal', () => {
				this.game = null;

				const backdrop = document.querySelector('.modal-backdrop');
				if (backdrop) {
					backdrop.remove();
				}
			});
		}
	}

	/**
	 * @public
	 * @description Muestra el modal de detalles del juego.
	 * @returns {void}
	 */
	show(): void {
		if (this.bsModal) {
			this.bsModal.show();
		}
	}

	/**
	 * @public
	 * @description Oculta el modal de detalles del juego.
	 * @returns {void}
	 */
	hide(): void {
		if (this.bsModal) {
			this.bsModal.hide();
		}
	}

	/**
	 * @public
	 * @description Maneja el evento de cambio en el estado de un logro (checkbox).
	 * Actualiza el estado del logro en el `GameService` si el usuario está autenticado.
	 * @param {number} gameId El ID del juego al que pertenece el logro.
	 * @param {number} achievementIndex El índice del logro dentro del array de logros del juego.
	 * @param {Event} event El evento de cambio del checkbox.
	 * @returns {void}
	 */
	onAchievementChange(gameId: number, achievementIndex: number, event: Event): void {
		const currentUser = this.authService.getCurrentUser;
		if (!currentUser) {
			this.error = 'Debes iniciar sesión para guardar el progreso de logros.';
			(event.target as HTMLInputElement).checked = !(event.target as HTMLInputElement).checked;
			return;
		}
		const isCompleted = (event.target as HTMLInputElement).checked;

		// Obtiene los juegos del usuario desde el servicio
		const userGames = this.gameService.getUserGames(currentUser.username);
		const gameToUpdate = userGames.find(g => g.id === gameId);

		if (gameToUpdate?.achievements) {
			gameToUpdate.achievements[achievementIndex].completed = isCompleted;
			this.gameService.updateGame(currentUser.username, gameToUpdate);
			this.achievementUpdated.emit({ gameId, achievementIndex, completed: isCompleted });
		}
	}
}

import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Game, GameService } from 'src/app/core/game/game.service';

declare let bootstrap: any;

@Component({
	selector: 'app-game-detail-modal',
	templateUrl: './game-detail-modal.component.html',
	styleUrls: ['./game-detail-modal.component.css']
})
export class GameDetailModalComponent {
	@Input() game: Game | null = null;

	@Output() achievementUpdated = new EventEmitter<{ gameId: number, achievementIndex: number, completed: boolean }>();

	@ViewChild('gameDetailModalElement') modalElementRef!: ElementRef;
	private bsModal: any;

	constructor(
		private readonly gameService: GameService,
		private readonly authService: AuthService
	) { }

	ngAfterViewInit(): void {
		if (this.modalElementRef && this.modalElementRef.nativeElement) {
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

	onAchievementChange(gameId: number, achievementIndex: number, event: Event): void {
		const currentUser = this.authService.getCurrentUser;
		if (!currentUser) {
			alert("Debes iniciar sesión para guardar el progreso de logros.");
			(event.target as HTMLInputElement).checked = !(event.target as HTMLInputElement).checked;
			return;
		}
		const isCompleted = (event.target as HTMLInputElement).checked;

		// Obtiene los juegos del usuario desde el servicio
		const userGames = this.gameService.getUserGames(currentUser.username);
		const gameToUpdate = userGames.find(g => g.id === gameId);

		if (gameToUpdate && gameToUpdate.achievements && gameToUpdate.achievements[achievementIndex]) {
			gameToUpdate.achievements[achievementIndex].completed = isCompleted;
			this.gameService.updateGame(currentUser.username, gameToUpdate);
			this.achievementUpdated.emit({ gameId, achievementIndex, completed: isCompleted });
		}
	}
}

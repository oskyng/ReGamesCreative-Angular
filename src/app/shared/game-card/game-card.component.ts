import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Game } from 'src/app/core/game/game.service';

/**
 * @description 
 * Componente para mostrar una tarjeta de juego individual.
 * @summary 
 * Utilizado en las páginas de categorías y en la biblioteca personal,
 * muestra información del juego y proporciona botones de acción que emiten eventos al componente padre.
 * Puede mostrar controles adicionales si se usa en la biblioteca personal.
 * @usageNotes
 * ```html
 * <!-- Uso en página de categorías -->
 * <app-game-card [game]="myGame" (addGameToLibrary)="onAddGame($event)"></app-game-card>
 *
 * <!-- Uso en mi biblioteca -->
 * <app-game-card [game]="myLibraryGame" [showLibraryControls]="true" (deleteGame)="onDeleteGame($event)"></app-game-card>
 * ```
 */
@Component({
	selector: 'app-game-card',
	templateUrl: './game-card.component.html',
	styleUrls: ['./game-card.component.css']
})
export class GameCardComponent {
	@Input() game!: Game;
	@Input() showLibraryControls: boolean = false;

	@Output() addGameToLibrary = new EventEmitter<Game>();
	@Output() viewDetails = new EventEmitter<Game>();
	@Output() toggleFavorite = new EventEmitter<number>();
	@Output() togglePlayed = new EventEmitter<number>();
	@Output() updateHours = new EventEmitter<number>();
	@Output() deleteGame = new EventEmitter<number>();

	constructor() { }

}

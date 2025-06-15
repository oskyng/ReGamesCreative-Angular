import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Game } from 'src/app/core/game/game.service';

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

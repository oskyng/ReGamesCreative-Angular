import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryComponent } from './category.component';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Game } from 'src/app/core/game/game.service';
import { User } from 'src/app/core/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

// Mock del componente GameCardComponent
@Component({
	selector: 'app-game-card',
	template: `
    <div class="mock-game-card">
      <h3>{{ game.title }}</h3>
      <button (click)="addGameToLibrary.emit(game)">Add to Library</button>
      <button (click)="viewDetails.emit(game)">View Details</button>
    </div>
  `
})
class MockGameCardComponent {
	@Input() game!: Game;
	@Input() showLibraryControls: boolean = false;
	@Output() addGameToLibrary = new EventEmitter<Game>();
	@Output() viewDetails = new EventEmitter<Game>();
	@Output() toggleFavorite = new EventEmitter<number>();
	@Output() togglePlayed = new EventEmitter<number>();
	@Output() updateHours = new EventEmitter<number>();
	@Output() deleteGame = new EventEmitter<number>();
}

// Mock del componente GameDetailModalComponent
@Component({
	selector: 'app-game-detail-modal',
	template: '<div class="mock-modal"></div>'
})
class MockGameDetailModalComponent {
	@Input() game: Game | null = null;
	show = jasmine.createSpy('show'); // Spy para el método show
}

describe('CategoryComponent', () => {
	let component: CategoryComponent;
	let fixture: ComponentFixture<CategoryComponent>;
	let activatedRouteSpy: { data: BehaviorSubject<any> }

	const mockAdminUser: User = { username: 'admin', role: 'admin', fullName: 'Admin', email: '', birthDay: '', password: '' };

	// Datos de prueba para juegos (simulando una categoría)
	const mockGames: Game[] = [
		{ id: 1, title: 'Game A', description: 'Desc A', platform: 'PC', genre: 'Action', hoursPlayed: 10, image: '', isFavorite: false, played: false, achievements: [] },
		{ id: 2, title: 'Game B', description: 'Desc B', platform: 'PS5', genre: 'RPG', hoursPlayed: 20, image: '', isFavorite: false, played: false, achievements: [] },
		{ id: 3, title: 'Game C', description: 'Desc C', platform: 'PC, Xbox', genre: 'Action, Adventure', hoursPlayed: 30, image: '', isFavorite: false, played: false, achievements: [] },
	];

	beforeEach(async () => {
		activatedRouteSpy = {
			data: new BehaviorSubject({ category: 'Acción' })
		};

		await TestBed.configureTestingModule({
			declarations: [
				CategoryComponent,
				MockGameCardComponent,
				MockGameDetailModalComponent
			],
			imports: [FormsModule],
			providers: [
				{ provide: ActivatedRoute, useValue: activatedRouteSpy }
			]
		}).compileComponents();
		fixture = TestBed.createComponent(CategoryComponent);
		component = fixture.componentInstance;
		component.allGames = [...mockGames];
		fixture.detectChanges();
	});

	it('debería crearse', () => {
		expect(component).toBeTruthy();
	});

	it('debería cargar los juegos y la categoría desde ActivatedRoute', () => {
		expect(component.categoryName).toBe('Acción');
		expect(component.allGames.length).toBeGreaterThan(0); // Verifica que los juegos se cargaron
		expect(component.filteredGames.length).toBe(component.allGames.length); // Todos los juegos inicialmente
	});
});

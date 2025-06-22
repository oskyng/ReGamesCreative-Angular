import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyLibraryComponent } from './my-library.component';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Game } from 'src/app/core/game/game.service';
import { Router } from '@angular/router';

// Mock del GameCardComponent
@Component({
  selector: 'app-game-card',
  template: `
    <div class="mock-game-card" [attr.data-game-id]="game.id">
      <h4>{{game.title}}</h4>
      <span class="badge" [ngClass]="game.played ? 'bg-success' : 'bg-warning'">{{ game.played ? 'Jugado' : 'Pendiente' }}</span>
      <button class="toggle-favorite-btn" (click)="toggleFavorite.emit(game.id)"></button>
      <button class="toggle-played-btn" (click)="togglePlayed.emit(game.id)"></button>
      <button class="update-hours-btn" (click)="updateHours.emit(game.id)"></button>
      <button class="delete-game-btn" (click)="deleteGame.emit(game.id)"></button>
      <button class="view-details-btn" (click)="viewDetails.emit(game)"></button>
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

// Mock del GameDetailModalComponent
@Component({
  selector: 'app-game-detail-modal',
  template: '<div class="mock-game-detail-modal"></div>'
})
class MockGameDetailModalComponent {
  @Input() game: Game | null = null;
  show = jasmine.createSpy('show');
}

// Mock del ConfirmationModalComponent
@Component({
  selector: 'app-confirmation-modal',
  template: '<div class="mock-confirmation-modal"></div>'
})
class MockConfirmationModalComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() confirmButtonText: string = '';
  @Output() confirmed = new EventEmitter<boolean>();
  show = jasmine.createSpy('show'); // Espía el método show
}

describe('MyLibraryComponent', () => {
  let component: MyLibraryComponent;
  let fixture: ComponentFixture<MyLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MyLibraryComponent,
        MockGameCardComponent,
        MockGameDetailModalComponent,
        MockConfirmationModalComponent
      ],
      imports: [FormsModule],
      providers: [
        { provide: Router, useValue: { navigate: () => { } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});

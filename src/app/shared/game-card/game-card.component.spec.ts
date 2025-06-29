import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCardComponent } from './game-card.component';
import { Game } from 'src/app/core/game/game.service';

describe('GameCardComponent', () => {
  let component: GameCardComponent;
  let fixture: ComponentFixture<GameCardComponent>;
  // Datos de prueba para un juego
  const testGame: Game = {
    id: 1,
    title: 'Test Game',
    description: 'This is a test game description.',
    platform: 'PC',
    genre: 'Adventure',
    hoursPlayed: 50,
    image: 'https://placehold.co/400x250/374151/D1D5DB?text=Test+Game',
    isFavorite: false,
    played: false,
    achievements: [
      {
        id: 1,
        name: "test",
        description: "test",
        image: "no_image",
        percent: "1.5",
        completed: true,
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GameCardComponent);
    component = fixture.componentInstance;
    component.game = { ...testGame };
    fixture.detectChanges();
  });


  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});

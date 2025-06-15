import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameDetailModalComponent } from './game-detail-modal.component';

describe('GameDetailModalComponent', () => {
  let component: GameDetailModalComponent;
  let fixture: ComponentFixture<GameDetailModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameDetailModalComponent]
    });
    fixture = TestBed.createComponent(GameDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

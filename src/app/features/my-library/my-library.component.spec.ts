import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MyLibraryComponent } from './my-library.component';
import { ApiService } from 'src/app/core/api/api.service';
import { AuthService, User } from 'src/app/core/auth/auth.service';
import { GameService, Game } from 'src/app/core/game/game.service';
import { Observable, of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';


describe('MyLibraryComponent', () => {
  let component: MyLibraryComponent;
  let fixture: ComponentFixture<MyLibraryComponent>;

  // Mocks para los servicios
  const mockApiService = {
    getGameDetails: jasmine.createSpy('getGameDetails').and.returnValue(of({} as Game)),
    getGameAchievements: jasmine.createSpy('getGameAchievements').and.returnValue(of([]))
  };

  const mockAuthService = {
    currentUser: of(null) as Observable<User | null>,
    getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue(null)
  };

  const mockGameService = {
    getUserGames: jasmine.createSpy('getUserGames').and.returnValue([]),
    updateGame: jasmine.createSpy('updateGame').and.returnValue({ success: true }),
    deleteGame: jasmine.createSpy('deleteGame').and.returnValue({ success: true })
  };

  // Mocks para los componentes hijos @ViewChild
  const mockGameDetailModalComponent = {
    show: jasmine.createSpy('show')
  };

  const mockConfirmationModalComponent = {
    show: jasmine.createSpy('show'),
    hide: jasmine.createSpy('hide')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [
        MyLibraryComponent
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GameService, useValue: mockGameService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MyLibraryComponent);
    component = fixture.componentInstance;

    // Asigna los mocks a las propiedades @ViewChild del componente
    component.gameDetailModal = mockGameDetailModalComponent as any;
    component.confirmationModal = mockConfirmationModalComponent as any;

    // Resetear espías para cada test
    mockApiService.getGameDetails.calls.reset();
    mockApiService.getGameAchievements.calls.reset();
    mockAuthService.currentUser = of(null) as Observable<User | null>;
    mockAuthService.getCurrentUser.calls.reset();
    mockGameService.getUserGames.calls.reset();
    mockGameService.updateGame.calls.reset();
    mockGameService.deleteGame.calls.reset();
    mockGameDetailModalComponent.show.calls.reset();
    mockConfirmationModalComponent.show.calls.reset();
    mockConfirmationModalComponent.hide.calls.reset();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('no debería cargar juegos si no hay usuario logueado', () => {
    mockAuthService.currentUser = of(null);

    fixture.detectChanges();

    expect(component.currentUser).toBeNull();
    expect(mockGameService.getUserGames).not.toHaveBeenCalled();
    expect(component.allUserGames).toEqual([]);
    expect(component.filteredGames).toEqual([]);
  });

  it('debería desuscribirse de las suscripciones al destruir el componente', () => {
    // Necesitamos una instancia real de Subscription para espiar
    const authSub = of(null).subscribe();
    (component as any).authSubscription = authSub; // Asignar el Subscription real para poder espiar su método unsubscribe

    spyOn(authSub, 'unsubscribe');

    component.ngOnDestroy();

    expect(authSub.unsubscribe).toHaveBeenCalled();
  });
});
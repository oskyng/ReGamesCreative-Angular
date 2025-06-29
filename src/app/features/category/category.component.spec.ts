import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CategoryComponent } from './category.component';
import { ApiService } from 'src/app/core/api/api.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { GameService } from 'src/app/core/game/game.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CategoryComponent', () => {
	let component: CategoryComponent;
	let fixture: ComponentFixture<CategoryComponent>;
	let httpTestingController: HttpTestingController;

	const mockActivatedRoute = {
		paramMap: of(convertToParamMap({ categorySlug: 'action' }))
	};

	let getGamesSpy: jasmine.Spy;
	let getGenresSpy: jasmine.Spy;
	let getPlatformsSpy: jasmine.Spy;

	const mockApiService = {
		getGames: (searchText: string, categorySlug: string, page: number) => {
			const mockData = [{ id: 1, title: 'Game 1', description: 'desc', platform: 'PC', genre: 'Action', image: '', hoursPlayed: 0, played: false, isFavorite: false }];
			return of(mockData);
		},
		getGenres: () => of(['Action', 'Adventure', 'Sports']),
		getPlatforms: () => of(['PC', 'PlayStation', 'Xbox']),
		getGameDetails: (id: number) => of({ id: id, title: 'Mock Game Details', description: 'details', platform: 'PC', genre: 'Action', image: '', hoursPlayed: 0, played: false, isFavorite: false }),
		getGameAchievements: (id: number) => of([{ name: 'Mock Achievement', description: 'desc', completed: false }])
	};

	const mockAuthService = {
		init: jasmine.createSpy('init').and.callThrough(),
		currentUser: of(null),
		getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue(null)
	};

	const mockGameService = {
		addGame: jasmine.createSpy('addGame').and.returnValue({ success: true, message: 'Juego añadido.' }),
		updateGame: jasmine.createSpy('updateGame').and.returnValue({ success: true, message: 'Juego actualizado.' })
	};

	const mockGameDetailModalComponent = {
		show: jasmine.createSpy('show')
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientTestingModule
			],
			declarations: [
				CategoryComponent
			],
			providers: [
				{ provide: ActivatedRoute, useValue: mockActivatedRoute },
				{ provide: ApiService, useValue: mockApiService },
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: GameService, useValue: mockGameService }
			],
			schemas: [NO_ERRORS_SCHEMA]
		}).compileComponents();

		fixture = TestBed.createComponent(CategoryComponent);
		component = fixture.componentInstance;
		httpTestingController = TestBed.inject(HttpTestingController);

		getGamesSpy = spyOn(mockApiService, 'getGames').and.callThrough();
		getGenresSpy = spyOn(mockApiService, 'getGenres').and.callThrough();
		getPlatformsSpy = spyOn(mockApiService, 'getPlatforms').and.callThrough();

		component.gameDetailModal = mockGameDetailModalComponent as any;
	});

	afterEach(() => {
		httpTestingController.verify();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('debería cargar los juegos y la categoría desde ActivatedRoute', () => {
		fixture.detectChanges();

		expect(component.categorySlug).toBe('action');
		expect(component.categoryName).toBe('Action');

		expect(getGamesSpy).toHaveBeenCalledWith('', 'action');
		expect(getGenresSpy).toHaveBeenCalled();
		expect(getPlatformsSpy).toHaveBeenCalled();

		expect(component.allGames.length).toBeGreaterThan(0);
		expect(component.availableGenres.length).toBeGreaterThan(0);
		expect(component.availablePlatforms.length).toBeGreaterThan(0);
	});

	it('debería manejar los errores de carga de API con un mensaje', () => {
		getGamesSpy.and.returnValue(throwError(() => new Error('API Error')));
		getGenresSpy.and.returnValue(of([]));
		getPlatformsSpy.and.returnValue(of([]));

		spyOn(window, 'alert');

		fixture.detectChanges();

		expect(window.alert).toHaveBeenCalledWith('Error al cargar videojuegos para esta categoría. Por favor, revisa tu clave API o inténtalo más tarde.');
		expect(component.allGames).toEqual([]);
		expect(component.availableGenres).toEqual([]);
		expect(component.availablePlatforms).toEqual([]);
	});

});
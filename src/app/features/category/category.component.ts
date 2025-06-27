import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of, Subscription, switchMap } from 'rxjs';
import { ApiService } from 'src/app/core/api/api.service';
import { User, AuthService } from 'src/app/core/auth/auth.service';
import { Game, GameService } from 'src/app/core/game/game.service';
import { GameDetailModalComponent } from 'src/app/shared/game-detail-modal/game-detail-modal.component';

declare let bootstrap: any;

/**
 * @description 
 * Componente para mostrar una lista de videojuegos filtrados por categoría.
 * @summary 
 * Este componente recupera juegos, géneros y plataformas de la API de RAWG,
 * permite la búsqueda y el filtrado, y ofrece funcionalidad para añadir juegos a la
 * biblioteca del usuario y ver detalles en un modal.
 * @usageNotes
 * ```html
 * <app-category></app-category>
 * ```
 */
@Component({
	selector: 'app-category',
	templateUrl: './category.component.html',
	styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit, OnDestroy {
	message = '';
	error = '';
	categoryName: string = '';
	categorySlug: string = '';
	allGames: Game[] = [];
	filteredGames: Game[] = [];

	searchTerm: string = '';
	selectedPlatform: string = '';
	selectedGenre: string = '';

	availablePlatforms: string[] = [];
	availableGenres: string[] = [];

	selectedGameForModal: Game | null = null;

	private routeSubscription!: Subscription;
	private authSubscription!: Subscription;
	currentUser: User | null = null;

	@ViewChild(GameDetailModalComponent) gameDetailModal!: GameDetailModalComponent;

	constructor(
		private readonly route: ActivatedRoute,
		private readonly authService: AuthService,
		private readonly gameService: GameService,
		private readonly rawgApiService: ApiService
	) { }

	ngOnInit(): void {
		this.authService.init();
		this.authSubscription = this.authService.currentUser.subscribe(user => {
			this.currentUser = user;
		});

		this.routeSubscription = this.route.paramMap.pipe(
			switchMap(params => {
				this.categorySlug = params.get('categorySlug') ?? '';
				this.categoryName = this.capitalizeFirstLetter(this.categorySlug.replace(/-/g, ' '));
				this.resetFilters();
				return forkJoin({
					games: this.rawgApiService.getGames('', this.categorySlug),
					genres: this.rawgApiService.getGenres(),
					platforms: this.rawgApiService.getPlatforms()
				});
			})
		).subscribe({
			next: ({ games, genres, platforms }) => {
				this.allGames = games;
				this.availableGenres = genres;
				this.availablePlatforms = platforms;
				this.filterGames();
			},
			error: (err) => {
				console.error('Error al cargar datos de RAWG API para la categoría:', this.categorySlug, err);
				this.allGames = [];
				this.availableGenres = [];
				this.availablePlatforms = [];
				alert('Error al cargar videojuegos para esta categoría. Por favor, revisa tu clave API o inténtalo más tarde.');
			}
		});
	}

	private capitalizeFirstLetter(str: string): string {
		if (!str) return '';
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	loadGamesAndFiltersFromRawg(category: string): void {
		const categorySlug = category.toLowerCase().replace(/\s/g, '-');

		// Usar forkJoin para hacer múltiples llamadas API en paralelo
		forkJoin({
			games: this.rawgApiService.getGames('', categorySlug),
			genres: this.rawgApiService.getGenres(),
			platforms: this.rawgApiService.getPlatforms()
		}).subscribe({
			next: ({ games, genres, platforms }) => {
				this.allGames = games;
				this.availableGenres = genres;
				this.availablePlatforms = platforms;
				this.filterGames();
			},
			error: (err) => {
				console.error('Error al cargar datos de RAWG API:', err);
				this.allGames = [];
				this.availableGenres = [];
				this.availablePlatforms = [];
				alert('Error al cargar videojuegos. Por favor, revisa tu clave API o inténtalo más tarde.');
			}
		});
	}

	// Extrae las opciones únicas de plataforma y género de los juegos cargados
	extractFilterOptions(): void {
		const platforms = new Set<string>();
		const genres = new Set<string>();

		this.allGames.forEach(game => {
			game.platform.split(',').map(p => p.trim()).forEach(p => platforms.add(p));
			game.genre.split(',').map(g => g.trim()).forEach(g => genres.add(g));
		});

		this.availablePlatforms = Array.from(platforms).sort((a, b) => a.localeCompare(b));
		this.availableGenres = Array.from(genres).sort((a, b) => a.localeCompare(b));
	}

	// Restablece los filtros de búsqueda
	resetFilters(): void {
		this.searchTerm = '';
		this.selectedPlatform = '';
		this.selectedGenre = '';
		this.filterGames();
	}

	// Filtra los juegos basándose en los criterios de búsqueda y selección
	filterGames(): void {
		const searchTermLower = this.searchTerm.toLowerCase();
		const selectedPlatformLower = this.selectedPlatform.toLowerCase();
		const selectedGenreLower = this.selectedGenre.toLowerCase();

		this.filteredGames = this.allGames.filter(game => {
			const matchesSearch = game.title.toLowerCase().includes(searchTermLower) ||
				game.description.toLowerCase().includes(searchTermLower);

			const matchesPlatform = selectedPlatformLower === '' || game.platform.toLowerCase().includes(selectedPlatformLower);
			const matchesGenre = selectedGenreLower === '' || game.genre.toLowerCase().includes(selectedGenreLower);

			return matchesSearch && matchesPlatform && matchesGenre;
		});
	}

	// Maneja el evento cuando se hace clic en "Añadir a Mi Biblioteca"
	handleAddToLibrary(game: Game): void {
		const currentUser = this.authService.getCurrentUser;
		if (!currentUser) {
			alert('Debes iniciar sesión para añadir juegos a tu biblioteca.');
			return;
		}

		this.rawgApiService.getGameAchievements(game.id).subscribe({
			next: (achievements) => {
				const gameWithAchievements: Game = { ...game, achievements: achievements };
				const result = this.gameService.addGame(currentUser.username, gameWithAchievements);
				alert(result.message);
			},
			error: (err) => {
				console.warn('No se pudieron cargar los logros para el juego:', game.title, err);
				const result = this.gameService.addGame(currentUser.username, game);
				alert(result.message + ' (Logros no cargados debido a un error de API)');
			}
		});
	}

	// Abre el modal de detalles del juego y pasa el juego seleccionado
	openGameDetailModal(game: Game): void {
		// Usar forkJoin para obtener los detalles completos del juego Y sus logros en paralelo
		forkJoin({
			details: this.rawgApiService.getGameDetails(game.id),
			achievements: this.rawgApiService.getGameAchievements(game.id).pipe(
				catchError(err => {
					console.error('Error al obtener logros para el juego', game.id, err);
					return of([]);
				})
			)
		}).subscribe({
			next: ({ details, achievements }) => {
				this.selectedGameForModal = { ...details, achievements: achievements };
				if (this.gameDetailModal) {
					this.gameDetailModal.show();
				}
			},
			error: (err) => {
				console.error('Error al cargar detalles o logros del juego de RAWG API:', err);
				this.selectedGameForModal = game;
				if (this.gameDetailModal) {
					this.gameDetailModal.show();
				}
				alert('Error al cargar los detalles completos del videojuego o sus logros.');
			}
		});
	}

	ngOnDestroy(): void {
		if (this.routeSubscription) {
			this.routeSubscription.unsubscribe();
		}
		if (this.authSubscription) {
			this.authSubscription.unsubscribe();
		}
	}
}

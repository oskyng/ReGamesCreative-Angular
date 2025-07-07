import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, forkJoin, map, Observable, of, Subscription, switchMap } from 'rxjs';
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

	currentPage: number = 1;
	hasMorePages: boolean = true;
	isLoading: boolean = false;

	constructor(
		private readonly route: ActivatedRoute,
		private readonly router: Router,
		private readonly authService: AuthService,
		private readonly gameService: GameService,
		private readonly rawgApiService: ApiService,
		private readonly elementRef: ElementRef
	) { }

	/**
	 * @lifecycle
	 * @description Hook de inicialización del componente.
	 * Inicializa la autenticación, se suscribe al usuario actual y carga
	 * los juegos y filtros basados en el slug de la categoría de la URL.
	 * Ahora maneja la carga inicial de la primera página de juegos.
	 * @returns {void}
	 */
	ngOnInit(): void {
		this.authService.init();
		this.authSubscription = this.authService.currentUser.subscribe(user => {
			this.currentUser = user;
		});

		this.routeSubscription = this.route.paramMap.pipe(
			switchMap(params => {
				this.categorySlug = params.get('categorySlug') ?? '';
				this.categoryName = this.capitalizeFirstLetter(this.categorySlug.replace(/-/g, ' '));
				this.resetPaginationAndFilters(); // Resetear filtros y estado de paginación

				// Cargar géneros y plataformas solo una vez, y la primera página de juegos
				return forkJoin({
					genres: this.rawgApiService.getGenres(),
					platforms: this.rawgApiService.getPlatforms()
				}).pipe(
					// Luego de cargar géneros y plataformas, cargar la primera página de juegos
					switchMap(({ genres, platforms }) => {
						this.availableGenres = genres;
						this.availablePlatforms = platforms;
						return this.loadGames(this.categorySlug, this.currentPage);
					})
				);
			})
		).subscribe({
			next: ({ games, next }) => {
				this.allGames = games;
				this.hasMorePages = !!next;
				this.filterGames();
				this.isLoading = false;
			},
			error: (err) => {
				console.error('Error al cargar datos de RAWG API para la categoría:', this.categorySlug, err);
				this.allGames = [];
				this.availableGenres = [];
				this.availablePlatforms = [];
				alert('Error al cargar videojuegos para esta categoría. Por favor, revisa tu clave API o inténtalo más tarde.');
				this.isLoading = false;
			}
		});
	}

	/**
	 * @private
	 * @description Carga juegos de la API RAWG para una categoría y página específica.
	 * @param {string} categorySlug - El slug de la categoría.
	 * @param {number} page - El número de página a cargar.
	 * @returns {Observable<{ games: Game[], next: string | null }>} Un observable con los juegos y el enlace a la siguiente página.
	 */
	private loadGames(categorySlug: string, page: number): Observable<{ games: Game[], next: string | null }> {
		this.isLoading = true;
		return this.rawgApiService.getGames('', categorySlug, page).pipe(
			map(response => ({ games: response.results, next: response.next })),
			catchError(err => {
				console.error('Error al cargar más juegos:', err);
				this.error = 'Error al cargar más juegos. Inténtalo de nuevo.';
				return of({ games: [], next: null });
			}),
			finalize(() => this.isLoading = false)
		);
	}

	/**
	 * @public
	 * @description Maneja el evento de scroll de la ventana.
	 * Carga más juegos si el usuario se acerca al final de la página y hay más páginas disponibles.
	 * @param {Event} event - El evento de scroll.
	 * @returns {void}
	 */
	@HostListener('window:scroll', ['$event'])
	onScroll(event: Event): void {
		// Calcular la posición actual del scroll
		const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
		// Calcular la altura total del contenido del documento
		const documentHeight = document.documentElement.scrollHeight;
		// Altura de la ventana visible
		const windowHeight = window.innerHeight;

		// Comprobar si el usuario está cerca del final (por ejemplo, a 200px del final)
		if (scrollPosition + windowHeight >= documentHeight - 200 && this.hasMorePages && !this.isLoading) {
			this.loadMoreGames();
		}
	}

	/**
	 * @public
	 * @description Carga la siguiente página de juegos si está disponible.
	 * @returns {void}
	 */
	loadMoreGames(): void {
		if (this.hasMorePages && !this.isLoading) {
			this.currentPage++;
			this.isLoading = true;
			this.rawgApiService.getGames(this.searchTerm, this.categorySlug, this.currentPage)
				.pipe(
					finalize(() => this.isLoading = false),
					catchError(err => {
						console.error('Error loading more games:', err);
						this.error = 'Error al cargar más juegos.';
						this.hasMorePages = false;
						return of({ results: [], next: null });
					})
				)
				.subscribe(response => {
					this.allGames = [...this.allGames, ...response.results];
					this.hasMorePages = !!response.next;
					this.filterGames();
				});
		}
	}

	/**
	 * @private
	 * @description Capitaliza la primera letra de una cadena.
	 * @param {string} str La cadena a capitalizar.
	 * @returns {string} La cadena con la primera letra en mayúscula.
	 */
	private capitalizeFirstLetter(str: string): string {
		if (!str) return '';
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	/**
	 * @public
	 * @description Restablece todos los filtros y el estado de paginación a sus valores iniciales.
	 * Esto prepara el componente para una nueva carga de la primera página de juegos.
	 * @returns {void}
	 */
	resetPaginationAndFilters(): void {
		this.searchTerm = '';
		this.selectedPlatform = '';
		this.selectedGenre = '';
		this.currentPage = 1;
		this.allGames = [];
		this.hasMorePages = true;
		this.isLoading = false;
		this.filteredGames = [];
	}

	/**
	 * @public
	 * @description Filtra la lista de juegos basándose en el término de búsqueda, la plataforma seleccionada y el género seleccionado.
	 * Se aplica a la lista `allGames` que se va acumulando.
	 * @returns {void}
	 */
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

	/**
	 * @public
	 * @description Maneja el evento cuando se hace clic en "Añadir a Mi Biblioteca" para un juego.
	 * Intenta añadir el juego a la biblioteca del usuario, incluyendo sus logros si están disponibles en la API.
	 * @param {Game} game El objeto Game a añadir a la biblioteca.
	 * @returns {void}
	 */
	handleAddToLibrary(game: Game): void {
		const currentUser = this.authService.getCurrentUser;
		if (!currentUser) {
			alert('Debes iniciar sesión para añadir juegos a tu biblioteca.');
			return;
		}

		this.rawgApiService.getGameAchievements(game.id).subscribe({
			next: (achievements) => {
				const gameWithAchievements: Game = { ...game, achievements: achievements };
				this.gameService.addGame(currentUser.username, gameWithAchievements).subscribe({
					next: (result) => {
						alert(result.message);
					},
					error: (err) => {
						console.error('Error al añadir el juego:', err);
						alert('Error al añadir el juego a la biblioteca.');
					}
				});
			},
			error: (err) => {
				console.warn('No se pudieron cargar los logros para el juego:', game.title, err);
				this.gameService.addGame(currentUser.username, game).subscribe({
					next: (result) => {
						alert(result.message + ' (Logros no cargados debido a un error de API)');
					},
					error: (err) => {
						console.error('Error al añadir el juego:', err);
						alert('Error al añadir el juego a la biblioteca.');
					}
				});
			}
		});
	}

	/**
	 * @public
	 * @description Navega a la página de detalles del juego.
	 * @param {Game} game El objeto Game cuyos detalles se van a mostrar.
	 * @returns {void}
	 */
	openGameDetailModal(game: Game): void {
		this.router.navigate(['/game', game.id]);
	}

	/**
	 * @lifecycle
	 * @description Hook de destrucción del componente. Desuscribe las suscripciones para evitar fugas de memoria.
	 * @returns {void}
	 */
	ngOnDestroy(): void {
		if (this.routeSubscription) {
			this.routeSubscription.unsubscribe();
		}
		if (this.authSubscription) {
			this.authSubscription.unsubscribe();
		}
	}
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { User, AuthService } from 'src/app/core/auth/auth.service';
import { Game, GameService } from 'src/app/core/game/game.service';

declare let bootstrap: any;

@Component({
	selector: 'app-category',
	templateUrl: './category.component.html',
	styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit, OnDestroy {
	message = '';
	error = '';
	categoryName: string = '';
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

	constructor(
		private readonly route: ActivatedRoute,
		private readonly authService: AuthService,
		private readonly gameService: GameService
	) { }

	ngOnInit(): void {
		this.authService.init();
		this.authSubscription = this.authService.currentUser.subscribe(user => {
			this.currentUser = user;
		});

		this.routeSubscription = this.route.data.subscribe(data => {
			this.categoryName = data['category'];
			this.loadGamesByCategory(this.categoryName);
			this.resetFilters();
		});
	}

	// Carga los juegos según la categoría seleccionada
	loadGamesByCategory(category: string): void {
		// Esto vendría de una API: https://api.rawg.io/api
		switch (category) {
			case 'Acción':
				this.allGames = [
					{
						id: 1, title: "Call of Duty: Modern Warfare III", description: "La secuela directa del éxito de 2022, con una campaña que continúa la historia y un renovado modo multijugador.",
						platform: "PC, PS5, Xbox Series X/S", genre: "FPS", hoursPlayed: 8, image: "assets/img/Call_of_Duty_Modern_Warfare_III.jpg", isFavorite: false, played: false, achievements: [{ name: "Primera Sangre", completed: false }, { name: "Victoria en Equipo", completed: false }]
					},
					{
						id: 2, title: "Marvel's Spider-Man 2", description: "Peter Parker y Miles Morales se unen para enfrentar nuevas amenazas en Nueva York.",
						platform: "PS5, PC", genre: "Acción, Aventura", hoursPlayed: 17, image: "assets//img/Marvels__Spider_Man_2.jpg", isFavorite: false, played: false, achievements: [{ name: "Telaraña Maestra", completed: false }, { name: "Héroe de la Ciudad", completed: false }]
					},
					{
						id: 3, title: "God of War Ragnarök", description: "Kratos y Atreus se embarcan en una épica búsqueda mientras el Ragnarök se acerca.",
						platform: "PS4, PS5, PC", genre: "Acción, Aventura, Hack and Slash", hoursPlayed: 25, image: "assets//img/god_of_war_ragnarok.jpg", isFavorite: false, played: false, achievements: [{ name: "Padre e Hijo", completed: false }, { name: "El Fin del Ragnarök", completed: false }]
					},
					{
						id: 4, title: "Street Fighter 6", description: "La nueva evolución de la icónica saga de lucha, con modos innovadores y un roster diverso.",
						platform: "PC, PS4, PS5, Xbox Series X/S", genre: "Lucha", hoursPlayed: 100, image: "assets//img/Street_Fighter_6.jpg", isFavorite: false, played: false, achievements: [{ name: "Primer KO", completed: false }, { name: "Leyenda Callejera", completed: false }]
					}
				];
				break;
			case 'RPG':
				this.allGames = [
					{
						id: 5, title: "Baldur's Gate 3", description: "Una inmersiva aventura de rol con decisiones que importan y combates tácticos por turnos.",
						platform: "PC, PS5", genre: "CRPG, Fantasía", hoursPlayed: 100, image: "assets//img/baldrs_gate_3.jpg", isFavorite: false, played: false, achievements: [{ name: "Inicio de la Aventura", completed: false }, { name: "Maestro Táctico", completed: false }]
					},
					{
						id: 6, title: "Elden Ring", description: "Un vasto mundo abierto de fantasía oscura con desafiantes combates y exploración.",
						platform: "PC, PS4, PS5, Xbox One, Series X/S", genre: "ARPG, Mundo Abierto", hoursPlayed: 80, image: "assets//img/Elden_Ring.jpg", isFavorite: false, played: false, achievements: [{ name: "El Círculo Quebrado", completed: false }, { name: "Señor de Elden", completed: false }]
					},
					{
						id: 7, title: "Final Fantasy VII Rebirth", description: "La esperada continuación del remake, expandiendo la épica aventura de Cloud y sus compañeros.",
						platform: "PS5", genre: "JRPG", hoursPlayed: 40, image: "assets//img/final_fantasy_vii_rebirth.jpg", isFavorite: false, played: false, achievements: [{ name: "Reunión", completed: false }, { name: "El Viaje Continúa", completed: false }]
					},
					{
						id: 8, title: "Cyberpunk 2077", description: "Adéntrate en Night City, un futuro distópico lleno de crimen, implantes y corporaciones.",
						platform: "PC, PS5, Xbox Series X/S", genre: "ARPG, Ciberpunk", hoursPlayed: 60, image: "assets//img/Cyberpunk_2077.jpg", isFavorite: false, played: false, achievements: [{ name: "Ciudadano de Night City", completed: false }, { name: "Leyenda del Cyberpunk", completed: false }]
					}
				];
				break;
			case 'Aventura':
				this.allGames = [
					{
						id: 9, title: "Zelda: Tears of the Kingdom", description: "Vuela por los cielos de Hyrule y explora nuevas tierras en esta secuela de Breath of the Wild.",
						platform: "Nintendo Switch", genre: "Aventura, Mundo Abierto", hoursPlayed: 100, image: "assets//img/Zelda_Tears_of_the_Kingdom.jpg", isFavorite: false, played: false, achievements: [{ name: "Bendición del Sabio", completed: false }, { name: "Explorador del Cielo", completed: false }]
					},
					{
						id: 10, title: "Star Wars Jedi: Survivor", description: "Continúa la historia de Cal Kestis en su lucha contra el Imperio Galáctico.",
						platform: "PC, PS5, Xbox Series X/S", genre: "Acción, Aventura", hoursPlayed: 20, image: "assets//img/star_wars_jedi_survivor.jpg", isFavorite: false, played: false, achievements: [{ name: "La Fuerza Despierta", completed: false }, { name: "Maestro Jedi", completed: false }]
					},
					{
						id: 11, title: "Alan Wake 2", description: "Un thriller psicológico que te sumerge en una oscura y retorcida historia.",
						platform: "PC, PS5, Xbox Series X/S", genre: "Survival Horror, Narrativo", hoursPlayed: 18, image: "assets//img/alan_wake_2.jpg", isFavorite: false, played: false, achievements: [{ name: "La Sombra Persistente", completed: false }, { name: "Escritor del Terror", completed: false }]
					},
					{
						id: 12, title: "Horizon Forbidden West", description: "Aloy viaja a una frontera misteriosa y mortífera para salvar un futuro agonizante.",
						platform: "PS4, PS5, PC", genre: "Acción, Aventura, Mundo Abierto", hoursPlayed: 40, image: "assets//img/horizon_zero_dawn_2.jpg", isFavorite: false, played: false, achievements: [{ name: "Cazadora Suprema", completed: false }, { name: "Salvadora del Oeste", completed: false }]
					}
				];
				break;
			case 'Estrategia':
				this.allGames = [
					{
						id: 13, title: "Age of Empires IV", description: "Vuelve la icónica saga de estrategia en tiempo real, con civilizaciones históricas y campañas épicas.",
						platform: "PC", genre: "RTS", hoursPlayed: 200, image: "assets//img/age_of_empires_iv.jpg", isFavorite: false, played: false, achievements: [{ name: "Fundador del Imperio", completed: false }, { name: "Conquistador Legendario", completed: false }]
					},
					{
						id: 14, title: "Civilization VI", description: "Construye un imperio que resista el paso del tiempo en este legendario juego de estrategia por turnos.",
						platform: "PC, Mac, Switch, iOS, Android", genre: "Estrategia por Turnos", hoursPlayed: 200, image: "assets/img/civilization_vi.jpg", isFavorite: false, played: false, achievements: [{ name: "La Primera Era", completed: false }, { name: "Victoria Cultural", completed: false }]
					},
					{
						id: 15, title: "Cities: Skylines II", description: "La secuela del aclamado constructor de ciudades, con más herramientas y posibilidades.",
						platform: "PC, PS5, Xbox Series X/S", genre: "Gestión, Construcción de Ciudades", hoursPlayed: 150, image: "assets//img/cities_skylines_2.jpg", isFavorite: false, played: false, achievements: [{ name: "Mi Primera Ciudad", completed: false }, { name: "Metrópolis Floreciente", completed: false }]
					},
					{
						id: 16, title: "Company of Heroes 3", description: "La estrategia de la Segunda Guerra Mundial con nuevos frentes y tácticas dinámicas.",
						platform: "PC, PS5, Xbox Series X/S", genre: "RTS", hoursPlayed: 30, image: "assets/img/Company_of_Heroes_3.jpg", isFavorite: false, played: false, achievements: [{ name: "Primera Batalla", completed: false }, { name: "Victoria Aliada", completed: false }]
					}
				];
				break;
			default:
				this.allGames = [];
				break;
		}

		this.extractFilterOptions();
		this.filterGames();
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
			this.error = 'Debes iniciar sesión para añadir juegos a tu biblioteca.';
			return;
		}

		const result = this.gameService.addGame(currentUser.username, game);
		alert(result.message);
	}

	// Abre el modal de detalles del juego y pasa el juego seleccionado
	openGameDetailModal(game: Game): void {
		this.selectedGameForModal = game;
		const modalElement = document.getElementById('gameDetailModal');
		if (modalElement) {
			const modal = new bootstrap.Modal(modalElement);
			modal.show();
		}
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

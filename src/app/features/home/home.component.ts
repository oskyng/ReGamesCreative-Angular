import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/core/api/api.service';
import { AuthService } from 'src/app/core/auth/auth.service';

/**
 * @description 
 * Componente de la página de inicio de la aplicación.
 * @summary 
 * Muestra una lista de categorías de videojuegos y permite al usuario navegar
 * a la página de juegos de cada categoría. Carga las categorías desde la API de RAWG
 * o usa valores predeterminados en caso de error.
 * @usageNotes
 * ```html
 * <app-home></app-home>
 * ```
 */
@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
	categories: { name: string, iconClass: string }[] = [];
	private categoriesSubscription!: Subscription;

	constructor(
		private readonly authService: AuthService,
		private readonly rawgApiService: ApiService
	) { }

	ngOnInit(): void {
		this.authService.init();

		// Cargar las categorías del servicio RawgApiService
		this.categoriesSubscription = this.rawgApiService.getGenres().subscribe({
			next: (categoryNames: string[]) => {
				this.categories = categoryNames.map(name => ({
					name: name,
					iconClass: this.getCategoryIcon(name)
				}));
			},
			error: (err) => {
				console.error('Error al cargar las categorías desde RAWG API:', err);
				this.categories = [
					{ name: 'Acción', iconClass: 'fas fa-fist-raised' },
					{ name: 'RPG', iconClass: 'fas fa-hat-wizard' },
					{ name: 'Aventura', iconClass: 'fas fa-map-marked-alt' },
					{ name: 'Estrategia', iconClass: 'fas fa-chess-knight' }
				];
				alert('Error al cargar categorías de la API. Se están mostrando categorías predeterminadas.');
			}
		});
	}

	private getCategoryIcon(categoryName: string): string {
		switch (categoryName.toLowerCase()) {
			case 'action':
			case 'accion':
				return 'fas fa-fist-raised';
			case 'rpg':
				return 'fas fa-hat-wizard';
			case 'adventure':
			case 'aventura':
				return 'fas fa-map-marked-alt';
			case 'strategy':
			case 'estrategia':
				return 'fas fa-chess-knight';
			case 'shooter':
				return 'fas fa-crosshairs';
			case 'puzzle':
				return 'fas fa-puzzle-piece';
			case 'racing':
				return 'fas fa-car';
			case 'sports':
				return 'fas fa-futbol';
			default:
				return 'fas fa-gamepad';
		}
	}

	ngOnDestroy(): void {
		if (this.categoriesSubscription) {
			this.categoriesSubscription.unsubscribe();
		}
	}
}

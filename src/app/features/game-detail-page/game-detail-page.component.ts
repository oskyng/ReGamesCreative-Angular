// ReGamesCreative-Angular/src/app/features/game-detail-page/game-detail-page.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ApiService } from 'src/app/core/api/api.service';
import { AuthService, User } from 'src/app/core/auth/auth.service';
import { Game, Achievement, GameService } from 'src/app/core/game/game.service';

/**
 * @file game-detail-page.component.ts
 * @description Componente de página para mostrar los detalles completos de un videojuego, incluyendo sus logros.
 * @summary Recupera el ID del juego de la ruta, carga sus detalles y logros desde la API RAWG,
 * y permite al usuario añadir el juego a su biblioteca o marcar logros como completados.
 * @usageNotes
 * Navega a esta página usando el enrutador de Angular:
 * ```typescript
 * this.router.navigate(['/juego', game.id]);
 * ```
 */
@Component({
  selector: 'app-game-detail-page',
  templateUrl: './game-detail-page.component.html',
  styleUrls: ['./game-detail-page.component.css']
})
export class GameDetailPageComponent implements OnInit, OnDestroy {
  /**
   * @public
   * @description El objeto Game con todos sus detalles y logros.
   */
  game: Game | null = null;
  /**
   * @public
   * @description Indica si los datos del juego están siendo cargados.
   */
  isLoading: boolean = true;
  /**
   * @public
   * @description Mensaje de error a mostrar si falla la carga de datos.
   */
  error: string | null = null;
  /**
   * @public
   * @description El usuario actualmente autenticado.
   */
  currentUser: User | null = null;
  /**
   * @public
   * @description Bandera que indica si el juego actual está en la biblioteca del usuario.
   */
  isGameInUserLibrary: boolean = false;

  /**
   * @private
   * @description Suscripción a los parámetros de la ruta.
   */
  private routeSubscription!: Subscription;
  /**
   * @private
   * @description Suscripción al estado de autenticación del usuario.
   */
  private authSubscription!: Subscription;

  /**
   * @param route Servicio para acceder a la información de la ruta activa (ID del juego).
   * @param router Servicio de enrutamiento para la navegación.
   * @param apiService Servicio para interactuar con la API de RAWG.
   * @param authService Servicio para gestionar la autenticación del usuario.
   * @param gameService Servicio para gestionar la biblioteca de juegos del usuario.
   */
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly gameService: GameService
  ) { }

  /**
   * @lifecycle
   * @description Hook de inicialización del componente.
   * Carga los detalles del juego y sus logros basándose en el ID de la URL.
   * También se suscribe al estado de autenticación del usuario.
   * @returns {void}
   */
  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.checkGameInLibrary();
    });

    this.routeSubscription = this.route.paramMap.pipe(
      switchMap(params => {
        this.isLoading = true;
        this.error = null;
        const gameId = Number(params.get('id'));
        if (isNaN(gameId)) {
          this.error = 'ID de juego no válido.';
          this.isLoading = false;
          return of(null);
        }

        // Carga los detalles del juego y todos sus logros en paralelo
        return forkJoin({
          details: this.apiService.getGameDetails(gameId),
          achievements: this.apiService.getGameAchievements(gameId).pipe(
            catchError(err => {
              console.warn('No se pudieron cargar los logros para el juego:', gameId, err);
              return of([]);
            })
          )
        }).pipe(
          catchError(err => {
            console.error('Error al cargar los detalles del juego:', err);
            this.error = 'No se pudo cargar la información del juego. Inténtalo de nuevo más tarde.';
            return of(null);
          })
        );
      })
    ).subscribe(data => {
      if (data && typeof data === 'object' && 'details' in data && 'achievements' in data) {
        this.game = data.details ? { ...data.details, achievements: data.achievements as Achievement[] } as Game : null;
        this.checkGameInLibrary();
      }
      this.isLoading = false;
    });
  }

  /**
   * @private
   * @description Verifica si el juego actual ya se encuentra en la biblioteca del usuario logueado.
   * Actualiza la propiedad `isGameInUserLibrary`.
   * @returns {void}
   */
  private checkGameInLibrary(): void {
    if (this.currentUser && this.game) {
      this.gameService.getUserGames(this.currentUser.username).subscribe(userGames => {
        this.isGameInUserLibrary = userGames.some(g => g.id === this.game!.id);
      });
    } else {
      this.isGameInUserLibrary = false;
    }
  }

  /**
   * @public
   * @description Añade el juego actual a la biblioteca del usuario.
   * Muestra una alerta con el resultado.
   * @returns {void}
   */
  handleAddToLibrary(): void {
    if (!this.currentUser) {
      alert('Debes iniciar sesión para añadir juegos a tu biblioteca.');
      return;
    }
    if (this.game) {
      this.gameService.addGame(this.currentUser.username, this.game).subscribe(result => {
        alert(result.message);
        this.checkGameInLibrary();
      });
    }
  }

  /**
   * @public
   * @description Maneja el cambio de estado (completado/no completado) de un logro.
   * Actualiza el logro en la biblioteca del usuario.
   * @param {number} achievementIndex El índice del logro en el array de logros del juego.
   * @param {Event} event El evento del checkbox.
   * @returns {void}
   */
  onAchievementChange(achievementIndex: number, event: Event): void {
    if (!this.currentUser || !this.game?.achievements) {
      alert('Debes iniciar sesión para guardar el progreso de logros.');
      (event.target as HTMLInputElement).checked = !(event.target as HTMLInputElement).checked; // Revierte el cambio visual
      return;
    }

    const isCompleted = (event.target as HTMLInputElement).checked;

    this.gameService.getUserGames(this.currentUser.username).subscribe(userGames => {
      const gameInLibrary = userGames.find(g => g.id === this.game!.id);

      if (gameInLibrary?.achievements) {
        gameInLibrary.achievements[achievementIndex].completed = isCompleted;
        this.gameService.updateGame(this.currentUser!.username, gameInLibrary);
      } else {
        alert('El juego debe estar en tu biblioteca para guardar el progreso de logros.');
        (event.target as HTMLInputElement).checked = !(event.target as HTMLInputElement).checked; // Revierte el cambio visual
      }
    });
  }

  /**
   * @public
   * @description Navega de vuelta a la página anterior en el historial del navegador.
   * @returns {void}
   */
  goBack(): void {
    this.router.navigateByUrl(this.router.url.split('/juego/')[0] || '/inicio');
  }

  onImageError(event: Event): void {
		const target = event.target as HTMLImageElement;
		target.src = 'https://placehold.co/600x800/374151/D1D5DB?text=No+Image';
	}

  onAchievementImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/achievement-placeholder.png';
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

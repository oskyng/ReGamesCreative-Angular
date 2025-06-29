import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Game, GameAchievement } from '../game/game.service';

// Define la estructura de una respuesta de la API de RAWG para la lista de juegos
interface RawgApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGame[];
}

// Define la estructura simplificada de un juego de RAWGS
interface RawgGame {
  id: number;
  name: string;
  background_image: string;
  genres: { id: number; name: string; slug: string }[];
  platforms: { platform: { id: number; name: string; slug: string } }[];
  released: string;
  description_raw?: string;
  achievements_count?: number;
}

// Interfaz para la respuesta de la API de logros de RAWG
interface RawgAchievementsApiResponse {
  count: number;
  results: RawgAchievementApi[];
}

// Interfaz para la estructura de un logro individual de la API de RAWG
interface RawgAchievementApi {
  id: number;
  name: string;
  description: string;
  image: string;
  percent: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly BASE_URL = 'https://api.rawg.io/api';
  private readonly API_KEY = 'e8efc69ecead49639193319812de4f90';

  constructor(private readonly http: HttpClient) { }

  /**
   * Obtiene una lista de juegos de la API de RAWG.
   * @param searchQuery Término de búsqueda para juegos.
   * @param genres IDs o slugs de géneros (separados por coma).
   * @param platforms IDs o slugs de plataformas (separados por coma).
   * @param page_size Número de resultados por página.
   * @returns Un Observable de un array de objetos Game (transformado desde RawgGame).
   */
  getGames(searchQuery: string = '', genres: string = '', platforms: string = '', page_size: number = 20): Observable<Game[]> {
    let params = new HttpParams().set('key', this.API_KEY).set('page_size', page_size.toString());

    if (searchQuery) {
      params = params.set('search', searchQuery);
    }
    if (genres) {
      params = params.set('genres', genres);
    }
    if (platforms) {
      params = params.set('platforms', platforms);
    }

    // Realiza la petición HTTP y mapea la respuesta al formato Game[]
    return this.http.get<RawgApiResponse>(`${this.BASE_URL}/games`, { params }).pipe(
      map(response => response.results.map(rawgGame => this.mapRawgGameToGame(rawgGame))),
      catchError(error => {
        console.error('Error fetching games from RAWG API:', error);
        return of([]); // Retorna un observable de array vacío en caso de error
      })
    );
  }

  /**
   * Obtiene los detalles completos de un juego específico por su ID.
   * @param id El ID del juego en RAWG.
   * @returns Un Observable de un objeto Game. Incluye la descripción completa si está disponible.
   */
  getGameDetails(id: number): Observable<Game> {
    const params = new HttpParams().set('key', this.API_KEY);
    return this.http.get<RawgGame>(`${this.BASE_URL}/games/${id}`, { params }).pipe(
      map(rawgGame => this.mapRawgGameToGame(rawgGame, true)), // Pasar true para indicar que es un detalle
      catchError(error => {
        console.error(`Error fetching details for game ID ${id} from RAWG API:`, error);
        throw error; // Propaga el error para que el componente lo maneje
      })
    );
  }

  /**
   * Obtiene la lista de logros para un juego específico por su ID.
   * @param gameId El ID del juego en RAWG.
   * @returns Un Observable de un array de objetos GameAchievement.
   */
  getGameAchievements(gameId: number): Observable<GameAchievement[]> {
    const params = new HttpParams().set('key', this.API_KEY);
    return this.http.get<RawgAchievementsApiResponse>(`${this.BASE_URL}/games/${gameId}/achievements`, { params }).pipe(
      map(response => response.results.map(rawgAchievement => this.mapRawgAchievementToGameAchievement(rawgAchievement))),
      catchError(error => {
        console.error(`Error fetching achievements for game ID ${gameId} from RAWG API:`, error);
        return of([]); // Retorna un observable de array vacío en caso de error
      })
    );
  }

  /**
   * Mapea un objeto RawgGame a la interfaz Game de nuestra aplicación.
   * Esta función NO mapea los logros, ya que se obtienen de un endpoint separado.
   * @param rawgGame El objeto RawgGame de la API.
   * @param includeFullDescription Indica si se debe incluir la descripción completa (description_raw).
   * @returns Un objeto Game compatible con tu aplicación.
   */
  private mapRawgGameToGame(rawgGame: RawgGame, includeFullDescription: boolean = false): Game {
    // description_raw solo viene en la respuesta del endpoint de detalle de un juego (/games/{id})
    const description = rawgGame.description_raw || rawgGame.name;
    return {
      id: rawgGame.id,
      title: rawgGame.name,
      description: includeFullDescription ? description : description.substring(0, 150) + (description.length > 150 ? '...' : ''),
      platform: rawgGame.platforms.map(p => p.platform.name).join(', '),
      genre: rawgGame.genres.map(g => g.name).join(', '),
      hoursPlayed: 0,
      image: rawgGame.background_image || 'https://placehold.co/400x250/374151/D1D5DB?text=No+Image',
      isFavorite: false,
      played: false,
      achievements: [] 
    };
  }

  /**
   * Mapea un objeto RawgAchievementApi a la interfaz GameAchievement de nuestra aplicación.
   * @param rawgAchievement El objeto de logro de la API.
   * @returns Un objeto GameAchievement compatible con tu aplicación (con 'completed' en false por defecto).
   */
  private mapRawgAchievementToGameAchievement(rawgAchievement: RawgAchievementApi): GameAchievement {
    return {
      id: rawgAchievement.id,
      name: rawgAchievement.name,
      description: rawgAchievement.description,
      image: rawgAchievement.image || 'https://placehold.co/100x100/374151/D1D5DB?text=Ach',
      percent: rawgAchievement.percent,
      completed: false
    };
  }

  /**
   * Obtiene la lista de géneros disponibles de la API de RAWG.
   * @returns Un Observable de un array de strings con los nombres de los géneros.
   */
  getGenres(): Observable<string[]> {
    const params = new HttpParams().set('key', this.API_KEY);
    return this.http.get<any>(`${this.BASE_URL}/genres`, { params }).pipe(
      map(response => response.results.map((genre: any) => genre.name)),
      catchError(error => {
        console.error('Error fetching genres from RAWG API:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene la lista de plataformas disponibles de la API de RAWG.
   * @returns Un Observable de un array de strings con los nombres de las plataformas.
   */
  getPlatforms(): Observable<string[]> {
    const params = new HttpParams().set('key', this.API_KEY);
    return this.http.get<any>(`${this.BASE_URL}/platforms`, { params }).pipe(
      map(response => response.results.map((platform: any) => platform.name)),
      catchError(error => {
        console.error('Error fetching platforms from RAWG API:', error);
        return of([]);
      })
    );
  }
}

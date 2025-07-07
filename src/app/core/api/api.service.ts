import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, expand, reduce } from 'rxjs/operators';
import { Game, Achievement } from '../game/game.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly BASE_URL = 'https://api.rawg.io/api';
  private readonly RAWG_API_KEY = 'e8efc69ecead49639193319812de4f90';

  constructor(private readonly http: HttpClient) { }

  /**
   * Obtiene una lista de juegos de la API de RAWG.
   * @param {string} searchText - Término de búsqueda para filtrar juegos por nombre.
   * @param {string} genreSlug - Slug del género para filtrar juegos por género.
   * @param {number} page - Número de página para la paginación.
   * @returns {Observable<{ results: Game[], next: string | null }>} Un observable que emite un objeto con un array de objetos Game y la URL de la siguiente página (o null si no hay más).
   */
  getGames(searchText: string = '', genreSlug: string = '', page: number = 1): Observable<{ results: Game[], next: string | null }> {
    let url = `${this.BASE_URL}/games?key=${this.RAWG_API_KEY}`;
    if (searchText) {
      url += `&search=${searchText}`;
    }
    if (genreSlug) {
      url += `&genres=${genreSlug}`;
    }
    
    url += `&page=${page}`;
    url += '&page_size=20';

    // Modificar para devolver también el campo 'next' para saber si hay más páginas
    return this.http.get<any>(url).pipe(
      map(response => {
        const games: Game[] = response.results.map((game: any) => ({
          id: game.id,
          title: game.name,
          image: game.background_image || 'https://placehold.co/400x225/000000/FFFFFF?text=No+Image',
          description: game.slug, // RAWG no devuelve la descripción completa en la lista, la obtenemos en detalles
          platform: game.platforms?.map((p: any) => p.platform.name).join(', ') || 'N/A',
          genre: game.genres?.map((g: any) => g.name).join(', ') || 'N/A',
          hoursPlayed: 0,
          played: false,
          isFavorite: false,
          achievements: [] // Los logros se cargan en el detalle
        }));
        return { results: games, next: response.next };
      })
    );
  }

  /**
   * Obtiene los detalles completos de un juego específico por su ID.
   * @param {number} id - El ID del juego.
   * @returns {Observable<Game>} Un observable que emite el objeto Game completo.
   */
  getGameDetails(id: number): Observable<Game> {
    return this.http.get<any>(`${this.BASE_URL}/games/${id}?key=${this.RAWG_API_KEY}`).pipe(
      map(game => ({
        id: game.id,
        title: game.name,
        image: game.background_image || 'https://placehold.co/400x225/000000/FFFFFF?text=No+Image',
        description: game.description_raw || game.description || 'No description available.',
        platform: game.platforms?.map((p: any) => p.platform.name).join(', ') || 'N/A',
        genre: game.genres?.map((g: any) => g.name).join(', ') || 'N/A',
        hoursPlayed: 0,
        played: false,
        isFavorite: false,
        achievements: []
      }))
    );
  }

  /**
   * Obtiene todos los logros de un juego por su ID, manejando la paginación para devolver todos los resultados.
   * @param {number} id - El ID del juego.
   * @returns {Observable<Achievement[]>} Un observable que emite un array de todos los objetos Achievement del juego.
   */
  getGameAchievements(id: number): Observable<Achievement[]> {
    const initialUrl = `${this.BASE_URL}/games/${id}/achievements?key=${this.RAWG_API_KEY}`;

    // La función que expandirá y hará las llamadas recursivas
    const fetchAchievementsPage = (url: string): Observable<any> => {
      return this.http.get<any>(url).pipe(
        map(response => {
          const achievements: Achievement[] = response.results.map((ach: any) => ({
            name: ach.name,
            description: ach.description || 'No description available.',
            completed: false, // Por defecto, el usuario no ha completado el logro
            image: ach.image || 'https://placehold.co/50x50/374151/D1D5DB?text=No+Img', // Añadido: imagen del logro
            percent: ach.percent || 0 // Añadido: porcentaje de jugadores que lo tienen
          }));
          return { achievements: achievements, next: response.next };
        })
      );
    };

    // Usar expand para seguir las URLs 'next' y acumular todos los logros
    return fetchAchievementsPage(initialUrl).pipe(
      expand(response => response.next ? fetchAchievementsPage(response.next) : of()), // Si hay 'next', llama de nuevo; si no, termina con un Observable vacío
      reduce((acc: Achievement[], current: { achievements: Achievement[], next: string | null }) => {
        return acc.concat(current.achievements); // Acumula los logros de cada página
      }, [])
    );
  }

  /**
   * Obtiene una lista de géneros de juegos.
   * @returns {Observable<string[]>} Un observable que emite un array de nombres de géneros.
   */
  getGenres(): Observable<string[]> {
    return this.http.get<any>(`${this.BASE_URL}/genres?key=${this.RAWG_API_KEY}`).pipe(
      map(response => response.results.map((genre: any) => genre.name))
    );
  }

  /**
   * Obtiene una lista de plataformas de juegos.
   * @returns {Observable<string[]>} Un observable que emite un array de nombres de plataformas.
   */
  getPlatforms(): Observable<string[]> {
    return this.http.get<any>(`${this.BASE_URL}/platforms?key=${this.RAWG_API_KEY}`).pipe(
      map(response => response.results.map((platform: any) => platform.name))
    );
  }
}

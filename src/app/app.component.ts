import { Component, OnInit } from '@angular/core';
import { AuthService, User } from './core/auth/auth.service';

/**
 * @description 
 * Componente raíz de la aplicación ReGamesCreative.
 * @summary
 * Este componente actúa como el punto de entrada principal, configurando la estructura base (encabezado, contenido principal con router-outlet y pie de página)
 * y gestionando la suscripción al estado de autenticación del usuario.
 * @usageNotes
 * ```html
 * <app-root></app-root>
 * ```
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'ReGamesCreative-Angular';
  currentUser: User | null = null;

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }
}

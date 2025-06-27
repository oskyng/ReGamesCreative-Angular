import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';

/**
 * @description 
 * Componente para el encabezado de la aplicación.
 * @summary 
 * Muestra el nombre de la aplicación, enlaces de navegación,
 * y gestiona la visualización del estado de autenticación del usuario (login/registro vs. perfil de usuario).
 * @usageNotes
 * ```html
 * <app-header></app-header>
 * ```
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(public authService: AuthService, private readonly router: Router) {
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

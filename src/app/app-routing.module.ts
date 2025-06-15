import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryComponent } from './features/category/category.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { MyLibraryComponent } from './features/my-library/my-library.component';
import { RecoverPasswordComponent } from './features/recover-password/recover-password.component';
import { RegisterComponent } from './features/register/register.component';
import { UserProfileComponent } from './features/user-profile/user-profile.component';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
	{ path: '', redirectTo: '/inicio', pathMatch: 'full' },
	{ path: 'inicio', component: HomeComponent },
	{ path: 'my-librery', component: MyLibraryComponent, canActivate: [authGuard] },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'profile', component: UserProfileComponent, canActivate: [authGuard] },
	{ path: 'recover-password', component: RecoverPasswordComponent },
	{ path: 'categorias/accion', component: CategoryComponent, data: { category: 'Acción' } },
	{ path: 'categorias/rpg', component: CategoryComponent, data: { category: 'RPG' } },
	{ path: 'categorias/aventura', component: CategoryComponent, data: { category: 'Aventura' } },
	{ path: 'categorias/estrategia', component: CategoryComponent, data: { category: 'Estrategia' } },
	// Ruta comodín para 404 (redirecciona al inicio)
	{ path: '**', redirectTo: '/inicio' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }

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
import { GameDetailPageComponent } from './features/game-detail-page/game-detail-page.component';

const routes: Routes = [
	{ path: '', redirectTo: '/home', pathMatch: 'full' },
	{ path: 'home', component: HomeComponent },
	{ path: 'my-librery', component: MyLibraryComponent, canActivate: [authGuard] },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'profile', component: UserProfileComponent, canActivate: [authGuard] },
	{ path: 'recover-password', component: RecoverPasswordComponent },
	{ path: 'category/:categorySlug', component: CategoryComponent },
	{ path: 'game/:id', component: GameDetailPageComponent },
	// Ruta comodín para 404 (redirecciona al inicio)
	{ path: '**', redirectTo: '/home' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }

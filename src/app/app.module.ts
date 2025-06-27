import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { GameCardComponent } from './shared/game-card/game-card.component';
import { GameDetailModalComponent } from './shared/game-detail-modal/game-detail-modal.component';
import { HomeComponent } from './features/home/home.component';
import { CategoryComponent } from './features/category/category.component';
import { MyLibraryComponent } from './features/my-library/my-library.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { UserProfileComponent } from './features/user-profile/user-profile.component';
import { RecoverPasswordComponent } from './features/recover-password/recover-password.component';
import { AuthService } from './core/auth/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationModalComponent } from './shared/confirmation-modal/confirmation-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    GameCardComponent,
    GameDetailModalComponent,
    HomeComponent,
    CategoryComponent,
    MyLibraryComponent,
    LoginComponent,
    RegisterComponent,
    UserProfileComponent,
    RecoverPasswordComponent,
    ConfirmationModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }

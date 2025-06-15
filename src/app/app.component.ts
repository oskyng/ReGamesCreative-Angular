import { Component, OnInit } from '@angular/core';
import { AuthService, User } from './core/auth/auth.service';

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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { Component, Input } from '@angular/core';
import { User } from './core/auth/auth.service';
import { Router } from '@angular/router';

// Mock del HeaderComponent
@Component({ selector: 'app-header', template: '' })
class MockHeaderComponent {
	@Input() currentUser: User | null = null; // Mock para la propiedad de entrada
	logout = jasmine.createSpy('logout'); // Mock para el método logout
}

// Mock del FooterComponent
@Component({ selector: 'app-footer', template: '' })
class MockFooterComponent { }

describe('AppComponent', () => {
	let fixture: ComponentFixture<AppComponent>;
	let component: AppComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				RouterTestingModule
			],
			declarations: [
				AppComponent,
				MockHeaderComponent,
				MockFooterComponent
			],
			providers: [
				{ provide: Router, useValue: { navigate: () => { } } }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(AppComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('debería crearse la app', () => {
		expect(component).toBeTruthy();
	});

	it(`debería tener como título 'ReGamesCreative-Angular'`, () => {
		expect(component.title).toEqual('ReGamesCreative-Angular');
	});
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameDetailModalComponent } from './game-detail-modal.component';

declare let bootstrap: any;

describe('GameDetailModalComponent', () => {
	let component: GameDetailModalComponent;
	let fixture: ComponentFixture<GameDetailModalComponent>;

	beforeEach(async () => {
		if (typeof bootstrap === 'undefined') {
			(window as any).bootstrap = {
				Modal: function () { }
			};
		}
		spyOn(bootstrap, 'Modal').and.callFake(function () {
			// Retorna un objeto mock con el método 'show'
			return {
				show: jasmine.createSpy('show'),
				hide: jasmine.createSpy('hide')
			};
		});

		await TestBed.configureTestingModule({
			declarations: [GameDetailModalComponent],
		}).compileComponents();
		fixture = TestBed.createComponent(GameDetailModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('debería crearse', () => {
		expect(component).toBeTruthy();
	});

	it('debería inicializar la instancia de Bootstrap Modal', () => {
		expect(bootstrap.Modal).toHaveBeenCalledWith(component.modalElementRef.nativeElement);
		expect(component['bsModal']).toBeDefined();
		expect(component['bsModal'].show).toBeDefined(); // Verifica que el mock tenga el método show
		expect(component['bsModal'].hide).toBeDefined(); // Verifica que el mock tenga el método hide
	});
});

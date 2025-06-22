import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationModalComponent } from './confirmation-modal.component';

// Mock de la clase Modal de Bootstrap
declare let bootstrap: any;

describe('ConfirmationModalComponent', () => {
	let component: ConfirmationModalComponent;
	let fixture: ComponentFixture<ConfirmationModalComponent>;

	beforeEach(async () => {
		if (typeof bootstrap === 'undefined') {
			(window as any).bootstrap = {
				Modal: function () {  }
			};
		}
		// Mockea la clase Modal de Bootstrap
		spyOn(bootstrap, 'Modal').and.callFake(function () {
			// Retorna un objeto mock con los métodos 'show' y 'hide'
			return {
				show: jasmine.createSpy('show'),
				hide: jasmine.createSpy('hide')
			};
		});

		await TestBed.configureTestingModule({
			declarations: [ConfirmationModalComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(ConfirmationModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('debería crearse', () => {
		expect(component).toBeTruthy();
	});

	it('debería inicializar la instancia de Bootstrap Modal', () => {
		expect(bootstrap.Modal).toHaveBeenCalledWith(component.modalElementRef.nativeElement);
		expect(component['bsModal']).toBeDefined();
		expect(component['bsModal'].show).toBeDefined();
		expect(component['bsModal'].hide).toBeDefined();
	});
});

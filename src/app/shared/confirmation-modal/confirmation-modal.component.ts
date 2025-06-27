import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

// Importa la función Modal de Bootstrap
declare let bootstrap: any;

/**
 * @description 
 * Componente reutilizable para mostrar un modal de confirmación genérico.
 * @summary 
 * Permite configurar el título, el mensaje y el texto del botón de confirmación.
 * Emite un evento cuando el usuario confirma o cancela la acción.
 * @usageNotes
 * ```html
 * <app-confirmation-modal
 * [title]="'Eliminar Item'"
 * [message]="'¿Estás seguro de que quieres eliminar este item?'"
 * [confirmButtonText]="'Sí, eliminar'"
 * (confirmed)="onConfirmationResult($event)">
 * </app-confirmation-modal>
 * ```
 */
@Component({
	selector: 'app-confirmation-modal',
	templateUrl: './confirmation-modal.component.html',
	styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent implements AfterViewInit {
	@Input() title: string = 'Confirmación';
	@Input() message: string = '¿Estás seguro de esta acción?';
	@Input() confirmButtonText: string = 'Confirmar';

	@Output() confirmed = new EventEmitter<boolean>();

	@ViewChild('confirmationModalElement') modalElementRef!: ElementRef;
	private bsModal: any;

	constructor() { }

	ngAfterViewInit(): void {
		// Inicializar la instancia del modal de Bootstrap después de que la vista se haya inicializado
		if (this.modalElementRef?.nativeElement) {
			this.bsModal = new bootstrap.Modal(this.modalElementRef.nativeElement);

			// Listener para cuando el modal se oculta (se cierra)
			this.modalElementRef.nativeElement.addEventListener('hidden.bs.modal', () => {
				const backdrop = document.querySelector('.modal-backdrop');
				if (backdrop) {
				   backdrop.remove();
				}
			});
		}
	}

	// Muestra el modal
	show(): void {
		if (this.bsModal) {
			this.bsModal.show();
		}
	}

	// Oculta el modal
	hide(): void {
		if (this.bsModal) {
			this.bsModal.hide();
		}
	}

	// Se llama cuando el usuario hace clic en el botón de confirmar
	onConfirm(): void {
		this.confirmed.emit(true);
		this.hide();
	}

	// Se llama cuando el usuario hace clic en el botón de cancelar o en el botón de cerrar
	onCancel(): void {
		this.confirmed.emit(false);
		this.hide();
	}

}

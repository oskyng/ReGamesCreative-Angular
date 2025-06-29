import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });

    // Inyecta el servicio y el controlador de pruebas HTTP
    service = TestBed.inject(ApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  // Verifica que no haya solicitudes HTTP pendientes después de cada prueba
  afterEach(() => {
    httpTestingController.verify();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });
});

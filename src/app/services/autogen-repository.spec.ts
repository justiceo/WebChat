import { TestBed, inject } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { BaseRequestOptions, Http, Response, ResponseOptions } from '@angular/http';

import { AutoGenRepository } from './autogen-repository';
import { HttpHandlerService } from './http_handler.service';
import { Message } from '../model/message';
import { CacheService } from './cache.service';

describe('AutoGenRepository', () => {
  let httpHandlerService: HttpHandlerService;
  let dataService: AutoGenRepository;
  let mockBackend: MockBackend;
  let lastConnection: MockConnection;

  beforeEach(() => {

    mockBackend = new MockBackend();
    const fakeHttp = new Http(mockBackend, new BaseRequestOptions());
    const cache = new CacheService();
    httpHandlerService = new HttpHandlerService(fakeHttp, cache);
    mockBackend.connections.subscribe(
      (connection: MockConnection) => lastConnection = connection);

    dataService = new AutoGenRepository(httpHandlerService);
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: HttpHandlerService, useValue: httpHandlerService }
      ],
    });
  });

  it('should be created', inject([AutoGenRepository], (service: AutoGenRepository) => {
    expect(service).toBeTruthy();
  }));


  describe('chooseAny', () => {
    it('should return lower bound', inject([AutoGenRepository], (service: AutoGenRepository) => {
      spyOn(Math, 'random').and.returnValue(0);
      const testArr = ['a', 'b', 'c', 'd'];
      const choosen: string = service.chooseAny(testArr);
      expect(choosen).toBe(testArr[0]);
    }));

    it('should return upper bound', inject([AutoGenRepository], (service: AutoGenRepository) => {
      spyOn(Math, 'random').and.returnValue(0.9);
      const testArr = ['a', 'b', 'c', 'd'];
      const choosen: string = service.chooseAny(testArr);
      expect(choosen).toBe(testArr[3]);
    }));

    it('should return only item', inject([AutoGenRepository], (service: AutoGenRepository) => {
      const testArr = ['a'];
      const choosen: string = service.chooseAny(testArr);
      expect(choosen).toBe(testArr[0]);
    }));

    it('should fail on empty list', inject([AutoGenRepository], (service: AutoGenRepository) => {
      expect(() => service.chooseAny([])).toThrow();
    }));
  });
});

import { TestBed, inject } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { BaseRequestOptions, Http, Response, ResponseOptions } from '@angular/http';

import { DataService } from './data.service';
import { HttpHandlerService } from './http_handler.service';
import { Message } from './message';

describe('DataService', () => {
  let httpHandlerService: HttpHandlerService;
  let dataService: DataService;
  let mockBackend: MockBackend;
  let lastConnection: MockConnection;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataService]
    });

    mockBackend = new MockBackend();
    const fakeHttp = new Http(mockBackend, new BaseRequestOptions());
    httpHandlerService = new HttpHandlerService(fakeHttp);
    mockBackend.connections.subscribe(
      (connection: MockConnection) => lastConnection = connection);

    dataService = new DataService(httpHandlerService);
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: HttpHandlerService, useValue: httpHandlerService },
        DataService,
      ],
    });
  });

  it('should be created', inject([DataService], (service: DataService) => {
    expect(service).toBeTruthy();
  }));

  it('should return messages list', inject([DataService], (service: DataService) => {
    spyOn(Math, 'random').and.returnValue(0.50);
    /*
    service.getMessages('thread-id-here').subscribe(message => {
      expect(message).toBeTruthy();
      expect(message.content).toBeTruthy();
    });
    */
  }));

  // TODO: test messages should be in chronological order

  // TODO: multiple calls should return same list
});

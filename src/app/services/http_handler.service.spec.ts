import { fakeAsync, TestBed, tick, inject } from "@angular/core/testing";
import { HttpEvent, HttpClient, HttpEventType } from "@angular/common/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Observable } from "rxjs";
import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";

import { HttpHandlerService } from "./http_handler.service";
import { CacheService } from "./cache.service";

describe("HttpHandlerService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpHandlerService, CacheService]
    });

    window.sessionStorage.clear();
  });

  it(
    "should be able to make http requests",
    inject(
      [HttpTestingController, HttpHandlerService],
      (httpMock: HttpTestingController, httpService: HttpHandlerService) => {
        const url = "/sample/endpoint";
        const mockResponse = '{"some-key": "some-value"}';

        httpService.get(url).subscribe((event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.Response:
              expect(event.body).toEqual(mockResponse);
          }
        });

        const mockReq = httpMock.expectOne(url);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual("json");
        mockReq.flush(mockResponse);

        httpMock.verify();
      }
    )
  );
});

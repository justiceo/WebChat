import { TestBed, inject } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";

import { DataService } from "./data.service";
import { HttpHandlerService } from "./http_handler.service";
import { CacheService } from "./cache.service";
import { Message } from "../model/message";

describe("DataService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CacheService, HttpHandlerService, DataService]
    });
  });

  it(
    "should be created",
    inject([DataService], (service: DataService) => {
      expect(service).toBeTruthy();
    })
  );

  describe("chooseAny", () => {
    it(
      "should return lower bound",
      inject([DataService], (service: DataService) => {
        spyOn(Math, "random").and.returnValue(0);
        const testArr = ["a", "b", "c", "d"];
        const choosen: string = service.chooseAny(testArr);
        expect(choosen).toBe(testArr[0]);
      })
    );

    it(
      "should return upper bound",
      inject([DataService], (service: DataService) => {
        spyOn(Math, "random").and.returnValue(0.9);
        const testArr = ["a", "b", "c", "d"];
        const choosen: string = service.chooseAny(testArr);
        expect(choosen).toBe(testArr[3]);
      })
    );

    it(
      "should return only item",
      inject([DataService], (service: DataService) => {
        const testArr = ["a"];
        const choosen: string = service.chooseAny(testArr);
        expect(choosen).toBe(testArr[0]);
      })
    );

    it(
      "should fail on empty list",
      inject([DataService], (service: DataService) => {
        expect(() => service.chooseAny([])).toThrow();
      })
    );
  });
});

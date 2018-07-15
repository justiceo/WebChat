import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, Input } from "@angular/core";

import { ChatComponent } from "./chat.component";
import { Thread } from "../model/thread";

describe("ChatComponent", () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [
          ChatComponent,
          MockThreadsListComponent,
          MockSingleThreadComponent
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

@Component({
  selector: "wc-threads-list",
  template: "threads list"
})
class MockThreadsListComponent {
  @Input() current: Thread;
}

@Component({
  selector: "wc-single-thread",
  template: "single thread"
})
class MockSingleThreadComponent {
  @Input() thread: Thread;
}

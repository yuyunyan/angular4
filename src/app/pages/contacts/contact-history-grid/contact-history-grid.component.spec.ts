import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactHistoryGridComponent } from './contact-history-grid.component';

describe('ContactHistoryGridComponent', () => {
  let component: ContactHistoryGridComponent;
  let fixture: ComponentFixture<ContactHistoryGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactHistoryGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactHistoryGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOrderLineHistoryGridComponent } from './sales-order-line-history-grid.component';

describe('SalesOrderLineHistoryGridComponent', () => {
  let component: SalesOrderLineHistoryGridComponent;
  let fixture: ComponentFixture<SalesOrderLineHistoryGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesOrderLineHistoryGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesOrderLineHistoryGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

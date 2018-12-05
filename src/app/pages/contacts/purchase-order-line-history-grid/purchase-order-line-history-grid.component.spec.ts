import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderLineHistoryGridComponent } from './purchase-order-line-history-grid.component';

describe('PurchaseOrderLineHistoryGridComponent', () => {
  let component: PurchaseOrderLineHistoryGridComponent;
  let fixture: ComponentFixture<PurchaseOrderLineHistoryGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderLineHistoryGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderLineHistoryGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

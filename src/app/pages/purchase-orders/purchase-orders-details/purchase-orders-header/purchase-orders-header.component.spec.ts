import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrdersHeaderComponent } from './purchase-orders-header.component';

describe('PurchaseOrdersHeaderComponent', () => {
  let component: PurchaseOrdersHeaderComponent;
  let fixture: ComponentFixture<PurchaseOrdersHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrdersHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrdersHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

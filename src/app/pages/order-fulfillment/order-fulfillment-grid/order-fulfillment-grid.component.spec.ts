import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderFulfillmentGridComponent } from './order-fulfillment-grid.component';

describe('OrderFulfillmentGridComponent', () => {
  let component: OrderFulfillmentGridComponent;
  let fixture: ComponentFixture<OrderFulfillmentGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderFulfillmentGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderFulfillmentGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

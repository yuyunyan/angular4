import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemSalesOrdersComponent } from './item-salesorders.component';

describe('ItemAvailabilityComponent', () => {
  let component: ItemSalesOrdersComponent;
  let fixture: ComponentFixture<ItemSalesOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemSalesOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSalesOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

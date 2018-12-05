import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemBreakdownComponent } from './item-breakdown.component';

describe('ItemBreakdownComponent', () => {
  let component: ItemBreakdownComponent;
  let fixture: ComponentFixture<ItemBreakdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemBreakdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

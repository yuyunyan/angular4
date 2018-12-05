import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemQuotesComponent } from './item-quotes.component';

describe('ItemAvailabilityComponent', () => {
  let component: ItemQuotesComponent;
  let fixture: ComponentFixture<ItemQuotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemQuotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemQuotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteExtraItemsComponent } from './quote-extra-items.component';

describe('QuoteExtraItemsComponent', () => {
  let component: QuoteExtraItemsComponent;
  let fixture: ComponentFixture<QuoteExtraItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuoteExtraItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteExtraItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

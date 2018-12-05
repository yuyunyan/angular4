import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IsDefaultCheckboxComponent } from './is-default-checkbox.component';

describe('IsDefaultCheckboxComponent', () => {
  let component: IsDefaultCheckboxComponent;
  let fixture: ComponentFixture<IsDefaultCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IsDefaultCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IsDefaultCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

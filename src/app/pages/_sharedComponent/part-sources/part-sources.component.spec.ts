import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartSourcesComponent } from './part-sources.component';

describe('PartSourcesComponent', () => {
  let component: PartSourcesComponent;
  let fixture: ComponentFixture<PartSourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartSourcesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartSourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

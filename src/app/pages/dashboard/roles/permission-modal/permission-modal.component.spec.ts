import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionModalComponent } from './permission-modal.component';

describe('PermissionModalComponent', () => {
  let component: PermissionModalComponent;
  let fixture: ComponentFixture<PermissionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

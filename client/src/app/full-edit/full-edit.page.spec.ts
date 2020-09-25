import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FullEditPage } from './full-edit.page';

describe('FullEditPage', () => {
  let component: FullEditPage;
  let fixture: ComponentFixture<FullEditPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullEditPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FullEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TabStatisticPage } from './tab_statistic.page';

describe('TabStatisticPage', () => {
  let component: TabStatisticPage;
  let fixture: ComponentFixture<TabStatisticPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabStatisticPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TabStatisticPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

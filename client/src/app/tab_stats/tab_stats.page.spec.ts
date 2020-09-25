import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { TabStatsPage } from './tab_stats-routing.module.page';

describe('Tab2Page', () => {
  let component: TabStatsPage;
  let fixture: ComponentFixture<TabStatsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabStatsPage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TabStatsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

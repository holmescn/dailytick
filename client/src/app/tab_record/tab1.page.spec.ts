import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { TabRecordPage } from './tab_record.page';

describe('Tab1Page', () => {
  let component: TabRecordPage;
  let fixture: ComponentFixture<TabRecordPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabRecordPage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TabRecordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

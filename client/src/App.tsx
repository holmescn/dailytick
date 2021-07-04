import { Route } from 'react-router-dom';
import { 
  IonApp,
  IonMenu,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonList,
  IonContent,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet
} from '@ionic/react';
import {
  sunny as sunnyIcon,
  moon as moonIcon,
  statsChart as statsChartIcon,
  pieChart as pieChartIcon,
  sync as syncIcon,
  attach as attachIcon
} from 'ionicons/icons';
import { IonReactRouter } from '@ionic/react-router';
import Index from './pages/Index';
import Login from './pages/Login';
import Editor from './pages/Editor';
import ActivityStat from './pages/ActivityStat';
import TagStat from './pages/TagStat';
//import ViewMessage from './pages/ViewMessage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

const App: React.FC = () => (
  <IonApp>
    <IonMenu side="start" menuId="main-menu" contentId="router-outlet">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem key="menu-item-1">
            <IonIcon icon={sunnyIcon} slot="start"></IonIcon>
            <IonLabel>白天模式</IonLabel>
          </IonItem>
          <IonItem key="menu-item-2">
            <IonIcon icon={moonIcon} slot="start"></IonIcon>
            <IonLabel>夜间模式</IonLabel>
          </IonItem>
          <IonItem key="menu-item-3">
            <IonIcon icon={statsChartIcon} slot="start"></IonIcon>
            <IonLabel>标签统计</IonLabel>
          </IonItem>
          <IonItem key="menu-item-4">
            <IonIcon icon={pieChartIcon} slot="start"></IonIcon>
            <IonLabel>时间统计</IonLabel>
          </IonItem>
          <IonItem key="menu-item-5">
            <IonIcon icon={syncIcon} slot="start"></IonIcon>
            <IonLabel>同步</IonLabel>
          </IonItem>
          <IonItem key="menu-item-6">
            <IonIcon icon={attachIcon} slot="start"></IonIcon>
            <IonLabel>安装 PWA</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>

    <IonReactRouter>
      <IonRouterOutlet id="router-outlet">
        <Route path="/" exact={true}>
          <Index />
        </Route>
        <Route path="/login" exact={true}>
          <Login />
        </Route>
        <Route path="/editor" exact={true}>
          <Editor />
        </Route>
        <Route path="/stat/activity" exact={true}>
          <ActivityStat />
        </Route>
        <Route path="/stat/tag" exact={true}>
          <TagStat />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;

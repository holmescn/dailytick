//import { Tick, getTick } from '../data/ticks';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonTitle,
} from '@ionic/react';
import './Login.css';

const Login: React.FC = () => {
  return (
    <IonPage id="view-message-page">
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>登录</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        
      </IonContent>
    </IonPage>
  );
}

export default Login;

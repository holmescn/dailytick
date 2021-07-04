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
import './TagStat.css';

const TagStat: React.FC = () => {
  return (
    <IonPage id="view-message-page">
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>标签时间统计</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        
      </IonContent>
    </IonPage>
  );
}

export default TagStat;

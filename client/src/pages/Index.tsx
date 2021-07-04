import TickListItem from '../components/TickListItem';
import { useState } from 'react';
import { Tick, getTicks } from '../data/ticks';
import {
  IonContent,
  IonHeader,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonMenuButton,
  IonIcon,
  useIonViewWillEnter
} from '@ionic/react';
import { 
  add as addIcon
} from 'ionicons/icons';
import './Index.css';

const Index: React.FC = () => {

  const [ticks, setTicks] = useState<Tick[]>([]);

  useIonViewWillEnter(() => {
    const ticks = getTicks();
    setTicks(ticks);
  });

  const refresh = (e: CustomEvent) => {
    setTimeout(() => {
      e.detail.complete();
    }, 3000);
  };

  return (
    <IonPage id="home-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton autoHide={false} menu="main-menu" />
          </IonButtons>
          <IonTitle>00:00:00</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => {}}>
              <IonIcon slot="icon-only" icon={addIcon} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={refresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonList>
          {ticks.map(t => <TickListItem key={t.id} tick={t} />)}
        </IonList>
      </IonContent>
    </IonPage>

  );
};

export default Index;

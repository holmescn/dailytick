import {
  IonItem,
  IonLabel,
  IonNote,
  IonItemSliding,
  IonItemOptions,
  IonItemOption
  } from '@ionic/react';
import { Tick } from '../data/ticks';
import './TickListItem.css';

interface TickListItemProps {
  key: string|number;
  tick: Tick;
}

const TickListItem: React.FC<TickListItemProps> = ({ key, tick }) => {
  return (
    <IonItemSliding>
      <IonItem detail={false} key={key}>
        <div slot="start" className="gap"></div>
        <IonLabel className="ion-text-wrap">
          <h2>
            <span>{tick.activity}</span>
            <span className="time">
              <IonNote>{tick._time}</IonNote>
            </span>
          </h2>
          <h3>
            <span>Project Name</span>
            <span className="duration">
              <IonNote>{tick._duration}</IonNote>
            </span>
          </h3>
          <p>{tick.tags.map(tag => <span>{"#"+tag}&nbsp;&nbsp;</span>)}</p>
        </IonLabel>
      </IonItem>

        <IonItemOptions side="end">
        <IonItemOption onClick={() => console.log('edit clicked')}>编辑</IonItemOption>
        <IonItemOption onClick={() => console.log('insert clicked')}>插入</IonItemOption>
        <IonItemOption onClick={() => console.log('delete clicked')}>删除</IonItemOption>
      </IonItemOptions>
    </IonItemSliding>  
  );
};

export default TickListItem;

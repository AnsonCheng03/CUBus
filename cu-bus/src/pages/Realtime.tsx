import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import ExploreContainer from "../components/ExploreContainer";
import "./Realtime.css";

const Tab1: React.FC = () => {
  function handleRefresh(event: any) {
    setTimeout(() => {
      // Any calls to load data go here
      console.log("Refreshed");
      event.target.complete();
    }, 2000);
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent>abc</IonRefresherContent>
        </IonRefresher>

        <p>Pull this content down to trigger the refresh.</p>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;

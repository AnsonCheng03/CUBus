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
import "./RouteSearch.css";
import "./routeComp.css";

const RouteSearch: React.FC<{ appData: any }> = ({ appData }) => {
  function handleRefresh(event: any) {
    setTimeout(() => {
      // Any calls to load data go here
      event.target.complete();
    }, 2000);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pull to Refresh</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <p>Pull this content down to trigger the refresh.</p>
      </IonContent>
    </IonPage>
  );
};

export default RouteSearch;

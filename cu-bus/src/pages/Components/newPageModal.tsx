import {
  createAnimation,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import loadingImage from "../../assets/download.gif";

import { arrowBackOutline } from "ionicons/icons";
import { Component, ComponentType, Suspense, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { OverlayEventDetail } from "@ionic/core/components";
import { Await } from "@remix-run/react";

interface BusMapProps {
  isOpen: boolean;
  setIsOpen: () => void;
  passedProps: ModalProps;
}

interface ModalProps {
  title: string;
  previousPage: string;
  passedPage: any;
}

interface LoadingSuspenseViewProps<T> {
  resolveFunction: () => Promise<T>;
  ViewComponent: ComponentType<any>;
  propNameForResolvedValue: string;
  otherProps?: Record<string, any>;
}

const ModalInput = (props: ModalProps) => {
  const enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const wrapperAnimation = createAnimation()
      .addElement(root?.querySelector(".modal-wrapper")!)
      .keyframes([
        { offset: 0, opacity: "1", transform: "translateX(100vw)" },
        { offset: 1, opacity: "1", transform: "translateX(0)" },
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing("ease-in-out")
      .duration(500)
      .addAnimation([wrapperAnimation]);
  };

  const leaveAnimation = (baseEl: HTMLElement) => {
    return enterAnimation(baseEl).direction("reverse");
  };

  const [present, dismiss] = useIonModal(ModalShown, {
    dismiss: (data: string, role: string) => dismiss(data, role),
    passedProps: { ...props },
  });

  function openModal() {
    present({
      onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {},
      enterAnimation: enterAnimation,
      leaveAnimation: leaveAnimation,
      id: "InfoModal",
    });
  }

  return (
    <>
      <div className="option" onClick={() => openModal()}>
        <div>{props.title}</div>
      </div>
    </>
  );
};

export const LoadingImage = () => {
  return (
    <div className="loadingImageContainer">
      <img src={loadingImage} className="loadingImage" alt="loading" />
    </div>
  );
};

export const LoadingSuspenseView = <T,>({
  resolveFunction,
  ViewComponent,
  propNameForResolvedValue,
  otherProps = {},
}: LoadingSuspenseViewProps<T>) => {
  return (
    <Suspense fallback={<LoadingImage />}>
      <Await resolve={resolveFunction()}>
        {(resolvedValue: T) => (
          <ViewComponent
            {...otherProps}
            {...{ [propNameForResolvedValue]: resolvedValue }}
          />
        )}
      </Await>
    </Suspense>
  );
};

export class Loading extends Component<{ isOpen?: boolean }> {
  render() {
    const enterAnimation = (baseEl: HTMLElement) => {
      const root = baseEl.shadowRoot;

      const backdropAnimation = createAnimation()
        .addElement(root?.querySelector("ion-backdrop")!)
        .fromTo("opacity", "1", "var(--backdrop-opacity)");

      return createAnimation()
        .addElement(baseEl)
        .easing("ease-out")
        .duration(0)
        .addAnimation([backdropAnimation]);
    };

    return (
      <IonModal
        isOpen={this.props.isOpen}
        canDismiss={!this.props.isOpen}
        id={"LoadingModal"}
        enterAnimation={enterAnimation}
        leaveAnimation={enterAnimation}
      >
        <LoadingImage />
      </IonModal>
    );
  }
}

const ModalShown = ({
  dismiss,
  passedProps,
}: {
  dismiss: (data?: string | null | undefined | number, role?: string) => void;
  passedProps: ModalProps;
}) => {
  console.log(passedProps);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar mode="ios">
          <IonButtons slot="start">
            <IonButton color="medium" onClick={() => dismiss(null, "cancel")}>
              <IonIcon slot="icon-only" icon={arrowBackOutline} />
              {` ${passedProps.previousPage ?? ""}`}
            </IonButton>
          </IonButtons>
          <IonTitle>{passedProps.title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">{passedProps.passedPage}</IonContent>
    </IonPage>
  );
};

export default ModalInput;

import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
} from "@ionic/react";
import { busOutline } from "ionicons/icons";
import React, { Component, useEffect } from "react";
import Draggable from "react-draggable";
import busMoving from "../../assets/busMoving.gif";

export default class BusMovingImage extends Component<{}> {
  state = {
    activeDrags: 0,
    rotated: false,
    controlledPosition: {
      x: 0,
      y: 0,
    },
    originalPosition: {
      x: null,
      y: null,
      rotated: null,
    },
    disabled: false,
    animated: true,
  };

  onStart = () => {
    this.setState({
      activeDrags: ++this.state.activeDrags,
      animated: false,
    });
  };

  onStopAsync = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.setState({
      animated: true,
      controlledPosition: {
        x: this.state.originalPosition.x,
        y: this.state.originalPosition.y,
      },
    });
    console.log(this.state.originalPosition.rotated, this.state.rotated);
    if (this.state.originalPosition.rotated !== this.state.rotated) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.setState({
        rotated: !this.state.rotated,
      });
    }
    this.setState({
      originalPosition: {
        x: null,
        y: null,
        rotated: null,
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.setState({
      activeDrags: --this.state.activeDrags,
      disabled: false,
    });
  };

  onStop = () => {
    this.setState({ disabled: true });
    this.onStopAsync();
  };

  handleDrag = (e: any, ui: { deltaX: number }) => {
    const { x, y } = this.state.controlledPosition;
    this.setState({
      originalPosition: {
        x: this.state.originalPosition.x || x,
        y: this.state.originalPosition.y || y,
        rotated:
          this.state.originalPosition.rotated === null
            ? this.state.rotated
            : this.state.originalPosition.rotated,
      },
      controlledPosition: {
        x: x + ui.deltaX,
        y: y,
      },
      rotated: this.state.originalPosition.x
        ? x > this.state.originalPosition.x
        : this.state.rotated,
    });
  };

  componentDidMount(): void {
    // keep the bus moving
    let runningPercentage = 0;
    let totalRunningTime = 12;
    let interval = 250;
    setInterval(() => {
      if (this.state.activeDrags > 0) {
        return;
      }
      const currentPosition = this.state.controlledPosition.x;
      const parentWidth =
        (document.querySelector(".busMovingImageRoute")?.clientWidth ||
          window.innerWidth) - 75;

      if (runningPercentage === 0) {
        this.setState({
          controlledPosition: {
            x: 0,
            y: this.state.controlledPosition.y,
          },
          rotated: false,
        });
      } else if (runningPercentage < 60) {
        this.setState({
          controlledPosition: {
            x: parentWidth * (runningPercentage / 60),
            y: this.state.controlledPosition.y,
          },
        });
      } else if (runningPercentage < 65) {
        this.setState({
          controlledPosition: {
            x: parentWidth,
            y: this.state.controlledPosition.y,
          },
        });
      } else if (runningPercentage < 70) {
        this.setState({
          rotated: true,
        });
      } else if (runningPercentage < 80) {
        this.setState({
          controlledPosition: {
            x: parentWidth * (1 - (runningPercentage - 70) / 10),
            y: this.state.controlledPosition.y,
          },
        });
      } else if (runningPercentage < 95) {
        this.setState({
          controlledPosition: {
            x: 0,
            y: this.state.controlledPosition.y,
          },
          rotated: true,
        });
      } else {
        this.setState({
          controlledPosition: {
            x: currentPosition,
            y: this.state.controlledPosition.y,
          },
          rotated: false,
        });
      }
      runningPercentage += (100 / totalRunningTime) * (interval / 1000);
      if (runningPercentage >= 100) {
        runningPercentage = 0;
      }
    }, interval);
  }

  render() {
    const { controlledPosition } = this.state;
    return (
      <div className="busMovingImageRouteContainer">
        <div
          className={`busMovingImageRoute ${
            this.state.rotated ? "rotated" : ""
          } ${this.state.animated ? "animated" : ""}
            `}
        >
          <Draggable
            axis="x"
            onStart={this.onStart}
            onStop={this.onStop}
            onDrag={this.handleDrag}
            disabled={this.state.disabled}
            bounds={"parent"}
            position={controlledPosition}
            grid={[10, 10]}
          >
            <div>
              <img src={busMoving} alt="bus" />
            </div>
          </Draggable>
        </div>
      </div>
    );
  }
}

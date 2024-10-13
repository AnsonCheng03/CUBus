import busMapImage from "../../assets/schoolbusmap.svg";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "./routeMap.css";

const BusMap = () => {
  return (
    <div className="busMapContainer">
      <TransformWrapper initialScale={1} wheel={{ step: 50 }} maxScale={100}>
        <TransformComponent>
          <img src={busMapImage} alt="Bus Map" />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default BusMap;

import { useRef, useCallback } from "react";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";
import busMapImage from "../../assets/schoolbusmap.svg";

const BusMap = () => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const onUpdate = useCallback(({ x, y, scale }: any) => {
    const { current: img } = imgRef;

    if (img) {
      const value = make3dTransformValue({ x, y, scale });

      img.style.setProperty("transform", value);
    }
  }, []);

  return (
    <>
      <QuickPinchZoom onUpdate={onUpdate}>
        <img ref={imgRef} src={busMapImage} />
      </QuickPinchZoom>
    </>
  );
};

export default BusMap;

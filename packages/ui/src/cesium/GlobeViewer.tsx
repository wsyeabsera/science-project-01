import { Viewer } from "resium";
import { Ion } from "cesium";

interface GlobeViewerProps {
  cesiumIonToken?: string;
}

export function GlobeViewer({ cesiumIonToken }: GlobeViewerProps) {
  if (cesiumIonToken) {
    Ion.defaultAccessToken = cesiumIonToken;
  }

  return (
    <Viewer
      full
      timeline={false}
      animation={false}
      homeButton={false}
      sceneModePicker={false}
    />
  );
}

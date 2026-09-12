import { useEffect, useState } from "react";
import { createBrowserCaptureSession } from "./features/sensor/browser-session";
import { SensorInstrument } from "./features/sensor/components/sensor-instrument";
import { MobileScroll } from "./mobile";

// Build app-specific screens and flows in this file. The surrounding mobile
// runtime is template-owned and intentionally lives outside this component.
export default function Prototype() {
  const [controller] = useState(createBrowserCaptureSession);

  useEffect(() => {
    const stopCapture = () => void controller.stop();
    window.addEventListener("pagehide", stopCapture);
    return () => window.removeEventListener("pagehide", stopCapture);
  }, [controller]);

  return (
    <MobileScroll className="app-screen">
      <SensorInstrument controller={controller} />
    </MobileScroll>
  );
}

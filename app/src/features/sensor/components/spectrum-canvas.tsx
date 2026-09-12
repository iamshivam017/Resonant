import { useEffect, useRef } from "react";

export interface SpectrumCanvasProps {
  samples: Float32Array;
}

export function SpectrumCanvas({ samples }: SpectrumCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const { width, height } = canvas;
    context.clearRect(0, 0, width, height);
    context.strokeStyle = "rgba(133, 151, 171, 0.24)";
    context.lineWidth = 1;
    for (let line = 0; line <= 4; line += 1) {
      const x = (line / 4) * width;
      const y = (line / 4) * height;
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    const finite = Array.from(samples).filter(Number.isFinite);
    if (!finite.length) return;
    const floor = Math.min(...finite);
    const ceiling = Math.max(...finite);
    const range = Math.max(ceiling - floor, 1);
    context.strokeStyle = "#3188ff";
    context.lineWidth = 2;
    context.beginPath();
    samples.forEach((value, index) => {
      const x = (index / Math.max(samples.length - 1, 1)) * width;
      const y = Number.isFinite(value) ? height - ((value - floor) / range) * height : height;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
  }, [samples]);

  return (
    <figure className="plot">
      <canvas
        ref={canvasRef}
        data-testid="spectrum-canvas"
        width={720}
        height={220}
        aria-label="Live microphone frequency spectrum. Digital amplitude is uncalibrated."
      />
      <figcaption>Relative spectrum from the current live frame</figcaption>
    </figure>
  );
}

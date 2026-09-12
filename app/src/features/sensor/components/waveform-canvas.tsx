import { useEffect, useRef } from "react";

export interface WaveformCanvasProps {
  samples?: Float32Array;
}

export function WaveformCanvas({ samples }: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);
    context.strokeStyle = "rgba(133, 151, 171, 0.24)";
    context.lineWidth = 1;
    for (let column = 0; column <= 4; column += 1) {
      const x = (column / 4) * width;
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let row = 0; row <= 4; row += 1) {
      const y = (row / 4) * height;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    if (!samples || samples.length < 2) return;
    context.strokeStyle = "#3188ff";
    context.lineWidth = 2;
    context.beginPath();
    for (let index = 0; index < samples.length; index += 1) {
      const x = (index / (samples.length - 1)) * width;
      const y = (0.5 - samples[index] / 2) * height;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }, [samples]);

  return (
    <figure className="plot">
      <canvas
        ref={canvasRef}
        data-testid="waveform-canvas"
        width={720}
        height={260}
        aria-label="Live microphone waveform. Digital amplitude is uncalibrated."
      />
      <figcaption>
        {samples ? "Current live microphone frame" : "Awaiting the first live microphone frame"}
      </figcaption>
    </figure>
  );
}

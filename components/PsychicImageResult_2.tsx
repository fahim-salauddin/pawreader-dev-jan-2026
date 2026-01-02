"use client";

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

interface Props {
  imageUrl: string;
  text: string;
}

type BubblePosition = "bottom-left" | "bottom-right";

export default function PsychicImageResult({ imageUrl, text }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [position, setPosition] = useState<BubblePosition>("bottom-right");

  /**
   * Decide bubble position
   * RULE:
   * - NEVER use top half (pet face zone)
   * - Only bottom-left or bottom-right
   * - Pick the visually calmer side
   */
  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const scoreZone = (x: number, y: number, w: number, h: number) => {
        const data = ctx.getImageData(x, y, w, h).data;
        let avg = 0;
        let variance = 0;

        for (let i = 0; i < data.length; i += 4) {
          const b =
            0.299 * data[i] +
            0.587 * data[i + 1] +
            0.114 * data[i + 2];
          avg += b;
        }
        avg /= data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          const b =
            0.299 * data[i] +
            0.587 * data[i + 1] +
            0.114 * data[i + 2];
          variance += Math.abs(b - avg);
        }

        return variance;
      };

      const w = img.width;
      const h = img.height;

      // ?? FACE-SAFE ZONE:
      // Top 50% is assumed to contain the pet face
      const zoneWidth = w * 0.4;
      const zoneHeight = h * 0.25;
      const zoneY = h * 0.7;

      const leftScore = scoreZone(0, zoneY, zoneWidth, zoneHeight);
      const rightScore = scoreZone(
        w - zoneWidth,
        zoneY,
        zoneWidth,
        zoneHeight
      );

      setPosition(leftScore < rightScore ? "bottom-left" : "bottom-right");
    };
  }, [imageUrl]);

  /**
   * Download combined image
   */
  const downloadImage = async () => {
    if (!containerRef.current) return;

    const canvas = await html2canvas(containerRef.current, {
      backgroundColor: null,
      scale: window.devicePixelRatio,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.download = "pet-psychic.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          display: "inline-block",
          marginTop: "16px",
        }}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Pet"
          style={{
            maxWidth: "100%",
            height: "auto",
            borderRadius: "14px",
            display: "block",
          }}
        />

        {/* SPEECH BUBBLE */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: position === "bottom-left" ? "20px" : "auto",
            right: position === "bottom-right" ? "20px" : "auto",
            maxWidth: "70%",
            background: "white",
            color: "#111",
            padding: "14px 18px",
            borderRadius: "22px",
            fontSize: "15px",
            fontWeight: 600,
            lineHeight: 1.4,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            wordWrap: "break-word",
          }}
        >
          {text}

          {/* Bubble tail */}
          <div
            style={{
              position: "absolute",
              bottom: "-10px",
              left: position === "bottom-left" ? "18px" : "auto",
              right: position === "bottom-right" ? "18px" : "auto",
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "12px solid white",
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <button
          onClick={downloadImage}
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            border: "none",
            background: "#6d28d9",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Download Image
        </button>
      </div>
    </div>
  );
}

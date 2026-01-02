"use client";

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

interface Props {
  imageUrl: string;
  text: string;
}

export default function PsychicImageResult({ imageUrl, text }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const [bubblePos, setBubblePos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Initial safe placement
  useEffect(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setBubblePos({
      x: rect.width * 0.6,
      y: rect.height * 0.65,
    });
  }, [imageUrl]);

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (!bubbleRef.current) return;

    const rect = bubbleRef.current.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    setDragging(true);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging || !containerRef.current || !bubbleRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const bubble = bubbleRef.current.getBoundingClientRect();

    let x = e.clientX - container.left - offset.x;
    let y = e.clientY - container.top - offset.y;

    // ?? FACE SAFE ZONE (top 50%)
    const faceSafeY = container.height * 0.5;
    if (y < faceSafeY) y = faceSafeY;

    // Keep inside container
    x = Math.max(10, Math.min(x, container.width - bubble.width - 10));
    y = Math.min(y, container.height - bubble.height - 10);

    setBubblePos({ x, y });
  };

  const onMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  });

  // Download image
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

  // Tail direction (toward pet body = center top)
  const tailDirection =
    bubblePos.x + 120 < (containerRef.current?.clientWidth ?? 0) / 2
      ? "right"
      : "left";

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
          ref={bubbleRef}
          onMouseDown={onMouseDown}
          style={{
            position: "absolute",
            left: bubblePos.x,
            top: bubblePos.y,
            maxWidth: "70%",
            background: "white",
            color: "#111",
            padding: "14px 18px",
            borderRadius: "22px",
            fontSize: "15px",
            fontWeight: 600,
            lineHeight: 1.4,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            cursor: "grab",
            userSelect: "none",
          }}
        >
          {text}

          {/* Bubble Tail */}
          <div
            style={{
              position: "absolute",
              top: "-10px",
              left: tailDirection === "right" ? "auto" : "20px",
              right: tailDirection === "right" ? "20px" : "auto",
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderBottom: "12px solid white",
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

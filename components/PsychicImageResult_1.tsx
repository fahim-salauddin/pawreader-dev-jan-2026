"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import html2canvas from "html2canvas";

interface Props {
  imageUrl: string;
  text: string;
}

type BubblePosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export default function PsychicImageResult({ imageUrl, text }: Props) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<BubblePosition>("top-left");

  // 🧠 Analyze image to find best bubble position
  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const zones: Record<BubblePosition, number> = {
        "top-left": 0,
        "top-right": 0,
        "bottom-left": 0,
        "bottom-right": 0,
      };

      const sample = (x: number, y: number, w: number, h: number) => {
        const data = ctx.getImageData(x, y, w, h).data;
        let variance = 0;
        let avg = 0;

        for (let i = 0; i < data.length; i += 4) {
          const brightness =
            0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          avg += brightness;
        }
        avg /= data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          const brightness =
            0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          variance += Math.abs(brightness - avg);
        }

        return variance;
      };

      const w = img.width;
      const h = img.height;
      const zoneW = w * 0.4;
      const zoneH = h * 0.3;

      zones["top-left"] = sample(0, 0, zoneW, zoneH);
      zones["top-right"] = sample(w - zoneW, 0, zoneW, zoneH);
      zones["bottom-left"] = sample(0, h - zoneH, zoneW, zoneH);
      zones["bottom-right"] = sample(w - zoneW, h - zoneH, zoneW, zoneH);

      // Pick least busy area
      const best = Object.entries(zones).sort((a, b) => a[1] - b[1])[0][0];
      setPosition(best as BubblePosition);
    };
  }, [imageUrl]);

  // Download
  const downloadImage = async () => {
    if (!captureRef.current) return;

    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: null,
      scale: window.devicePixelRatio,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.download = "pet-psychic.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const bubblePositionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={captureRef} className="relative inline-block">
        <Image
          src={imageUrl}
          alt="Pet"
          width={800}
          height={600}
          unoptimized
          className="rounded-xl object-contain"
        />

        {/* SPEECH BUBBLE */}
        <div
          className={`
            absolute
            ${bubblePositionClasses[position]}
            max-w-[85%]
            bg-white
            text-black
            px-6
            py-4
            rounded-4xl
            shadow-xl
            font-semibold
            break-words
            whitespace-pre-wrap
          `}
        >
          {text}
        </div>
      </div>

      <button
        onClick={downloadImage}
        className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
      >
        Download Image
      </button>
    </div>
  );
}

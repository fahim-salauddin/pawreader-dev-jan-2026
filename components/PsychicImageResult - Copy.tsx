"use client";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

interface Props {
  imageUrl: string;
  text: string;
}

const fonts: Record<string, string> = {
  comic: '"Comic Sans MS", "Comic Neue", "Baloo 2", system-ui, sans-serif',
  meme: '"Impact", "Arial Black", system-ui, sans-serif',
  clean: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  cursive: '"Brush Script MT", "Lucida Handwriting", cursive',
  bold: '"Arial Black", "Helvetica Bold", sans-serif',
  elegant: '"Georgia", "Times New Roman", serif',
};

export default function PsychicImageResult({ imageUrl, text }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [bubblePos, setBubblePos] = useState({ x: 0, y: 0 });
  const [bubbleWidth, setBubbleWidth] = useState(320);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [font, setFont] = useState("comic");
  const [content, setContent] = useState(text);
  const [visible, setVisible] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Initial placement and size calculation
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setImageSize({ width: rect.width, height: rect.height });
    
    // Scale bubble width based on image size - increased to 50% for larger bubbles
    const scaledWidth = Math.max(280, rect.width * 0.5);
    setBubbleWidth(scaledWidth);
    
    setBubblePos({
      x: rect.width * 0.55,
      y: rect.height * 0.65,
    });
    setVisible(true);
  }, [imageUrl]);

  const startDrag = (e: any) => {
    const point = e.touches ? e.touches[0] : e;
    const rect = bubbleRef.current!.getBoundingClientRect();
    setOffset({
      x: point.clientX - rect.left,
      y: point.clientY - rect.top,
    });
    setDragging(true);
  };

  const onMove = (e: any) => {
    if (!containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;

    if (dragging && bubbleRef.current) {
      const bubble = bubbleRef.current.getBoundingClientRect();
      let x = point.clientX - container.left - offset.x;
      let y = point.clientY - container.top - offset.y;

      // Allow dragging anywhere - removed face safe zone restriction
      x = Math.max(10, Math.min(x, container.width - bubble.width - 10));
      y = Math.max(10, Math.min(y, container.height - bubble.height - 10));

      setBubblePos({ x, y });
    }

    if (resizing) {
      const newWidth = Math.max(280, point.clientX - container.left - bubblePos.x);
      setBubbleWidth(Math.min(newWidth, container.width - bubblePos.x - 20));
    }
  };

  const stopAll = () => {
    setDragging(false);
    setResizing(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", stopAll);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", stopAll);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", stopAll);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", stopAll);
    };
  });

  const addEmoji = (emoji: string) => {
    setContent((c) => c + " " + emoji);
  };

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
      {/* CONTROLS */}
      <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {/* Font Selection */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Font:</label>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            style={{
              padding: "10px 16px",
              fontSize: 15,
              borderRadius: 8,
              border: "2px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 500,
              minWidth: 150,
            }}
          >
            <option value="comic">Comic Sans</option>
            <option value="meme">Impact (Meme)</option>
            <option value="clean">Clean Sans</option>
            <option value="cursive">Cursive</option>
            <option value="bold">Bold Arial</option>
            <option value="elegant">Elegant Serif</option>
          </select>
        </div>

        {/* Emoji Selection */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Add Emoji:</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 500 }}>
            {[
              "😂", "😒", "🙄", "😈", "🐾",
              "😍", "😭", "🤔", "😴", "🤨",
              "😱", "🥺", "😤", "🤗", "😎",
              "🐶", "🐱", "🐭", "🐹", "🐰",
              "❤️", "💕", "✨", "🔥", "💯"
            ].map((e) => (
              <button
                key={e}
                onClick={() => addEmoji(e)}
                style={{
                  fontSize: 24,
                  padding: "8px 12px",
                  cursor: "pointer",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  background: "#fff",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(el) => {
                  el.currentTarget.style.background = "#6d28d9";
                  el.currentTarget.style.transform = "scale(1.1)";
                  el.currentTarget.style.borderColor = "#6d28d9";
                }}
                onMouseLeave={(el) => {
                  el.currentTarget.style.background = "#fff";
                  el.currentTarget.style.transform = "scale(1)";
                  el.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{ position: "relative", display: "inline-block" }}
      >
        <img
          src={imageUrl}
          alt="Pet"
          style={{
            maxWidth: "100%",
            borderRadius: 14,
            display: "block",
          }}
        />

        {/* SPEECH BUBBLE */}
        <div
          ref={bubbleRef}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          style={{
            position: "absolute",
            left: bubblePos.x,
            top: bubblePos.y,
            width: bubbleWidth,
            background: "rgba(0,0,0,0.85)",
            color: "#fff",
            padding: `${Math.max(18, bubbleWidth * 0.06)}px ${Math.max(22, bubbleWidth * 0.07)}px`,
            borderRadius: Math.max(24, bubbleWidth * 0.08),
            fontSize: Math.max(18, bubbleWidth * 0.055),
            fontWeight: 800,
            fontFamily: fonts[font],
            lineHeight: 1.35,
            boxShadow: "0 12px 35px rgba(0,0,0,0.45)",
            cursor: "grab",
            userSelect: "none",
            transform: visible ? "scale(1)" : "scale(0.8)",
            opacity: visible ? 1 : 0,
            transition: "transform 0.35s ease, opacity 0.35s ease",
          }}
        >
          {content}

          {/* RESIZE HANDLE */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              setResizing(true);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setResizing(true);
            }}
            style={{
              position: "absolute",
              right: 6,
              bottom: 6,
              width: Math.max(16, bubbleWidth * 0.05),
              height: Math.max(16, bubbleWidth * 0.05),
              background: "#fff",
              borderRadius: 4,
              cursor: "nwse-resize",
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={downloadImage}
          style={{
            padding: "12px 24px",
            borderRadius: 10,
            border: "none",
            background: "#6d28d9",
            color: "white",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#5b21b6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#6d28d9";
          }}
        >
          Download Image
        </button>
      </div>
    </div>
  );
}
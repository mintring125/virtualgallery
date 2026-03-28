"use client";

import { useState } from "react";

type TabletDialPadProps = {
  onVectorChange: (vector: { x: number; y: number }) => void;
};

export function TabletDialPad({ onVectorChange }: TabletDialPadProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function updateFromPointer(clientX: number, clientY: number, rect: DOMRect) {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const max = rect.width / 2 - 24;
    const distance = Math.min(Math.hypot(dx, dy), max);
    const angle = Math.atan2(dy, dx);
    const x = max === 0 ? 0 : (Math.cos(angle) * distance) / max;
    const y = max === 0 ? 0 : (Math.sin(angle) * distance) / max;

    onVectorChange({ x, y });
    setOffset({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance });
  }

  return (
    <div
      className="dialpad"
      onPointerDown={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        updateFromPointer(event.clientX, event.clientY, rect);
      }}
      onPointerMove={(event) => {
        if ((event.buttons & 1) !== 1) {
          return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        updateFromPointer(event.clientX, event.clientY, rect);
      }}
      onPointerUp={() => {
        onVectorChange({ x: 0, y: 0 });
        setOffset({ x: 0, y: 0 });
      }}
      onPointerLeave={() => {
        onVectorChange({ x: 0, y: 0 });
        setOffset({ x: 0, y: 0 });
      }}
      aria-label="학생 이동 다이얼패드"
      role="application"
    >
      <div className="dialpad-inner" style={{ ["--x" as string]: `${offset.x}px`, ["--y" as string]: `${offset.y}px` }} />
    </div>
  );
}

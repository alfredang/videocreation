import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

const PALETTES: Array<[string, string, string]> = [
  ["#ff6b6b", "#feca57", "#ff9ff3"],
  ["#48dbfb", "#0abde3", "#5f27cd"],
  ["#1dd1a1", "#10ac84", "#2e86de"],
  ["#f368e0", "#ff9ff3", "#576574"],
  ["#feca57", "#ff6348", "#5f27cd"],
  ["#54a0ff", "#5f27cd", "#222f3e"],
];

export const GradientBackground: React.FC<{ sceneIndex: number }> = ({
  sceneIndex,
}) => {
  const frame = useCurrentFrame();
  const [c1, c2, c3] = PALETTES[sceneIndex % PALETTES.length];
  const angle = interpolate(frame, [0, 120], [135, 315], {
    extrapolateRight: "extend",
  });
  const pos1 = interpolate(frame, [0, 120], [0, 100], {
    extrapolateRight: "extend",
  });
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, ${c1} 0%, ${c2} ${pos1}%, ${c3} 100%)`,
      }}
    />
  );
};

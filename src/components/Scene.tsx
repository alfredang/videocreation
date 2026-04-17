import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PlanScene } from "../types";
import { GradientBackground } from "./GradientBackground";

type Props = {
  scene: PlanScene;
  index: number;
  total: number;
};

export const Scene: React.FC<Props> = ({ scene, index, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  const translateY = interpolate(entrance, [0, 1], [60, 0]);
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  const exitStart = scene.durationFrames - 10;
  const fadeOut = interpolate(frame, [exitStart, scene.durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <GradientBackground sceneIndex={index} />
      {scene.audioFile ? <Audio src={staticFile(scene.audioFile)} /> : null}

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
          opacity: opacity * fadeOut,
          transform: `translateY(${translateY}px)`,
        }}
      >
        <div
          style={{
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 96,
            lineHeight: 1.1,
            color: "white",
            textAlign: "center",
            textShadow: "0 8px 40px rgba(0,0,0,0.35)",
            letterSpacing: "-0.02em",
          }}
        >
          {scene.caption}
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 80,
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                background:
                  i === index ? "white" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

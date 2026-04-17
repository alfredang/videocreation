import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { Plan } from "./types";
import { Scene } from "./components/Scene";

export const TopicVideo: React.FC<{ plan: Plan }> = ({ plan }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Series>
        {plan.scenes.map((scene, i) => (
          <Series.Sequence
            key={i}
            durationInFrames={scene.durationFrames}
          >
            <Scene scene={scene} index={i} total={plan.scenes.length} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

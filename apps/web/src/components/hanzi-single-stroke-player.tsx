"use client";

import { useEffect, useId, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import type { CharacterJson } from "hanzi-writer";

type StrokeRenderData = {
  medianPath: string;
  strokePath: string;
  transform: string;
};

const CHARACTER_BOX_OFFSET = -128;
const CHARACTER_BOX_SIZE = 1280;

export function HanziSingleStrokePlayer({
  character,
  strokeIndex,
  label,
  size = 196,
}: {
  character: string;
  strokeIndex: number;
  label: string;
  size?: number;
}) {
  const componentId = useId();
  const maskId = `single-stroke-ink-${componentId.replaceAll(":", "")}`;
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [renderData, setRenderData] = useState<StrokeRenderData | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let disposed = false;

    void import("hanzi-writer")
      .then(async ({ default: HanziWriter }) => {
        const data = (await HanziWriter.loadCharacterData(
          character,
        )) as CharacterJson | void;

        if (disposed || !data) return;

        const strokePath = data.strokes[strokeIndex];
        const median = data.medians[strokeIndex];

        if (!strokePath || !median?.length) {
          setStatus("error");
          return;
        }

        setRenderData({
          medianPath: toSvgPath(median),
          strokePath,
          transform: HanziWriter.getScalingTransform(size, size, 18).transform,
        });
        setAnimationKey((current) => current + 1);
        setStatus("ready");
      })
      .catch(() => {
        if (!disposed) setStatus("error");
      });

    return () => {
      disposed = true;
    };
  }, [character, size, strokeIndex]);

  useEffect(() => {
    if (!renderData) return;

    let frameId = 0;
    let startTime: number | null = null;
    const duration = 1350;

    const step = (time: number) => {
      startTime ??= time;
      const nextProgress = Math.min((time - startTime) / duration, 1);
      setProgress(nextProgress);

      if (nextProgress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(frameId);
  }, [animationKey, renderData]);

  function replayAnimation() {
    setProgress(0);
    setAnimationKey((current) => current + 1);
  }

  const boxStyle = { height: size, width: size };
  const inkProgress = easeOutCubic(progress);

  return (
    <div className="rounded-2xl border border-hairline bg-white p-2">
      <div
        className="relative grid place-items-center overflow-hidden"
        style={boxStyle}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${label} từ dữ liệu nét chữ ${character}`}
        >
          {renderData ? (
            <>
              <defs>
                <mask
                  id={maskId}
                  maskUnits="userSpaceOnUse"
                  x={CHARACTER_BOX_OFFSET}
                  y={CHARACTER_BOX_OFFSET}
                  width={CHARACTER_BOX_SIZE}
                  height={CHARACTER_BOX_SIZE}
                >
                  <rect
                    x={CHARACTER_BOX_OFFSET}
                    y={CHARACTER_BOX_OFFSET}
                    width={CHARACTER_BOX_SIZE}
                    height={CHARACTER_BOX_SIZE}
                    fill="black"
                  />
                  <path
                    d={renderData.medianPath}
                    className="hanzi-single-stroke-mask"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - inkProgress}
                  />
                </mask>
              </defs>
              <g transform={renderData.transform}>
                <path
                  d={renderData.strokePath}
                  className="hanzi-single-stroke-outline"
                />
                <path
                  d={renderData.strokePath}
                  className="hanzi-single-stroke-fill"
                  mask={`url(#${maskId})`}
                />
              </g>
            </>
          ) : null}
        </svg>

        {status === "loading" ? (
          <div className="absolute inset-0 grid place-items-center bg-white/80 text-primary">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : null}
        {status === "error" ? (
          <div className="absolute inset-0 grid place-items-center bg-white/95 px-5 text-center text-xs font-semibold text-ink-muted">
            Không tải được dữ liệu nét này.
          </div>
        ) : null}
      </div>
      <button
        className="focus-ring mt-2 ml-auto inline-flex size-10 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary-active disabled:pointer-events-none disabled:opacity-50"
        type="button"
        aria-label={`Xem lại ${label}`}
        title="Xem lại"
        disabled={status !== "ready"}
        onClick={replayAnimation}
      >
        <RotateCcw className="size-4" />
      </button>
    </div>
  );
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function toSvgPath(points: number[][]) {
  return points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`)
    .join(" ");
}

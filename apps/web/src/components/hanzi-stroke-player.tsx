"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import type HanziWriter from "hanzi-writer";

export function HanziStrokePanel({
  characters,
  label,
  className = "",
  playerSize = 148,
}: {
  characters: string[];
  label: string;
  className?: string;
  playerSize?: number;
}) {
  const [selectedCharacter, setSelectedCharacter] = useState(
    characters[0] ?? "",
  );
  const activeCharacter = characters.includes(selectedCharacter)
    ? selectedCharacter
    : characters[0] ?? "";

  if (!activeCharacter) return null;

  return (
    <div
      className={`mt-3 rounded-xl border border-hairline bg-canvas-soft p-3 ${className}`}
    >
      {characters.length > 1 ? (
        <div
          className="mb-3 flex max-w-full flex-wrap gap-1"
          aria-label={`Chọn chữ trong ${label}`}
        >
          {characters.map((character) => (
            <button
              key={character}
              className={`focus-ring flex size-8 items-center justify-center rounded-lg border text-base font-black transition ${
                activeCharacter === character
                  ? "border-primary bg-white text-primary"
                  : "border-hairline bg-white text-ink-secondary hover:border-primary hover:text-primary"
              }`}
              type="button"
              aria-pressed={activeCharacter === character}
              onClick={() => setSelectedCharacter(character)}
            >
              {character}
            </button>
          ))}
        </div>
      ) : null}

      <HanziStrokePlayer character={activeCharacter} size={playerSize} />
    </div>
  );
}

function HanziStrokePlayer({
  character,
  size,
}: {
  character: string;
  size: number;
}) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let disposed = false;
    const target = targetRef.current;

    if (!target) return;

    setStatus("loading");
    target.replaceChildren();

    void import("hanzi-writer")
      .then(({ default: HanziWriterModule }) => {
        if (disposed || !targetRef.current) return;

        let createdWriter: HanziWriter | null = null;
        const writer = HanziWriterModule.create(targetRef.current, character, {
          width: size,
          height: size,
          padding: 8,
          showCharacter: false,
          showOutline: true,
          strokeColor: "#111827",
          outlineColor: "#d8dee8",
          highlightColor: "#0ea5e9",
          strokeAnimationSpeed: 1.15,
          delayBetweenStrokes: 180,
          onLoadCharDataSuccess: () => {
            if (disposed) return;
            setStatus("ready");
            window.requestAnimationFrame(() => {
              if (!disposed) void createdWriter?.animateCharacter();
            });
          },
          onLoadCharDataError: () => {
            if (disposed) return;
            setStatus("error");
          },
        });

        createdWriter = writer;
        writerRef.current = writer;
      })
      .catch(() => {
        if (!disposed) setStatus("error");
      });

    return () => {
      disposed = true;
      writerRef.current?.cancelQuiz();
      writerRef.current = null;
      target.replaceChildren();
    };
  }, [character, size]);

  function replayAnimation() {
    const writer = writerRef.current;
    if (!writer) return;

    void writer.hideCharacter({ duration: 0 }).then(() => {
      void writer.animateCharacter();
    });
  }

  const boxStyle = { height: size, width: size };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        className="relative grid place-items-center overflow-hidden rounded-xl border border-hairline bg-white"
        style={boxStyle}
      >
        <div
          ref={targetRef}
          aria-label={`Thứ tự nét chữ ${character}`}
          style={boxStyle}
        />
        {status === "loading" ? (
          <div className="absolute inset-0 grid place-items-center bg-white/80 text-primary">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : null}
        {status === "error" ? (
          <div className="absolute inset-0 grid place-items-center bg-white/95 px-4 text-center text-xs font-semibold text-ink-muted">
            Không tải được dữ liệu nét chữ.
          </div>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-4xl font-black text-ink">{character}</p>
        <button
          className="focus-ring mt-3 inline-flex size-10 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary-active disabled:pointer-events-none disabled:opacity-50"
          type="button"
          aria-label={`Xem lại nét chữ ${character}`}
          title="Xem lại"
          disabled={status !== "ready"}
          onClick={replayAnimation}
        >
          <RotateCcw className="size-4" />
        </button>
      </div>
    </div>
  );
}

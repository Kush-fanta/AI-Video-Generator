"use client";

import React, { useMemo, useState } from "react";
import { Player } from "@remotion/player";
import { ChapterMarker } from "../../../hero/chapter-marker";
import { defaultIdentityPack, swarajyaDebasishIdentityPack, swarajyaIdentityPack } from "../../../shared/identity/presets";
import { heroPresets } from "../../../shared/identity/components/hero";
import { resolveHeroTokens, resolveIdentity } from "../../../shared/identity/resolve";

type PackId = "default" | "swarajya" | "debasish";
type HeroPresetName = keyof typeof heroPresets;

const PACKS: Array<{ id: PackId; label: string; identity: typeof defaultIdentityPack }> = [
  { id: "default", label: "Default", identity: defaultIdentityPack },
  { id: "swarajya", label: "Swarajya", identity: swarajyaIdentityPack },
  { id: "debasish", label: "Debasish", identity: swarajyaDebasishIdentityPack },
];

const PRESET_STATES: Record<
  HeroPresetName,
  {
    paddingX: number;
    numberSize: number;
    numberMinWidth: number;
    titleSize: number;
    titleMaxWidth: number;
    barWidth: number;
    barMaxHeight: number;
    gap: number;
    titleLetterSpacingEm: number;
  }
> = {
  default: {
    paddingX: 120,
    numberSize: 200,
    numberMinWidth: 200,
    titleSize: 72,
    titleMaxWidth: 800,
    barWidth: 4,
    barMaxHeight: 120,
    gap: 56,
    titleLetterSpacingEm: -0.02,
  },
  compact: {
    paddingX: 72,
    numberSize: 150,
    numberMinWidth: 150,
    titleSize: 56,
    titleMaxWidth: 680,
    barWidth: 3,
    barMaxHeight: 100,
    gap: 32,
    titleLetterSpacingEm: -0.01,
  },
  bold: {
    paddingX: 160,
    numberSize: 240,
    numberMinWidth: 240,
    titleSize: 88,
    titleMaxWidth: 900,
    barWidth: 6,
    barMaxHeight: 150,
    gap: 72,
    titleLetterSpacingEm: -0.03,
  },
  tactical: {
    paddingX: 104,
    numberSize: 180,
    numberMinWidth: 180,
    titleSize: 64,
    titleMaxWidth: 760,
    barWidth: 5,
    barMaxHeight: 112,
    gap: 44,
    titleLetterSpacingEm: -0.015,
  },
};

const PRESET_ORDER: HeroPresetName[] = ["default", "compact", "bold", "tactical"];

const inputStyle: React.CSSProperties = {
  marginTop: 6,
  width: "100%",
  border: "1px solid #2e2e2e",
  borderRadius: 10,
  background: "#111111",
  color: "#f3f3f3",
  padding: "10px 12px",
  fontSize: 13,
  outline: "none",
};

const panelStyle: React.CSSProperties = {
  background: "#111111",
  border: "1px solid #232323",
  borderRadius: 16,
  padding: 16,
};

function RangeField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label style={{ display: "grid", gap: 6, fontSize: 12, color: "#cfcfcf" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span>{label}</span>
        <span style={{ color: "#8b8b8b" }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function ChapterMarkerLabPage() {
  const [packId, setPackId] = useState<PackId>("default");
  const [preset, setPreset] = useState<HeroPresetName>("default");
  const [title, setTitle] = useState("The New Policy Clock");
  const [number, setNumber] = useState("03");
  const [paddingX, setPaddingX] = useState(PRESET_STATES.default.paddingX);
  const [numberSize, setNumberSize] = useState(PRESET_STATES.default.numberSize);
  const [numberMinWidth, setNumberMinWidth] = useState(PRESET_STATES.default.numberMinWidth);
  const [titleSize, setTitleSize] = useState(PRESET_STATES.default.titleSize);
  const [titleMaxWidth, setTitleMaxWidth] = useState(PRESET_STATES.default.titleMaxWidth);
  const [barWidth, setBarWidth] = useState(PRESET_STATES.default.barWidth);
  const [barMaxHeight, setBarMaxHeight] = useState(PRESET_STATES.default.barMaxHeight);
  const [gap, setGap] = useState(PRESET_STATES.default.gap);
  const [titleLetterSpacingEm, setTitleLetterSpacingEm] = useState(
    PRESET_STATES.default.titleLetterSpacingEm,
  );

  const selectedPack = useMemo(() => {
    return PACKS.find((option) => option.id === packId)?.identity ?? defaultIdentityPack;
  }, [packId]);

  const identity = useMemo(() => resolveIdentity(selectedPack), [selectedPack]);

  const tokenOverrides = useMemo(
    () => ({
      paddingX,
      numberSize,
      numberMinWidth,
      titleSize,
      titleMaxWidth,
      barWidth,
      barMaxHeight,
      gap,
      titleLetterSpacingEm,
    }),
    [
      barMaxHeight,
      barWidth,
      gap,
      numberMinWidth,
      numberSize,
      paddingX,
      titleLetterSpacingEm,
      titleMaxWidth,
      titleSize,
    ],
  );

  const resolvedTokens = useMemo(
    () => resolveHeroTokens(identity, preset, tokenOverrides),
    [identity, preset, tokenOverrides],
  );

  const applyPreset = (nextPreset: HeroPresetName) => {
    const next = PRESET_STATES[nextPreset];
    setPreset(nextPreset);
    setPaddingX(next.paddingX);
    setNumberSize(next.numberSize);
    setNumberMinWidth(next.numberMinWidth);
    setTitleSize(next.titleSize);
    setTitleMaxWidth(next.titleMaxWidth);
    setBarWidth(next.barWidth);
    setBarMaxHeight(next.barMaxHeight);
    setGap(next.gap);
    setTitleLetterSpacingEm(next.titleLetterSpacingEm);
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 57px)",
        display: "grid",
        gridTemplateColumns: "360px minmax(0, 1fr)",
        background: "#090909",
        color: "#f5f5f5",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid #1f1f1f",
          padding: 20,
          overflowY: "auto",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20 }}>Chapter Marker Lab</h2>
        <p style={{ color: "#9a9a9a", fontSize: 13, marginTop: 8 }}>
          Token-first hero preview with pack, preset, and local override controls.
        </p>

        <div style={{ ...panelStyle, marginTop: 16 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 12, color: "#cfcfcf" }}>
            <span>Identity pack</span>
            <select
              value={packId}
              onChange={(event) => setPackId(event.target.value as PackId)}
              style={inputStyle}
            >
              {PACKS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#cfcfcf" }}>Preset</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PRESET_ORDER.map((name) => (
                <button
                  key={name}
                  onClick={() => applyPreset(name)}
                  style={{
                    background: name === preset ? "#e8e0d4" : "#171717",
                    color: name === preset ? "#111111" : "#d9d9d9",
                    border: "1px solid #2c2c2c",
                    borderRadius: 999,
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...panelStyle, marginTop: 16, display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 12, color: "#cfcfcf" }}>
            <span>Number</span>
            <input value={number} onChange={(event) => setNumber(event.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 12, color: "#cfcfcf" }}>
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} style={inputStyle} />
          </label>
        </div>

        <div style={{ ...panelStyle, marginTop: 16, display: "grid", gap: 14 }}>
          <RangeField label="Padding X" value={paddingX} min={24} max={240} onChange={setPaddingX} />
          <RangeField label="Number Size" value={numberSize} min={80} max={320} onChange={setNumberSize} />
          <RangeField
            label="Number Min Width"
            value={numberMinWidth}
            min={80}
            max={320}
            onChange={setNumberMinWidth}
          />
          <RangeField label="Title Size" value={titleSize} min={28} max={120} onChange={setTitleSize} />
          <RangeField
            label="Title Max Width"
            value={titleMaxWidth}
            min={320}
            max={1100}
            onChange={setTitleMaxWidth}
          />
          <RangeField label="Bar Width" value={barWidth} min={1} max={16} onChange={setBarWidth} />
          <RangeField
            label="Bar Max Height"
            value={barMaxHeight}
            min={40}
            max={260}
            onChange={setBarMaxHeight}
          />
          <RangeField label="Gap" value={gap} min={8} max={120} onChange={setGap} />
          <RangeField
            label="Title Letter Spacing x100"
            value={Math.round(titleLetterSpacingEm * 100)}
            min={-8}
            max={8}
            onChange={(value) => setTitleLetterSpacingEm(value / 100)}
          />
        </div>
      </aside>

      <main style={{ padding: 20, display: "grid", gap: 16 }}>
        <div style={panelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#8d8d8d", marginBottom: 4 }}>Resolved contract</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{identity.id}</div>
            </div>
            <div style={{ textAlign: "right", fontSize: 12, color: "#8d8d8d" }}>
              <div>Family: hero</div>
              <div>Preset: {preset}</div>
            </div>
          </div>
          <div style={{ borderRadius: 20, overflow: "hidden", background: "#0b0b0b", aspectRatio: "16 / 9" }}>
            <Player
              component={ChapterMarker as React.ComponentType<any>}
              inputProps={{
                number,
                title,
                identity,
                preset,
                tokens: resolvedTokens,
              }}
              durationInFrames={90}
              fps={30}
              compositionWidth={1280}
              compositionHeight={720}
              autoPlay
              loop
              controls
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import { Player } from "@remotion/player";
import { ChapterMarker } from "../../../hero/chapter-marker";
import { ColdOpen } from "../../../hero/cold-open";
import { FramedLeftTextRight } from "../../../image-comp/framed-left-text-right";
import { FullBleedOverlay } from "../../../image-comp/full-bleed-overlay";
import { WaffleGrid } from "../../../data-viz/waffle-grid";
import { defaultIdentityPack, swarajyaDebasishIdentityPack, swarajyaIdentityPack } from "../../../shared/identity/presets";
import { dataVizPresets } from "../../../shared/identity/components/data-viz";
import { heroPresets } from "../../../shared/identity/components/hero";
import { imageCompPresets } from "../../../shared/identity/components/image-comp";
import { resolveDataVizTokens, resolveHeroTokens, resolveIdentity, resolveImageCompTokens } from "../../../shared/identity/resolve";

type PackId = "default" | "swarajya" | "debasish";
type FamilyId = "hero" | "image-comp" | "data-viz";
type HeroPresetName = keyof typeof heroPresets;
type ImageCompPresetName = keyof typeof imageCompPresets;
type DataVizPresetName = keyof typeof dataVizPresets;
type TemplateId = "chapter-marker" | "cold-open" | "framed-left-text-right" | "full-bleed-overlay" | "waffle-grid";

const PACKS: Array<{ id: PackId; label: string; identity: typeof defaultIdentityPack }> = [
  { id: "default", label: "Default", identity: defaultIdentityPack },
  { id: "swarajya", label: "Swarajya", identity: swarajyaIdentityPack },
  { id: "debasish", label: "Debasish", identity: swarajyaDebasishIdentityPack },
];

const FAMILY_TEMPLATES: Record<FamilyId, Array<{ id: TemplateId; label: string }>> = {
  hero: [
    { id: "chapter-marker", label: "Chapter Marker" },
    { id: "cold-open", label: "Cold Open" },
  ],
  "image-comp": [
    { id: "framed-left-text-right", label: "Framed Left / Text Right" },
    { id: "full-bleed-overlay", label: "Full Bleed Overlay" },
  ],
  "data-viz": [{ id: "waffle-grid", label: "Waffle Grid" }],
};

const HERO_PRESET_ORDER: HeroPresetName[] = ["default", "compact", "bold", "tactical"];
const IMAGE_PRESET_ORDER: ImageCompPresetName[] = ["default", "frame-heavy", "overlay-heavy"];
const DATA_PRESET_ORDER: DataVizPresetName[] = ["default", "minimal", "ops"];

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

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label style={{ display: "grid", gap: 6, fontSize: 12, color: "#cfcfcf" }}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label style={{ display: "grid", gap: 6, fontSize: 12, color: "#cfcfcf" }}>
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle} />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
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

const IMAGE_SOURCE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80";

export function IdentityLabPage() {
  const [packId, setPackId] = useState<PackId>("default");
  const [family, setFamily] = useState<FamilyId>("hero");
  const [templateId, setTemplateId] = useState<TemplateId>("chapter-marker");
  const [heroPreset, setHeroPreset] = useState<HeroPresetName>("default");
  const [imagePreset, setImagePreset] = useState<ImageCompPresetName>("default");
  const [dataPreset, setDataPreset] = useState<DataVizPresetName>("default");
  const [number, setNumber] = useState("03");
  const [title, setTitle] = useState("The New Policy Clock");
  const [line, setLine] = useState("The first policy vote lands tonight.");
  const [at, setAt] = useState("001");
  const [headline, setHeadline] = useState("A template can wear any identity.");
  const [body, setBody] = useState(
    "The structure stays fixed while packs and presets change the tone, spacing, and surface treatment.",
  );
  const [categoryLabel, setCategoryLabel] = useState("Strategy");
  const [percent, setPercent] = useState(68);
  const [label, setLabel] = useState("Audience coverage");
  const [source, setSource] = useState("Verified audience survey · April 2026");

  const selectedPack = useMemo(() => {
    return PACKS.find((option) => option.id === packId)?.identity ?? defaultIdentityPack;
  }, [packId]);

  const identity = useMemo(() => resolveIdentity(selectedPack), [selectedPack]);

  const familyTemplateOptions = FAMILY_TEMPLATES[family];
  const currentTemplate = useMemo(
    () => familyTemplateOptions.find((option) => option.id === templateId) ?? familyTemplateOptions[0],
    [familyTemplateOptions, templateId],
  );

  const handleFamilyChange = (nextFamily: FamilyId) => {
    setFamily(nextFamily);
    const nextTemplate = FAMILY_TEMPLATES[nextFamily][0];
    setTemplateId(nextTemplate.id);
    if (nextFamily === "hero") {
      setHeroPreset("default");
    } else if (nextFamily === "image-comp") {
      setImagePreset("default");
    } else {
      setDataPreset("default");
    }
  };

  const templateInputProps = useMemo(() => {
    switch (templateId) {
      case "chapter-marker":
        return {
          number,
          title,
          identity,
          preset: heroPreset,
          tokens: resolveHeroTokens(identity, heroPreset, {}),
        };
      case "cold-open":
        return {
          line,
          at,
          identity,
          preset: heroPreset,
          tokens: resolveHeroTokens(identity, heroPreset, {}),
        };
      case "framed-left-text-right":
        return {
          image: IMAGE_SOURCE,
          headline,
          body,
          categoryLabel,
          at,
          identity,
          preset: imagePreset,
          tokens: resolveImageCompTokens(identity, imagePreset, {}),
        };
      case "full-bleed-overlay":
        return {
          image: IMAGE_SOURCE,
          headline,
          body,
          categoryLabel,
          at,
          condensedMode: false,
          accentWords: ["identity", "preset", "tokens"],
          identity,
          preset: imagePreset,
          tokens: resolveImageCompTokens(identity, imagePreset, {}),
        };
      case "waffle-grid":
        return {
          percent,
          label,
          source,
          at,
          identity,
          preset: dataPreset,
          tokens: resolveDataVizTokens(identity, dataPreset, {}),
        };
      default:
        return {};
    }
  }, [
    at,
    body,
    categoryLabel,
    dataPreset,
    headline,
    heroPreset,
    identity,
    imagePreset,
    label,
    line,
    number,
    percent,
    source,
    templateId,
    title,
  ]);

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
        <h2 style={{ margin: 0, fontSize: 20 }}>Identity Lab</h2>
        <p style={{ color: "#9a9a9a", fontSize: 13, marginTop: 8 }}>
          Switch packs and presets against real templates, not abstract token charts.
        </p>

        <div style={{ ...panelStyle, marginTop: 16, display: "grid", gap: 12 }}>
          <SelectField
            label="Identity pack"
            value={packId}
            onChange={(value) => setPackId(value as PackId)}
            options={PACKS.map((option) => ({ value: option.id, label: option.label }))}
          />
          <SelectField
            label="Family"
            value={family}
            onChange={(value) => handleFamilyChange(value as FamilyId)}
            options={[
              { value: "hero", label: "Hero" },
              { value: "image-comp", label: "Image Comp" },
              { value: "data-viz", label: "Data Viz" },
            ]}
          />
          <SelectField
            label="Template"
            value={templateId}
            onChange={(value) => setTemplateId(value as TemplateId)}
            options={familyTemplateOptions.map((option) => ({ value: option.id, label: option.label }))}
          />
        </div>

        <div style={{ ...panelStyle, marginTop: 16, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(family === "hero"
              ? HERO_PRESET_ORDER
              : family === "image-comp"
                ? IMAGE_PRESET_ORDER
                : DATA_PRESET_ORDER
            ).map((presetName) => {
              const active =
                (family === "hero" && presetName === heroPreset) ||
                (family === "image-comp" && presetName === imagePreset) ||
                (family === "data-viz" && presetName === dataPreset);

              return (
                <button
                  key={presetName}
                  onClick={() => {
                    if (family === "hero") {
                      setHeroPreset(presetName as HeroPresetName);
                    } else if (family === "image-comp") {
                      setImagePreset(presetName as ImageCompPresetName);
                    } else {
                      setDataPreset(presetName as DataVizPresetName);
                    }
                  }}
                  style={{
                    background: active ? "#e8e0d4" : "#171717",
                    color: active ? "#111111" : "#d9d9d9",
                    border: "1px solid #2c2c2c",
                    borderRadius: 999,
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {presetName}
                </button>
              );
            })}
          </div>
        </div>

        {family === "hero" ? (
          <div style={{ ...panelStyle, marginTop: 16, display: "grid", gap: 12 }}>
            <TextField label="Number" value={number} onChange={setNumber} />
            <TextField label="Title" value={title} onChange={setTitle} />
          </div>
        ) : null}

        {family === "image-comp" ? (
          <div style={{ ...panelStyle, marginTop: 16, display: "grid", gap: 12 }}>
            <TextField label="Headline" value={headline} onChange={setHeadline} />
            <TextField label="Body" value={body} onChange={setBody} />
            <TextField label="Category label" value={categoryLabel} onChange={setCategoryLabel} />
            <TextField label="At label" value={at} onChange={setAt} />
          </div>
        ) : null}

        {family === "data-viz" ? (
          <div style={{ ...panelStyle, marginTop: 16, display: "grid", gap: 12 }}>
            <NumberField label="Percent" value={percent} onChange={setPercent} min={0} max={100} />
            <TextField label="Label" value={label} onChange={setLabel} />
            <TextField label="Source" value={source} onChange={setSource} />
          </div>
        ) : null}
      </aside>

      <main style={{ padding: 20, display: "grid", gap: 16 }}>
        <div style={panelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#8d8d8d", marginBottom: 4 }}>Resolved contract</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{identity.id}</div>
            </div>
            <div style={{ textAlign: "right", fontSize: 12, color: "#8d8d8d" }}>
              <div>Family: {family}</div>
              <div>Template: {currentTemplate.label}</div>
            </div>
          </div>
          <div style={{ borderRadius: 20, overflow: "hidden", background: "#0b0b0b", aspectRatio: "16 / 9" }}>
            <Player
              component={
                (templateId === "chapter-marker"
                  ? ChapterMarker
                  : templateId === "cold-open"
                    ? ColdOpen
                    : templateId === "framed-left-text-right"
                      ? FramedLeftTextRight
                      : templateId === "full-bleed-overlay"
                        ? FullBleedOverlay
                        : WaffleGrid) as React.ComponentType<any>
              }
              inputProps={templateInputProps as any}
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

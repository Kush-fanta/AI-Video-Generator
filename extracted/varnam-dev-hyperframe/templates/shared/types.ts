import type {
  DataVizTokens,
  HeroTokens,
  IdentityPack,
  ImageCompTokens,
} from "./identity/types";

/** Legacy props for unmigrated templates only. */
export interface BaseProps {
  palette?: Record<string, string>;
  serif?: string;
  sans?: string;
}

/** Base props for token-first templates. */
export interface BaseTemplateProps {
  identity?: IdentityPack;
  preset?: string;
}

export interface HeroTemplateProps extends BaseTemplateProps {
  tokens?: Partial<HeroTokens>;
}

export interface ImageCompTemplateProps extends BaseTemplateProps {
  tokens?: Partial<ImageCompTokens>;
}

export interface DataVizTemplateProps extends BaseTemplateProps {
  tokens?: Partial<DataVizTokens>;
}

/** Content that can be text or a number */
export type TextContent = string | number;

/** Image reference — filename in public/ folder */
export type ImageRef = string;

/** Timing anchor — frame number when element should appear */
export type FrameAt = number;

/** Category label props */
export interface CategoryLabel {
  text: string;
  position?: "top-left" | "top-right";
}

/** Source label props */
export interface SourceLabel {
  text: string;
  position?: "bottom-left" | "bottom-right";
}

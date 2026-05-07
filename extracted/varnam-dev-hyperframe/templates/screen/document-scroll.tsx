import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface DocumentScrollProps extends BaseProps {
  /** Document title shown at the top of the page */
  title: string;
  /** Full passage text — the document body that scrolls */
  passage: string;
  /** Substring within passage to highlight with terracotta annotation */
  highlightText?: string;
  /** Source / attribution line */
  source?: string;
  /**
   * When true, renders a letter/memo format at the top of the document:
   * sender name, date, and salutation before the main passage.
   */
  showLetterFormat?: boolean;
  /** Sender name — used when showLetterFormat is true */
  sender?: string;
  /** Date string — used when showLetterFormat is true, e.g. "12 March 1971" */
  letterDate?: string;
  /** Salutation line — used when showLetterFormat is true, e.g. "Dear Prime Minister," */
  salutation?: string;
  /** Frame when element appears */
  at?: number;
}

/**
 * PDF/report document that slowly scrolls to reveal a key passage.
 * White page with serif text, justified body, page border and shadow.
 * Minimum body text: 28px. Line height: 1.7.
 * showLetterFormat: renders sender / date / salutation header for letters and memos.
 * Highlight draws on in terracotta when the key passage scrolls into view.
 */
export const DocumentScroll: React.FC<DocumentScrollProps> = ({
  title,
  passage,
  highlightText,
  source,
  showLetterFormat = false,
  sender,
  letterDate,
  salutation,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Slowed-down scroll — let text breathe
  const scrollY = interpolate(f, [15, FPS * 7], [0, 180], C);

  // Highlight appears mid-way through the scroll
  const highlightAt = at + Math.round(FPS * 2.5);
  const highlightOpacity = highlightText
    ? interpolate(frame, [highlightAt, highlightAt + 14], [0, 1], C)
    : 0;

  const renderPassage = () => {
    if (!highlightText || !passage.includes(highlightText)) {
      return <span>{passage}</span>;
    }

    const idx = passage.indexOf(highlightText);
    const before = passage.slice(0, idx);
    const after = passage.slice(idx + highlightText.length);

    return (
      <>
        <span>{before}</span>
        <span
          style={{
            position: "relative",
            display: "inline",
          }}
        >
          {/* Highlight background */}
          <span
            style={{
              position: "absolute",
              left: -4,
              right: -4,
              top: -3,
              bottom: -3,
              backgroundColor: P.terracotta,
              opacity: highlightOpacity * 0.18,
              borderRadius: 3,
            }}
          />
          {/* Underline that draws in */}
          <span
            style={{
              position: "absolute",
              bottom: -4,
              left: 0,
              width: `${highlightOpacity * 100}%`,
              height: 2,
              backgroundColor: P.terracotta,
              borderRadius: 1,
            }}
          />
          {/* Text colour shift at full opacity */}
          <span
            style={{
              position: "relative",
              color: highlightOpacity > 0.6 ? P.terracotta : "#333",
              fontWeight: highlightOpacity > 0.6 ? 700 : 400,
              transition: "none",
            }}
          >
            {highlightText}
          </span>
        </span>
        <span>{after}</span>
      </>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Document page — centered with shadow */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 180,
          right: 440,
          bottom: 60,
          ...reveal(frame, at + 4),
        }}
      >
        {/* Page with border and shadow */}
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#FFFFFF",
            borderRadius: 4,
            boxShadow:
              "0 4px 40px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
            border: "1px solid #E8E4DE",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Red margin line — classic document look */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 80,
              width: 1,
              height: "100%",
              backgroundColor: "#E8B4B4",
              opacity: 0.35,
            }}
          />

          {/* Ruled lines — subtle horizontal guides, adjust for 28px line height */}
          {Array.from({ length: 22 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 96 + i * 44 - scrollY,
                left: 44,
                right: 44,
                height: 1,
                backgroundColor: "#E8E4DE",
                opacity: 0.25,
              }}
            />
          ))}

          {/* Scrolling content */}
          <div
            style={{
              transform: `translateY(-${scrollY}px)`,
              padding: "60px 80px 96px 108px",
            }}
          >
            {/* Document title */}
            <div
              style={{
                fontFamily: serif,
                fontSize: 44,
                lineHeight: 1.2,
                color: "#1A1A1A",
                textAlign: "center",
                marginBottom: 10,
                fontWeight: 400,
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </div>

            {/* Title underline */}
            <div
              style={{
                width: 56,
                height: 2,
                backgroundColor: P.terracotta,
                margin: "0 auto 36px",
                opacity: 0.6,
              }}
            />

            {/* Letter format header — sender / date / salutation */}
            {showLetterFormat && (
              <div style={{ marginBottom: 40 }}>
                {sender && (
                  <div
                    style={{
                      fontFamily: serif,
                      fontSize: 40,
                      lineHeight: 1.4,
                      color: "#333",
                      marginBottom: 4,
                    }}
                  >
                    {sender}
                  </div>
                )}
                {letterDate && (
                  <div
                    style={{
                      fontFamily: serif,
                      fontSize: 40,
                      lineHeight: 1.4,
                      color: "#555",
                      marginBottom: 24,
                    }}
                  >
                    {letterDate}
                  </div>
                )}
                {salutation && (
                  <div
                    style={{
                      fontFamily: serif,
                      fontSize: 40,
                      lineHeight: 1.6,
                      color: "#333",
                      marginBottom: 20,
                    }}
                  >
                    {salutation}
                  </div>
                )}
              </div>
            )}

            {/* Body passage — big serif at 40px, 1.8 line height — instantly readable at phone size */}
            <div
              style={{
                fontFamily: serif,
                fontSize: 40,
                lineHeight: 1.8,
                color: "#333",
                textAlign: "left",
                position: "relative",
              }}
            >
              {renderPassage()}
            </div>
          </div>
        </div>
      </div>

      {/* Right editorial column — key passage + source */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 400,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 40,
          paddingRight: 60,
        }}
      >
        {/* "Key Passage" eyebrow */}
        <div
          style={{
            ...reveal(frame, at + 8),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: P.muted,
            marginBottom: 20,
          }}
        >
          Key Passage
        </div>

        {highlightText && (
          <div style={reveal(frame, at + 14)}>
            <div
              style={{
                fontFamily: serif,
                fontSize: 42,
                lineHeight: 1.2,
                color: P.text,
                letterSpacing: "-0.02em",
                maxWidth: 340,
              }}
            >
              {"\u201C"}
              {highlightText}
              {"\u201D"}
            </div>
          </div>
        )}

        {/* Terracotta accent line */}
        <div
          style={{
            width: `${lineGrow(frame, at + 20, 28)}%`,
            maxWidth: 100,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 20,
            borderRadius: 2,
          }}
        />

        {source && (
          <div
            style={{
              ...reveal(frame, at + 28),
              fontFamily: sans,
              fontSize: 20,
              lineHeight: 1.5,
              color: P.sub,
              marginTop: 16,
            }}
          >
            {source}
          </div>
        )}
      </div>

      {/* Decorative vertical hairline */}
      <div
        style={{
          position: "absolute",
          top: 160,
          right: 418,
          width: 1,
          height: 200,
          backgroundColor: P.light,
          opacity: lineGrow(frame, at + 22, 18) / 100,
        }}
      />

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 180,
          width: `${lineGrow(frame, at + 16, 36)}%`,
          maxWidth: 320,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "screen-document-scroll",
  props: {
    title: "Memorandum",
    passage: "We reviewed the draft against the reference notes, then tightened the language, reduced the noise, and kept the strongest line at the top. The final pass keeps the argument direct and the source trail visible.",
    highlightText: "strongest line",
    source: "Office of Review",
    showLetterFormat: true,
    sender: "Editorial Review Team",
    letterDate: "12 March 2026",
    salutation: "Dear team,"
  },
  durationInFrames: 240,
};

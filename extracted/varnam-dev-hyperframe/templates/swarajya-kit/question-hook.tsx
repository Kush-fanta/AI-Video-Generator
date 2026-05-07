/**
 * QuestionHook — Centered bold question card, forward-pull hook.
 *
 * Ref frame: /tmp/swarajya-study/frames/Rc7Knnuai-Q/45s.png — "But how?"
 * Purpose: Larger than TextCard — Inter Bold 88px. Optional accent word
 *          rendered in SK.accent.red. Optional muted continuation line below
 *          (Inter Medium 24px). Column 880.
 *
 * Props: { question: string; accentWord?: string; continuation?: string;
 *          durationInFrames: number; bg?: "navy" | "black" }
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface QuestionHookProps {
  question: string;
  accentWord?: string;
  continuation?: string;
  durationInFrames: number;
  bg?: "navy" | "black";
}

/**
 * Renders the question text, replacing the first occurrence of accentWord
 * with a red <span>. Handles the case where accentWord is undefined.
 */
function renderQuestion(question: string, accentWord?: string): React.ReactNode {
  if (!accentWord) {
    return question;
  }
  const idx = question.indexOf(accentWord);
  if (idx === -1) {
    return question;
  }
  return (
    <>
      {question.slice(0, idx)}
      <span style={{ color: SK.accent.red }}>{accentWord}</span>
      {question.slice(idx + accentWord.length)}
    </>
  );
}

export const QuestionHook: React.FC<QuestionHookProps> = ({
  question,
  accentWord,
  continuation,
  durationInFrames,
  bg = "navy",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const backgroundColor = bg === "black" ? SK.bg.black : SK.bg.navy;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          maxWidth: SK.safe.columnWidth,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        {/* Main question */}
        <p
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.bold,
            fontSize: 88,
            color: SK.text.white,
            textAlign: "center",
            lineHeight: 1.1,
            margin: 0,
            padding: 0,
          }}
        >
          {renderQuestion(question, accentWord)}
        </p>

        {/* Optional continuation line */}
        {continuation ? (
          <p
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.medium,
              fontSize: 24,
              color: SK.text.mute,
              textAlign: "center",
              lineHeight: 1.4,
              margin: 0,
              padding: 0,
            }}
          >
            {continuation}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default QuestionHook;

export const demo = {
  compositionId: "sk-question-hook",
  durationInFrames: 120,
  props: {
    question: "But how?",
    accentWord: "how?",
    continuation: "And what does it mean for every country watching the skies?",
    durationInFrames: 120,
    bg: "navy" as const,
  },
};

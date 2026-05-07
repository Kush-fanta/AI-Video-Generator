import { Composition } from "remotion";
import {
  DarkPunch,
  BreathBeat,
  ZoomPunch,
  LandingMoment,
  CallbackEcho,
  CrossDissolve,
  Blackout,
  EndTitle,
  FadeReveal,
  SectionWipe,
} from "./index";

const castComponent = <T,>(
  component: React.FC<T>
): React.FC<Record<string, unknown>> =>
  component as unknown as React.FC<Record<string, unknown>>;

/**
 * TransitionDemos — registers one Composition per transition template.
 * 1920×1080, 30fps, durations tuned so each demo runs through its full motion.
 * Mount this inside your Remotion Root to preview all 10 templates.
 */
export const TransitionDemos: React.FC = () => {
  return (
    <>
      {/*
       * DarkPunch — setup → hard cut → punch.
       * 150 frames: setup visible ~0-59, punch hits at 60.
       * setupAt=0, punchAt=60 leaves 90 frames on the punch phase.
       */}
      <Composition
        id="trans-dark-punch"
        component={castComponent(DarkPunch)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={150}
        defaultProps={{
          setupText: "That was the deal.",
          punchText: "Something changed.",
          subtitle: "And nobody said a word.",
          setupAt: 0,
          punchAt: 60,
        }}
      />

      {/*
       * BreathBeat — the "let that sink in" breath.
       * 150 frames: text arrives immediately, subtext at frame 50.
       */}
      <Composition
        id="trans-breath-beat"
        component={castComponent(BreathBeat)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={150}
        defaultProps={{
          text: "The honest test.",
          subtext: "Not the official one.",
          at: 0,
          subtextAt: 50,
        }}
      />

      {/*
       * ZoomPunch — thesis word explodes from zero.
       * 120 frames: spring settles by ~frame 30, subtitle arrives at 28.
       */}
      <Composition
        id="trans-zoom-punch"
        component={castComponent(ZoomPunch)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={120}
        defaultProps={{
          text: "Brain Centre",
          subtitle: "India's answer to Silicon Valley — or so the plan went.",
          at: 0,
        }}
      />

      {/*
       * LandingMoment — single word arrives with impact.
       * 150 frames: scale spring settles ~frame 25, accent line fully drawn ~frame 36.
       */}
      <Composition
        id="trans-landing-moment"
        component={castComponent(LandingMoment)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={150}
        defaultProps={{
          word: "Ownership.",
          supportingText: "The question nobody wanted to answer.",
          at: 0,
        }}
      />

      {/*
       * CallbackEcho — ghost bar in bg, new headline in front.
       * echoType "bar" echoes a data bar. 150 frames.
       */}
      <Composition
        id="trans-callback-echo"
        component={castComponent(CallbackEcho)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={150}
        defaultProps={{
          echoType: "bar" as const,
          echoValue: 72,
          headline: "What can India own?",
          keyword: "own",
          at: 0,
        }}
      />

      {/*
       * CrossDissolve — phase 1 fades out, phase 2 rises.
       * dissolveAt=70 gives 70 frames on phase 1, 50 frames on phase 2.
       */}
      <Composition
        id="trans-cross-dissolve"
        component={castComponent(CrossDissolve)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={150}
        defaultProps={{
          text: "...",
          at: 0,
        }}
      />

      {/*
       * Blackout — pure silence.
       * 120 frames. fadeIn=true gives a 10-frame fade from content.
       */}
      <Composition
        id="trans-blackout"
        component={castComponent(Blackout)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={120}
        defaultProps={{
          fadeIn: true,
        }}
      />

      {/*
       * EndTitle — closing card on dark bg.
       * 180 frames so the teaser has time to arrive and hold.
       */}
      <Composition
        id="trans-end-title"
        component={castComponent(EndTitle)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={180}
        defaultProps={{
          channelName: "INDIA PILL",
          title: "Why India never became the world's factory",
          teaser: "Next: The logistics problem nobody solved",
          at: 0,
        }}
      />

      {/*
       * FadeReveal — editorial document loading sequence.
       * 150 frames: label at 0, accent line at 8, hero at 20, support at 38.
       */}
      <Composition
        id="trans-fade-reveal"
        component={castComponent(FadeReveal)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={150}
        defaultProps={{
          categoryLabel: "Economic Policy",
          heroText: "The decade India chose to wait.",
          supportingText:
            "From 1991 to 2001, a window opened — and most of it was left unused.",
          heroAt: 20,
        }}
      />

      {/*
       * SectionWipe — horizontal terracotta bar sweeps left→right.
       * 150 frames: wipe plays 0-26, label reveals at 28.
       */}
      <Composition
        id="trans-section-wipe"
        component={castComponent(SectionWipe)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={150}
        defaultProps={{
          categoryLabel: "Part II — The Reckoning",
          at: 0,
        }}
      />
    </>
  );
};

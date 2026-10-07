import { useEffect, useState } from "react";
import { AngleProof } from "@/components/angle-proof";
import { AreaProof } from "@/components/area-proof";
import { BalanceProof } from "@/components/balance-proof";
import { BubbleProof } from "@/components/bubble-proof";
import { EqualsProof } from "@/components/equals-proof";
import { FractionProof } from "@/components/fraction-proof";
import { GridProof } from "@/components/grid-proof";
import { InstrumentLab } from "@/components/instrument-lab";
import { Lobby } from "@/components/lobby";
import { MachineProof } from "@/components/machine-proof";
import { MotionProof } from "@/components/motion-proof";
import { OddsProof } from "@/components/odds-proof";
import { OrbitProof } from "@/components/orbit-proof";
import { PrimeProof } from "@/components/prime-proof";
import { SequenceProof } from "@/components/sequence-proof";
import { SlopeProof } from "@/components/slope-proof";
import { SymbolMatch } from "@/components/symbol-match";
import { ThereforeProof } from "@/components/therefore-proof";
import { VectorProof } from "@/components/vector-proof";
import { WaveProof } from "@/components/wave-proof";
import { emptyProgress, loadProgress, noteVisit, type ArcadeProgress, type TrackId } from "@/game/progress";
import { doorPose } from "@/game/render/stage";
import { useDoor } from "@/components/use-arrive";
import type { ReactNode } from "react";

type Screen = "lobby" | "lab" | TrackId;

export function Arcade() {
  const [screen, setScreen] = useState<Screen>("lobby");
  const [held, setHeld] = useState<Screen>("lobby");
  const [opened, setOpened] = useState<TrackId[]>([]);
  const [progress, setProgress] = useState<ArcadeProgress>(() => emptyProgress());
  const door = useDoor(screen !== "lobby");

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  useEffect(() => {
    if (screen === "lobby" && door < 0.02) setHeld("lobby");
  }, [screen, door]);

  function enter(id: TrackId) {
    setOpened((current) => (current.includes(id) ? current : [...current, id]));
    noteVisit(id);
    setProgress(loadProgress());
    setHeld(id);
    setScreen(id);
  }

  function leave() {
    setProgress(loadProgress());
    setScreen("lobby");
  }

  function openLab() {
    setHeld("lab");
    setScreen("lab");
  }

  const pose = doorPose(door);
  const lobbyShown = screen === "lobby" || door < 0.98;
  const lobbySettled = screen === "lobby" && door < 0.02;

  return (
    <>
      <div
        className={lobbyShown ? "h-dvh overflow-hidden" : "hidden"}
        style={
          lobbySettled
            ? undefined
            : {
                opacity: pose.lobbyOpacity,
                transform: `scale(${pose.lobbyScale})`,
                pointerEvents: screen === "lobby" ? "auto" : "none",
              }
        }
        aria-hidden={screen === "lobby" ? undefined : true}
      >
        <Lobby progress={progress} onPlay={enter} onLab={openLab} />
      </div>
      <Bay id="lab" screen={screen} held={held} door={door}>
        {screen === "lab" || held === "lab" ? <InstrumentLab onExit={leave} /> : null}
      </Bay>
      {opened.includes("bubbles") ? (
        <Bay id="bubbles" screen={screen} held={held} door={door}>
          <BubbleProof active={screen === "bubbles"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("symbols") ? (
        <Bay id="symbols" screen={screen} held={held} door={door}>
          <SymbolMatch active={screen === "symbols"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("equals") ? (
        <Bay id="equals" screen={screen} held={held} door={door}>
          <EqualsProof active={screen === "equals"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("run") ? (
        <Bay id="run" screen={screen} held={held} door={door}>
          <SequenceProof active={screen === "run"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("logic") ? (
        <Bay id="logic" screen={screen} held={held} door={door}>
          <ThereforeProof active={screen === "logic"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("odds") ? (
        <Bay id="odds" screen={screen} held={held} door={door}>
          <OddsProof active={screen === "odds"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("slope") ? (
        <Bay id="slope" screen={screen} held={held} door={door}>
          <SlopeProof active={screen === "slope"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("fractions") ? (
        <Bay id="fractions" screen={screen} held={held} door={door}>
          <FractionProof active={screen === "fractions"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("primes") ? (
        <Bay id="primes" screen={screen} held={held} door={door}>
          <PrimeProof active={screen === "primes"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("vectors") ? (
        <Bay id="vectors" screen={screen} held={held} door={door}>
          <VectorProof active={screen === "vectors"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("angles") ? (
        <Bay id="angles" screen={screen} held={held} door={door}>
          <AngleProof active={screen === "angles"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("machine") ? (
        <Bay id="machine" screen={screen} held={held} door={door}>
          <MachineProof active={screen === "machine"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("balance") ? (
        <Bay id="balance" screen={screen} held={held} door={door}>
          <BalanceProof active={screen === "balance"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("area") ? (
        <Bay id="area" screen={screen} held={held} door={door}>
          <AreaProof active={screen === "area"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("motion") ? (
        <Bay id="motion" screen={screen} held={held} door={door}>
          <MotionProof active={screen === "motion"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("grid") ? (
        <Bay id="grid" screen={screen} held={held} door={door}>
          <GridProof active={screen === "grid"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("waves") ? (
        <Bay id="waves" screen={screen} held={held} door={door}>
          <WaveProof active={screen === "waves"} onExit={leave} />
        </Bay>
      ) : null}
      {opened.includes("orbit") ? (
        <Bay id="orbit" screen={screen} held={held} door={door}>
          <OrbitProof active={screen === "orbit"} onExit={leave} />
        </Bay>
      ) : null}
    </>
  );
}

function Bay({
  id,
  screen,
  held,
  door,
  children,
}: {
  id: Screen;
  screen: Screen;
  held: Screen;
  door: number;
  children: ReactNode;
}) {
  const live = screen === id;
  const visible = live || (held === id && door > 0.02);
  const pose = doorPose(door);
  return (
    <div
      className={visible ? "h-dvh overflow-hidden" : "hidden"}
      style={
        visible
          ? {
              opacity: pose.stationOpacity,
              transform: `translateY(${pose.stationY}px)`,
              pointerEvents: live ? "auto" : "none",
            }
          : undefined
      }
      aria-hidden={live ? undefined : true}
    >
      {children}
    </div>
  );
}

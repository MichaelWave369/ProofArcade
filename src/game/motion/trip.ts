export type TripAim = "either" | "speed" | "time";

export type TripPlay = {
  id: number;
  title: string;
  blurb: string;
  aim: TripAim;
  flag: number;
  startSpeed: number;
  startTime: number;
  /** Locked speed, when the player is finding time. */
  speed: number;
  /** Locked time, when the player is finding speed. */
  time: number;
  maxSpeed: number;
  maxTime: number;
  solutionSpeed: number;
  solutionTime: number;
  track: number;
};

export const TRIP_LAW = "Distance = speed × time. The ghost mark is that product. The craft follows it when you launch. No drag, no head start.";

function play(
  id: number,
  title: string,
  aim: TripAim,
  blurb: string,
  flag: number,
  startSpeed: number,
  startTime: number,
  solutionSpeed: number,
  solutionTime: number,
  speed = 0,
  time = 0,
  maxSpeed = 8,
  maxTime = 8,
): TripPlay {
  return {
    id,
    title,
    aim,
    blurb,
    flag,
    startSpeed,
    startTime,
    speed,
    time,
    maxSpeed,
    maxTime,
    solutionSpeed,
    solutionTime,
    track: flag + 6,
  };
}

export const TRIP_PLAYS: TripPlay[] = [
  play(1, "Land on 6", "either", "Speed and time are both yours. Their product has to be 6 m.", 6, 1, 1, 2, 3),
  play(2, "A longer product", "either", "The flag is at 8 m. Change either dial.", 8, 2, 2, 2, 4),
  play(3, "Twelve meters", "either", "More than one pair lands on 12. Any honest pair counts.", 12, 1, 2, 3, 4),
  play(4, "Three seconds", "speed", "The clock is locked at 3 s. Choose the speed that reaches 9 m.", 9, 1, 3, 3, 3, 0, 3),
  play(5, "Four seconds", "speed", "Time stays 4 s. The flag is at 12 m.", 12, 1, 4, 3, 4, 0, 4),
  play(6, "Five seconds", "speed", "A longer clock, a nearer flag. Time is 5 s. The flag is 10 m.", 10, 1, 5, 2, 5, 0, 5),
  play(7, "Speed stays 4", "time", "You cannot change the speed. Choose how long the trip runs.", 12, 4, 1, 4, 3, 4, 0),
  play(8, "Speed stays 3", "time", "3 m each second. The flag is 15 m away.", 15, 3, 1, 3, 5, 3, 0),
  play(9, "Speed stays 2", "time", "A slow craft. Give it enough seconds to reach 8 m.", 8, 2, 1, 2, 4, 2, 0),
  play(10, "No faster than 4", "either", "The flag is at 16 m, and speed cannot pass 4.", 16, 1, 1, 4, 4, 0, 0, 4, 8),
  play(11, "No faster than 6", "either", "18 m, with speed capped at 6.", 18, 2, 2, 6, 3, 0, 0, 6, 8),
  play(12, "Six seconds", "speed", "The clock is 6 s. Reach 18 m.", 18, 1, 6, 3, 6, 0, 6),
  play(13, "Speed stays 5", "time", "5 m each second. The flag is at 20 m.", 20, 5, 2, 5, 4, 5, 0),
  play(14, "Twenty-four", "either", "The flag is far. Both dials are free.", 24, 3, 3, 4, 6),
  play(15, "A short clock", "speed", "Only 2 s. The flag is still 14 m out.", 14, 3, 2, 7, 2, 0, 2),
  play(16, "Speed stays 6", "time", "6 m each second. How many seconds reach 24 m?", 24, 6, 1, 6, 4, 6, 0),
];

export function tripDistance(speed: number, time: number) {
  return speed * time;
}

export function tripSolved(play: TripPlay, speed: number, time: number) {
  if (!Number.isInteger(speed) || !Number.isInteger(time)) return false;
  if (speed < 1 || time < 1 || speed > play.maxSpeed || time > play.maxTime) return false;
  if (play.aim === "speed" && time !== play.time) return false;
  if (play.aim === "time" && speed !== play.speed) return false;
  return speed * time === play.flag;
}

export function auditTrip(): string[] {
  const errors: string[] = [];
  if (TRIP_PLAYS.length !== 16) errors.push("trip count");
  const aims = new Set(TRIP_PLAYS.map((item) => item.aim));
  for (const aim of ["either", "speed", "time"] as const) {
    if (!aims.has(aim)) errors.push(`missing ${aim}`);
  }
  TRIP_PLAYS.forEach((item, index) => {
    if (item.id !== index + 1) errors.push(`id ${item.id}`);
    if (item.track <= item.flag) errors.push(`track ${item.id}`);
    if (tripSolved(item, item.startSpeed, item.startTime)) errors.push(`start solved ${item.id}`);
    if (!tripSolved(item, item.solutionSpeed, item.solutionTime)) errors.push(`unsolved ${item.id}`);
    if (item.solutionSpeed * item.solutionTime !== item.flag) errors.push(`product ${item.id}`);
    if (item.aim === "speed" && item.solutionTime !== item.time) errors.push(`lock time ${item.id}`);
    if (item.aim === "time" && item.solutionSpeed !== item.speed) errors.push(`lock speed ${item.id}`);
    if (item.aim === "either" && item.solutionSpeed > item.maxSpeed) errors.push(`cap ${item.id}`);
  });
  const open = TRIP_PLAYS[0];
  if (!open || tripSolved(open, 1, 6) !== true) errors.push("either accepts another pair");
  const capped = TRIP_PLAYS[9];
  if (!capped || tripSolved(capped, 8, 2) !== false) errors.push("cap should reject");
  return errors;
}

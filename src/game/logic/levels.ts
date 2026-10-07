export type LogicClaim = {
  text: string;
  follows: boolean;
  blurb: string;
};

export type LogicLevel = {
  id: number;
  title: string;
  move: string;
  premises: string[];
  claims: LogicClaim[];
};

export const LOGIC_LEVELS: LogicLevel[] = [
  {
    id: 1,
    title: "The rule fires",
    move: "If it is true, the result is true",
    premises: ["If it rains, the path is wet.", "It is raining."],
    claims: [
      { text: "The path is wet.", follows: true, blurb: "The rule said rain makes the path wet, and it is raining." },
      { text: "The path is dry.", follows: false, blurb: "Dry would contradict the rule once rain is given." },
      { text: "It is not raining.", follows: false, blurb: "The second line says it is raining." },
      { text: "Rain is enough to make this path wet.", follows: true, blurb: "That is what the first line already says." },
    ],
  },
  {
    id: 2,
    title: "Dark lamp",
    move: "If the result failed, the cause failed",
    premises: ["If the switch is on, the lamp is lit.", "The lamp is dark."],
    claims: [
      { text: "The switch is off.", follows: true, blurb: "A lit lamp is required when the switch is on. The lamp is dark, so the switch is not on." },
      { text: "The switch is on.", follows: false, blurb: "An on switch would force a lit lamp." },
      { text: "The lamp is lit.", follows: false, blurb: "The second line says the lamp is dark." },
      { text: "The switch cannot be on.", follows: true, blurb: "Same denial, said the other way. On is impossible here." },
    ],
  },
  {
    id: 3,
    title: "One of the two",
    move: "Knock out one option",
    premises: ["The card is a heart or a spade.", "The card is not a heart."],
    claims: [
      { text: "The card is a spade.", follows: true, blurb: "Heart is gone, so the remaining option stands." },
      { text: "The card is a diamond.", follows: false, blurb: "Diamond was never one of the two options." },
      { text: "The card could still be a heart.", follows: false, blurb: "The second line already ruled hearts out." },
      { text: "The card is not a heart.", follows: true, blurb: "That line was given. It still follows." },
    ],
  },
  {
    id: 4,
    title: "Both lines",
    move: "Each given fact still holds",
    premises: ["The number is even.", "The number is greater than 10."],
    claims: [
      { text: "The number is even.", follows: true, blurb: "Given outright." },
      { text: "The number is greater than 10.", follows: true, blurb: "Also given. Both can be true together." },
      { text: "The number is 12.", follows: false, blurb: "12 fits, but 14 and 16 fit too. Nothing forces 12." },
      { text: "The number is odd.", follows: false, blurb: "Odd contradicts even." },
    ],
  },
  {
    id: 5,
    title: "Wet path",
    move: "The result does not prove the cause",
    premises: ["If it rains, the path is wet.", "The path is wet."],
    claims: [
      { text: "It must be raining.", follows: false, blurb: "A hose, a spill, or dew can wet a path. The rule only runs one direction." },
      { text: "It must be dry weather.", follows: false, blurb: "Rain is still possible. Wet does not forbid it." },
      { text: "The path is wet.", follows: true, blurb: "That was given." },
      { text: "Rain would wet the path.", follows: true, blurb: "The first line still stands, whether or not this wetness came from rain." },
    ],
  },
  {
    id: 6,
    title: "Open gate",
    move: "Denying the cause proves nothing about the result",
    premises: ["If the gate is locked, the bell rings.", "The gate is not locked."],
    claims: [
      { text: "The bell is silent.", follows: false, blurb: "The rule does not say the bell rings only for a locked gate." },
      { text: "The bell must be ringing.", follows: false, blurb: "Unlocked does not force the bell either way." },
      { text: "The gate is unlocked.", follows: true, blurb: "Restating the second line." },
      { text: "These lines do not settle the bell.", follows: true, blurb: "Locked would settle it. Unlocked leaves it open." },
    ],
  },
  {
    id: 7,
    title: "Multiples of four",
    move: "A general rule applies to the case in front of you",
    premises: ["Every multiple of 4 is even.", "12 is a multiple of 4."],
    claims: [
      { text: "12 is even.", follows: true, blurb: "12 is a multiple of 4, and every such multiple is even." },
      { text: "Every even number is a multiple of 4.", follows: false, blurb: "That is the rule backwards. 2 is even and not a multiple of 4, and nothing here forbids that." },
      { text: "10 is a multiple of 4.", follows: false, blurb: "10 was never claimed." },
      { text: "12 is a multiple of 4.", follows: true, blurb: "Given on the second line." },
    ],
  },
  {
    id: 8,
    title: "Some, not all",
    move: "Some means at least one",
    premises: ["Some primes are odd.", "2 is prime."],
    claims: [
      { text: "At least one prime is odd.", follows: true, blurb: "That is what some means." },
      { text: "There exists an odd prime.", follows: true, blurb: "Same fact, different words." },
      { text: "2 is odd.", follows: false, blurb: "Being prime was not tied to being odd for this case." },
      { text: "Every prime is odd.", follows: false, blurb: "Some does not mean every." },
    ],
  },
  {
    id: 9,
    title: "The chain",
    move: "Follow the links",
    premises: ["If the key turns, the bolt slides.", "If the bolt slides, the door opens.", "The key turns."],
    claims: [
      { text: "The bolt slides.", follows: true, blurb: "The key turned, so the first rule fires." },
      { text: "The door opens.", follows: true, blurb: "Bolt slides, so the second rule fires too." },
      { text: "The door stays shut.", follows: false, blurb: "Shut contradicts the chain." },
      { text: "The key did not turn.", follows: false, blurb: "The third line says it did." },
    ],
  },
  {
    id: 10,
    title: "Squares",
    move: "Flip a rule by denying both ends",
    premises: ["If a shape is a square, then it has four equal sides."],
    claims: [
      { text: "If a shape does not have four equal sides, it is not a square.", follows: true, blurb: "The flipped form of the same rule. Unequal sides cannot hide a square." },
      { text: "If a shape has four equal sides, it is a square.", follows: false, blurb: "A rhombus can have four equal sides and still not be a square. The rule never said that." },
      { text: "If a shape is not a square, it lacks four equal sides.", follows: false, blurb: "A rhombus can have four equal sides and still not be a square. Not-a-square does not force unequal sides." },
      { text: "A square has four equal sides.", follows: true, blurb: "Drop the 'if' and the result remains." },
    ],
  },
  {
    id: 11,
    title: "Not both",
    move: "Taking one drops the other",
    premises: ["You cannot have both the cake and the coin.", "You have the cake."],
    claims: [
      { text: "You do not have the coin.", follows: true, blurb: "Both together are forbidden, and the cake is already taken." },
      { text: "You have the coin.", follows: false, blurb: "That would be both." },
      { text: "You have neither.", follows: false, blurb: "You have the cake, so neither is false." },
      { text: "You have the cake.", follows: true, blurb: "Given." },
    ],
  },
  {
    id: 12,
    title: "At least one",
    move: "Inclusive or leaves the other open",
    premises: ["At least one is true: the quiz was passed, or the essay was passed.", "The quiz was passed."],
    claims: [
      { text: "The essay was failed.", follows: false, blurb: "At least one allows both. Passing the quiz does not kill the essay." },
      { text: "The quiz was passed.", follows: true, blurb: "Given." },
      { text: "Both were failed.", follows: false, blurb: "The quiz was passed, so both failed is impossible." },
      { text: "These lines do not decide the essay.", follows: true, blurb: "Passing the quiz leaves the essay open. At least one allows both." },
    ],
  },
  {
    id: 13,
    title: "Needed, not enough",
    move: "A requirement runs when the result is seen",
    premises: ["The torch lights only if it has a battery.", "The torch is lit."],
    claims: [
      { text: "The torch has a battery.", follows: true, blurb: "Lit is impossible without a battery, and it is lit." },
      { text: "Any torch with a battery is lit.", follows: false, blurb: "A battery is required, not a guarantee. The switch can still be off." },
      { text: "The torch is dark.", follows: false, blurb: "The second line says it is lit." },
      { text: "No battery would mean no light.", follows: true, blurb: "That is the requirement, said from the other side." },
    ],
  },
  {
    id: 14,
    title: "Squares and rectangles",
    move: "The wider set does not collapse",
    premises: ["All squares are rectangles.", "This tile is a square."],
    claims: [
      { text: "This tile is a rectangle.", follows: true, blurb: "It is a square, and every square is a rectangle." },
      { text: "Every rectangle is a square.", follows: false, blurb: "The rule does not run backwards." },
      { text: "This tile is not a rectangle.", follows: false, blurb: "That contradicts the first claim that does follow." },
      { text: "This tile is a square.", follows: true, blurb: "Given." },
    ],
  },
  {
    id: 15,
    title: "Divisible",
    move: "Apply the rule you were given, not its reverse",
    premises: ["If a whole number is divisible by 6, then it is divisible by 3.", "18 is divisible by 6."],
    claims: [
      { text: "18 is divisible by 3.", follows: true, blurb: "18 meets the condition, so the result follows." },
      { text: "If a whole number is divisible by 3, then it is divisible by 6.", follows: false, blurb: "9 is the classic counterexample, and these lines never claim the reverse." },
      { text: "9 is divisible by 6.", follows: false, blurb: "9 is not mentioned, and the rule does not push upward." },
      { text: "18 is divisible by 6.", follows: true, blurb: "Given." },
    ],
  },
  {
    id: 16,
    title: "Mixed bench",
    move: "Use only what was written",
    premises: ["If the sample is pure gold, then it conducts.", "The sample conducts.", "If the sample is iron, then it is not pure gold."],
    claims: [
      { text: "The sample must be pure gold.", follows: false, blurb: "Conducting is the result, not proof of the cause. Other metals conduct." },
      { text: "The sample conducts.", follows: true, blurb: "Given." },
      { text: "If this sample is iron, it is not pure gold.", follows: true, blurb: "The third line says exactly that." },
      { text: "The sample must be iron.", follows: false, blurb: "Iron is one story that fits. It is not forced." },
      { text: "A pure gold sample would conduct.", follows: true, blurb: "The first line still holds." },
    ],
  },
];

export function auditLogic(): string[] {
  const errors: string[] = [];
  if (LOGIC_LEVELS.length !== 16) errors.push(`logic count ${LOGIC_LEVELS.length}`);
  LOGIC_LEVELS.forEach((level, index) => {
    if (level.id !== index + 1) errors.push(`logic id ${level.id}`);
    if (level.premises.length < 1) errors.push(`level ${level.id} premises`);
    if (level.claims.length < 4) errors.push(`level ${level.id} claims ${level.claims.length}`);
    const follows = level.claims.filter((claim) => claim.follows).length;
    const denied = level.claims.length - follows;
    if (follows < 2) errors.push(`level ${level.id} follows ${follows}`);
    if (denied < 2) errors.push(`level ${level.id} denied ${denied}`);
    const seen = new Set<string>();
    for (const claim of level.claims) {
      if (seen.has(claim.text)) errors.push(`level ${level.id} duplicate claim`);
      seen.add(claim.text);
      if (!claim.blurb || !claim.text) errors.push(`level ${level.id} empty claim`);
    }
    if (!level.move || !level.title) errors.push(`level ${level.id} title`);
  });
  return errors;
}

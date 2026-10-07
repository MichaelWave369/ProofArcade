export type RunPrompt = {
  rule: string;
  terms: (string | null)[];
  choices: string[];
  answer: string;
  blurb: string;
};

export type RunLevel = {
  id: number;
  title: string;
  prompts: RunPrompt[];
};

export const RUN_LEVELS: RunLevel[] = [
  {
    id: 1,
    title: "Step two",
    prompts: [
      { rule: "Add 2", terms: ["2", "4", "6", null, "10"], choices: ["7", "8", "9", "12"], answer: "8", blurb: "Even steps. 6 + 2 = 8." },
      { rule: "Add 2", terms: ["1", "3", "5", "7", null], choices: ["8", "9", "10", "11"], answer: "9", blurb: "Odd numbers. 7 + 2 = 9." },
      { rule: "Add 2", terms: ["10", "12", "14", null, "18"], choices: ["15", "16", "17", "20"], answer: "16", blurb: "14 + 2 = 16, then 18." },
    ],
  },
  {
    id: 2,
    title: "Step five",
    prompts: [
      { rule: "Add 5", terms: ["5", "10", "15", null, "25"], choices: ["18", "20", "21", "30"], answer: "20", blurb: "15 + 5 = 20." },
      { rule: "Add 5", terms: ["3", "8", "13", "18", null], choices: ["21", "22", "23", "28"], answer: "23", blurb: "18 + 5 = 23." },
      { rule: "Subtract 5", terms: ["40", "35", "30", null, "20"], choices: ["22", "25", "28", "15"], answer: "25", blurb: "Counting down by 5. 30 − 5 = 25." },
    ],
  },
  {
    id: 3,
    title: "Squares",
    prompts: [
      { rule: "Square numbers", terms: ["1", "4", "9", "16", null], choices: ["20", "24", "25", "36"], answer: "25", blurb: "1² 2² 3² 4² 5². Next is 25." },
      { rule: "Square numbers", terms: ["4", "9", "16", null, "36"], choices: ["20", "25", "30", "49"], answer: "25", blurb: "2² through 6². The gap is 5²." },
      { rule: "Square numbers", terms: ["36", "49", "64", null], choices: ["72", "80", "81", "100"], answer: "81", blurb: "6² 7² 8² 9². Next is 81." },
    ],
  },
  {
    id: 4,
    title: "Cubes",
    prompts: [
      { rule: "Cubes", terms: ["1", "8", "27", null], choices: ["36", "48", "64", "81"], answer: "64", blurb: "1³ 2³ 3³ 4³. Four cubed is 64." },
      { rule: "Cubes", terms: ["8", "27", "64", null], choices: ["81", "100", "125", "216"], answer: "125", blurb: "2³ through 5³. Five cubed is 125." },
      { rule: "Cubes", terms: ["1", "8", null, "64", "125"], choices: ["16", "27", "32", "36"], answer: "27", blurb: "The missing cube is 3³ = 27." },
    ],
  },
  {
    id: 5,
    title: "Doubles",
    prompts: [
      { rule: "Multiply by 2", terms: ["3", "6", "12", null, "48"], choices: ["18", "24", "30", "36"], answer: "24", blurb: "12 × 2 = 24, then 48." },
      { rule: "Multiply by 2", terms: ["1", "2", "4", "8", null], choices: ["10", "12", "16", "32"], answer: "16", blurb: "Powers of two. 8 × 2 = 16." },
      { rule: "Multiply by 2", terms: ["5", "10", "20", null], choices: ["25", "30", "40", "60"], answer: "40", blurb: "20 × 2 = 40." },
    ],
  },
  {
    id: 6,
    title: "Triples",
    prompts: [
      { rule: "Multiply by 3", terms: ["2", "6", "18", null], choices: ["24", "36", "54", "72"], answer: "54", blurb: "18 × 3 = 54." },
      { rule: "Multiply by 3", terms: ["1", "3", "9", "27", null], choices: ["54", "63", "81", "108"], answer: "81", blurb: "27 × 3 = 81." },
      { rule: "Multiply by 3", terms: ["4", "12", null, "108"], choices: ["24", "36", "48", "54"], answer: "36", blurb: "12 × 3 = 36, and 36 × 3 = 108." },
    ],
  },
  {
    id: 7,
    title: "Fibonacci",
    prompts: [
      { rule: "Add the previous two", terms: ["1", "1", "2", "3", "5", null], choices: ["6", "7", "8", "10"], answer: "8", blurb: "3 + 5 = 8." },
      { rule: "Add the previous two", terms: ["2", "3", "5", "8", null], choices: ["11", "12", "13", "16"], answer: "13", blurb: "5 + 8 = 13." },
      { rule: "Add the previous two", terms: ["1", "2", "3", "5", "8", null], choices: ["11", "12", "13", "21"], answer: "13", blurb: "5 + 8 = 13 again, from a different start." },
    ],
  },
  {
    id: 8,
    title: "Triangular",
    prompts: [
      { rule: "Add the next integer", terms: ["1", "3", "6", "10", null], choices: ["12", "14", "15", "16"], answer: "15", blurb: "Differences are 2, 3, 4, 5. 10 + 5 = 15." },
      { rule: "Add the next integer", terms: ["6", "10", "15", null, "28"], choices: ["18", "20", "21", "24"], answer: "21", blurb: "15 + 6 = 21, then 21 + 7 = 28." },
      { rule: "Add the next integer", terms: ["10", "15", "21", null], choices: ["26", "27", "28", "36"], answer: "28", blurb: "21 + 7 = 28." },
    ],
  },
  {
    id: 9,
    title: "Powers of two",
    prompts: [
      { rule: "Powers of 2", terms: ["2", "4", "8", "16", null], choices: ["24", "30", "32", "64"], answer: "32", blurb: "16 × 2 = 32." },
      { rule: "Powers of 2", terms: ["1", "2", "4", null, "16"], choices: ["6", "8", "10", "12"], answer: "8", blurb: "4 × 2 = 8, then 16." },
      { rule: "Powers of 2", terms: ["16", "32", "64", null], choices: ["96", "100", "128", "256"], answer: "128", blurb: "64 × 2 = 128." },
    ],
  },
  {
    id: 10,
    title: "Primes",
    prompts: [
      { rule: "Prime numbers", terms: ["2", "3", "5", "7", null], choices: ["8", "9", "10", "11"], answer: "11", blurb: "After 7, the next prime is 11." },
      { rule: "Prime numbers", terms: ["3", "5", "7", "11", null], choices: ["12", "13", "14", "15"], answer: "13", blurb: "11 is prime. Next is 13, not 12." },
      { rule: "Prime numbers", terms: ["5", "7", "11", "13", null], choices: ["15", "16", "17", "19"], answer: "17", blurb: "15 is composite. 17 is prime." },
    ],
  },
  {
    id: 11,
    title: "Angles",
    prompts: [
      { rule: "Add 15°", terms: ["0°", "15°", "30°", null, "60°"], choices: ["40°", "45°", "50°", "75°"], answer: "45°", blurb: "30° + 15° = 45°." },
      { rule: "Add 15°", terms: ["30°", "45°", "60°", null], choices: ["65°", "70°", "75°", "90°"], answer: "75°", blurb: "60° + 15° = 75°." },
      { rule: "Subtract 15°", terms: ["90°", "75°", "60°", null], choices: ["30°", "40°", "45°", "50°"], answer: "45°", blurb: "60° − 15° = 45°." },
    ],
  },
  {
    id: 12,
    title: "Motion",
    prompts: [
      { rule: "Constant speed, 3 each second", terms: ["0", "3", "6", "9", null], choices: ["10", "11", "12", "15"], answer: "12", blurb: "Distance = speed × time. 3 × 4 = 12." },
      { rule: "Fall distances, squares", terms: ["1", "4", "9", "16", null], choices: ["20", "24", "25", "36"], answer: "25", blurb: "From rest, distance grows with t²: 5² = 25." },
      { rule: "Speed gains 2 each second", terms: ["0", "2", "4", "6", null], choices: ["7", "8", "10", "12"], answer: "8", blurb: "Constant acceleration. The next speed is 8." },
    ],
  },
  {
    id: 13,
    title: "Halves",
    prompts: [
      { rule: "Divide by 2", terms: ["1", "1/2", "1/4", "1/8", null], choices: ["1/10", "1/12", "1/16", "1/32"], answer: "1/16", blurb: "Each term is half the last. Half of 1/8 is 1/16." },
      { rule: "Divide by 3", terms: ["81", "27", "9", "3", null], choices: ["0", "1", "1.5", "2"], answer: "1", blurb: "3 ÷ 3 = 1." },
      { rule: "Divide by 2", terms: ["64", "32", "16", "8", null], choices: ["2", "4", "6", "0"], answer: "4", blurb: "8 ÷ 2 = 4." },
    ],
  },
  {
    id: 14,
    title: "Growing steps",
    prompts: [
      { rule: "Steps grow by 2", terms: ["1", "3", "7", "13", null], choices: ["17", "19", "20", "21"], answer: "21", blurb: "Differences 2, 4, 6, 8. 13 + 8 = 21." },
      { rule: "Steps grow by 1", terms: ["2", "3", "5", "8", "12", null], choices: ["15", "16", "17", "20"], answer: "17", blurb: "Differences 1, 2, 3, 4, 5. 12 + 5 = 17." },
      { rule: "Steps grow by 1", terms: ["5", "6", "8", "11", "15", null], choices: ["18", "19", "20", "21"], answer: "20", blurb: "Differences 1, 2, 3, 4, 5. 15 + 5 = 20." },
    ],
  },
  {
    id: 15,
    title: "Factorials",
    prompts: [
      { rule: "n!", terms: ["1", "2", "6", "24", null], choices: ["48", "72", "120", "720"], answer: "120", blurb: "1, 2, 6, 24, 120 are 1! through 5!." },
      { rule: "n!", terms: ["2", "6", "24", "120", null], choices: ["240", "360", "600", "720"], answer: "720", blurb: "120 × 6 = 720, which is 6!." },
      { rule: "n!", terms: ["1", "2", "6", null, "120"], choices: ["12", "18", "24", "36"], answer: "24", blurb: "The missing term is 4! = 24." },
    ],
  },
  {
    id: 16,
    title: "Mixed proof",
    prompts: [
      { rule: "Square numbers", terms: ["16", "25", "36", "49", null], choices: ["56", "60", "64", "81"], answer: "64", blurb: "4² through 8². Next is 64." },
      { rule: "Add the previous two", terms: ["3", "5", "8", "13", null], choices: ["18", "20", "21", "26"], answer: "21", blurb: "8 + 13 = 21." },
      { rule: "Cubes", terms: ["8", "27", "64", "125", null], choices: ["150", "180", "196", "216"], answer: "216", blurb: "2³ through 6³. Six cubed is 216." },
    ],
  },
];

export function auditRun(): string[] {
  const errors: string[] = [];
  RUN_LEVELS.forEach((level, index) => {
    if (level.id !== index + 1) errors.push(`run id ${level.id}`);
    if (level.prompts.length !== 3) errors.push(`level ${level.id} prompts ${level.prompts.length}`);
    for (const prompt of level.prompts) {
      const blanks = prompt.terms.filter((term) => term === null).length;
      if (blanks !== 1) errors.push(`level ${level.id} blanks ${blanks}`);
      if (prompt.choices.length !== 4) errors.push(`level ${level.id} choices`);
      if (new Set(prompt.choices).size !== prompt.choices.length) errors.push(`level ${level.id} duplicate choice`);
      if (!prompt.choices.includes(prompt.answer)) errors.push(`level ${level.id} answer missing`);
    }
  });
  return errors;
}

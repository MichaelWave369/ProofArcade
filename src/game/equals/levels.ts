export type EqualsCard = {
  a: string;
  b?: string;
  match: boolean;
  blurb: string;
};

export type EqualsLevel = {
  id: number;
  title: string;
  target: string;
  blurb: string;
  par: number;
  cards: EqualsCard[];
};

export const EQUALS_LEVELS: EqualsLevel[] = [
  {
    id: 1,
    title: "Four",
    target: "4",
    blurb: "Pop every card that equals 4. Leave the rest.",
    par: 20,
    cards: [
      { a: "2²", match: true, blurb: "Two squared is 4." },
      { a: "√16", match: true, blurb: "The square root of 16 is 4." },
      { a: "8÷2", match: true, blurb: "Eight divided by two is 4." },
      { a: "6−2", match: true, blurb: "Six minus two is 4." },
      { a: "3²", match: false, blurb: "Three squared is 9." },
      { a: "2×3", match: false, blurb: "Two times three is 6." },
    ],
  },
  {
    id: 2,
    title: "Eight",
    target: "8",
    blurb: "Same value, different spelling. Force counts too.",
    par: 22,
    cards: [
      { a: "2³", match: true, blurb: "Two cubed is 8." },
      { a: "√64", match: true, blurb: "The square root of 64 is 8." },
      { a: "4×2", match: true, blurb: "Four times two is 8." },
      { a: "F=ma", b: "2·4", match: true, blurb: "Force is mass times acceleration. 2 × 4 = 8." },
      { a: "3²", match: false, blurb: "Three squared is 9." },
      { a: "4²", match: false, blurb: "Four squared is 16." },
      { a: "2×3", match: false, blurb: "Two times three is 6." },
    ],
  },
  {
    id: 3,
    title: "Nine",
    target: "9",
    blurb: "Squares and sums can hide the same number.",
    par: 22,
    cards: [
      { a: "3²", match: true, blurb: "Three squared is 9." },
      { a: "√81", match: true, blurb: "The square root of 81 is 9." },
      { a: "6+3", match: true, blurb: "Six plus three is 9." },
      { a: "18÷2", match: true, blurb: "Eighteen divided by two is 9." },
      { a: "2³", match: false, blurb: "Two cubed is 8." },
      { a: "4²", match: false, blurb: "Four squared is 16." },
      { a: "5×2", match: false, blurb: "Five times two is 10." },
    ],
  },
  {
    id: 4,
    title: "Twelve",
    target: "12",
    blurb: "A triangle's area can match a product.",
    par: 26,
    cards: [
      { a: "3×4", match: true, blurb: "Three times four is 12." },
      { a: "√144", match: true, blurb: "The square root of 144 is 12." },
      { a: "½bh", b: "6·4", match: true, blurb: "Triangle area is half base times height. ½ × 6 × 4 = 12." },
      { a: "24÷2", match: true, blurb: "Twenty-four divided by two is 12." },
      { a: "4²", match: false, blurb: "Four squared is 16." },
      { a: "3³", match: false, blurb: "Three cubed is 27." },
      { a: "5×3", match: false, blurb: "Five times three is 15." },
      { a: "2³", match: false, blurb: "Two cubed is 8." },
    ],
  },
  {
    id: 5,
    title: "Sixteen",
    target: "16",
    blurb: "Kinetic energy can land on the same number as a square.",
    par: 28,
    cards: [
      { a: "4²", match: true, blurb: "Four squared is 16." },
      { a: "2⁴", match: true, blurb: "Two to the fourth is 16." },
      { a: "s²", b: "s=4", match: true, blurb: "A square of side 4 has area 16." },
      { a: "½mv²", b: "2·4²", match: true, blurb: "Kinetic energy ½mv² with m = 2 and v = 4 is 16." },
      { a: "4×5", match: false, blurb: "Four times five is 20." },
      { a: "3²", match: false, blurb: "Three squared is 9." },
      { a: "√81", match: false, blurb: "The square root of 81 is 9." },
      { a: "5²", match: false, blurb: "Five squared is 25." },
    ],
  },
  {
    id: 6,
    title: "Six",
    target: "6",
    blurb: "Watch the near misses. 8 and 5 are not 6.",
    par: 24,
    cards: [
      { a: "2×3", match: true, blurb: "Two times three is 6." },
      { a: "√36", match: true, blurb: "The square root of 36 is 6." },
      { a: "9−3", match: true, blurb: "Nine minus three is 6." },
      { a: "12÷2", match: true, blurb: "Twelve divided by two is 6." },
      { a: "2³", match: false, blurb: "Two cubed is 8." },
      { a: "3+2", match: false, blurb: "Three plus two is 5." },
      { a: "4×4", match: false, blurb: "Four times four is 16." },
      { a: "5+2", match: false, blurb: "Five plus two is 7." },
    ],
  },
  {
    id: 7,
    title: "Ten",
    target: "10",
    blurb: "Momentum is mass times velocity.",
    par: 26,
    cards: [
      { a: "5×2", match: true, blurb: "Five times two is 10." },
      { a: "√100", match: true, blurb: "The square root of 100 is 10." },
      { a: "p=mv", b: "2·5", match: true, blurb: "Momentum p = mv. 2 × 5 = 10." },
      { a: "15−5", match: true, blurb: "Fifteen minus five is 10." },
      { a: "3²", match: false, blurb: "Three squared is 9." },
      { a: "4×4", match: false, blurb: "Four times four is 16." },
      { a: "2³", match: false, blurb: "Two cubed is 8." },
      { a: "6×3", match: false, blurb: "Six times three is 18." },
    ],
  },
  {
    id: 8,
    title: "Twenty-five",
    target: "25",
    blurb: "A square of side 5 covers 25.",
    par: 24,
    cards: [
      { a: "5²", match: true, blurb: "Five squared is 25." },
      { a: "√625", match: true, blurb: "The square root of 625 is 25." },
      { a: "s²", b: "s=5", match: true, blurb: "A square of side 5 has area 25." },
      { a: "100÷4", match: true, blurb: "One hundred divided by four is 25." },
      { a: "4²", match: false, blurb: "Four squared is 16." },
      { a: "6²", match: false, blurb: "Six squared is 36." },
      { a: "3³", match: false, blurb: "Three cubed is 27." },
      { a: "2×10", match: false, blurb: "Two times ten is 20." },
    ],
  },
  {
    id: 9,
    title: "One half",
    target: "½",
    blurb: "Sine and cosine can equal a plain fraction.",
    par: 30,
    cards: [
      { a: "1÷2", match: true, blurb: "One divided by two is one half." },
      { a: "sin", b: "30°", match: true, blurb: "Sine of 30° is 1/2." },
      { a: "cos", b: "60°", match: true, blurb: "Cosine of 60° is 1/2." },
      { a: "3÷6", match: true, blurb: "Three divided by six is one half." },
      { a: "sin", b: "90°", match: false, blurb: "Sine of 90° is 1." },
      { a: "cos", b: "0°", match: false, blurb: "Cosine of 0° is 1." },
      { a: "tan", b: "45°", match: false, blurb: "Tangent of 45° is 1." },
      { a: "2÷2", match: false, blurb: "Two divided by two is 1." },
    ],
  },
  {
    id: 10,
    title: "Thirty-six",
    target: "36",
    blurb: "Six squared, and three ways to build it.",
    par: 26,
    cards: [
      { a: "6²", match: true, blurb: "Six squared is 36." },
      { a: "9×4", match: true, blurb: "Nine times four is 36." },
      { a: "3×12", match: true, blurb: "Three times twelve is 36." },
      { a: "√1296", match: true, blurb: "The square root of 1296 is 36." },
      { a: "5²", match: false, blurb: "Five squared is 25." },
      { a: "7²", match: false, blurb: "Seven squared is 49." },
      { a: "8×4", match: false, blurb: "Eight times four is 32." },
      { a: "4³", match: false, blurb: "Four cubed is 64." },
    ],
  },
  {
    id: 11,
    title: "Phi",
    target: "φ",
    blurb: "The golden ratio. Close is not the same.",
    par: 28,
    cards: [
      { a: "φ", match: true, blurb: "Phi, about 1.618." },
      { a: "1+√5", b: "÷ 2", match: true, blurb: "(1 + √5) / 2 is phi." },
      { a: "1.618", match: true, blurb: "Phi, written as a decimal." },
      { a: "π", match: false, blurb: "Pi is about 3.14, not phi." },
      { a: "√2", match: false, blurb: "The square root of 2 is about 1.414." },
      { a: "e", match: false, blurb: "Euler's number is about 2.718." },
      { a: "8÷5", match: false, blurb: "Eight fifths is 1.6, near phi but not it." },
      { a: "22÷7", match: false, blurb: "Twenty-two sevenths is about 3.14, a stand-in for pi." },
    ],
  },
  {
    id: 12,
    title: "Four pi",
    target: "4π",
    blurb: "Area and circumference can share a value.",
    par: 32,
    cards: [
      { a: "πr²", b: "r=2", match: true, blurb: "Circle area πr² with radius 2 is 4π." },
      { a: "2πr", b: "r=2", match: true, blurb: "Circumference 2πr with radius 2 is 4π." },
      { a: "πd", b: "d=4", match: true, blurb: "Circumference πd with diameter 4 is 4π." },
      { a: "4π", match: true, blurb: "Four times pi." },
      { a: "πr²", b: "r=1", match: false, blurb: "Area with radius 1 is π, not 4π." },
      { a: "2πr", b: "r=1", match: false, blurb: "A unit circle's circumference is 2π." },
      { a: "πd", b: "d=8", match: false, blurb: "Diameter 8 gives 8π." },
      { a: "πr²", b: "r=4", match: false, blurb: "Radius 4 gives area 16π." },
    ],
  },
  {
    id: 13,
    title: "Twenty-four",
    target: "24",
    blurb: "Work and area again. Read the givens.",
    par: 30,
    cards: [
      { a: "6×4", match: true, blurb: "Six times four is 24." },
      { a: "8×3", match: true, blurb: "Eight times three is 24." },
      { a: "48÷2", match: true, blurb: "Forty-eight divided by two is 24." },
      { a: "½bh", b: "8·6", match: true, blurb: "½ × 8 × 6 = 24." },
      { a: "4²", match: false, blurb: "Four squared is 16." },
      { a: "5²", match: false, blurb: "Five squared is 25." },
      { a: "3³", match: false, blurb: "Three cubed is 27." },
      { a: "7×3", match: false, blurb: "Seven times three is 21." },
      { a: "20+5", match: false, blurb: "Twenty plus five is 25." },
    ],
  },
  {
    id: 14,
    title: "Twenty-seven",
    target: "27",
    blurb: "A cube, a product, and a force.",
    par: 28,
    cards: [
      { a: "3³", match: true, blurb: "Three cubed is 27." },
      { a: "9×3", match: true, blurb: "Nine times three is 27." },
      { a: "√729", match: true, blurb: "The square root of 729 is 27." },
      { a: "F=ma", b: "9·3", match: true, blurb: "Force 9 × 3 = 27." },
      { a: "3²", match: false, blurb: "Three squared is 9." },
      { a: "2⁵", match: false, blurb: "Two to the fifth is 32." },
      { a: "5²", match: false, blurb: "Five squared is 25." },
      { a: "6×4", match: false, blurb: "Six times four is 24." },
    ],
  },
  {
    id: 15,
    title: "One",
    target: "1",
    blurb: "The quiet identities. Zero is not one.",
    par: 30,
    cards: [
      { a: "sin", b: "90°", match: true, blurb: "Sine of 90° is 1." },
      { a: "cos", b: "0°", match: true, blurb: "Cosine of 0° is 1." },
      { a: "tan", b: "45°", match: true, blurb: "Tangent of 45° is 1." },
      { a: "7÷7", match: true, blurb: "Seven divided by seven is 1." },
      { a: "1²", match: true, blurb: "One squared is 1." },
      { a: "sin", b: "0°", match: false, blurb: "Sine of 0° is 0." },
      { a: "cos", b: "90°", match: false, blurb: "Cosine of 90° is 0." },
      { a: "2²", match: false, blurb: "Two squared is 4." },
      { a: "1÷2", match: false, blurb: "One half, not one." },
    ],
  },
  {
    id: 16,
    title: "Sixty-four",
    target: "64",
    blurb: "Last page. Cube, square, and a sixth power.",
    par: 28,
    cards: [
      { a: "8²", match: true, blurb: "Eight squared is 64." },
      { a: "4³", match: true, blurb: "Four cubed is 64." },
      { a: "2⁶", match: true, blurb: "Two to the sixth is 64." },
      { a: "√4096", match: true, blurb: "The square root of 4096 is 64." },
      { a: "6²", match: false, blurb: "Six squared is 36." },
      { a: "7²", match: false, blurb: "Seven squared is 49." },
      { a: "9×7", match: false, blurb: "Nine times seven is 63." },
      { a: "4²", match: false, blurb: "Four squared is 16." },
      { a: "3³", match: false, blurb: "Three cubed is 27." },
    ],
  },
];

export function auditEquals(): string[] {
  const errors: string[] = [];
  EQUALS_LEVELS.forEach((level, index) => {
    if (level.id !== index + 1) errors.push(`equals id ${level.id}`);
    const matches = level.cards.filter((card) => card.match).length;
    const decoys = level.cards.length - matches;
    if (matches < 3) errors.push(`level ${level.id} matches ${matches}`);
    if (decoys < 2) errors.push(`level ${level.id} decoys ${decoys}`);
    const seen = new Set<string>();
    for (const card of level.cards) {
      const key = `${card.a}|${card.b ?? ""}`;
      if (seen.has(key)) errors.push(`level ${level.id} duplicate ${key}`);
      seen.add(key);
      if (!card.blurb) errors.push(`level ${level.id} missing blurb`);
    }
  });
  return errors;
}

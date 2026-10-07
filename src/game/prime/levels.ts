export type PrimeLevel = {
  id: number;
  title: string;
  blurb: string;
  numbers: number[];
};

export const PRIME_LEVELS: PrimeLevel[] = [
  { id: 1, title: "To ten", blurb: "1 is not prime. 2 is.", numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { id: 2, title: "Teens", blurb: "11, 13, 17. Watch the evens.", numbers: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17] },
  { id: 3, title: "Odds that fail", blurb: "9, 15, 21, 25, 27 are odd and not prime.", numbers: [13, 15, 17, 19, 21, 23, 25, 27] },
  { id: 4, title: "Into the thirties", blurb: "23, 29, 31.", numbers: [21, 22, 23, 25, 27, 29, 31, 32] },
  { id: 5, title: "Only even prime", blurb: "2 is the only even prime.", numbers: [2, 4, 6, 8, 10, 12, 14, 15, 17, 19] },
  { id: 6, title: "Thirties", blurb: "31, 37, 41.", numbers: [31, 32, 33, 34, 35, 36, 37, 38, 39, 41] },
  { id: 7, title: "Forties", blurb: "49 is 7 squared.", numbers: [43, 44, 45, 46, 47, 48, 49, 51, 53, 55] },
  { id: 8, title: "Sixties", blurb: "57 is 3 times 19.", numbers: [57, 58, 59, 60, 61, 62, 63, 64, 65, 67] },
  { id: 9, title: "Seventies", blurb: "77 is 7 times 11.", numbers: [71, 72, 73, 74, 75, 76, 77, 78, 79, 81] },
  { id: 10, title: "Nineties trap", blurb: "91 is 7 times 13.", numbers: [83, 84, 87, 89, 90, 91, 93, 95, 97, 99] },
  { id: 11, title: "Around one hundred", blurb: "97, 101, 103, 107.", numbers: [95, 96, 97, 99, 100, 101, 102, 103, 105, 107] },
  { id: 12, title: "Classic misses", blurb: "1, squares, and products. Keep the primes.", numbers: [1, 9, 15, 23, 25, 27, 29, 31, 35, 37, 49, 77] },
  { id: 13, title: "Past 110", blurb: "121 is 11 squared.", numbers: [109, 111, 113, 115, 119, 121, 123, 125, 127, 131] },
  { id: 14, title: "Past 130", blurb: "133 is 7 times 19. 143 is 11 times 13.", numbers: [131, 133, 135, 137, 139, 141, 143, 145, 147, 149] },
  { id: 15, title: "Past 150", blurb: "169 is 13 squared.", numbers: [151, 153, 155, 157, 159, 161, 163, 165, 167, 169] },
  { id: 16, title: "Last sieve", blurb: "187 is 11 times 17.", numbers: [173, 177, 179, 183, 187, 189, 191, 193, 195, 197] },
];

export function isPrime(n: number): boolean {
  if (n < 2 || !Number.isInteger(n)) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

export function factorBlurb(n: number): string {
  if (n === 1) return "1 has only one divisor. A prime needs two: 1 and itself.";
  if (isPrime(n)) return `${n} has no divisors except 1 and itself.`;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return `${n} = ${i} × ${n / i}. Not prime.`;
  }
  return `${n} is not prime.`;
}

export function auditPrime(): string[] {
  const errors: string[] = [];
  if (PRIME_LEVELS.length !== 16) errors.push("prime count");
  PRIME_LEVELS.forEach((level, index) => {
    if (level.id !== index + 1) errors.push(`prime id ${level.id}`);
    if (new Set(level.numbers).size !== level.numbers.length) errors.push(`level ${level.id} duplicate`);
    const primes = level.numbers.filter(isPrime);
    if (primes.length < 3) errors.push(`level ${level.id} primes ${primes.length}`);
    if (level.numbers.length - primes.length < 2) errors.push(`level ${level.id} decoys`);
    if (level.numbers.some((n) => n < 1 || n > 400)) errors.push(`level ${level.id} range`);
  });
  return errors;
}

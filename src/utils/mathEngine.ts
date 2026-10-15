/**
 * High-Precision Mathematical Expression Evaluator & Formatter
 * Tokenizes, parses, and evaluates scientific expressions supporting
 * arithmetic, trigonometry, logs, powers, roots, constants, and combinatorics.
 */

export type AngleMode = 'DEG' | 'RAD' | 'GRAD';
export type NumberFormatMode = 'STD' | 'SCI' | 'ENG' | 'FRAC';

export interface EvaluationResult {
  success: boolean;
  value?: number;
  formatted?: string;
  fraction?: string;
  scientific?: string;
  engineering?: string;
  steps?: string[];
  error?: string;
}

// Scientific & Physical Constants
export const CONSTANTS: Record<string, { value: number; symbol: string; name: string; unit?: string }> = {
  pi: { value: Math.PI, symbol: 'π', name: 'Archimedes Constant (Pi)' },
  e: { value: Math.E, symbol: 'e', name: 'Euler\'s Number' },
  phi: { value: (1 + Math.sqrt(5)) / 2, symbol: 'φ', name: 'Golden Ratio' },
  c: { value: 299792458, symbol: 'c', name: 'Speed of Light', unit: 'm/s' },
  G: { value: 6.67430e-11, symbol: 'G', name: 'Gravitational Constant', unit: 'm³/(kg·s²)' },
  h: { value: 6.62607015e-34, symbol: 'h', name: 'Planck Constant', unit: 'J·s' },
  k: { value: 1.380649e-23, symbol: 'k_B', name: 'Boltzmann Constant', unit: 'J/K' },
  NA: { value: 6.02214076e23, symbol: 'N_A', name: 'Avogadro Constant', unit: 'mol⁻¹' },
};

// Factorial helper
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('Factorial requires non-negative integer');
  }
  if (n > 170) return Infinity; // Overflow in 64-bit float
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// Permutations nPr = n! / (n - r)!
export function permutations(n: number, r: number): number {
  if (n < 0 || r < 0 || r > n || !Number.isInteger(n) || !Number.isInteger(r)) {
    throw new Error('Invalid arguments for nPr');
  }
  let res = 1;
  for (let i = 0; i < r; i++) {
    res *= (n - i);
  }
  return res;
}

// Combinations nCr = n! / (r! * (n - r)!)
export function combinations(n: number, r: number): number {
  if (n < 0 || r < 0 || r > n || !Number.isInteger(n) || !Number.isInteger(r)) {
    throw new Error('Invalid arguments for nCr');
  }
  if (r === 0 || r === n) return 1;
  if (r > n / 2) r = n - r;
  let res = 1;
  for (let i = 1; i <= r; i++) {
    res = (res * (n - i + 1)) / i;
  }
  return Math.round(res);
}

// Greatest Common Divisor
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// Least Common Multiple
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a * b) / gcd(a, b));
}

// Angle conversion helper
function toRadians(angle: number, mode: AngleMode): number {
  if (mode === 'RAD') return angle;
  if (mode === 'DEG') return (angle * Math.PI) / 180;
  return (angle * Math.PI) / 200; // GRAD
}

function fromRadians(rad: number, mode: AngleMode): number {
  if (mode === 'RAD') return rad;
  if (mode === 'DEG') return (rad * 180) / Math.PI;
  return (rad * 200) / Math.PI; // GRAD
}

// Convert floating point to continued fraction approximation
export function toFractionString(val: number, maxDenominator: number = 10000): string | null {
  if (!Number.isFinite(val) || Math.abs(val) > 1e7) return null;
  if (Number.isInteger(val)) return `${val}`;

  const sign = val < 0 ? '-' : '';
  val = Math.abs(val);

  let bestNumerator = 1;
  let bestDenominator = 1;
  let minError = Math.abs(val - bestNumerator / bestDenominator);

  for (let den = 1; den <= maxDenominator; den++) {
    const num = Math.round(val * den);
    const err = Math.abs(val - num / den);
    if (err < minError) {
      minError = err;
      bestNumerator = num;
      bestDenominator = den;
      if (err < 1e-11) break;
    }
  }

  if (minError < 1e-6) {
    if (bestDenominator === 1) return `${sign}${bestNumerator}`;
    return `${sign}${bestNumerator}/${bestDenominator}`;
  }
  return null;
}

// Format numbers nicely avoiding IEEE 754 precision artifacts like 0.30000000000000004
export function formatStandard(val: number, precision: number = 11): string {
  if (!Number.isFinite(val)) {
    if (Number.isNaN(val)) return 'Error: Undefined';
    return val > 0 ? 'Infinity' : '-Infinity';
  }
  if (Math.abs(val) < 1e-15 && val !== 0) return '0';

  const rounded = Number(val.toPrecision(precision));
  if (Math.abs(rounded) >= 1e12 || (Math.abs(rounded) < 1e-7 && rounded !== 0)) {
    return rounded.toExponential();
  }
  return rounded.toString();
}

export function formatScientific(val: number, precision: number = 6): string {
  if (!Number.isFinite(val)) return formatStandard(val);
  return val.toExponential(precision);
}

export function formatEngineering(val: number, precision: number = 4): string {
  if (!Number.isFinite(val) || val === 0) return formatStandard(val);
  const exp = Math.floor(Math.log10(Math.abs(val)));
  const engExp = Math.floor(exp / 3) * 3;
  const mantissa = val / Math.pow(10, engExp);
  return `${Number(mantissa.toFixed(precision))} × 10^${engExp}`;
}

// Auto-complete unclosed parentheses and clean trailing dangling operators
export function autoCompleteExpression(expr: string): string {
  let s = expr.trim();
  if (!s) return s;

  // Trim trailing binary operator if user hits = with dangling operator like "5 + "
  s = s.replace(/(\s*[+\-*\/^%]\s*)+$/, '');

  // Count unclosed parentheses
  let open = 0;
  for (const c of s) {
    if (c === '(') open++;
    else if (c === ')') open = Math.max(0, open - 1);
  }
  while (open > 0) {
    s += ')';
    open--;
  }
  return s;
}

// Expression Preprocessor: formats raw input for evaluation
export function sanitizeExpression(expr: string): string {
  let s = expr;
  // Replace unicode and visual operators
  s = s.replace(/×/g, '*');
  s = s.replace(/÷/g, '/');
  s = s.replace(/−/g, '-');
  s = s.replace(/π/g, 'pi');
  s = s.replace(/φ/g, 'phi');
  s = s.replace(/√\(/g, 'sqrt(');
  s = s.replace(/√(\d+(\.\d+)?)/g, 'sqrt($1)');
  s = s.replace(/²/g, '^2');
  s = s.replace(/³/g, '^3');

  // Replace textual modulo 'mod' with operator '%'
  s = s.replace(/\bmod\b/gi, '%');

  // Postfix percentage: e.g. 50% -> (50*0.01)
  s = s.replace(/(\d+(\.\d+)?)%/g, '($1*0.01)');
  s = s.replace(/\)%/g, ')*0.01');

  // Handle implicit multiplication:
  // e.g. 2(3) -> 2*(3)
  s = s.replace(/(\d)(\()/g, '$1*$2');
  // e.g. )2 -> )*2
  s = s.replace(/(\))(\d)/g, '$1*$2');
  // e.g. )( -> )*(
  s = s.replace(/(\))(\()/g, '$1*$2');
  // e.g. 2pi -> 2*pi, 2sqrt -> 2*sqrt, 2sin -> 2*sin
  s = s.replace(/(\d)(pi|phi|e\b|sqrt|cbrt|sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|ln|log|abs)/g, '$1*$2');
  // e.g. )pi -> )*pi
  s = s.replace(/(\))(pi|phi|e\b|sqrt|cbrt|sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|ln|log|abs)/g, '$1*$2');

  return s;
}

// Token Types for Shunting Yard Parser
type TokenType = 'NUMBER' | 'OPERATOR' | 'FUNCTION' | 'LPAREN' | 'RPAREN' | 'COMMA';

interface Token {
  type: TokenType;
  value: string;
}

// Tokenize expression string
function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const isAlpha = (c: string) => /[a-zA-Z_]/.test(c);
  const isDigit = (c: string) => /[\d.]/.test(c);

  while (i < expr.length) {
    const c = expr[i];

    if (/\s/.test(c)) {
      i++;
      continue;
    }

    if (c === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (c === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    if (c === ',') {
      tokens.push({ type: 'COMMA', value: ',' });
      i++;
      continue;
    }

    // Operators: +, -, *, /, ^, %, !
    if (c === '+' || c === '-' || c === '*' || c === '/' || c === '^' || c === '%' || c === '!') {
      // Check if minus is unary negation
      if (c === '-') {
        const prev = tokens[tokens.length - 1];
        if (!prev || prev.type === 'OPERATOR' || prev.type === 'LPAREN' || prev.type === 'COMMA') {
          tokens.push({ type: 'OPERATOR', value: 'u-' });
          i++;
          continue;
        }
      }
      tokens.push({ type: 'OPERATOR', value: c });
      i++;
      continue;
    }

    // Number
    if (isDigit(c)) {
      let numStr = '';
      while (i < expr.length && isDigit(expr[i])) {
        numStr += expr[i];
        i++;
      }
      if (i < expr.length && (expr[i] === 'e' || expr[i] === 'E')) {
        const next = expr[i + 1];
        if (next === '+' || next === '-' || /[\d]/.test(next)) {
          numStr += expr[i];
          i++;
          if (expr[i] === '+' || expr[i] === '-') {
            numStr += expr[i];
            i++;
          }
          while (i < expr.length && /[\d]/.test(expr[i])) {
            numStr += expr[i];
            i++;
          }
        }
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // Identifier: function name or constant
    if (isAlpha(c)) {
      let name = '';
      while (i < expr.length && (isAlpha(expr[i]) || /[\d_]/.test(expr[i]))) {
        name += expr[i];
        i++;
      }
      if (CONSTANTS[name]) {
        tokens.push({ type: 'NUMBER', value: CONSTANTS[name].value.toString() });
      } else {
        tokens.push({ type: 'FUNCTION', value: name.toLowerCase() });
      }
      continue;
    }

    throw new Error(`Unexpected character: '${c}'`);
  }

  return tokens;
}

// Operator Precedence & Associativity
const PRECEDENCE: Record<string, { prec: number; rightAssoc?: boolean }> = {
  '!': { prec: 5 },
  'u-': { prec: 4, rightAssoc: true },
  '^': { prec: 3, rightAssoc: true },
  '*': { prec: 2 },
  '/': { prec: 2 },
  '%': { prec: 2 },
  '+': { prec: 1 },
  '-': { prec: 1 },
};

// Shunting-Yard Algorithm to produce Reverse Polish Notation (RPN)
function shuntingYard(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const operatorStack: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'NUMBER') {
      output.push(token);
    } else if (token.type === 'FUNCTION') {
      operatorStack.push(token);
    } else if (token.type === 'COMMA') {
      while (operatorStack.length && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
        output.push(operatorStack.pop()!);
      }
      if (!operatorStack.length) {
        throw new Error('Misplaced comma or mismatched parentheses');
      }
    } else if (token.type === 'OPERATOR') {
      const o1 = token.value;
      const p1 = PRECEDENCE[o1]?.prec || 0;
      const right1 = PRECEDENCE[o1]?.rightAssoc || false;

      while (operatorStack.length) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === 'OPERATOR') {
          const o2 = top.value;
          const p2 = PRECEDENCE[o2]?.prec || 0;
          if ((!right1 && p1 <= p2) || (right1 && p1 < p2)) {
            output.push(operatorStack.pop()!);
            continue;
          }
        } else if (top.type === 'FUNCTION') {
          output.push(operatorStack.pop()!);
          continue;
        }
        break;
      }
      operatorStack.push(token);
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token);
    } else if (token.type === 'RPAREN') {
      let foundLparen = false;
      while (operatorStack.length) {
        const top = operatorStack.pop()!;
        if (top.type === 'LPAREN') {
          foundLparen = true;
          break;
        }
        output.push(top);
      }
      if (!foundLparen) {
        throw new Error('Mismatched parentheses: missing "("');
      }
      if (operatorStack.length && operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
        output.push(operatorStack.pop()!);
      }
    }
  }

  while (operatorStack.length) {
    const top = operatorStack.pop()!;
    if (top.type === 'LPAREN' || top.type === 'RPAREN') {
      throw new Error('Mismatched parentheses: unclosed "("');
    }
    output.push(top);
  }

  return output;
}

// Evaluate RPN Tokens
function evaluateRPN(rpn: Token[], angleMode: AngleMode): number {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === 'NUMBER') {
      const val = parseFloat(token.value);
      if (Number.isNaN(val)) throw new Error(`Invalid number: ${token.value}`);
      stack.push(val);
    } else if (token.type === 'OPERATOR') {
      const op = token.value;

      if (op === 'u-') {
        if (!stack.length) throw new Error('Invalid syntax for unary minus');
        const a = stack.pop()!;
        stack.push(-a);
        continue;
      }

      if (op === '!') {
        if (!stack.length) throw new Error('Missing operand for factorial');
        const a = stack.pop()!;
        stack.push(factorial(a));
        continue;
      }

      if (stack.length < 2) throw new Error(`Missing operand for operator '${op}'`);
      const b = stack.pop()!;
      const a = stack.pop()!;

      switch (op) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          if (b === 0) throw new Error('Division by zero (undefined)');
          stack.push(a / b);
          break;
        case '%':
          if (b === 0) throw new Error('Modulo by zero');
          stack.push(a % b);
          break;
        case '^':
          stack.push(Math.pow(a, b));
          break;
        default:
          throw new Error(`Unknown operator: ${op}`);
      }
    } else if (token.type === 'FUNCTION') {
      const fn = token.value;

      const singleArgFunctions = [
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
        'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
        'ln', 'log', 'log10', 'log2', 'exp',
        'sqrt', 'cbrt', 'abs', 'floor', 'ceil', 'round', 'fact', 'inv'
      ];

      const twoArgFunctions = ['ncr', 'npr', 'root', 'gcd', 'lcm', 'pow', 'mod'];

      if (singleArgFunctions.includes(fn)) {
        if (!stack.length) throw new Error(`Missing argument for function '${fn}'`);
        const a = stack.pop()!;

        switch (fn) {
          case 'sin': {
            const rad = toRadians(a, angleMode);
            const val = Math.sin(rad);
            stack.push(Math.abs(val) < 1e-15 ? 0 : val);
            break;
          }
          case 'cos': {
            const rad = toRadians(a, angleMode);
            const val = Math.cos(rad);
            stack.push(Math.abs(val) < 1e-15 ? 0 : val);
            break;
          }
          case 'tan': {
            const rad = toRadians(a, angleMode);
            const cosVal = Math.cos(rad);
            if (Math.abs(cosVal) < 1e-15) throw new Error('Tangent undefined at 90° / π/2');
            const val = Math.tan(rad);
            stack.push(Math.abs(val) < 1e-15 ? 0 : val);
            break;
          }
          case 'asin': {
            if (a < -1 || a > 1) throw new Error('Domain error: asin argument must be between -1 and 1');
            const rad = Math.asin(a);
            stack.push(fromRadians(rad, angleMode));
            break;
          }
          case 'acos': {
            if (a < -1 || a > 1) throw new Error('Domain error: acos argument must be between -1 and 1');
            const rad = Math.acos(a);
            stack.push(fromRadians(rad, angleMode));
            break;
          }
          case 'atan': {
            const rad = Math.atan(a);
            stack.push(fromRadians(rad, angleMode));
            break;
          }
          case 'sinh':
            stack.push(Math.sinh(a));
            break;
          case 'cosh':
            stack.push(Math.cosh(a));
            break;
          case 'tanh':
            stack.push(Math.tanh(a));
            break;
          case 'asinh':
            stack.push(Math.asinh(a));
            break;
          case 'acosh':
            if (a < 1) throw new Error('Domain error: acosh argument must be >= 1');
            stack.push(Math.acosh(a));
            break;
          case 'atanh':
            if (a <= -1 || a >= 1) throw new Error('Domain error: atanh argument must be between -1 and 1');
            stack.push(Math.atanh(a));
            break;
          case 'ln':
            if (a <= 0) throw new Error('Domain error: ln requires positive value');
            stack.push(Math.log(a));
            break;
          case 'log':
          case 'log10':
            if (a <= 0) throw new Error('Domain error: log10 requires positive value');
            stack.push(Math.log10(a));
            break;
          case 'log2':
            if (a <= 0) throw new Error('Domain error: log2 requires positive value');
            stack.push(Math.log2(a));
            break;
          case 'exp':
            stack.push(Math.exp(a));
            break;
          case 'sqrt':
            if (a < 0) throw new Error('Domain error: sqrt requires non-negative value');
            stack.push(Math.sqrt(a));
            break;
          case 'cbrt':
            stack.push(Math.cbrt(a));
            break;
          case 'abs':
            stack.push(Math.abs(a));
            break;
          case 'floor':
            stack.push(Math.floor(a));
            break;
          case 'ceil':
            stack.push(Math.ceil(a));
            break;
          case 'round':
            stack.push(Math.round(a));
            break;
          case 'fact':
            stack.push(factorial(a));
            break;
          case 'inv':
            if (a === 0) throw new Error('Division by zero (1/0)');
            stack.push(1 / a);
            break;
          default:
            throw new Error(`Unknown function: ${fn}`);
        }
      } else if (twoArgFunctions.includes(fn)) {
        if (stack.length < 2) throw new Error(`Missing arguments for function '${fn}(a, b)'`);
        const b = stack.pop()!;
        const a = stack.pop()!;

        switch (fn) {
          case 'ncr':
            stack.push(combinations(a, b));
            break;
          case 'npr':
            stack.push(permutations(a, b));
            break;
          case 'root':
            if (b === 0) throw new Error('Zeroth root is undefined');
            if (a < 0 && b % 2 === 0) throw new Error('Even root of negative number is undefined');
            if (a < 0) {
              stack.push(-Math.pow(-a, 1 / b));
            } else {
              stack.push(Math.pow(a, 1 / b));
            }
            break;
          case 'gcd':
            stack.push(gcd(a, b));
            break;
          case 'lcm':
            stack.push(lcm(a, b));
            break;
          case 'pow':
            stack.push(Math.pow(a, b));
            break;
          case 'mod':
            if (b === 0) throw new Error('Modulo by zero');
            stack.push(a % b);
            break;
          default:
            throw new Error(`Unknown function: ${fn}`);
        }
      } else {
        throw new Error(`Unrecognized function: ${fn}`);
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('Invalid expression format');
  }

  return stack[0];
}

// Compute prime factorization of positive integer
export function getPrimeFactors(n: number): string | null {
  if (!Number.isInteger(n) || n <= 1 || n > 1e10) return null;
  let d = 2;
  const factors: Record<number, number> = {};
  let temp = n;
  while (d * d <= temp) {
    if (temp % d === 0) {
      factors[d] = (factors[d] || 0) + 1;
      temp = Math.floor(temp / d);
    } else {
      d = d === 2 ? 3 : d + 2;
    }
  }
  if (temp > 1) {
    factors[temp] = (factors[temp] || 0) + 1;
  }
  if (factors[n] === 1) {
    return `${n} is Prime`;
  }
  return Object.entries(factors)
    .map(([base, exp]) => (exp > 1 ? `${base}^${exp}` : `${base}`))
    .join(' × ');
}

// Generate human-readable arithmetic insight steps
export function getArithmeticInsights(expr: string, value: number): string[] {
  const steps: string[] = [];

  // Check if simple division
  const divMatch = expr.match(/^\s*(-?\d+(\.\d+)?)\s*[÷\/]\s*(-?\d+(\.\d+)?)\s*$/);
  if (divMatch) {
    const a = parseFloat(divMatch[1]);
    const b = parseFloat(divMatch[3]);
    if (b !== 0) {
      const quotient = Math.trunc(a / b);
      const remainder = a % b;
      steps.push(`Dividend: ${a}, Divisor: ${b}`);
      steps.push(`Quotient: ${quotient}, Remainder: ${remainder}`);
      if (remainder !== 0) {
        steps.push(`Exact Fraction: ${toFractionString(a / b) || `${a}/${b}`}`);
      }
      return steps;
    }
  }

  // Check if simple multiplication
  const mulMatch = expr.match(/^\s*(-?\d+(\.\d+)?)\s*[×*]\s*(-?\d+(\.\d+)?)\s*$/);
  if (mulMatch) {
    const a = parseFloat(mulMatch[1]);
    const b = parseFloat(mulMatch[3]);
    steps.push(`Multiplicand: ${a}, Multiplier: ${b}`);
    steps.push(`Product: ${formatStandard(value)}`);
    return steps;
  }

  // Check if simple addition
  const addMatch = expr.match(/^\s*(-?\d+(\.\d+)?)\s*\+\s*(-?\d+(\.\d+)?)\s*$/);
  if (addMatch) {
    const a = parseFloat(addMatch[1]);
    const b = parseFloat(addMatch[3]);
    steps.push(`Addends: ${a} and ${b}`);
    steps.push(`Sum: ${formatStandard(value)}`);
    return steps;
  }

  // Check if simple subtraction
  const subMatch = expr.match(/^\s*(-?\d+(\.\d+)?)\s*[−-]\s*(-?\d+(\.\d+)?)\s*$/);
  if (subMatch) {
    const a = parseFloat(subMatch[1]);
    const b = parseFloat(subMatch[3]);
    steps.push(`Minuend: ${a}, Subtrahend: ${b}`);
    steps.push(`Difference: ${formatStandard(value)}`);
    return steps;
  }

  // General expression properties
  if (Number.isInteger(value)) {
    steps.push(`Integer Result: ${value} (${value % 2 === 0 ? 'Even' : 'Odd'})`);
    if (value > 1 && value <= 10000000) {
      const pf = getPrimeFactors(value);
      if (pf) {
        steps.push(`Prime Factors: ${pf}`);
      }
    }
  } else {
    const frac = toFractionString(value);
    if (frac) {
      steps.push(`Rational Fraction: ${frac}`);
    }
  }

  // Engineering scale
  const eng = formatEngineering(value);
  if (eng && !eng.includes('× 10^0')) {
    steps.push(`Engineering Scale: ${eng}`);
  }

  return steps;
}

// Master Evaluation Function
export function evaluateExpression(expr: string, angleMode: AngleMode = 'DEG'): EvaluationResult {
  if (!expr || !expr.trim()) {
    return { success: false, error: 'Empty expression' };
  }

  try {
    const completed = autoCompleteExpression(expr);
    const sanitized = sanitizeExpression(completed);
    const tokens = tokenize(sanitized);
    const rpn = shuntingYard(tokens);
    const val = evaluateRPN(rpn, angleMode);

    if (Number.isNaN(val)) {
      return { success: false, error: 'Result is undefined (NaN)' };
    }

    const formatted = formatStandard(val);
    const fraction = toFractionString(val) || undefined;
    const scientific = formatScientific(val);
    const engineering = formatEngineering(val);
    const steps = getArithmeticInsights(expr, val);

    return {
      success: true,
      value: val,
      formatted,
      fraction,
      scientific,
      engineering,
      steps,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Syntax Error';
    return {
      success: false,
      error: message,
    };
  }
}

// Count open vs closed parentheses in an expression
export function getParenthesesBalance(expr: string): number {
  let count = 0;
  for (const c of expr) {
    if (c === '(') count++;
    else if (c === ')') count--;
  }
  return Math.max(0, count);
}

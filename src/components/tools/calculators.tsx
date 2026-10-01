"use client";

/**
 * Everyday calculators: BMI, loan/EMI, mortgage, compound interest, GPA, tip,
 * calories and days between dates. Pure math in the browser.
 *
 * Numbers are formatted with a fixed locale so the server-rendered HTML matches
 * what the browser shows (a visitor's own locale could differ and break hydration).
 */
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Choice, FieldLabel, Toggle, useMounted } from "@/components/kit";
import { CalcLayout, Calculation, Disclaimer, EmptyResult, NumberField, ResultGrid, ResultHero, numberError } from "@/components/calculators/calc-ui";
import { cn } from "@/lib/utils";

const NF = (digits = 2) => new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const money = (n: number, sym: string) => `${n < 0 ? "−" : ""}${sym}${NF(2).format(Math.abs(n))}`;
const whole = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
const dec = (n: number, d = 1) => NF(d).format(n);
/** Parse a typed number ("1,250.50" → 1250.5); null when empty or invalid. */
const parse = (s: string): number | null => {
  const t = s.replace(/[,\s]/g, "");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

const CURRENCIES = [
  { value: "$", label: "$" },
  { value: "€", label: "€" },
  { value: "£", label: "£" },
  { value: "₹", label: "₹" },
  { value: "", label: "None" },
];

/* ——— BMI ——— */

const BMI_BANDS = [
  { max: 18.5, label: "Underweight", tone: "text-sky-600 dark:text-sky-300" },
  { max: 25, label: "Healthy weight", tone: "text-success" },
  { max: 30, label: "Overweight", tone: "text-warning" },
  { max: Infinity, label: "Obesity", tone: "text-danger" },
];

export function BmiCalculator() {
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [cm, setCm] = useState("175");
  const [kg, setKg] = useState("70");
  const [ft, setFt] = useState("5");
  const [inch, setInch] = useState("9");
  const [lb, setLb] = useState("155");

  const hM = units === "metric" ? (parse(cm) ?? 0) / 100 : ((parse(ft) ?? 0) * 12 + (parse(inch) ?? 0)) * 0.0254;
  const wKg = units === "metric" ? (parse(kg) ?? 0) : (parse(lb) ?? 0) * 0.45359237;
  const ok = hM > 0.5 && hM < 2.8 && wKg > 2 && wKg < 650;
  const bmi = ok ? wKg / (hM * hM) : 0;
  const band = BMI_BANDS.find((b) => bmi < b.max)!;
  const lo = 18.5 * hM * hM;
  const hi = 24.9 * hM * hM;
  const showW = (v: number) => (units === "metric" ? `${dec(v)} kg` : `${dec(v / 0.45359237)} lb`);
  // Position on a 15–40 scale for the marker.
  const pct = Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100));

  return (
    <CalcLayout
      inputs={
        <>
          <Choice label="Units" value={units} onChange={setUnits} options={[{ value: "metric", label: "Metric (cm, kg)" }, { value: "imperial", label: "US (ft, in, lb)" }]} />
          {units === "metric" ? (
            <>
              <NumberField label="Height" value={cm} onChange={setCm} suffix="cm" />
              <NumberField label="Weight" value={kg} onChange={setKg} suffix="kg" />
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Height (feet)" value={ft} onChange={setFt} suffix="ft" inputMode="numeric" />
                <NumberField label="Inches" value={inch} onChange={setInch} suffix="in" />
              </div>
              <NumberField label="Weight" value={lb} onChange={setLb} suffix="lb" />
            </>
          )}
        </>
      }
      results={
        ok ? (
          <>
            <ResultHero label="Your BMI" value={dec(bmi)} sub={band.label} />
            <div className="rounded-2xl border border-line bg-surface p-4">
              <div className="relative h-2.5 rounded-full bg-[linear-gradient(90deg,#60a5fa_0%,#60a5fa_14%,#22c55e_14%,#22c55e_40%,#f59e0b_40%,#f59e0b_60%,#ef4444_60%)]">
                <span aria-hidden className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink shadow" style={{ left: `${pct}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-[11.5px] text-muted">
                <span>15</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>
            <ResultGrid
              items={[
                { label: "Category", value: <span className={band.tone}>{band.label}</span> },
                { label: "Healthy weight for your height", value: `${showW(lo)} – ${showW(hi)}`, sub: "BMI 18.5 to 24.9" },
              ]}
            />
            <Calculation formula="BMI = weight (kg) ÷ height (m)²" steps={[`${dec(wKg)} ÷ ${dec(hM, 2)}² = ${dec(bmi)}`]} />
            <Disclaimer>BMI is a quick screening number for adults. It doesn&apos;t tell muscle from fat, and different cut-offs apply to children, teenagers and some ethnic groups. Talk to a doctor about your own health.</Disclaimer>
          </>
        ) : (
          <EmptyResult>Enter your height and weight to see your BMI.</EmptyResult>
        )
      }
    />
  );
}

/* ——— Loan / EMI ——— */

/** Monthly payment for a fully amortizing loan. */
function payment(principal: number, annualRate: number, months: number) {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

/** Year-by-year schedule: interest, principal and balance. */
function schedule(principal: number, annualRate: number, months: number, pay: number) {
  const r = annualRate / 100 / 12;
  const rows: { year: number; interest: number; principal: number; balance: number }[] = [];
  let bal = principal;
  let yi = 0;
  let yp = 0;
  for (let m = 1; m <= months; m++) {
    const i = bal * r;
    const p = Math.min(pay - i, bal);
    bal -= p;
    yi += i;
    yp += p;
    if (m % 12 === 0 || m === months) {
      rows.push({ year: Math.ceil(m / 12), interest: yi, principal: yp, balance: Math.max(0, bal) });
      yi = 0;
      yp = 0;
    }
  }
  return rows;
}

function ScheduleTable({ rows, sym }: { rows: ReturnType<typeof schedule>; sym: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-line bg-surface">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between px-4 py-3 text-[14px] font-medium text-ink">
        Yearly breakdown
        <span className="text-[13px] font-normal text-accent">{open ? "Hide" : "Show"}</span>
      </button>
      {open ? (
        <div className="max-h-80 overflow-auto border-t border-line">
          <table className="w-full text-right text-[13px]">
            <thead className="sticky top-0 bg-surface text-muted">
              <tr>
                <th scope="col" className="px-4 py-2 text-left font-medium">Year</th>
                <th scope="col" className="px-4 py-2 font-medium">Principal</th>
                <th scope="col" className="px-4 py-2 font-medium">Interest</th>
                <th scope="col" className="px-4 py-2 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody className="num text-ink-2">
              {rows.map((r) => (
                <tr key={r.year} className="border-t border-line">
                  <td className="px-4 py-2 text-left">{r.year}</td>
                  <td className="px-4 py-2">{money(r.principal, sym)}</td>
                  <td className="px-4 py-2">{money(r.interest, sym)}</td>
                  <td className="px-4 py-2">{money(r.balance, sym)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export function LoanCalculator() {
  const [sym, setSym] = useState("$");
  const [amount, setAmount] = useState("25,000");
  const [rate, setRate] = useState("7.5");
  const [term, setTerm] = useState("5");
  const [unit, setUnit] = useState<"years" | "months">("years");
  const P = parse(amount);
  const R = parse(rate);
  const T = parse(term);
  const months = T ? Math.round(unit === "years" ? T * 12 : T) : 0;
  const ok = P !== null && P > 0 && R !== null && R >= 0 && R < 100 && months > 0 && months <= 600;
  const pay = ok ? payment(P, R, months) : 0;
  const total = pay * months;

  return (
    <CalcLayout
      inputs={
        <>
          <Choice label="Currency" value={sym} onChange={setSym} options={CURRENCIES} />
          <NumberField label="Loan amount" value={amount} onChange={setAmount} prefix={sym || undefined} error={numberError(P, amount, { allowZero: false })} />
          <NumberField label="Interest rate (yearly)" value={rate} onChange={setRate} suffix="%" />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
            <NumberField label="Loan term" value={term} onChange={setTerm} inputMode="numeric" />
            <Choice label="Unit" value={unit} onChange={setUnit} options={[{ value: "years", label: "Years" }, { value: "months", label: "Months" }]} />
          </div>
        </>
      }
      results={
        ok ? (
          <>
            <ResultHero label="Monthly payment (EMI)" value={money(pay, sym)} sub={`${months} monthly payments`} />
            <ResultGrid
              items={[
                { label: "Total interest", value: money(total - P, sym) },
                { label: "Total of all payments", value: money(total, sym) },
              ]}
            />
            <Calculation formula="EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)" steps={[`P = ${money(P, sym)}, r = ${dec(R, 3)}% ÷ 12 = ${dec(R / 12, 4)}% a month, n = ${months}`]} />
            <ScheduleTable rows={schedule(P, R, months, pay)} sym={sym} />
            <Disclaimer>Assumes a fixed rate and equal monthly payments. Lenders may add fees or round differently, so check the exact figure in your loan offer.</Disclaimer>
          </>
        ) : (
          <EmptyResult>Enter the loan amount, interest rate and term.</EmptyResult>
        )
      }
    />
  );
}

/* ——— Mortgage ——— */

export function MortgageCalculator() {
  const [sym, setSym] = useState("$");
  const [price, setPrice] = useState("400,000");
  const [down, setDown] = useState("20");
  const [downMode, setDownMode] = useState<"pct" | "amount">("pct");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState<"30" | "20" | "15" | "10">("30");
  const [tax, setTax] = useState("4,000");
  const [ins, setIns] = useState("1,500");
  const [hoa, setHoa] = useState("0");

  const priceN = parse(price) ?? 0;
  const downN = parse(down) ?? 0;
  const downAmt = downMode === "pct" ? (priceN * downN) / 100 : downN;
  const loan = priceN - downAmt;
  const R = parse(rate);
  const months = Number(years) * 12;
  const ok = priceN > 0 && loan > 0 && downAmt >= 0 && R !== null && R >= 0 && R < 30;
  const pi = ok ? payment(loan, R, months) : 0;
  const taxM = (parse(tax) ?? 0) / 12;
  const insM = (parse(ins) ?? 0) / 12;
  const hoaM = parse(hoa) ?? 0;
  const monthly = pi + taxM + insM + hoaM;

  return (
    <CalcLayout
      inputs={
        <>
          <Choice label="Currency" value={sym} onChange={setSym} options={CURRENCIES} />
          <NumberField label="Home price" value={price} onChange={setPrice} prefix={sym || undefined} />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
            <NumberField label="Down payment" value={down} onChange={setDown} prefix={downMode === "amount" ? sym || undefined : undefined} suffix={downMode === "pct" ? "%" : undefined} />
            <Choice label="Enter as" value={downMode} onChange={setDownMode} options={[{ value: "pct", label: "%" }, { value: "amount", label: sym || "Amount" }]} />
          </div>
          <NumberField label="Interest rate (yearly)" value={rate} onChange={setRate} suffix="%" />
          <Choice label="Loan term" value={years} onChange={setYears} options={[{ value: "30", label: "30 years" }, { value: "20", label: "20 years" }, { value: "15", label: "15 years" }, { value: "10", label: "10 years" }]} />
          <NumberField label="Property tax (per year)" value={tax} onChange={setTax} prefix={sym || undefined} hint="Optional" />
          <NumberField label="Home insurance (per year)" value={ins} onChange={setIns} prefix={sym || undefined} hint="Optional" />
          <NumberField label="HOA fees (per month)" value={hoa} onChange={setHoa} prefix={sym || undefined} hint="Optional" />
        </>
      }
      results={
        ok ? (
          <>
            <ResultHero label="Estimated monthly payment" value={money(monthly, sym)} sub={`Principal & interest ${money(pi, sym)}`} />
            <ResultGrid
              items={[
                { label: "Loan amount", value: money(loan, sym), sub: `${dec((loan / priceN) * 100)}% of the price` },
                { label: "Down payment", value: money(downAmt, sym) },
                { label: "Total interest", value: money(pi * months - loan, sym), sub: `over ${years} years` },
                { label: "Taxes, insurance & HOA", value: money(taxM + insM + hoaM, sym), sub: "per month" },
              ]}
            />
            <ScheduleTable rows={schedule(loan, R, months, pi)} sym={sym} />
            <Disclaimer>An estimate for a fixed-rate loan. It doesn&apos;t include mortgage insurance (PMI), closing costs or rate changes; your lender&apos;s Loan Estimate has the real numbers.</Disclaimer>
          </>
        ) : (
          <EmptyResult>Enter the home price, down payment and interest rate.</EmptyResult>
        )
      }
    />
  );
}

/* ——— Compound interest ——— */

const COMPOUND = { yearly: 1, quarterly: 4, monthly: 12, daily: 365 } as const;
type Compound = keyof typeof COMPOUND;

export function CompoundInterestCalculator() {
  const [sym, setSym] = useState("$");
  const [start, setStart] = useState("10,000");
  const [monthlyAdd, setMonthlyAdd] = useState("200");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("10");
  const [freq, setFreq] = useState<Compound>("monthly");

  const P = parse(start) ?? 0;
  const C = parse(monthlyAdd) ?? 0;
  const R = parse(rate);
  const Y = parse(years);
  const ok = P >= 0 && C >= 0 && P + C > 0 && R !== null && R > -100 && R < 100 && Y !== null && Y > 0 && Y <= 100;

  // Simulate month by month with the equivalent monthly rate for the chosen compounding.
  const rows: { year: number; balance: number; contributed: number }[] = [];
  let bal = P;
  let contributed = P;
  if (ok) {
    const n = COMPOUND[freq];
    const monthly = Math.pow(1 + R / 100 / n, n / 12) - 1;
    for (let m = 1; m <= Math.round(Y * 12); m++) {
      bal = bal * (1 + monthly) + C;
      contributed += C;
      if (m % 12 === 0) rows.push({ year: m / 12, balance: bal, contributed });
    }
  }
  const interest = bal - contributed;

  return (
    <CalcLayout
      inputs={
        <>
          <Choice label="Currency" value={sym} onChange={setSym} options={CURRENCIES} />
          <NumberField label="Starting amount" value={start} onChange={setStart} prefix={sym || undefined} />
          <NumberField label="Monthly contribution" value={monthlyAdd} onChange={setMonthlyAdd} prefix={sym || undefined} hint="Added at the end of each month" />
          <NumberField label="Interest rate (yearly)" value={rate} onChange={setRate} suffix="%" />
          <NumberField label="Years" value={years} onChange={setYears} />
          <Choice label="Compounded" value={freq} onChange={setFreq} options={[{ value: "yearly", label: "Yearly" }, { value: "quarterly", label: "Quarterly" }, { value: "monthly", label: "Monthly" }, { value: "daily", label: "Daily" }]} />
        </>
      }
      results={
        ok ? (
          <>
            <ResultHero label={`Balance after ${Y} year${Y === 1 ? "" : "s"}`} value={money(bal, sym)} />
            <ResultGrid
              items={[
                { label: "Total contributed", value: money(contributed, sym) },
                { label: "Interest earned", value: money(interest, sym), sub: contributed > 0 ? `${dec((interest / contributed) * 100)}% on top` : undefined },
              ]}
            />
            {rows.length ? (
              <div className="rounded-2xl border border-line bg-surface p-4">
                <p className="mb-3 text-[13px] font-medium text-ink">Growth by year</p>
                <ol className="space-y-1.5">
                  {rows.filter((_, i) => rows.length <= 12 || i % Math.ceil(rows.length / 12) === 0 || i === rows.length - 1).map((r) => (
                    <li key={r.year} className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 text-[12.5px]">
                      <span className="text-muted">Yr {r.year}</span>
                      <span className="relative h-2.5 overflow-hidden rounded-full bg-bg-subtle">
                        <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${(r.balance / bal) * 100}%` }} />
                        <span className="absolute inset-y-0 left-0 rounded-full bg-ink/30" style={{ width: `${(r.contributed / bal) * 100}%` }} />
                      </span>
                      <span className="num text-ink-2">{money(r.balance, sym)}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 flex gap-4 text-[11.5px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-ink/30" /> Contributed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-accent" /> Interest
                  </span>
                </p>
              </div>
            ) : null}
            <Calculation formula="A = P(1 + r/n)^(nt), plus each monthly contribution compounding from the month it's added" steps={[]} />
            <Disclaimer>Assumes a constant rate and no taxes, fees or inflation. Real investment returns go up and down.</Disclaimer>
          </>
        ) : (
          <EmptyResult>Enter an amount, rate and number of years.</EmptyResult>
        )
      }
    />
  );
}

/* ——— GPA ——— */

const GRADES: Record<string, number> = { "A+": 4.0, A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7, "C+": 2.3, C: 2.0, "C-": 1.7, "D+": 1.3, D: 1.0, "D-": 0.7, F: 0 };
type Course = { id: number; name: string; grade: string; credits: string };
let courseId = 3;

export function GpaCalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: "", grade: "A", credits: "3" },
    { id: 2, name: "", grade: "B+", credits: "4" },
    { id: 3, name: "", grade: "A-", credits: "3" },
  ]);
  const [prevGpa, setPrevGpa] = useState("");
  const [prevCredits, setPrevCredits] = useState("");
  const update = (id: number, patch: Partial<Course>) => setCourses((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const counted = courses.map((c) => ({ ...c, cr: parse(c.credits) ?? 0 })).filter((c) => c.cr > 0);
  const credits = counted.reduce((s, c) => s + c.cr, 0);
  const points = counted.reduce((s, c) => s + c.cr * GRADES[c.grade], 0);
  const gpa = credits ? points / credits : 0;
  const pg = parse(prevGpa);
  const pc = parse(prevCredits);
  const cumulative = pg !== null && pc !== null && pc > 0 && pg >= 0 && pg <= 4.3 ? (points + pg * pc) / (credits + pc) : null;

  return (
    <CalcLayout
      inputs={
        <>
          <div>
            <FieldLabel>Courses</FieldLabel>
            <ul className="space-y-2">
              {courses.map((c, i) => (
                <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_5.5rem_4.5rem_auto] items-center gap-2">
                  <input aria-label={`Course ${i + 1} name`} value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} placeholder={`Course ${i + 1}`} className="h-11 min-w-0 rounded-xl border border-line bg-surface px-3 text-[14px] text-ink outline-none focus:border-accent/50" />
                  <select aria-label={`Course ${i + 1} grade`} value={c.grade} onChange={(e) => update(c.id, { grade: e.target.value })} className="h-11 rounded-xl border border-line bg-surface px-2 text-[14px] text-ink outline-none focus:border-accent/50">
                    {Object.keys(GRADES).map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <input aria-label={`Course ${i + 1} credits`} inputMode="decimal" value={c.credits} onChange={(e) => update(c.id, { credits: e.target.value })} placeholder="Credits" className="num h-11 min-w-0 rounded-xl border border-line bg-surface px-3 text-[14px] text-ink outline-none focus:border-accent/50" />
                  <button type="button" onClick={() => setCourses((cs) => cs.filter((x) => x.id !== c.id))} disabled={courses.length <= 1} aria-label={`Remove course ${i + 1}`} className="rounded-full p-2 text-muted hover:bg-bg-subtle hover:text-ink disabled:opacity-30">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setCourses((cs) => [...cs, { id: ++courseId, name: "", grade: "A", credits: "3" }])} className="chip mt-3">
              <Plus aria-hidden className="h-3.5 w-3.5" /> Add course
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-line pt-5">
            <NumberField label="Current GPA" value={prevGpa} onChange={setPrevGpa} hint="Optional, for cumulative GPA" />
            <NumberField label="Credits so far" value={prevCredits} onChange={setPrevCredits} hint="Optional" />
          </div>
        </>
      }
      results={
        credits ? (
          <>
            <ResultHero label="GPA for these courses" value={dec(gpa, 2)} sub={`${dec(credits, credits % 1 ? 1 : 0)} credits · ${dec(points, 1)} grade points`} />
            {cumulative !== null ? <ResultGrid items={[{ label: "New cumulative GPA", value: dec(cumulative, 2), sub: `over ${dec(credits + (pc ?? 0), 0)} credits` }]} /> : null}
            <Calculation formula="GPA = Σ (grade points × credits) ÷ Σ credits" steps={[`${dec(points, 1)} ÷ ${dec(credits, credits % 1 ? 1 : 0)} = ${dec(gpa, 2)}`]} />
            <Disclaimer>Uses the common US 4.0 scale (A = 4.0, A− = 3.7, B+ = 3.3 …). Some schools count A+ as 4.3 or weight honors classes — check your school&apos;s scale.</Disclaimer>
          </>
        ) : (
          <EmptyResult>Add your courses with their grades and credits.</EmptyResult>
        )
      }
    />
  );
}

/* ——— Tip ——— */

export function TipCalculator() {
  const [sym, setSym] = useState("$");
  const [bill, setBill] = useState("64.50");
  const [tip, setTip] = useState("18");
  const [people, setPeople] = useState("2");
  const [roundUp, setRoundUp] = useState(false);
  const B = parse(bill);
  const T = parse(tip);
  const N = Math.max(1, Math.floor(parse(people) ?? 1));
  const ok = B !== null && B > 0 && T !== null && T >= 0 && T <= 100;
  const tipAmt = ok ? (B * T) / 100 : 0;
  let total = ok ? B + tipAmt : 0;
  let each = total / N;
  if (ok && roundUp) {
    each = Math.ceil(each);
    total = each * N;
  }

  return (
    <CalcLayout
      inputs={
        <>
          <Choice label="Currency" value={sym} onChange={setSym} options={CURRENCIES} />
          <NumberField label="Bill amount" value={bill} onChange={setBill} prefix={sym || undefined} />
          <div>
            <NumberField label="Tip" value={tip} onChange={setTip} suffix="%" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["10", "15", "18", "20", "25"].map((p) => (
                <button key={p} type="button" onClick={() => setTip(p)} className={cn("chip", tip === p && "chip-active")}>
                  {p}%
                </button>
              ))}
            </div>
          </div>
          <NumberField label="Split between" value={people} onChange={setPeople} suffix={N === 1 ? "person" : "people"} inputMode="numeric" />
          <Toggle label="Round each share up to a whole amount" checked={roundUp} onChange={setRoundUp} />
        </>
      }
      results={
        ok ? (
          <>
            <ResultHero label={N > 1 ? "Each person pays" : "Total to pay"} value={money(N > 1 ? each : total, sym)} sub={roundUp ? "Rounded up" : undefined} />
            <ResultGrid
              items={[
                { label: "Tip", value: money(total - B!, sym), sub: roundUp ? `${dec(((total - B!) / B!) * 100)}% after rounding` : `${T}% of the bill` },
                { label: "Total with tip", value: money(total, sym) },
                ...(N > 1 ? [{ label: "Tip per person", value: money((total - B!) / N, sym) }, { label: "Bill per person", value: money(B! / N, sym) }] : []),
              ]}
            />
          </>
        ) : (
          <EmptyResult>Enter the bill amount and tip percentage.</EmptyResult>
        )
      }
    />
  );
}

/* ——— Calories (BMR / TDEE) ——— */

const ACTIVITY = [
  { value: "1.2", label: "Little or no exercise" },
  { value: "1.375", label: "Light: 1–3 days a week" },
  { value: "1.55", label: "Moderate: 3–5 days a week" },
  { value: "1.725", label: "Active: 6–7 days a week" },
  { value: "1.9", label: "Very active: hard daily exercise or physical job" },
];

export function CalorieCalculator() {
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [sex, setSex] = useState<"female" | "male">("female");
  const [age, setAge] = useState("30");
  const [cm, setCm] = useState("165");
  const [kg, setKg] = useState("65");
  const [ft, setFt] = useState("5");
  const [inch, setInch] = useState("5");
  const [lb, setLb] = useState("143");
  const [activity, setActivity] = useState("1.375");

  const A = parse(age) ?? 0;
  const hCm = units === "metric" ? (parse(cm) ?? 0) : ((parse(ft) ?? 0) * 12 + (parse(inch) ?? 0)) * 2.54;
  const wKg = units === "metric" ? (parse(kg) ?? 0) : (parse(lb) ?? 0) * 0.45359237;
  const ok = A >= 15 && A <= 100 && hCm > 100 && hCm < 250 && wKg > 30 && wKg < 300;
  // Mifflin–St Jeor equation.
  const bmr = 10 * wKg + 6.25 * hCm - 5 * A + (sex === "male" ? 5 : -161);
  const tdee = bmr * Number(activity);
  const floor = sex === "male" ? 1500 : 1200;

  return (
    <CalcLayout
      inputs={
        <>
          <Choice label="Units" value={units} onChange={setUnits} options={[{ value: "metric", label: "Metric (cm, kg)" }, { value: "imperial", label: "US (ft, in, lb)" }]} />
          <Choice label="Sex" value={sex} onChange={setSex} options={[{ value: "female", label: "Female" }, { value: "male", label: "Male" }]} />
          <NumberField label="Age" value={age} onChange={setAge} suffix="years" inputMode="numeric" />
          {units === "metric" ? (
            <>
              <NumberField label="Height" value={cm} onChange={setCm} suffix="cm" />
              <NumberField label="Weight" value={kg} onChange={setKg} suffix="kg" />
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Height (feet)" value={ft} onChange={setFt} suffix="ft" inputMode="numeric" />
                <NumberField label="Inches" value={inch} onChange={setInch} suffix="in" />
              </div>
              <NumberField label="Weight" value={lb} onChange={setLb} suffix="lb" />
            </>
          )}
          <div>
            <FieldLabel htmlFor="cal-activity">Activity level</FieldLabel>
            <select id="cal-activity" value={activity} onChange={(e) => setActivity(e.target.value)} className="h-12 w-full rounded-xl border border-line bg-surface px-3 text-[15px] text-ink outline-none focus:border-accent/50">
              {ACTIVITY.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </>
      }
      results={
        ok ? (
          <>
            <ResultHero label="Calories to maintain your weight" value={`${whole(tdee)} kcal`} sub="per day" />
            <ResultGrid
              items={[
                { label: "Lose about 0.5 kg (1 lb) a week", value: `${whole(Math.max(floor, tdee - 500))} kcal`, sub: tdee - 500 < floor ? "Kept at a safe minimum" : "−500 a day" },
                { label: "Gain about 0.25 kg (0.5 lb) a week", value: `${whole(tdee + 250)} kcal`, sub: "+250 a day" },
                { label: "Basal metabolic rate (BMR)", value: `${whole(bmr)} kcal`, sub: "Calories at complete rest" },
              ]}
            />
            <Calculation formula={`BMR = 10 × kg + 6.25 × cm − 5 × age ${sex === "male" ? "+ 5" : "− 161"} (Mifflin–St Jeor)`} steps={[`${whole(bmr)} × ${activity} activity factor = ${whole(tdee)} kcal`]} />
            <Disclaimer>An estimate for healthy adults — individual needs vary. Not for pregnancy or medical conditions; ask a doctor or dietitian before big changes to what you eat.</Disclaimer>
          </>
        ) : (
          <EmptyResult>Enter your age (15+), height and weight.</EmptyResult>
        )
      }
    />
  );
}

/* ——— Days between dates ——— */

const parseDay = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
};
const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const DAY = 86_400_000;

function ymd(a: Date, b: Date) {
  let y = b.getUTCFullYear() - a.getUTCFullYear();
  let m = b.getUTCMonth() - a.getUTCMonth();
  let d = b.getUTCDate() - a.getUTCDate();
  if (d < 0) {
    m--;
    d += new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), 0)).getUTCDate();
  }
  if (m < 0) {
    y--;
    m += 12;
  }
  return { y, m, d };
}

/** Monday–Friday days in [a, b), counted without looping over every day. */
function weekdays(a: Date, b: Date) {
  const days = Math.round((b.getTime() - a.getTime()) / DAY);
  const full = Math.floor(days / 7);
  let count = full * 5;
  const startDow = a.getUTCDay();
  for (let i = 0; i < days % 7; i++) {
    const dow = (startDow + i) % 7;
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

export function DateDifferenceCalculator() {
  const mounted = useMounted();
  const [fromRaw, setFrom] = useState("");
  const [toRaw, setTo] = useState("");
  const [includeEnd, setIncludeEnd] = useState(false);
  // "Today" is filled in after hydration so the server and browser agree.
  const today = mounted ? isoDay(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))) : "";
  const from = fromRaw || today;
  const to = toRaw;
  const a0 = parseDay(from);
  const b0 = parseDay(to);
  const ok = a0 && b0;
  const swapped = ok && b0 < a0;
  const a = swapped ? b0! : a0!;
  const bEnd = ok ? new Date((swapped ? a0! : b0!).getTime() + (includeEnd ? DAY : 0)) : null;
  const days = ok && bEnd ? Math.round((bEnd.getTime() - a.getTime()) / DAY) : 0;
  const parts = ok && bEnd ? ymd(a, bEnd) : null;

  return (
    <CalcLayout
      inputs={
        <>
          <div>
            <FieldLabel htmlFor="dd-from" hint="Today by default">
              Start date
            </FieldLabel>
            <input id="dd-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-12 w-full rounded-xl border border-line bg-surface px-3 text-[15px] text-ink outline-none focus:border-accent/50" />
          </div>
          <div>
            <FieldLabel htmlFor="dd-to">End date</FieldLabel>
            <input id="dd-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-12 w-full rounded-xl border border-line bg-surface px-3 text-[15px] text-ink outline-none focus:border-accent/50" />
          </div>
          <Toggle label="Include the end date (count both days)" checked={includeEnd} onChange={setIncludeEnd} />
          <div className="flex flex-wrap gap-1.5">
            {[
              ["+30 days", 30],
              ["+90 days", 90],
              ["+1 year", 365],
            ].map(([label, n]) => (
              <button key={label} type="button" className="chip" disabled={!a0} onClick={() => a0 && setTo(isoDay(new Date(a0.getTime() + (n as number) * DAY)))}>
                {label}
              </button>
            ))}
          </div>
        </>
      }
      results={
        ok && parts ? (
          <>
            <ResultHero label={swapped ? "Days between (end is before start)" : "Days between"} value={`${whole(days)} day${days === 1 ? "" : "s"}`} sub={includeEnd ? "End date included" : "End date not included"} />
            <ResultGrid
              items={[
                { label: "Years, months, days", value: `${parts.y}y ${parts.m}m ${parts.d}d` },
                { label: "Weeks and days", value: `${Math.floor(days / 7)}w ${days % 7}d` },
                { label: "Weekdays (Mon–Fri)", value: whole(weekdays(a, bEnd!)), sub: "Public holidays not removed" },
                { label: "Hours", value: whole(days * 24) },
              ]}
            />
          </>
        ) : (
          <EmptyResult>Pick an end date to count the days between.</EmptyResult>
        )
      }
    />
  );
}

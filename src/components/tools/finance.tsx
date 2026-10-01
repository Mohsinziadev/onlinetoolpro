"use client";

/**
 * Finance calculators that work in any country: pay, home buying, borrowing,
 * saving, investing, shopping and business. Pure math in the browser.
 * Shared helpers (currency picker, number parsing, loan payments) live in
 * ./calculators.tsx.
 */
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Choice, FieldLabel, Toggle } from "@/components/kit";
import { CalcLayout, Calculation, Disclaimer, EmptyResult, NumberField, ResultGrid, ResultHero } from "@/components/calculators/calc-ui";
import { CURRENCIES, dec, money, parse, payment, whole } from "@/components/tools/calculators";
import { cn } from "@/lib/utils";

const n0 = (s: string) => parse(s) ?? 0;
const pct = (n: number, d = 1) => `${dec(n, d)}%`;
const selectClass = "h-12 w-full rounded-xl border border-line bg-surface px-3 text-[15px] text-ink outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

function Currency({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <Choice label="Currency" value={value} onChange={onChange} options={CURRENCIES} />;
}

/** Months to repay `balance` at `apr`% with a fixed monthly payment; null if it never gets paid off. */
function monthsToRepay(balance: number, apr: number, pay: number): { months: number; interest: number } | null {
  const r = apr / 100 / 12;
  let bal = balance;
  let interest = 0;
  for (let m = 1; m <= 1200; m++) {
    const i = bal * r;
    if (pay <= i && m === 1) return null;
    interest += i;
    bal = bal + i - pay;
    if (bal <= 0.005) return { months: m, interest };
  }
  return null;
}

const yearsMonths = (m: number) => {
  const y = Math.floor(m / 12);
  const r = m % 12;
  return [y ? `${y} year${y === 1 ? "" : "s"}` : "", r ? `${r} month${r === 1 ? "" : "s"}` : ""].filter(Boolean).join(" ") || "0 months";
};

/* ——— Salary ↔ hourly ——— */

type Period = "hour" | "day" | "week" | "biweek" | "month" | "year";

export function SalaryConverter() {
  const [sym, setSym] = useState("$");
  const [amount, setAmount] = useState("25");
  const [period, setPeriod] = useState<Period>("hour");
  const [hours, setHours] = useState("40");
  const [days, setDays] = useState("5");
  const [weeks, setWeeks] = useState("52");
  const [ftSalary, setFtSalary] = useState("50,000");
  const [ftHours, setFtHours] = useState("37.5");
  const [myHours, setMyHours] = useState("22.5");

  const A = parse(amount);
  const H = n0(hours);
  const D = n0(days);
  const W = n0(weeks);
  const ok = A !== null && A >= 0 && H > 0 && H <= 168 && D > 0 && D <= 7 && W > 0 && W <= 52;
  const perYear: Record<Period, number> = { hour: H * W, day: D * W, week: W, biweek: W / 2, month: 12, year: 1 };
  const yearly = ok ? A! * perYear[period] : 0;
  const rows: [string, number][] = [
    ["Hourly", yearly / (H * W)],
    ["Daily", yearly / (D * W)],
    ["Weekly", yearly / W],
    ["Every two weeks", yearly / (W / 2)],
    ["Monthly", yearly / 12],
    ["Yearly", yearly],
  ];
  const fs = n0(ftSalary);
  const fh = n0(ftHours);
  const mh = n0(myHours);
  const proRata = fs > 0 && fh > 0 && mh >= 0 ? (fs * mh) / fh : null;

  return (
    <div className="space-y-4">
      <CalcLayout
        inputs={
          <>
            <Currency value={sym} onChange={setSym} />
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
              <NumberField label="Pay" value={amount} onChange={setAmount} prefix={sym || undefined} />
              <div>
                <FieldLabel htmlFor="sal-period">Per</FieldLabel>
                <select id="sal-period" value={period} onChange={(e) => setPeriod(e.target.value as Period)} className={selectClass}>
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="biweek">Two weeks</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <NumberField label="Hours a week" value={hours} onChange={setHours} />
              <NumberField label="Days a week" value={days} onChange={setDays} />
              <NumberField label="Paid weeks a year" value={weeks} onChange={setWeeks} />
            </div>
            <p className="text-[12.5px] text-muted">Full-time is usually 40 hours in the US and Canada, 37.5–40 in the UK and 38 in Australia. Paid holidays still count as paid weeks.</p>
          </>
        }
        results={
          ok ? (
            <>
              <ResultHero label="Yearly pay (before tax)" value={money(yearly, sym)} sub={`${dec(H, H % 1 ? 1 : 0)} hours × ${dec(W, 0)} weeks = ${whole(H * W)} paid hours a year`} />
              <ResultGrid items={rows.filter(([k]) => k !== "Yearly").map(([k, v]) => ({ label: k, value: money(v, sym) }))} />
            </>
          ) : (
            <EmptyResult>Enter your pay and working hours.</EmptyResult>
          )
        }
      />
      <CalcLayout
        inputs={
          <>
            <p className="text-[15px] font-medium text-ink">Part-time (pro-rata) salary</p>
            <NumberField label="Full-time salary" value={ftSalary} onChange={setFtSalary} prefix={sym || undefined} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Full-time hours a week" value={ftHours} onChange={setFtHours} />
              <NumberField label="Your hours a week" value={myHours} onChange={setMyHours} />
            </div>
          </>
        }
        results={
          proRata !== null ? (
            <>
              <ResultHero label="Your pro-rata salary" value={money(proRata, sym)} sub={`${pct((mh / fh) * 100, 0)} of full time · ${money(proRata / 12, sym)} a month`} />
              <Calculation formula="Pro-rata salary = full-time salary × your hours ÷ full-time hours" steps={[`${money(fs, sym)} × ${dec(mh, 1)} ÷ ${dec(fh, 1)} = ${money(proRata, sym)}`]} />
            </>
          ) : (
            <EmptyResult>Enter the full-time salary and hours.</EmptyResult>
          )
        }
      />
      <Disclaimer>Figures are gross pay, before tax and other deductions. Take-home pay depends on where you live and work.</Disclaimer>
    </div>
  );
}

/* ——— Mortgage affordability ——— */

export function MortgageAffordability() {
  const [sym, setSym] = useState("$");
  const [income, setIncome] = useState("90,000");
  const [debts, setDebts] = useState("400");
  const [down, setDown] = useState("40,000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState<"30" | "25" | "20" | "15">("30");
  const [taxPct, setTaxPct] = useState("1.1");
  const [ins, setIns] = useState("1,500");
  const [front, setFront] = useState("28");
  const [back, setBack] = useState("36");

  const I = n0(income);
  const Dn = n0(down);
  const R = parse(rate);
  const months = Number(years) * 12;
  const ok = I > 0 && R !== null && R >= 0 && R < 30;
  const k = ok ? payment(1, R!, months) : 0; // monthly payment per 1 unit borrowed
  const t = n0(taxPct) / 100 / 12;
  const insM = n0(ins) / 12;
  const budgetFront = (I / 12) * (n0(front) / 100);
  const budgetBack = (I / 12) * (n0(back) / 100) - n0(debts);
  const budget = Math.min(budgetFront, budgetBack);
  const price = ok && budget > insM ? Math.max(0, (budget - insM + Dn * k) / (k + t)) : 0;
  const loan = Math.max(0, price - Dn);
  const pi = loan * k;
  const limitedBy = budgetBack < budgetFront ? "your other debts" : "your income";

  return (
    <CalcLayout
      inputs={
        <>
          <Currency value={sym} onChange={setSym} />
          <NumberField label="Yearly income (before tax)" value={income} onChange={setIncome} prefix={sym || undefined} hint="Combined, if buying with someone" />
          <NumberField label="Monthly debt payments" value={debts} onChange={setDebts} prefix={sym || undefined} hint="Car, student and personal loans, card minimums" />
          <NumberField label="Down payment / deposit" value={down} onChange={setDown} prefix={sym || undefined} />
          <NumberField label="Mortgage rate (yearly)" value={rate} onChange={setRate} suffix="%" />
          <Choice label="Loan term" value={years} onChange={setYears} options={[{ value: "30", label: "30 yrs" }, { value: "25", label: "25 yrs" }, { value: "20", label: "20 yrs" }, { value: "15", label: "15 yrs" }]} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Property tax (% of price a year)" value={taxPct} onChange={setTaxPct} suffix="%" />
            <NumberField label="Insurance (per year)" value={ins} onChange={setIns} prefix={sym || undefined} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Housing limit (% of income)" value={front} onChange={setFront} suffix="%" />
            <NumberField label="All-debts limit (% of income)" value={back} onChange={setBack} suffix="%" />
          </div>
        </>
      }
      results={
        ok && price > 0 ? (
          <>
            <ResultHero label="You could afford a home of about" value={money(price, sym)} sub={`Limited by ${limitedBy}`} />
            <ResultGrid
              items={[
                { label: "Loan amount", value: money(loan, sym), sub: `${dec(price ? (Dn / price) * 100 : 0)}% down` },
                { label: "Monthly payment", value: money(pi + price * t + insM, sym), sub: "Loan, property tax and insurance" },
                { label: "Loan payment", value: money(pi, sym), sub: "Principal and interest" },
                { label: "Loan-to-income", value: `${dec(loan / I, 1)}×`, sub: "Many UK lenders cap around 4.5×" },
              ]}
            />
            <Calculation formula={`Housing ≤ ${front}% of monthly income, and housing + debts ≤ ${back}%`} steps={[`Housing budget: ${money(budget, sym)} a month`]} />
            <Disclaimer>A guide using common lender ratios (28% / 36% in the US). Lenders also look at your credit, savings and local rules — and the most you can borrow isn&apos;t always what&apos;s comfortable to repay.</Disclaimer>
          </>
        ) : ok ? (
          <EmptyResult>Your current debts use up the budget these ratios allow. Try lowering debts or adjusting the limits.</EmptyResult>
        ) : (
          <EmptyResult>Enter your income and the mortgage rate.</EmptyResult>
        )
      }
    />
  );
}

/* ——— Auto loan ——— */

export function AutoLoanCalculator() {
  const [sym, setSym] = useState("$");
  const [price, setPrice] = useState("32,000");
  const [down, setDown] = useState("4,000");
  const [trade, setTrade] = useState("8,000");
  const [owed, setOwed] = useState("0");
  const [taxRate, setTaxRate] = useState("7");
  const [taxAfterTrade, setTaxAfterTrade] = useState(true);
  const [fees, setFees] = useState("500");
  const [rate, setRate] = useState("6.9");
  const [months, setMonths] = useState<"36" | "48" | "60" | "72" | "84">("60");

  const P = n0(price);
  const tradeNet = n0(trade) - n0(owed);
  const tax = Math.max(0, (taxAfterTrade ? P - n0(trade) : P) * (n0(taxRate) / 100));
  const loan = P + tax + n0(fees) - n0(down) - tradeNet;
  const R = parse(rate);
  const N = Number(months);
  const ok = P > 0 && loan > 0 && R !== null && R >= 0 && R < 40;
  const pay = ok ? payment(loan, R!, N) : 0;

  return (
    <CalcLayout
      inputs={
        <>
          <Currency value={sym} onChange={setSym} />
          <NumberField label="Car price" value={price} onChange={setPrice} prefix={sym || undefined} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Down payment" value={down} onChange={setDown} prefix={sym || undefined} />
            <NumberField label="Trade-in value" value={trade} onChange={setTrade} prefix={sym || undefined} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Still owed on trade-in" value={owed} onChange={setOwed} prefix={sym || undefined} />
            <NumberField label="Fees (title, registration…)" value={fees} onChange={setFees} prefix={sym || undefined} />
          </div>
          <NumberField label="Sales tax" value={taxRate} onChange={setTaxRate} suffix="%" />
          <Toggle label="Tax only the price after the trade-in (most US states)" checked={taxAfterTrade} onChange={setTaxAfterTrade} />
          <NumberField label="Interest rate (APR)" value={rate} onChange={setRate} suffix="%" />
          <Choice label="Loan term (months)" value={months} onChange={setMonths} options={["36", "48", "60", "72", "84"].map((m) => ({ value: m as "60", label: m }))} />
        </>
      }
      results={
        ok ? (
          <>
            <ResultHero label="Monthly payment" value={money(pay, sym)} sub={`${N} payments`} />
            <ResultGrid
              items={[
                { label: "Amount financed", value: money(loan, sym) },
                { label: "Total interest", value: money(pay * N - loan, sym) },
                { label: "Sales tax", value: money(tax, sym) },
                { label: "Total cost of the car", value: money(pay * N + n0(down) + Math.max(0, tradeNet), sym), sub: "Payments + down payment + trade-in equity" },
              ]}
            />
            {tradeNet < 0 ? <Disclaimer>You owe more on the trade-in than it&apos;s worth, so the difference ({money(-tradeNet, sym)}) is added to the new loan.</Disclaimer> : null}
          </>
        ) : (
          <EmptyResult>Enter the car price, rate and term.</EmptyResult>
        )
      }
    />
  );
}

/* ——— Debt payoff (snowball vs avalanche) ——— */

type Debt = { id: number; name: string; balance: string; apr: string; min: string };
let debtId = 3;

function simulateDebts(debts: { name: string; balance: number; apr: number; min: number }[], extra: number, order: "avalanche" | "snowball") {
  const list = debts.map((d) => ({ ...d, bal: d.balance, paidAt: 0 }));
  let interest = 0;
  for (let m = 1; m <= 600; m++) {
    const open = list.filter((d) => d.bal > 0.005);
    if (!open.length) return { months: m - 1, interest, order: [...list].sort((a, b) => a.paidAt - b.paidAt).map((d) => d.name) };
    let pool = extra + list.filter((d) => d.bal <= 0.005).reduce((s, d) => s + d.min, 0); // freed-up minimums roll over
    for (const d of open) {
      const i = (d.bal * d.apr) / 100 / 12;
      interest += i;
      d.bal += i;
    }
    for (const d of open) {
      const p = Math.min(d.min, d.bal);
      d.bal -= p;
      pool += d.min - p;
    }
    const targets = list.filter((d) => d.bal > 0.005).sort((a, b) => (order === "avalanche" ? b.apr - a.apr || a.bal - b.bal : a.bal - b.bal || b.apr - a.apr));
    for (const d of targets) {
      if (pool <= 0) break;
      const p = Math.min(pool, d.bal);
      d.bal -= p;
      pool -= p;
    }
    for (const d of list) if (d.bal <= 0.005 && !d.paidAt) d.paidAt = m;
  }
  return null;
}

export function DebtPayoffCalculator() {
  const [sym, setSym] = useState("$");
  const [debts, setDebts] = useState<Debt[]>([
    { id: 1, name: "Credit card", balance: "4,500", apr: "24.9", min: "120" },
    { id: 2, name: "Car loan", balance: "9,800", apr: "7.5", min: "260" },
    { id: 3, name: "Store card", balance: "900", apr: "29.9", min: "35" },
  ]);
  const [extra, setExtra] = useState("200");
  const update = (id: number, patch: Partial<Debt>) => setDebts((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  const clean = debts.map((d) => ({ name: d.name || "Debt", balance: n0(d.balance), apr: n0(d.apr), min: n0(d.min) })).filter((d) => d.balance > 0);
  const stuck = clean.find((d) => d.min <= (d.balance * d.apr) / 100 / 12);
  const ok = clean.length > 0 && !stuck;
  const av = ok ? simulateDebts(clean, n0(extra), "avalanche") : null;
  const sn = ok ? simulateDebts(clean, n0(extra), "snowball") : null;
  const base = ok ? simulateDebts(clean, 0, "avalanche") : null;
  const total = clean.reduce((s, d) => s + d.balance, 0);

  return (
    <CalcLayout
      inputs={
        <>
          <Currency value={sym} onChange={setSym} />
          <div>
            <FieldLabel>Your debts</FieldLabel>
            <ul className="space-y-3">
              {debts.map((d, i) => (
                <li key={d.id} className="space-y-2 rounded-2xl border border-line p-3">
                  <div className="flex items-center gap-2">
                    <input aria-label={`Debt ${i + 1} name`} value={d.name} onChange={(e) => update(d.id, { name: e.target.value })} className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-[14px] text-ink outline-none focus:border-accent/50" />
                    <button type="button" onClick={() => setDebts((ds) => ds.filter((x) => x.id !== d.id))} disabled={debts.length <= 1} aria-label={`Remove ${d.name || `debt ${i + 1}`}`} className="rounded-full p-2 text-muted hover:bg-bg-subtle hover:text-ink disabled:opacity-30">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <div className="col-span-2 sm:col-span-1">
                      <NumberField label="Balance" value={d.balance} onChange={(v) => update(d.id, { balance: v })} prefix={sym || undefined} />
                    </div>
                    <NumberField label="APR" value={d.apr} onChange={(v) => update(d.id, { apr: v })} suffix="%" />
                    <NumberField label="Minimum" value={d.min} onChange={(v) => update(d.id, { min: v })} prefix={sym || undefined} />
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" className="chip mt-3" onClick={() => setDebts((ds) => [...ds, { id: ++debtId, name: `Debt ${ds.length + 1}`, balance: "", apr: "", min: "" }])}>
              <Plus aria-hidden className="h-3.5 w-3.5" /> Add a debt
            </button>
          </div>
          <NumberField label="Extra you can pay each month" value={extra} onChange={setExtra} prefix={sym || undefined} hint="On top of all the minimums" />
        </>
      }
      results={
        stuck ? (
          <EmptyResult>The minimum on “{stuck.name}” doesn&apos;t cover its monthly interest, so it would never be paid off. Raise that minimum.</EmptyResult>
        ) : av && sn ? (
          <>
            <ResultHero label="Debt-free in (avalanche)" value={yearsMonths(av.months)} sub={`Total interest ${money(av.interest, sym)} on ${money(total, sym)} of debt`} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { name: "Avalanche", note: "Highest interest rate first", r: av },
                { name: "Snowball", note: "Smallest balance first", r: sn },
              ].map((s) => (
                <div key={s.name} className={cn("rounded-2xl border p-4", s.r.interest <= Math.min(av.interest, sn.interest) + 0.5 ? "border-accent/40 bg-accent-soft" : "border-line bg-surface")}>
                  <p className="text-[14px] font-medium text-ink">{s.name}</p>
                  <p className="text-[12px] text-muted">{s.note}</p>
                  <p className="num mt-2 text-[18px] font-medium text-ink">{yearsMonths(s.r.months)}</p>
                  <p className="text-[12.5px] text-muted">Interest {money(s.r.interest, sym)}</p>
                  <p className="mt-2 text-[12px] text-muted">Order: {s.r.order.join(" → ")}</p>
                </div>
              ))}
            </div>
            {base && n0(extra) > 0 ? (
              <ResultGrid
                items={[
                  { label: "Extra payment saves", value: money(base.interest - av.interest, sym), sub: "in interest, vs minimums only" },
                  { label: "And gets you there", value: yearsMonths(base.months - av.months), sub: "sooner" },
                ]}
              />
            ) : null}
            <Disclaimer>Assumes fixed rates and no new spending on these debts. When a debt is paid off, its minimum payment rolls onto the next one.</Disclaimer>
          </>
        ) : (
          <EmptyResult>Add at least one debt with its balance, rate and minimum payment.</EmptyResult>
        )
      }
    />
  );
}

/* ——— Credit card payoff ——— */

export function CreditCardPayoff() {
  const [sym, setSym] = useState("$");
  const [balance, setBalance] = useState("5,000");
  const [apr, setApr] = useState("22.9");
  const [mode, setMode] = useState<"payment" | "months">("payment");
  const [pay, setPay] = useState("200");
  const [target, setTarget] = useState("24");

  const B = n0(balance);
  const A = n0(apr);
  const r = A / 100 / 12;
  const ok = B > 0 && A >= 0 && A < 100;
  const byPay = ok && mode === "payment" ? monthsToRepay(B, A, n0(pay)) : null;
  const T = Math.round(n0(target));
  const needed = ok && mode === "months" && T > 0 ? payment(B, A, T) : 0;
  const interestNeeded = needed * T - B;

  return (
    <CalcLayout
      inputs={
        <>
          <Currency value={sym} onChange={setSym} />
          <NumberField label="Card balance" value={balance} onChange={setBalance} prefix={sym || undefined} />
          <NumberField label="Interest rate (APR)" value={apr} onChange={setApr} suffix="%" />
          <Choice label="I want to know" value={mode} onChange={setMode} options={[{ value: "payment", label: "How long it takes" }, { value: "months", label: "What to pay each month" }]} />
          {mode === "payment" ? <NumberField label="Monthly payment" value={pay} onChange={setPay} prefix={sym || undefined} /> : <NumberField label="Pay it off in" value={target} onChange={setTarget} suffix="months" inputMode="numeric" />}
          <p className="text-[12.5px] text-muted">Assumes you stop using the card while paying it off.</p>
        </>
      }
      results={
        !ok ? (
          <EmptyResult>Enter the balance and interest rate.</EmptyResult>
        ) : mode === "payment" ? (
          byPay ? (
            <>
              <ResultHero label="Paid off in" value={yearsMonths(byPay.months)} sub={`Total interest ${money(byPay.interest, sym)}`} />
              <ResultGrid
                items={[
                  { label: "Total you'll pay", value: money(B + byPay.interest, sym) },
                  { label: "Interest this month", value: money(B * r, sym), sub: `${dec(A / 12, 2)}% a month` },
                ]}
              />
            </>
          ) : (
            <EmptyResult>That payment doesn&apos;t cover the monthly interest ({money(B * r, sym)}), so the balance would never go down.</EmptyResult>
          )
        ) : (
          <>
            <ResultHero label={`Pay each month to be debt-free in ${T} months`} value={money(needed, sym)} />
            <ResultGrid
              items={[
                { label: "Total interest", value: money(interestNeeded, sym) },
                { label: "Total you'll pay", value: money(needed * T, sym) },
              ]}
            />
            <Calculation formula="Payment = B × r ÷ (1 − (1 + r)^−n)" steps={[`r = ${dec(A, 2)}% ÷ 12 per month, n = ${T}`]} />
          </>
        )
      }
    />
  );
}

/* ——— Savings goal ——— */

export function SavingsGoalCalculator() {
  const [sym, setSym] = useState("$");
  const [goal, setGoal] = useState("20,000");
  const [have, setHave] = useState("2,000");
  const [rate, setRate] = useState("4");
  const [mode, setMode] = useState<"monthly" | "time">("monthly");
  const [years, setYears] = useState("3");
  const [monthly, setMonthly] = useState("400");

  const G = n0(goal);
  const P = n0(have);
  const r = n0(rate) / 100 / 12;
  const n = Math.round(n0(years) * 12);
  const grow = (months: number) => Math.pow(1 + r, months);
  const needed = n > 0 ? (r ? ((G - P * grow(n)) * r) / (grow(n) - 1) : (G - P) / n) : 0;
  let monthsNeeded: number | null = null;
  const M = n0(monthly);
  if (mode === "time" && G > P) {
    let bal = P;
    for (let m = 1; m <= 1200; m++) {
      bal = bal * (1 + r) + M;
      if (bal >= G) {
        monthsNeeded = m;
        break;
      }
    }
  }
  const ok = G > 0;

  return (
    <CalcLayout
      inputs={
        <>
          <Currency value={sym} onChange={setSym} />
          <NumberField label="Savings goal" value={goal} onChange={setGoal} prefix={sym || undefined} />
          <NumberField label="Already saved" value={have} onChange={setHave} prefix={sym || undefined} />
          <NumberField label="Interest rate (yearly)" value={rate} onChange={setRate} suffix="%" hint="Your savings account rate, or 0" />
          <Choice label="I want to know" value={mode} onChange={setMode} options={[{ value: "monthly", label: "How much to save a month" }, { value: "time", label: "How long it takes" }]} />
          {mode === "monthly" ? <NumberField label="Reach it in" value={years} onChange={setYears} suffix="years" /> : <NumberField label="I can save each month" value={monthly} onChange={setMonthly} prefix={sym || undefined} />}
        </>
      }
      results={
        !ok ? (
          <EmptyResult>Enter your savings goal.</EmptyResult>
        ) : P >= G ? (
          <EmptyResult>You&apos;ve already reached this goal. 🎉</EmptyResult>
        ) : mode === "monthly" ? (
          n > 0 ? (
            <>
              <ResultHero label="Save each month" value={money(Math.max(0, needed), sym)} sub={`for ${yearsMonths(n)}`} />
              <ResultGrid
                items={[
                  { label: "You'll put in", value: money(P + Math.max(0, needed) * n, sym) },
                  { label: "Interest earned", value: money(Math.max(0, G - P - Math.max(0, needed) * n), sym) },
                ]}
              />
            </>
          ) : (
            <EmptyResult>Enter how many years you have.</EmptyResult>
          )
        ) : monthsNeeded ? (
          <>
            <ResultHero label="You'll reach your goal in" value={yearsMonths(monthsNeeded)} sub={`saving ${money(M, sym)} a month`} />
            <ResultGrid items={[{ label: "You'll put in", value: money(P + M * monthsNeeded, sym) }]} />
          </>
        ) : (
          <EmptyResult>At this amount it would take more than 100 years — try saving a bit more each month.</EmptyResult>
        )
      }
    />
  );
}

/* ——— Retirement ——— */

export function RetirementCalculator() {
  const [sym, setSym] = useState("$");
  const [age, setAge] = useState("35");
  const [retireAge, setRetireAge] = useState("67");
  const [saved, setSaved] = useState("40,000");
  const [monthly, setMonthly] = useState("600");
  const [ret, setRet] = useState("6");
  const [infl, setInfl] = useState("2.5");
  const [income, setIncome] = useState("40,000");
  const [wd, setWd] = useState("4");

  const a = n0(age);
  const ra = n0(retireAge);
  const years = ra - a;
  const ok = a >= 16 && ra > a && ra <= 90;
  const r = n0(ret) / 100 / 12;
  let bal = n0(saved);
  for (let m = 0; m < years * 12; m++) bal = bal * (1 + r) + n0(monthly);
  const today = bal / Math.pow(1 + n0(infl) / 100, years); // in today's money
  const w = n0(wd) / 100;
  const supports = today * w;
  const target = w > 0 ? n0(income) / w : 0;
  const gap = target - today;
  // Extra monthly saving (in future money) needed to close the gap.
  const gapFuture = gap * Math.pow(1 + n0(infl) / 100, years);
  const extraNeeded = gap > 0 && years > 0 ? (r ? (gapFuture * r) / (Math.pow(1 + r, years * 12) - 1) : gapFuture / (years * 12)) : 0;

  return (
    <CalcLayout
      inputs={
        <>
          <Currency value={sym} onChange={setSym} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Your age" value={age} onChange={setAge} inputMode="numeric" />
            <NumberField label="Retire at" value={retireAge} onChange={setRetireAge} inputMode="numeric" />
          </div>
          <NumberField label="Retirement savings now" value={saved} onChange={setSaved} prefix={sym || undefined} />
          <NumberField label="Monthly contribution" value={monthly} onChange={setMonthly} prefix={sym || undefined} hint="Include any employer contribution" />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Expected return" value={ret} onChange={setRet} suffix="%" />
            <NumberField label="Inflation" value={infl} onChange={setInfl} suffix="%" />
          </div>
          <NumberField label="Yearly income you'd like in retirement" value={income} onChange={setIncome} prefix={sym || undefined} hint="In today's money, from savings (on top of any state pension)" />
          <NumberField label="Yearly withdrawal rate" value={wd} onChange={setWd} suffix="%" hint="4% is a common rule of thumb" />
        </>
      }
      results={
        ok ? (
          <>
            <ResultHero label={`Savings at ${ra} (in today's money)`} value={money(today, sym)} sub={`${money(bal, sym)} in future money after ${years} years`} />
            <ResultGrid
              items={[
                { label: "Yearly income it could provide", value: money(supports, sym), sub: `at a ${pct(n0(wd), 1)} withdrawal rate` },
                { label: "Savings needed for your goal", value: money(target, sym), sub: "in today's money" },
                gap > 0 ? { label: "Shortfall", value: money(gap, sym), sub: `Save about ${money(extraNeeded, sym)} more a month` } : { label: "On track", value: "✓", sub: `${money(-gap, sym)} above your goal` },
              ]}
            />
            <Disclaimer>A projection with steady returns, which real investments don&apos;t have. It ignores taxes and fees, and doesn&apos;t include state pensions or Social Security. Use it to compare scenarios, not as financial advice.</Disclaimer>
          </>
        ) : (
          <EmptyResult>Enter your age and the age you&apos;d like to retire.</EmptyResult>
        )
      }
    />
  );
}

/* ——— Inflation ——— */

export function InflationCalculator() {
  const [sym, setSym] = useState("$");
  const [amount, setAmount] = useState("100");
  const [years, setYears] = useState("10");
  const [rate, setRate] = useState("3");
  const A = n0(amount);
  const Y = n0(years);
  const f = Math.pow(1 + n0(rate) / 100, Y);
  const ok = A > 0 && Y > 0 && Y <= 100;
  // Milestones up to the chosen horizon, plus the horizon itself.
  const rows = ok ? [...new Set([1, 5, 10, 20, 30].filter((y) => y < Y).concat(Y))] : [];

  return (
    <CalcLayout
      inputs={
        <>
          <Currency value={sym} onChange={setSym} />
          <NumberField label="Amount" value={amount} onChange={setAmount} prefix={sym || undefined} />
          <NumberField label="Years" value={years} onChange={setYears} />
          <NumberField label="Average yearly inflation" value={rate} onChange={setRate} suffix="%" hint="Central banks in the US, UK, Canada and Australia aim for about 2–3%" />
        </>
      }
      results={
        ok ? (
          <>
            <ResultHero label={`What costs ${money(A, sym)} today will cost`} value={money(A * f, sym)} sub={`in ${Y} years at ${pct(n0(rate))} a year`} />
            <ResultGrid
              items={[
                { label: `${money(A, sym)} in ${Y} years buys what`, value: money(A / f, sym), sub: "buys today" },
                { label: "Purchasing power lost", value: pct((1 - 1 / f) * 100) },
              ]}
            />
            <div className="rounded-2xl border border-line bg-surface p-4">
              <p className="mb-2 text-[13px] font-medium text-ink">Cost over time</p>
              <ul className="space-y-1 text-[13.5px]">
                {rows.map((y) => (
                  <li key={y} className="flex justify-between">
                    <span className="text-muted">In {y} year{y === 1 ? "" : "s"}</span>
                    <span className="num text-ink">{money(A * Math.pow(1 + n0(rate) / 100, y), sym)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Disclaimer>Uses the average rate you enter. Official historical inflation for each country comes from its statistics office (for example the BLS in the US or the ONS in the UK).</Disclaimer>
          </>
        ) : (
          <EmptyResult>Enter an amount and a number of years.</EmptyResult>
        )
      }
    />
  );
}

/* ——— ROI ——— */

export function RoiCalculator() {
  const [sym, setSym] = useState("$");
  const [invested, setInvested] = useState("10,000");
  const [returned, setReturned] = useState("13,500");
  const [years, setYears] = useState("3");
  const I = n0(invested);
  const R = n0(returned);
  const Y = n0(years);
  const ok = I > 0;
  const roi = ((R - I) / I) * 100;
  const annual = Y > 0 && R > 0 ? (Math.pow(R / I, 1 / Y) - 1) * 100 : null;

  return (
    <CalcLayout
      inputs={
        <>
          <Currency value={sym} onChange={setSym} />
          <NumberField label="Amount invested" value={invested} onChange={setInvested} prefix={sym || undefined} />
          <NumberField label="Amount returned (final value)" value={returned} onChange={setReturned} prefix={sym || undefined} />
          <NumberField label="Over how many years" value={years} onChange={setYears} hint="Optional — for the yearly rate" />
        </>
      }
      results={
        ok ? (
          <>
            <ResultHero label="Return on investment" value={`${roi >= 0 ? "+" : ""}${pct(roi, 2)}`} sub={`${roi >= 0 ? "Gain" : "Loss"} of ${money(Math.abs(R - I), sym)}`} />
            {annual !== null ? <ResultGrid items={[{ label: "Annualized return", value: pct(annual, 2), sub: `per year over ${Y} years (compound)` }]} /> : null}
            <Calculation formula="ROI = (final value − amount invested) ÷ amount invested × 100" steps={annual !== null ? [`Annualized = (final ÷ invested)^(1 ÷ years) − 1`] : []} />
          </>
        ) : (
          <EmptyResult>Enter the amount you invested.</EmptyResult>
        )
      }
    />
  );
}

/* ——— Rent vs buy ——— */

export function RentVsBuyCalculator() {
  const [sym, setSym] = useState("$");
  const [price, setPrice] = useState("400,000");
  const [downPct, setDownPct] = useState("20");
  const [rate, setRate] = useState("6.5");
  const [rent, setRent] = useState("2,000");
  const [stay, setStay] = useState("7");
  const [growth, setGrowth] = useState("3");
  const [rentUp, setRentUp] = useState("3");
  const [invest, setInvest] = useState("5");
  const [taxPct, setTaxPct] = useState("1.1");
  const [maintPct, setMaintPct] = useState("1");
  const [ins, setIns] = useState("1,500");
  const [buyCosts, setBuyCosts] = useState("3");
  const [sellCosts, setSellCosts] = useState("6");

  const P = n0(price);
  const down = (P * n0(downPct)) / 100;
  const loan = P - down;
  const R = n0(rate);
  const N = 360;
  const pay = loan > 0 ? payment(loan, R, N) : 0;
  const Y = Math.max(1, Math.min(30, Math.round(n0(stay))));
  const ok = P > 0 && n0(rent) > 0;

  /** Net cost of buying and renting if you leave after `y` years. */
  function costs(y: number) {
    const months = y * 12;
    let bal = loan;
    let buy = down + (P * n0(buyCosts)) / 100;
    for (let m = 1; m <= months; m++) {
      const value = P * Math.pow(1 + n0(growth) / 100, (m - 1) / 12);
      const i = (bal * R) / 100 / 12;
      bal -= Math.min(pay - i, bal);
      buy += pay + (value * (n0(taxPct) + n0(maintPct))) / 100 / 12 + n0(ins) / 12;
    }
    const sale = P * Math.pow(1 + n0(growth) / 100, y);
    buy -= sale * (1 - n0(sellCosts) / 100) - Math.max(0, bal);
    let rentTotal = 0;
    for (let k = 0; k < y; k++) rentTotal += n0(rent) * 12 * Math.pow(1 + n0(rentUp) / 100, k);
    // A renter can invest the down payment and buying costs instead.
    const upfront = down + (P * n0(buyCosts)) / 100;
    const gain = upfront * (Math.pow(1 + n0(invest) / 100, y) - 1);
    return { buy, rent: rentTotal - gain };
  }

  const c = ok ? costs(Y) : null;
  let breakEven: number | null = null;
  if (ok) for (let y = 1; y <= 30; y++) if (costs(y).buy < costs(y).rent) { breakEven = y; break; }
  const buyWins = c ? c.buy < c.rent : false;

  return (
    <CalcLayout
      inputs={
        <>
          <Currency value={sym} onChange={setSym} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Home price" value={price} onChange={setPrice} prefix={sym || undefined} />
            <NumberField label="Down payment" value={downPct} onChange={setDownPct} suffix="%" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Mortgage rate" value={rate} onChange={setRate} suffix="%" />
            <NumberField label="Monthly rent" value={rent} onChange={setRent} prefix={sym || undefined} />
          </div>
          <NumberField label="How many years you'll stay" value={stay} onChange={setStay} />
          <details className="rounded-2xl border border-line p-3 text-[14px]">
            <summary className="cursor-pointer font-medium text-ink">Assumptions</summary>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <NumberField label="Home price growth" value={growth} onChange={setGrowth} suffix="%/yr" />
              <NumberField label="Rent increase" value={rentUp} onChange={setRentUp} suffix="%/yr" />
              <NumberField label="Investment return" value={invest} onChange={setInvest} suffix="%/yr" />
              <NumberField label="Property tax" value={taxPct} onChange={setTaxPct} suffix="%/yr" />
              <NumberField label="Maintenance" value={maintPct} onChange={setMaintPct} suffix="%/yr" />
              <NumberField label="Insurance" value={ins} onChange={setIns} prefix={sym || undefined} />
              <NumberField label="Buying costs" value={buyCosts} onChange={setBuyCosts} suffix="%" />
              <NumberField label="Selling costs" value={sellCosts} onChange={setSellCosts} suffix="%" />
            </div>
          </details>
        </>
      }
      results={
        c ? (
          <>
            <ResultHero label={`Over ${Y} year${Y === 1 ? "" : "s"}`} value={buyWins ? "Buying is cheaper" : "Renting is cheaper"} sub={`by about ${money(Math.abs(c.rent - c.buy), sym)}`} />
            <ResultGrid
              items={[
                { label: "Net cost of buying", value: money(c.buy, sym), sub: "All costs minus what you'd get from selling" },
                { label: "Net cost of renting", value: money(c.rent, sym), sub: "Rent minus growth on money not spent on a deposit" },
                { label: "Buying pays off after", value: breakEven ? `${breakEven} year${breakEven === 1 ? "" : "s"}` : "30+ years" },
                { label: "Monthly mortgage payment", value: money(pay, sym) },
              ]}
            />
            <Disclaimer>A simplified comparison: it ignores taxes on gains, tax breaks for homeowners and mortgage insurance, and assumes steady growth. Small changes to price growth or rent increases can flip the answer — try a few.</Disclaimer>
          </>
        ) : (
          <EmptyResult>Enter the home price and monthly rent.</EmptyResult>
        )
      }
    />
  );
}

/* ——— Rental yield ——— */

export function RentalYieldCalculator() {
  const [sym, setSym] = useState("$");
  const [price, setPrice] = useState("300,000");
  const [buyCosts, setBuyCosts] = useState("10,000");
  const [rent, setRent] = useState("1,600");
  const [costs, setCosts] = useState("4,800");
  const [vacancy, setVacancy] = useState("4");
  const P = n0(price);
  const totalCost = P + n0(buyCosts);
  const annualRent = n0(rent) * 12;
  const collected = annualRent * (1 - n0(vacancy) / 100);
  const net = collected - n0(costs);
  const ok = P > 0 && annualRent > 0;

  return (
    <CalcLayout
      inputs={
        <>
          <Currency value={sym} onChange={setSym} />
          <NumberField label="Property price" value={price} onChange={setPrice} prefix={sym || undefined} />
          <NumberField label="Buying costs" value={buyCosts} onChange={setBuyCosts} prefix={sym || undefined} hint="Stamp duty / transfer tax, legal fees, repairs" />
          <NumberField label="Monthly rent" value={rent} onChange={setRent} prefix={sym || undefined} />
          <NumberField label="Yearly running costs" value={costs} onChange={setCosts} prefix={sym || undefined} hint="Management, insurance, maintenance, service charges" />
          <NumberField label="Vacancy (time empty)" value={vacancy} onChange={setVacancy} suffix="%" />
        </>
      }
      results={
        ok ? (
          <>
            <ResultHero label="Net rental yield" value={pct((net / totalCost) * 100, 2)} sub={`${money(net, sym)} a year after costs`} />
            <ResultGrid
              items={[
                { label: "Gross yield", value: pct((annualRent / P) * 100, 2), sub: "Yearly rent ÷ price" },
                { label: "Rent collected", value: money(collected, sym), sub: `per year, after ${pct(n0(vacancy), 0)} vacancy` },
              ]}
            />
            <Calculation formula="Net yield = (rent collected − running costs) ÷ (price + buying costs) × 100" steps={[]} />
            <Disclaimer>Before mortgage interest and tax. Gross yields of 5–8% are often quoted as reasonable, but it varies a lot by city.</Disclaimer>
          </>
        ) : (
          <EmptyResult>Enter the property price and monthly rent.</EmptyResult>
        )
      }
    />
  );
}

/* ——— Simple interest ——— */

export function SimpleInterestCalculator() {
  const [sym, setSym] = useState("$");
  const [principal, setPrincipal] = useState("5,000");
  const [rate, setRate] = useState("5");
  const [time, setTime] = useState("3");
  const [unit, setUnit] = useState<"years" | "months" | "days">("years");
  const P = n0(principal);
  const R = n0(rate);
  const t = unit === "years" ? n0(time) : unit === "months" ? n0(time) / 12 : n0(time) / 365;
  const interest = (P * R * t) / 100;
  const compound = P * Math.pow(1 + R / 100 / 12, t * 12) - P;
  const ok = P > 0 && t > 0;

  return (
    <CalcLayout
      inputs={
        <>
          <Currency value={sym} onChange={setSym} />
          <NumberField label="Principal (amount)" value={principal} onChange={setPrincipal} prefix={sym || undefined} />
          <NumberField label="Interest rate (yearly)" value={rate} onChange={setRate} suffix="%" />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
            <NumberField label="Time" value={time} onChange={setTime} />
            <Choice label="Unit" value={unit} onChange={setUnit} options={[{ value: "years", label: "Years" }, { value: "months", label: "Months" }, { value: "days", label: "Days" }]} />
          </div>
        </>
      }
      results={
        ok ? (
          <>
            <ResultHero label="Simple interest" value={money(interest, sym)} sub={`Total ${money(P + interest, sym)}`} />
            <ResultGrid items={[{ label: "With monthly compounding instead", value: money(compound, sym), sub: `${money(compound - interest, sym)} more` }]} />
            <Calculation formula="Interest = principal × rate × time" steps={[`${money(P, sym)} × ${dec(R, 2)}% × ${dec(t, 3)} years = ${money(interest, sym)}`]} />
          </>
        ) : (
          <EmptyResult>Enter the amount, rate and time.</EmptyResult>
        )
      }
    />
  );
}

/* ——— Discount ——— */

export function DiscountCalculator() {
  const [sym, setSym] = useState("$");
  const [price, setPrice] = useState("80");
  const [off, setOff] = useState("25");
  const [extra, setExtra] = useState("");
  const [tax, setTax] = useState("");
  const [was, setWas] = useState("120");
  const [now, setNow] = useState("90");
  const P = n0(price);
  const after1 = P * (1 - n0(off) / 100);
  const after2 = after1 * (1 - n0(extra) / 100);
  const withTax = after2 * (1 + n0(tax) / 100);
  const totalOff = P ? (1 - after2 / P) * 100 : 0;
  const W = n0(was);
  const N = n0(now);

  return (
    <div className="space-y-4">
      <CalcLayout
        inputs={
          <>
            <Currency value={sym} onChange={setSym} />
            <NumberField label="Original price" value={price} onChange={setPrice} prefix={sym || undefined} />
            <div>
              <NumberField label="Discount" value={off} onChange={setOff} suffix="% off" />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["10", "15", "20", "25", "30", "40", "50", "70"].map((v) => (
                  <button key={v} type="button" onClick={() => setOff(v)} className={cn("chip", off === v && "chip-active")}>
                    {v}%
                  </button>
                ))}
              </div>
            </div>
            <NumberField label="Extra discount (optional)" value={extra} onChange={setExtra} suffix="% off" hint="e.g. “an extra 10% off sale prices”" />
            <NumberField label="Sales tax / VAT to add (optional)" value={tax} onChange={setTax} suffix="%" />
          </>
        }
        results={
          P > 0 ? (
            <>
              <ResultHero label="You pay" value={money(n0(tax) ? withTax : after2, sym)} sub={n0(tax) ? `${money(after2, sym)} before tax` : undefined} />
              <ResultGrid
                items={[
                  { label: "You save", value: money(P - after2, sym) },
                  { label: "Total discount", value: pct(totalOff, 1), sub: n0(extra) ? `Not ${dec(n0(off) + n0(extra), 0)}% — discounts stack on the reduced price` : undefined },
                ]}
              />
            </>
          ) : (
            <EmptyResult>Enter the original price.</EmptyResult>
          )
        }
      />
      <CalcLayout
        inputs={
          <>
            <p className="text-[15px] font-medium text-ink">What percent off is it?</p>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Was" value={was} onChange={setWas} prefix={sym || undefined} />
              <NumberField label="Now" value={now} onChange={setNow} prefix={sym || undefined} />
            </div>
          </>
        }
        results={W > 0 && N >= 0 ? <ResultHero label="Discount" value={pct(((W - N) / W) * 100, 1)} sub={`You save ${money(W - N, sym)}`} /> : <EmptyResult>Enter both prices.</EmptyResult>}
      />
    </div>
  );
}

/* ——— Profit margin & markup ——— */

export function ProfitMarginCalculator() {
  const [sym, setSym] = useState("$");
  const [mode, setMode] = useState<"price" | "margin" | "markup">("price");
  const [cost, setCost] = useState("40");
  const [price, setPrice] = useState("65");
  const [margin, setMargin] = useState("35");
  const [markup, setMarkup] = useState("50");
  const C = n0(cost);
  const sell = mode === "price" ? n0(price) : mode === "margin" ? (n0(margin) < 100 ? C / (1 - n0(margin) / 100) : NaN) : C * (1 + n0(markup) / 100);
  const profit = sell - C;
  const ok = C > 0 && Number.isFinite(sell) && sell > 0;

  return (
    <CalcLayout
      inputs={
        <>
          <Currency value={sym} onChange={setSym} />
          <Choice label="I know" value={mode} onChange={setMode} options={[{ value: "price", label: "Cost and price" }, { value: "margin", label: "Cost and margin" }, { value: "markup", label: "Cost and markup" }]} />
          <NumberField label="Cost" value={cost} onChange={setCost} prefix={sym || undefined} />
          {mode === "price" ? <NumberField label="Selling price" value={price} onChange={setPrice} prefix={sym || undefined} /> : null}
          {mode === "margin" ? <NumberField label="Profit margin you want" value={margin} onChange={setMargin} suffix="%" /> : null}
          {mode === "markup" ? <NumberField label="Markup" value={markup} onChange={setMarkup} suffix="%" /> : null}
        </>
      }
      results={
        ok ? (
          <>
            <ResultHero label={mode === "price" ? "Profit margin" : "Selling price"} value={mode === "price" ? pct((profit / sell) * 100, 2) : money(sell, sym)} sub={`Profit ${money(profit, sym)} per sale`} />
            <ResultGrid
              items={[
                { label: "Margin", value: pct((profit / sell) * 100, 2), sub: "Profit ÷ price" },
                { label: "Markup", value: pct((profit / C) * 100, 2), sub: "Profit ÷ cost" },
              ]}
            />
            <Calculation formula="Margin = (price − cost) ÷ price · Markup = (price − cost) ÷ cost" steps={[`A 50% markup is a 33.3% margin; a 50% margin needs a 100% markup.`]} />
          </>
        ) : mode === "margin" && n0(margin) >= 100 ? (
          <EmptyResult>A margin must be below 100% — the profit can&apos;t be the whole price.</EmptyResult>
        ) : (
          <EmptyResult>Enter the cost and one more number.</EmptyResult>
        )
      }
    />
  );
}

/* ——— VAT / GST / sales tax ——— */

type Region = { id: string; label: string; parts: { name: string; rate: number }[]; sym: string };
// Standard rates as of October 2026 — check official sources if rules change.
const REGIONS: Region[] = [
  { id: "uk", label: "UK — VAT 20%", parts: [{ name: "VAT", rate: 20 }], sym: "£" },
  { id: "uk5", label: "UK — reduced VAT 5%", parts: [{ name: "VAT", rate: 5 }], sym: "£" },
  { id: "au", label: "Australia — GST 10%", parts: [{ name: "GST", rate: 10 }], sym: "$" },
  { id: "nz", label: "New Zealand — GST 15%", parts: [{ name: "GST", rate: 15 }], sym: "$" },
  { id: "ca-on", label: "Canada: Ontario — HST 13%", parts: [{ name: "HST", rate: 13 }], sym: "$" },
  { id: "ca-ns", label: "Canada: Nova Scotia — HST 14%", parts: [{ name: "HST", rate: 14 }], sym: "$" },
  { id: "ca-15", label: "Canada: NB, NL, PEI — HST 15%", parts: [{ name: "HST", rate: 15 }], sym: "$" },
  { id: "ca-bc", label: "Canada: British Columbia — GST 5% + PST 7%", parts: [{ name: "GST", rate: 5 }, { name: "PST", rate: 7 }], sym: "$" },
  { id: "ca-mb", label: "Canada: Manitoba — GST 5% + RST 7%", parts: [{ name: "GST", rate: 5 }, { name: "RST", rate: 7 }], sym: "$" },
  { id: "ca-sk", label: "Canada: Saskatchewan — GST 5% + PST 6%", parts: [{ name: "GST", rate: 5 }, { name: "PST", rate: 6 }], sym: "$" },
  { id: "ca-qc", label: "Canada: Quebec — GST 5% + QST 9.975%", parts: [{ name: "GST", rate: 5 }, { name: "QST", rate: 9.975 }], sym: "$" },
  { id: "ca-gst", label: "Canada: AB, NT, NU, YT — GST 5%", parts: [{ name: "GST", rate: 5 }], sym: "$" },
  { id: "custom", label: "US sales tax / other — enter a rate", parts: [{ name: "Tax", rate: 0 }], sym: "$" },
];

export function VatCalculator() {
  const [regionId, setRegionId] = useState("uk");
  const [custom, setCustom] = useState("8.25");
  const [amount, setAmount] = useState("100");
  const [mode, setMode] = useState<"add" | "remove">("add");
  const region = REGIONS.find((r) => r.id === regionId)!;
  const parts = region.id === "custom" ? [{ name: "Tax", rate: n0(custom) }] : region.parts;
  const totalRate = parts.reduce((s, p) => s + p.rate, 0);
  const A = n0(amount);
  const net = mode === "add" ? A : A / (1 + totalRate / 100);
  const gross = mode === "add" ? A * (1 + totalRate / 100) : A;
  const sym = region.sym;
  const ok = A > 0;

  return (
    <CalcLayout
      inputs={
        <>
          <div>
            <FieldLabel htmlFor="vat-region">Country / province</FieldLabel>
            <select id="vat-region" value={regionId} onChange={(e) => setRegionId(e.target.value)} className={selectClass}>
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          {region.id === "custom" ? <NumberField label="Tax rate" value={custom} onChange={setCustom} suffix="%" hint="US sales tax depends on the state, county and city" /> : null}
          <Choice label="I want to" value={mode} onChange={setMode} options={[{ value: "add", label: "Add tax to a price" }, { value: "remove", label: "Remove tax from a price" }]} />
          <NumberField label={mode === "add" ? "Price before tax" : "Price including tax"} value={amount} onChange={setAmount} prefix={sym} />
        </>
      }
      results={
        ok ? (
          <>
            <ResultHero label={mode === "add" ? "Price including tax" : "Price before tax"} value={money(mode === "add" ? gross : net, sym)} sub={`${parts.map((p) => p.name).join(" + ")} at ${dec(totalRate, totalRate % 1 ? 3 : 0)}%`} />
            <ResultGrid
              items={[
                { label: "Before tax", value: money(net, sym) },
                ...parts.map((p) => ({ label: p.name, value: money((net * p.rate) / 100, sym) })),
                { label: "Including tax", value: money(gross, sym) },
              ]}
            />
            <Calculation formula={mode === "add" ? "Total = price × (1 + rate)" : "Price before tax = total ÷ (1 + rate)"} steps={mode === "remove" ? [`Not total × ${dec(totalRate, 2)}% — that's a common mistake`] : []} />
            <Disclaimer>Standard rates as of October 2026. Some goods are taxed at reduced or zero rates; check with the tax authority for specific items.</Disclaimer>
          </>
        ) : (
          <EmptyResult>Enter a price.</EmptyResult>
        )
      }
    />
  );
}

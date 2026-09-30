"use client";

import { useState } from "react";
import { Calculation, CalcLayout, Disclaimer, EmptyResult, NumberField, numberError, ResultGrid, ResultHero } from "@/components/calculators/calc-ui";
import { Segmented } from "@/components/ui/segmented";
import { cpm, engagement, parseDuration, parseNumber, revenueBreakdown, rpm, watchTime } from "@/lib/calc";
import { formatCurrency, formatDuration, formatNumber, formatPercent } from "@/lib/utils";

const CURRENCIES = [
  { value: "USD", label: "USD $" },
  { value: "GBP", label: "GBP £" },
  { value: "CAD", label: "CAD $" },
  { value: "AUD", label: "AUD $" },
] as const;
type Currency = (typeof CURRENCIES)[number]["value"];
const SYMBOL: Record<Currency, string> = { USD: "$", GBP: "£", CAD: "$", AUD: "$" };

function CurrencyPicker({ value, onChange }: { value: Currency; onChange: (c: Currency) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-ink">Currency</p>
      <Segmented label="Currency" size="sm" value={value} onChange={onChange} options={CURRENCIES} />
      <p className="mt-1.5 text-xs text-muted">Changes the symbol only — no exchange-rate conversion.</p>
    </div>
  );
}

/* ─── Revenue ───────────────────────────────────────────────────────────── */

export function RevenueCalculator() {
  const [views, setViews] = useState("100000");
  const [rpmIn, setRpmIn] = useState("4.00");
  const [cur, setCur] = useState<Currency>("USD");
  const v = parseNumber(views);
  const r = parseNumber(rpmIn);
  const vErr = numberError(v, views);
  const rErr = numberError(r, rpmIn);
  const ready = v !== null && r !== null && !vErr && !rErr;
  const res = ready ? revenueBreakdown(v, r) : null;
  const money = (n: number) => formatCurrency(n, cur);

  return (
    <CalcLayout
      inputs={
        <>
          <NumberField label="Monthly views" value={views} onChange={setViews} error={vErr} hint="Monetized and non-monetized views combined." />
          <NumberField
            label="Estimated RPM"
            value={rpmIn}
            onChange={setRpmIn}
            prefix={SYMBOL[cur]}
            suffix="per 1,000 views"
            error={rErr}
            hint="Use the RPM from YouTube Studio → Analytics → Revenue for the most realistic estimate."
          />
          <CurrencyPicker value={cur} onChange={setCur} />
        </>
      }
      results={
        res && v !== null && r !== null ? (
          <>
            <ResultHero label="Estimated monthly revenue" value={money(res.monthly)} sub={`${formatNumber(v)} views at ${money(r)} RPM`} />
            <ResultGrid
              items={[
                { label: "Daily estimate", value: money(res.daily), sub: "Yearly ÷ 365" },
                { label: "Weekly estimate", value: money(res.weekly), sub: "Daily × 7" },
                { label: "Monthly estimate", value: money(res.monthly) },
                { label: "Yearly estimate", value: money(res.yearly), sub: "Monthly × 12" },
              ]}
            />
            <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
              <p className="text-[13px] font-medium text-ink">If your RPM were different</p>
              <table className="mt-2 w-full text-[13px]">
                <thead>
                  <tr className="text-muted">
                    <th scope="col" className="py-1 text-left font-normal">RPM</th>
                    <th scope="col" className="py-1 text-right font-normal">Monthly</th>
                    <th scope="col" className="py-1 text-right font-normal">Yearly</th>
                  </tr>
                </thead>
                <tbody className="num divide-y divide-line">
                  {[0.5, 0.75, 1, 1.25, 1.5].map((m) => {
                    const b = revenueBreakdown(v, r * m);
                    return (
                      <tr key={m} className={m === 1 ? "font-semibold text-ink" : "text-ink-2"}>
                        <td className="py-1.5">{money(r * m)}</td>
                        <td className="py-1.5 text-right">{money(b.monthly)}</td>
                        <td className="py-1.5 text-right">{money(b.yearly)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Calculation
              formula="Revenue = Views ÷ 1,000 × RPM"
              steps={[`${formatNumber(v)} ÷ 1,000 × ${money(r)} = ${money(res.monthly)} per month`]}
            />
            <Disclaimer>
              Actual YouTube earnings vary substantially by audience, geography, content category, monetization, ad inventory and other
              factors. This is only a mathematical estimate.
            </Disclaimer>
          </>
        ) : (
          <EmptyResult>Enter monthly views and an RPM to see estimates.</EmptyResult>
        )
      }
    />
  );
}

/* ─── RPM ───────────────────────────────────────────────────────────────── */

export function RpmCalculator() {
  const [revenue, setRevenue] = useState("850");
  const [views, setViews] = useState("210000");
  const [cur, setCur] = useState<Currency>("USD");
  const rev = parseNumber(revenue);
  const v = parseNumber(views);
  const revErr = numberError(rev, revenue);
  const vErr = numberError(v, views, { allowZero: false });
  const result = rev !== null && v !== null && !revErr && !vErr ? rpm(rev, v) : null;
  const money = (n: number) => formatCurrency(n, cur);

  return (
    <CalcLayout
      inputs={
        <>
          <NumberField label="Estimated revenue" value={revenue} onChange={setRevenue} prefix={SYMBOL[cur]} error={revErr} hint="Total revenue for the period (your share, after YouTube's)." />
          <NumberField label="Views" value={views} onChange={setViews} error={vErr} hint="All views in the same period." />
          <CurrencyPicker value={cur} onChange={setCur} />
        </>
      }
      results={
        result !== null && rev !== null && v !== null ? (
          <>
            <ResultHero label="RPM (revenue per 1,000 views)" value={money(result)} />
            <ResultGrid
              items={[
                { label: "Revenue per view", value: formatCurrency(result / 1000, cur, 4) },
                { label: "Views per 1 unit of revenue", value: formatNumber(1000 / (result || Infinity), 1), sub: `Views to earn ${money(1)}` },
              ]}
            />
            <Calculation
              formula="RPM = Revenue ÷ Views × 1,000"
              steps={[`${money(rev)} ÷ ${formatNumber(v)} = ${formatCurrency(result / 1000, cur, 5)} per view`, `× 1,000 = ${money(result)} RPM`]}
            />
            <Disclaimer>RPM describes a past period. It changes with season, audience location, content and ad demand.</Disclaimer>
          </>
        ) : (
          <EmptyResult>Enter revenue and views (views must be greater than 0).</EmptyResult>
        )
      }
    />
  );
}

/* ─── CPM ───────────────────────────────────────────────────────────────── */

export function CpmCalculator() {
  const [adRevenue, setAdRevenue] = useState("1200");
  const [impressions, setImpressions] = useState("150000");
  const [totalRevenue, setTotalRevenue] = useState("");
  const [views, setViews] = useState("");
  const [cur, setCur] = useState<Currency>("USD");
  const ar = parseNumber(adRevenue);
  const imp = parseNumber(impressions);
  const arErr = numberError(ar, adRevenue);
  const impErr = numberError(imp, impressions, { allowZero: false });
  const result = ar !== null && imp !== null && !arErr && !impErr ? cpm(ar, imp) : null;
  const tr = parseNumber(totalRevenue);
  const tv = parseNumber(views);
  const rpmResult = tr !== null && tv !== null && tv > 0 && tr >= 0 ? rpm(tr, tv) : null;
  const money = (n: number) => formatCurrency(n, cur);

  return (
    <CalcLayout
      inputs={
        <>
          <NumberField label="Advertising revenue" value={adRevenue} onChange={setAdRevenue} prefix={SYMBOL[cur]} error={arErr} hint="Gross ad revenue for the period (what advertisers paid)." />
          <NumberField label="Monetized impressions" value={impressions} onChange={setImpressions} error={impErr} hint="Impressions where an ad was actually shown." />
          <CurrencyPicker value={cur} onChange={setCur} />
          <div className="border-t border-line pt-5">
            <p className="text-[13px] font-medium text-ink">Optional: compare with RPM</p>
            <p className="mt-0.5 mb-3 text-xs text-muted">Enter your total revenue and all views for the same period.</p>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Total revenue" value={totalRevenue} onChange={setTotalRevenue} prefix={SYMBOL[cur]} />
              <NumberField label="Total views" value={views} onChange={setViews} />
            </div>
          </div>
        </>
      }
      results={
        result !== null && ar !== null && imp !== null ? (
          <>
            <ResultHero label="CPM (cost per 1,000 monetized impressions)" value={money(result)} />
            {rpmResult !== null ? (
              <ResultGrid
                items={[
                  { label: "Your RPM", value: money(rpmResult), sub: "Revenue per 1,000 views" },
                  { label: "RPM as % of CPM", value: formatPercent((rpmResult / result) * 100, 0), sub: "Share of ad pricing reaching you per view" },
                ]}
              />
            ) : null}
            <Calculation formula="CPM = Ad revenue ÷ Monetized impressions × 1,000" steps={[`${money(ar)} ÷ ${formatNumber(imp)} × 1,000 = ${money(result)}`]} />
            <Disclaimer>
              CPM is what advertisers pay before YouTube&apos;s revenue share, counted only on impressions that showed an ad. RPM is what
              you earn per 1,000 of all views, after the revenue share. RPM is usually lower than CPM.
            </Disclaimer>
          </>
        ) : (
          <EmptyResult>Enter ad revenue and monetized impressions (impressions must be greater than 0).</EmptyResult>
        )
      }
    />
  );
}

/* ─── Watch time ────────────────────────────────────────────────────────── */

export function WatchTimeCalculator() {
  const [views, setViews] = useState("25000");
  const [avd, setAvd] = useState("4:30");
  const v = parseNumber(views);
  const secs = parseDuration(avd);
  const vErr = numberError(v, views);
  const dErr = avd.trim() && secs === null ? "Use HH:MM:SS, MM:SS or seconds (e.g. 4:30)." : null;
  const res = v !== null && secs !== null && !vErr && !dErr ? watchTime(v, secs) : null;
  const THRESHOLD = 4000;

  return (
    <CalcLayout
      inputs={
        <>
          <NumberField label="Number of views" value={views} onChange={setViews} error={vErr} />
          <NumberField
            label="Average view duration"
            value={avd}
            onChange={setAvd}
            inputMode="text"
            placeholder="HH:MM:SS"
            error={dErr}
            hint={secs !== null && !dErr ? `= ${formatNumber(secs)} seconds (${formatDuration(secs)})` : "Accepts 1:02:03, 4:30, 270 or 4m 30s."}
          />
        </>
      }
      results={
        res && v !== null && secs !== null ? (
          <>
            <ResultHero label="Total watch time" value={`${formatNumber(res.hours, 1)} hours`} sub={`${formatNumber(res.minutes)} minutes`} />
            <ResultGrid
              items={[
                { label: "Total minutes", value: formatNumber(res.minutes) },
                { label: "Total hours", value: formatNumber(res.hours, 2) },
                { label: "Total days", value: formatNumber(res.hours / 24, 1), sub: "Continuous viewing" },
                { label: `Share of ${formatNumber(THRESHOLD)} hours`, value: formatPercent(Math.min(100, (res.hours / THRESHOLD) * 100), 1), sub: "A commonly referenced threshold" },
              ]}
            />
            <Calculation
              formula="Watch time = Views × Average view duration"
              steps={[`${formatNumber(v)} × ${formatNumber(secs)} s = ${formatNumber(v * secs)} s`, `÷ 60 = ${formatNumber(res.minutes)} min · ÷ 3,600 = ${formatNumber(res.hours, 2)} h`]}
            />
            <Disclaimer>
              Check YouTube&apos;s current Partner Program requirements for which views and watch time count toward eligibility (for
              example, public long-form views over the last 12 months).
            </Disclaimer>
          </>
        ) : (
          <EmptyResult>Enter views and an average view duration.</EmptyResult>
        )
      }
    />
  );
}

/* ─── Engagement ────────────────────────────────────────────────────────── */

export function EngagementCalculator() {
  const [views, setViews] = useState("48000");
  const [likes, setLikes] = useState("1900");
  const [comments, setComments] = useState("140");
  const v = parseNumber(views);
  const l = parseNumber(likes);
  const c = parseNumber(comments);
  const vErr = numberError(v, views, { allowZero: false });
  const lErr = numberError(l, likes);
  const cErr = numberError(c, comments);
  const ok = v !== null && !vErr && !lErr && !cErr && (l !== null || c !== null);
  const res = ok ? engagement(v, l, c) : null;

  return (
    <CalcLayout
      inputs={
        <>
          <NumberField label="Views" value={views} onChange={setViews} error={vErr} />
          <NumberField label="Likes" value={likes} onChange={setLikes} error={lErr} hint="Leave empty if likes are hidden." />
          <NumberField label="Comments" value={comments} onChange={setComments} error={cErr} hint="Leave empty if comments are off." />
        </>
      }
      results={
        res && v !== null ? (
          <>
            <ResultHero label="Engagement rate" value={formatPercent(res.engagementRate)} sub="(Likes + comments) ÷ views × 100" />
            <ResultGrid
              items={[
                { label: "Like rate", value: formatPercent(res.likeRate), sub: "Likes ÷ views × 100" },
                { label: "Comment rate", value: formatPercent(res.commentRate, 3), sub: "Comments ÷ views × 100" },
                { label: "Likes per comment", value: res.likesPerComment === null ? "—" : formatNumber(res.likesPerComment, 1) },
                { label: "Comments per 1,000 views", value: res.commentsPer1000 === null ? "—" : formatNumber(res.commentsPer1000, 2) },
              ]}
            />
            <Calculation
              formula="Like rate = Likes ÷ Views × 100"
              steps={[
                l !== null ? `${formatNumber(l)} ÷ ${formatNumber(v)} × 100 = ${formatPercent(res.likeRate)}` : "Likes not provided",
                c !== null ? `Comment rate: ${formatNumber(c)} ÷ ${formatNumber(v)} × 100 = ${formatPercent(res.commentRate, 3)}` : "Comments not provided",
              ]}
            />
            <Disclaimer>
              These are descriptive ratios of public counts. YouTube doesn&apos;t publish engagement rate as a metric or confirm how
              likes and comments affect recommendations.
            </Disclaimer>
          </>
        ) : (
          <EmptyResult>Enter views (greater than 0) and at least likes or comments.</EmptyResult>
        )
      }
    />
  );
}

"use client";

import { useId, useState } from "react";
import styles from "./StaffingCostCalculator.module.css";

// Port of the inline-script calculator on goodwillstaffing.ca. The formulas
// are unchanged, including that statutory taxes are listed but, as on the
// original, not added to the grand total.

type Region = "CA" | "US";

const TAX_RATE: Record<Region, number> = { CA: 0.0761, US: 0.0765 };
const TAX_LABEL: Record<Region, string> = { CA: "CPP/EI", US: "FICA/SUI" };

const OVERTIME_OPTIONS = [0.05, 0.1, 0.45];
const BURDEN_OPTIONS = [0.25, 0.3, 0.37];
const HIDDEN_OPTIONS = [0.08, 0.12, 0.18];

const money = (n: number) => `$${Math.round(n).toLocaleString("en-CA")}`;
const pct = (n: number) => `${Math.round(n * 100)}%`;

function RateSelect({
  label,
  value,
  options,
  onChange,
  amount,
}: {
  label: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
  amount: number;
}) {
  const id = useId();
  return (
    <div className={styles.row}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputs}>
        <select id={id} className={styles.select} value={value} onChange={(e) => onChange(Number(e.target.value))}>
          {options.map((option) => (
            <option key={option} value={option}>
              {pct(option)}
            </option>
          ))}
        </select>
        <output className={styles.subBox}>{money(amount)}</output>
      </div>
    </div>
  );
}

export function StaffingCostCalculator() {
  const salaryId = useId();
  const [region, setRegion] = useState<Region>("CA");
  const [base, setBase] = useState(67779);
  const [overtime, setOvertime] = useState(0.45);
  const [burden, setBurden] = useState(0.37);
  const [hidden, setHidden] = useState(0.18);

  const taxes = base * TAX_RATE[region];
  const overtimeCost = base * overtime * 1.5;
  const burdenCost = base * burden;
  const totalAllIn = base + overtimeCost + burdenCost;
  const totalHidden = totalAllIn * hidden;
  const grandTotal = totalAllIn + totalHidden;

  return (
    <div className={styles.calculator}>
      <h2 className={styles.title}>In-House Staffing Cost Calculator</h2>

      <div className={styles.toggle} role="group" aria-label="Payroll rules">
        {(["CA", "US"] as const).map((r) => (
          <button
            key={r}
            type="button"
            className={styles.toggleButton}
            aria-pressed={region === r}
            onClick={() => setRegion(r)}
          >
            {r === "CA" ? "🇨🇦 Canada (CPP/EI)" : "🇺🇸 USA (FICA/SUI)"}
          </button>
        ))}
      </div>

      <div className={styles.row}>
        <label htmlFor={salaryId} className={styles.label}>
          1. Insert employee base salary
        </label>
        <input
          id={salaryId}
          type="number"
          min={0}
          inputMode="numeric"
          className={styles.input}
          value={Number.isFinite(base) ? base : ""}
          onChange={(e) => setBase(Number(e.target.value) || 0)}
        />
      </div>

      <RateSelect
        label="2. Select % of hours at overtime rates"
        value={overtime}
        options={OVERTIME_OPTIONS}
        onChange={setOvertime}
        amount={overtimeCost}
      />
      <RateSelect
        label="3. Select all-in facility burden*"
        value={burden}
        options={BURDEN_OPTIONS}
        onChange={setBurden}
        amount={burdenCost}
      />

      <div className={styles.totalRow}>
        <span>Total all-in cost of employee</span>
        <output className={styles.wide}>{money(totalAllIn)}</output>
      </div>

      <RateSelect
        label="4. Select hidden cost level**"
        value={hidden}
        options={HIDDEN_OPTIONS}
        onChange={setHidden}
        amount={base * hidden}
      />

      <div className={styles.totalRow}>
        <span>Total hidden costs</span>
        <output className={styles.wide}>{money(totalHidden)}</output>
      </div>
      <div className={styles.totalRow}>
        <span>% of base pay</span>
        <output className={styles.wide}>{base > 0 ? pct(totalHidden / base) : "0%"}</output>
      </div>

      <dl className={styles.result}>
        <div>
          <dt>Statutory taxes ({TAX_LABEL[region]})</dt>
          <dd>{money(taxes)}</dd>
        </div>
        <div>
          <dt>Overtime cost (1.5x premium)</dt>
          <dd>{money(overtimeCost)}</dd>
        </div>
        <div>
          <dt>Facility burden (benefits/WSIB)</dt>
          <dd>{money(burdenCost)}</dd>
        </div>
        <div>
          <dt>Hidden costs (attrition/recruitment)</dt>
          <dd>{money(totalHidden)}</dd>
        </div>
        <div className={styles.grand}>
          <dt>Total annual cost</dt>
          <dd aria-live="polite">{money(grandTotal)}</dd>
        </div>
      </dl>

      <p className={styles.footnote}>
        * Includes health benefits, bonuses, matching taxes, WSIB/WCB, and malpractice insurance.
        <br />
        ** Represents recruitment, credentialing, orientation, and lost productivity from turnover.
      </p>
    </div>
  );
}

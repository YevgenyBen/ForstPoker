"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";

type Row = { label: string; netNis: number; cumulative: number };

function valueToneClass(n: number): string {
  if (n < 0) return "text-[var(--fp-loss)]";
  if (n > 0) return "text-[var(--fp-moss)]";
  return "text-[var(--fp-ink)]";
}

export function CareerChart({ data }: { data: Row[] }) {
  const t = useTranslations("career");

  if (data.length === 0) return null;

  return (
    <div className="mt-6 h-56 w-full rounded-xl border border-[var(--fp-wood-mid)]/25 bg-[var(--fp-panel)] p-3">
      <p className="mb-2 text-center text-sm font-medium">{t("chartTitle")}</p>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const raw = payload[0].value;
              const n = typeof raw === "number" ? raw : Number(raw);
              const safe = Number.isFinite(n) ? n : 0;
              return (
                <div
                  className="rounded-lg border px-3 py-2 text-sm shadow-md"
                  style={{
                    backgroundColor: "var(--fp-panel)",
                    borderColor: "color-mix(in srgb, var(--fp-wood-mid) 35%, transparent)",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.18)",
                  }}
                >
                  {label != null && (
                    <p className="mb-1 font-semibold text-[var(--fp-ink)]">{label}</p>
                  )}
                  <p
                    className={`text-base font-semibold tabular-nums ${valueToneClass(safe)}`}
                    dir="ltr"
                  >
                    ₪{safe}
                  </p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke="var(--fp-felt)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

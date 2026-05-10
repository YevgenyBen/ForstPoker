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
            formatter={(v) => [typeof v === "number" ? `₪${v}` : v, ""]}
            contentStyle={{
              backgroundColor: "var(--fp-panel)",
              border: "1px solid color-mix(in srgb, var(--fp-wood-mid) 35%, transparent)",
              borderRadius: "8px",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.18)",
            }}
            labelStyle={{
              color: "var(--fp-ink)",
              fontWeight: 600,
              marginBottom: 4,
            }}
            itemStyle={{
              color: "var(--fp-moss)",
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

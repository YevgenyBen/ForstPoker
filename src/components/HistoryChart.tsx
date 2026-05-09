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

export function HistoryChart({ data }: { data: Row[] }) {
  const t = useTranslations("history");

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

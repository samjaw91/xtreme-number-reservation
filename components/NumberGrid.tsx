"use client";

import { CampaignNumber } from "@/lib/types";

const statusMap: Record<string, string> = {
  available: "متاح",
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
};

export function NumberGrid({
  numbers,
  selected,
  onToggle,
}: {
  numbers: CampaignNumber[];
  selected: number[];
  onToggle: (num: number) => void;
}) {
  return (
    <div className="number-grid">
      {numbers.map((item) => {
        const isSelected = selected.includes(item.number_value);
        const disabled = item.current_status !== "available";
        return (
          <button
            key={item.id}
            type="button"
            className={`number-box status-${item.current_status} ${isSelected ? "selected" : ""}`}
            onClick={() => !disabled && onToggle(item.number_value)}
            disabled={disabled}
          >
            <strong>{item.number_value}</strong>
            <span>{statusMap[item.current_status]}</span>
          </button>
        );
      })}
    </div>
  );
}

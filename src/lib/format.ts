export function pct(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function ms(value: number) {
  return `${Math.round(value)}ms`;
}

export function trend(current: number, previous: number | null | undefined) {
  if (previous === null || previous === undefined || previous === 0) {
    return { label: "—", direction: "flat" as const, percent: 0 };
  }

  const percent = ((current - previous) / Math.abs(previous)) * 100;
  const direction = percent > 0 ? "up" : percent < 0 ? "down" : "flat";
  return {
    label: `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`,
    direction,
    percent,
  };
}

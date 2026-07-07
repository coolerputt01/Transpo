type StatusPillProps = {
  label: string;
  tone?: "blue" | "green" | "amber" | "red" | "gray";
};

export function StatusPill({ label, tone = "gray" }: StatusPillProps) {
  return <span className={`status-pill status-${tone}`}>{label.split("_").join(" ")}</span>;
}

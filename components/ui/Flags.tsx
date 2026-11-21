export type Flag = "us" | "jp" | "ba";

export function FlagIcon({ f }: { f: Flag }) {
  const cls = "h-[10px] w-[15px] shrink-0 rounded-[2px] sm:h-3 sm:w-[18px]";
  if (f === "jp") return <svg viewBox="0 0 18 12" className={cls} aria-hidden><rect width="18" height="12" fill="#FFFFFF" /><circle cx="9" cy="6" r="3.4" fill="#BC002D" /></svg>;
  if (f === "ba") return <svg viewBox="0 0 18 12" className={cls} aria-hidden><rect width="18" height="12" fill="#002395" /><path d="M5 0h9v12z" fill="#FECB00" /></svg>;
  return (
    <svg viewBox="0 0 18 12" className={cls} aria-hidden>
      <rect width="18" height="12" fill="#FFFFFF" />
      {[0, 2, 4, 6, 8, 10].map((y) => <rect key={y} y={y} width="18" height="1" fill="#B22234" />)}
      <rect width="8" height="6.5" fill="#3C3B6E" />
    </svg>
  );
}

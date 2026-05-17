const LTR_MARK = "\u200E";

/** Prefix text so RTL scripts (e.g. Hebrew) align from the left in LTR columns. */
export function ltrAlignText(text: string): string {
  if (!text) return text;
  return `${LTR_MARK}${text}`;
}

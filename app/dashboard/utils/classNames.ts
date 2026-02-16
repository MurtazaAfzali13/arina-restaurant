"use client";

export function classNames(...xs: Array<string | null | undefined | false>) {
  return xs.filter(Boolean).join(" ");
}

export default classNames;

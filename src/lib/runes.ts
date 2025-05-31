// src/lib/runes.ts

export function field(initialValue: string) {
  return {
    value: initialValue
  };
}

export function form(fields: Record<string, any>) {
  return {
    fields
  };
}

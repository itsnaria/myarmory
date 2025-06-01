// src/lib/runes.ts
// This file contains utility functions for creating runes, fields, and forms
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

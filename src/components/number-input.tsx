"use client";

import { useState, type InputHTMLAttributes } from "react";

type NumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value: number;
  // Receives the typed text; callers parse it with their own rules.
  onValueChange: (raw: string) => void;
};

// Drop leading zeros ("01513" -> "1513") but keep "0" and "0.5".
function trimLeadingZeros(raw: string) {
  return raw.replace(/^0+(?=\d)/, "");
}

// Number field that keeps what the user typed, so clearing it shows an
// empty box instead of a stuck "0" that new digits get appended to.
export default function NumberInput({
  value,
  onValueChange,
  onBlur,
  onFocus,
  ...props
}: NumberInputProps) {
  const [text, setText] = useState(String(value));
  const [lastValue, setLastValue] = useState(value);

  // Follow outside changes (resets, presets) without clobbering typing.
  if (value !== lastValue) {
    setLastValue(value);

    if (Number(text) !== value) {
      setText(String(value));
    }
  }

  return (
    <input
      {...props}
      type="number"
      value={text}
      onChange={(event) => {
        const raw = trimLeadingZeros(event.target.value);

        setText(raw);
        onValueChange(raw);
      }}
      onFocus={(event) => {
        // Select a lone "0" so the first digit typed replaces it.
        if (Number(text) === 0) {
          event.currentTarget.select();
        }

        onFocus?.(event);
      }}
      onBlur={(event) => {
        if (text.trim() === "") {
          setText(String(value));
        }

        onBlur?.(event);
      }}
    />
  );
}

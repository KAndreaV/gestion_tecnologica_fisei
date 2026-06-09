import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  suffix?: ReactNode;
}

export function Input({ label, suffix, id, className, ...props }: InputProps) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <div className="input-shell">
        <input id={id} className={className} {...props} />
        {suffix ? <span aria-hidden="true">{suffix}</span> : null}
      </div>
    </label>
  );
}
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    mask?: "cnpj" | "currency";
}

function applyMask(value: string, mask?: "cnpj" | "currency"): string {
    if (mask === "cnpj") {
        return value
            .replace(/\D/g, "")
            .slice(0, 14)
            .replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    }
    if (mask === "currency") {
        const num = value.replace(/\D/g, "");
        return (Number(num) / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }
    return value;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, mask, onChange, className = "", ...props }, ref) => {
        function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
            if (mask) e.target.value = applyMask(e.target.value, mask);
            onChange?.(e);
        }

        return (
            <div className="flex flex-col gap-1">
                {label && (
                    <label className="text-sm font-medium text-slate-300">{label}</label>
                )}
                <input
                    ref={ref}
                    onChange={handleChange}
                    className={`
            w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors
            bg-slate-700 text-white placeholder-slate-500
            border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
            ${className}
          `}
                    {...props}
                />
                {error && <span className="text-xs text-red-400">{error}</span>}
            </div>
        );
    }
);

Input.displayName = "Input";
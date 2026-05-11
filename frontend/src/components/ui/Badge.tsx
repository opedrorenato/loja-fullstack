type BadgeVariant = "primary" | "secondary" | "danger" | "success" | "warning";

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}

const variants: Record<BadgeVariant, string> = {
    primary: "bg-blue-900/40 text-blue-400 border-blue-700",
    secondary: "bg-slate-700 text-slate-300 border-slate-600",
    danger: "bg-red-900/40 text-red-400 border-red-700",
    success: "bg-emerald-900/40 text-emerald-400 border-emerald-700",
    warning: "bg-amber-900/40 text-amber-400 border-amber-700",
};

export function Badge({ variant = "primary", children, className = "" }: BadgeProps) {
    return (
        <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
            ${variants[variant]}
            ${className}
        `}>
            {children}
        </span>
    );
}

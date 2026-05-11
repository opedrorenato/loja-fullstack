interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
    return (
        <div
            className={`
                inline-block rounded-full border-blue-500 border-t-transparent animate-spin
                ${sizes[size]}
                ${className}
            `}
            role="status"
            aria-label="Carregando"
        />
    );
}

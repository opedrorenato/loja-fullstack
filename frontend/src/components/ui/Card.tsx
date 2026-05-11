interface CardProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    className?: string;
    noPadding?: boolean;
    footer?: React.ReactNode;
}

export function Card({ children, title, description, className = "", noPadding = false, footer }: CardProps) {
    return (
        <div className={`bg-slate-800 rounded-xl border border-slate-700 overflow-hidden ${className}`}>
            {(title || description) && (
                <div className="px-5 py-4 border-b border-slate-700">
                    {title && <h3 className="text-sm font-semibold text-slate-200">{title}</h3>}
                    {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
                </div>
            )}
            <div className={noPadding ? "" : "p-5"}>
                {children}
            </div>
            {footer && (
                <div className="px-5 py-4 border-t border-slate-700 bg-slate-800/50">
                    {footer}
                </div>
            )}
        </div>
    );
}

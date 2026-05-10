interface HeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
    return (
        <div className="flex items-center justify-between py-6 px-8 border-b border-slate-700 bg-slate-800">
            <div>
                <h1 className="text-xl font-semibold text-white">{title}</h1>
                {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
    );
}

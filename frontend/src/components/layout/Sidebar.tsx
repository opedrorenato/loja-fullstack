"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { label: "Pedidos", href: "/", icon: "🧾" },
    { label: "Novo Pedido", href: "/novo-pedido", icon: "➕" },
    { label: "Produtos", href: "/produtos", icon: "📦" },
    { label: "Clientes", href: "/clientes", icon: "👥" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-gray-700">
                <h1 className="text-lg font-bold tracking-tight">🏪 Loja FullStack</h1>
                <p className="text-xs text-gray-400 mt-0.5">Sistema de Vendas</p>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                {navItems.map((item) => {
                    const active =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${active
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"}
              `}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-700">
                <p className="text-xs text-gray-500">v1.0.0</p>
            </div>
        </aside>
    );
}
"use client";

import { useEffect } from "react";
import { Button } from "./Button";

interface ModalProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg";
}

const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
};

export function Modal({ open, title, onClose, children, footer, size = "md" }: ModalProps) {
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        if (open) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative z-10 w-full ${sizes[size]} mx-4 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
                        ✕
                    </Button>
                </div>
                {/* Body */}
                <div className="px-6 py-4">{children}</div>
                {/* Footer */}
                {footer && (
                    <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-700 bg-slate-900/40 rounded-b-xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-2xl shadow-black/50">
                <div className="text-center mb-8">
                    <h1 className="font-heading text-3xl font-bold text-primary tracking-tight">SwiftPOS</h1>
                    <p className="text-muted-foreground mt-2 font-sans">Login to your dashboard</p>
                </div>
                {children}
            </div>
        </div>
    );
}

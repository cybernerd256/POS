"use client";

import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Supabase Auth integration here
        window.location.href = "/pos";
    };

    return (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Email or PIN</label>
                <input
                    type="text"
                    required
                    className="bg-base border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 ring-primary transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                    type="password"
                    required
                    className="bg-base border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 ring-primary transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button
                type="submit"
                className="mt-4 bg-primary text-primary-foreground font-bold py-2.5 rounded-md hover:opacity-90 transition-opacity"
            >
                Sign In
            </button>
            <div className="text-center mt-4">
                <a href="#" className="text-sm text-accent hover:underline">Forgot password?</a>
            </div>
        </form>
    );
}

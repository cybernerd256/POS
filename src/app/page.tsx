import Link from "next/link";
import { ArrowRight, Store, Zap, Fingerprint } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base text-foreground font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-base/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-base font-bold text-base">
              S
            </div>
            <span className="font-heading font-bold text-xl tracking-wide text-primary">SwiftPOS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
            <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
          </div>
          <Link
            href="/pos"
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-bold text-sm tracking-wide hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Open POS <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative">
        {/* Glow effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider mb-8">
          <Zap className="w-3.5 h-3.5" />
          <span>SWIFTPOS 2.0 IS LIVE</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight max-w-4xl leading-tight mb-8">
          The Luxury Standard in <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Point of Sale</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 font-medium">
          Offline-first architecture. Unparalleled speed. Built for premium retail operations that cannot afford downtime.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/pos"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_var(--primary)]"
          >
            <Store className="w-5 h-5" />
            Launch Terminal
          </Link>
          <Link
            href="/inventory"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-surface border border-border text-foreground font-bold px-8 py-4 rounded-xl hover:bg-elevated transition-colors"
          >
            Manage Inventory
          </Link>
        </div>

        {/* Mock Dashboard Preview */}
        <div className="mt-20 w-full relative rounded-2xl border border-border/50 bg-elevated/40 backdrop-blur-sm p-2 shadow-2xl">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="rounded-xl border border-border bg-base overflow-hidden aspect-[16/9] sm:aspect-[21/9] flex flex-col">
            <div className="h-12 border-b border-border bg-surface flex items-center justify-between px-4 gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-danger/50" />
                <div className="w-3 h-3 rounded-full bg-warning/50" />
                <div className="w-3 h-3 rounded-full bg-success/50" />
              </div>
              <div className="text-xs font-mono text-muted-foreground bg-base px-2 py-0.5 rounded border border-border">swiftpos.app/pos</div>
              <div className="w-16" /> {/* Spacer */}
            </div>
            <div className="flex-1 flex items-center justify-center bg-base/50 p-8">
              <div className="grid grid-cols-3 gap-6 w-full h-full opacity-30">
                <div className="col-span-2 rounded-lg border border-border border-dashed bg-surface/50 p-6 flex flex-col gap-4">
                  <div className="h-8 bg-border/20 rounded w-1/4" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="aspect-square bg-border/20 rounded" />
                    <div className="aspect-square bg-border/20 rounded" />
                    <div className="aspect-square bg-border/20 rounded" />
                    <div className="aspect-square bg-border/20 rounded" />
                    <div className="aspect-square bg-border/20 rounded" />
                    <div className="aspect-square bg-border/20 rounded" />
                  </div>
                </div>
                <div className="col-span-1 rounded-lg border border-border border-dashed bg-surface/50 p-6 flex flex-col gap-4">
                  <div className="h-8 bg-border/20 rounded w-1/2 mb-4" />
                  <div className="h-12 bg-border/20 rounded w-full" />
                  <div className="h-12 bg-border/20 rounded w-full" />
                  <div className="mt-auto h-16 bg-primary/20 rounded w-full border border-primary/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-surface max-w-7xl mx-auto px-6 rounded-3xl mb-24 border border-border">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Engineered for Excellence</h2>
          <p className="text-muted-foreground text-lg">Everything you need to run your store, beautiful and fast.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-primary" />}
            title="Local-First Sync Engine"
            desc="Runs directly in your browser with Dexie.js. Instantly processes orders offline and silently syncs to the cloud when connections restore."
          />
          <FeatureCard
            icon={<Store className="w-6 h-6 text-accent" />}
            title="Luxury Utility Interface"
            desc="Designed with cues from high-end terminal systems. Dark mode optimized, zero visual clutter, built for speed."
          />
          <FeatureCard
            icon={<Fingerprint className="w-6 h-6 text-info" />}
            title="Secure Manager Actions"
            desc="Role-based permissions, PIN-protected void and refund flows, and strict audit logs for every transaction."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-base py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center text-background font-bold text-xs">
              S
            </div>
            <span className="font-heading font-bold text-sm tracking-wide">SwiftPOS</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} SwiftPOS. Built for performance.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-2xl bg-base border border-border hover:border-primary/30 transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-elevated border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

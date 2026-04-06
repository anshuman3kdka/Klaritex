import { InputPanel } from "@/components/analyzer/InputPanel";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:py-12">
      <header className="mx-auto mb-8 w-full max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Klaritex</h1>
        <p className="mt-3 text-base text-slate-600 sm:text-lg">Language Exposed. Accountability Scored.</p>
      </header>

      <InputPanel />
    </main>
  );
}

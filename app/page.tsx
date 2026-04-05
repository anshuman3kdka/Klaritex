import { InputPanel } from "@/components/analyzer/InputPanel";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Klaritex</h1>
        <p className="mt-3 text-lg text-slate-600">Language Exposed. Accountability Scored.</p>
      </div>

      <InputPanel />
    </main>
  );
}

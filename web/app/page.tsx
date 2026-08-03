import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] bg-slate-950 text-white p-8">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">
            DhanSetu Web Application
          </h1>
        </div>

        <p className="text-slate-400 mb-8 leading-relaxed">
          Application structure configured with Redux Toolkit state management, Axios single-entry API client, and clean modular folder organization.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <h3 className="text-emerald-400 font-semibold mb-1">📁 `components/`</h3>
            <p className="text-xs text-slate-400">
              Shared UI elements (`common/`, `UI/`)
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <h3 className="text-purple-400 font-semibold mb-1">⚛️ `redux/`</h3>
            <p className="text-xs text-slate-400">
              Redux Store, Hooks, Provider & Slices
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <h3 className="text-blue-400 font-semibold mb-1">⚡ `utils/`</h3>
            <p className="text-xs text-slate-400">
              Single Base URL Axios API Client (`api.ts`)
            </p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-300">
          <div className="text-slate-500 mb-2">// Import single API client instance anywhere:</div>
          <div className="text-emerald-400 mb-4">import api, &#123; apiClient &#125; from "@/utils/api";</div>
          <div className="text-slate-500 mb-2">// Import typed Redux hooks:</div>
          <div className="text-purple-400">import &#123; useAppDispatch, useAppSelector &#125; from "@/redux/hooks";</div>
        </div>
      </div>
    </div>
  );
}

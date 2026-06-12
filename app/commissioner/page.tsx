"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CommissionerPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  async function startDraft() {
    const { data, error } = await supabase.rpc("commissioner_start_draft", {
      p_code: code,
    });

    setMessage(error ? error.message : data);
  }

  async function resetDraft() {
    const confirmed = window.confirm(
      "Reset the entire draft? This clears all picks."
    );

    if (!confirmed) return;

    const { data, error } = await supabase.rpc("commissioner_reset_draft", {
      p_code: code,
    });

    setMessage(error ? error.message : data);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-xl">
        <h1 className="text-4xl font-bold">Commissioner Controls</h1>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Commissioner code"
          type="password"
          className="mt-8 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />

        <div className="mt-6 flex gap-4">
          <button
            onClick={startDraft}
            className="rounded-lg bg-emerald-500 px-4 py-3 font-bold text-slate-950"
          >
            Start Draft
          </button>

          <button
            onClick={resetDraft}
            className="rounded-lg bg-red-500 px-4 py-3 font-bold text-white"
          >
            Reset Draft
          </button>
        </div>

        {message && (
          <p className="mt-6 rounded-lg bg-slate-900 p-4 text-amber-300">
            {message}
          </p>
        )}

        <a href="/draft" className="mt-8 inline-block text-emerald-400">
          Go to draft room
        </a>
      </div>
    </main>
  );
}
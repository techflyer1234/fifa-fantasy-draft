"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Team = {
  id: string;
  team_name: string;
  draft_position: number;
  managers:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

export default function SetupPage() {
  const [managerName, setManagerName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [draftPosition, setDraftPosition] = useState("1");
  const [teams, setTeams] = useState<Team[]>([]);
  const [message, setMessage] = useState("");

  async function loadTeams() {
    const { data, error } = await supabase
      .from("teams")
      .select("id, team_name, draft_position, managers(name)")
      .order("draft_position");

    if (error) {
      setMessage(error.message);
      return;
    }

    setTeams((data ?? []) as Team[]);
  }

  useEffect(() => {
    loadTeams();
  }, []);

  async function createTeam() {
    setMessage("");

    if (!managerName.trim() || !teamName.trim()) {
      setMessage("Manager name and team name are required.");
      return;
    }

    const pos = Number(draftPosition);

    if (![1, 2, 3, 4].includes(pos)) {
      setMessage("Draft position must be 1, 2, 3, or 4.");
      return;
    }

    const { data: manager, error: managerError } = await supabase
      .from("managers")
      .insert({
        name: managerName.trim(),
      })
      .select("id")
      .single();

    if (managerError) {
      setMessage(managerError.message);
      return;
    }

    const { error: teamError } = await supabase.from("teams").insert({
      manager_id: manager.id,
      team_name: teamName.trim(),
      draft_position: pos,
    });

    if (teamError) {
      setMessage(teamError.message);
      return;
    }

    localStorage.setItem("managerName", managerName.trim());
    localStorage.setItem("teamName", teamName.trim());

    setManagerName("");
    setTeamName("");
    setDraftPosition("1");
    setMessage("Team created successfully.");
    await loadTeams();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">League Setup</h1>
        <p className="mt-3 text-slate-400">
          Create your manager profile and team before the draft starts.
        </p>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <label className="block text-sm text-slate-300">Manager Name</label>
          <input
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Raj"
          />

          <label className="mt-5 block text-sm text-slate-300">Team Name</label>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Raj FC"
          />

          <label className="mt-5 block text-sm text-slate-300">
            Draft Position
          </label>
          <select
            value={draftPosition}
            onChange={(e) => setDraftPosition(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          >
           {[1, 2, 3, 4].map((pos) => {
  const taken = teams.some((team) => team.draft_position === pos);

  return (
    <option key={pos} value={pos} disabled={taken}>
      {pos}
      {pos === 1 ? "st" : pos === 2 ? "nd" : pos === 3 ? "rd" : "th"}
      {taken ? " — taken" : ""}
    </option>
  );
})}
          </select>

          <button
            onClick={createTeam}
            className="mt-6 w-full rounded-lg bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400"
          >
            Create Team
          </button>

          {message && <p className="mt-4 text-sm text-amber-300">{message}</p>}
        </div>

        <h2 className="mt-10 text-2xl font-bold">Current Teams</h2>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="px-4 py-3">Draft Pos.</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3">Team</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">{team.draft_position}</td>
                  <td className="px-4 py-3">{Array.isArray(team.managers)
                                            ? team.managers[0]?.name ?? "—"
                                            : team.managers?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold">
                    {team.team_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <a
          href="/"
          className="mt-8 inline-block rounded-lg border border-slate-700 px-4 py-3 text-slate-200 hover:bg-slate-900"
        >
          Back to player database
        </a>
      </div>
    </main>
  );
}


"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Player = {
  id: string;
  player_name: string;
  country: string;
  position: string | null;
  club: string | null;
  draft_pool_type: string | null;
  drafted_by_team_id: string | null;
};

type Team = {
  id: string;
  team_name: string;
  draft_position: number;
};

export default function DraftPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [position, setPosition] = useState("all");
  const [message, setMessage] = useState("");

  async function loadData() {
    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("id, player_name, country, position, club, draft_pool_type, drafted_by_team_id")
      .order("country")
      .order("player_name");

    if (playerError) {
      setMessage(playerError.message);
      return;
    }

    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("id, team_name, draft_position")
      .order("draft_position");

    if (teamError) {
      setMessage(teamError.message);
      return;
    }

    setPlayers((playerData ?? []) as Player[]);
    setTeams((teamData ?? []) as Team[]);
  }

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("draft-room")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players" },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const countries = useMemo(() => {
    return Array.from(new Set(players.map((p) => p.country))).sort();
  }, [players]);

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.player_name.toLowerCase().includes(search.toLowerCase()) ||
      (player.club ?? "").toLowerCase().includes(search.toLowerCase());

    const matchesCountry = country === "all" || player.country === country;
    const matchesPosition = position === "all" || player.position === position;
    const isAvailable = !player.drafted_by_team_id;

    return matchesSearch && matchesCountry && matchesPosition && isAvailable;
  });

  async function draftPlayer(player: Player) {
    setMessage("");
const teamId = localStorage.getItem("teamId");
const teamName = localStorage.getItem("teamName");

if (!teamId || !teamName) {
  setMessage("No team selected. Select your team before drafting.");
  return;
}

const confirmed = window.confirm(
  `Draft ${player.player_name} to ${teamName}?`
);

if (!confirmed) {
  setMessage("Draft cancelled.");
  return;
}

const { data, error } = await supabase.rpc("draft_player", {
p_player_id: player.id,
p_team_id: teamId,
});

if (error) {
setMessage(error.message);
return;
}

setMessage(`${player.player_name}: ${data}`);


    setMessage(`Drafted ${player.player_name}`);
    await loadData();
  }

  function selectTeam(team: Team) {
    localStorage.setItem("teamId", team.id);
    localStorage.setItem("teamName", team.team_name);
    setMessage(`Selected ${team.team_name}`);
  }

  const selectedTeamName =
    typeof window !== "undefined" ? localStorage.getItem("teamName") : null;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold">Draft Room</h1>

        <p className="mt-2 text-slate-400">
          Selected team:{" "}
          <span className="font-semibold text-emerald-400">
            {selectedTeamName ?? "None"}
          </span>
        </p>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="text-xl font-bold">Select Your Team</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => selectTeam(team)}
                className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800"
              >
                {team.draft_position}. {team.team_name}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <p className="mt-4 rounded-lg bg-slate-900 p-3 text-amber-300">
            {message}
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <h2 className="text-2xl font-bold">Available Players</h2>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search player or club..."
                  className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
                />

                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
                >
                  <option value="all">All countries</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
                >
                  <option value="all">All positions</option>
                  <option value="GK">GK</option>
                  <option value="DF">DF</option>
                  <option value="MF">MF</option>
                  <option value="FW">FW</option>
                </select>
              </div>

              <p className="mt-4 text-sm text-slate-400">
                Showing {filteredPlayers.length} available players.
              </p>

              <div className="mt-4 max-h-[600px] overflow-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-900 text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Player</th>
                      <th className="px-4 py-3">Country</th>
                      <th className="px-4 py-3">Pos</th>
                      <th className="px-4 py-3">Club</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPlayers.map((player) => (
                      <tr key={player.id} className="border-t border-slate-800">
                        <td className="px-4 py-3 font-semibold">
                          {player.player_name}
                        </td>
                        <td className="px-4 py-3">{player.country}</td>
                        <td className="px-4 py-3">{player.position}</td>
                        <td className="px-4 py-3 text-slate-300">
                          {player.club}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => draftPlayer(player)}
                            className="rounded-lg bg-emerald-500 px-3 py-2 font-bold text-slate-950 hover:bg-emerald-400"
                          >
                            Draft
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-2xl font-bold">Teams</h2>

            <div className="mt-4 space-y-4">
              {teams.map((team) => {
                const roster = players.filter(
                  (p) => p.drafted_by_team_id === team.id
                );

                return (
                  <div
                    key={team.id}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                  >
                    <h3 className="font-bold">
                      {team.draft_position}. {team.team_name}
                    </h3>

                    <p className="text-sm text-slate-400">
                      {roster.length} players
                    </p>

                    <ul className="mt-2 space-y-1 text-sm text-slate-300">
                      {roster.slice(0, 10).map((player) => (
                        <li key={player.id}>
                          {player.player_name} — {player.country}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
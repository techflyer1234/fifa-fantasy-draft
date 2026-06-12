import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Player = {
  id: string;
  player_name: string;
  country: string;
  position: string | null;
  club: string | null;
  draft_pool_type: string | null;
};

export default async function Home() {
  const { data, error, count } = await supabase
    .from("players")
    .select("id, player_name, country, position, club, draft_pool_type", {
      count: "exact",
    })
    .order("country", { ascending: true })
    .order("player_name", { ascending: true })
    .range(0, 1247);

  const players = (data ?? []) as Player[];

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <h1 className="text-3xl font-bold">Database connection error</h1>
        <pre className="mt-6 rounded-lg bg-red-950 p-4 text-red-200">
          {error.message}
        </pre>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <h1 className="text-4xl font-bold">FIFA Fantasy Draft 2026</h1>
      <div className="mt-6 flex flex-wrap gap-4">
<div className="mt-6 flex flex-wrap gap-4">
  <a
    href="/setup"
    className="rounded-lg bg-blue-500 px-4 py-3 font-bold text-white hover:bg-blue-400"
  >
    Team Setup
  </a>

  <a
    href="/draft"
    className="rounded-lg bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400"
  >
    Draft Room
  </a>

  <a
    href="/commissioner"
    className="rounded-lg bg-red-500 px-4 py-3 font-bold text-white hover:bg-red-400"
  >
    Commissioner Controls
  </a>
</div>

</div>

      <p className="mt-3 text-slate-400">
        {count ?? players.length} players loaded. Showing first {players.length}.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Club</th>
              <th className="px-4 py-3">Pool</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="border-t border-slate-800">
                <td className="px-4 py-3 font-medium">{player.player_name}</td>
                <td className="px-4 py-3">{player.country}</td>
                <td className="px-4 py-3">{player.position ?? "—"}</td>
                <td className="px-4 py-3">{player.club ?? "—"}</td>
                <td className="px-4 py-3">{player.draft_pool_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
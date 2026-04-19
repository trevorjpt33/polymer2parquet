import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="rounded-2xl bg-gray-900 text-white px-10 py-16 mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          NBA & ABA Historical Statistics
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mb-8">
          Explore player profiles, compare athletes across eras, and browse team
          histories spanning both the NBA and ABA — from 1946 to present.
        </p>
        <div className="flex gap-4">
          <Link
            to="/players"
            className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Browse Players
          </Link>
          <Link
            to="/compare"
            className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
          >
            Compare Players
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Player Encyclopedia</h2>
          <p className="text-sm text-gray-500">
            5,400+ player profiles with career stats, bio info, and season-by-season breakdowns.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Player Comparisons</h2>
          <p className="text-sm text-gray-500">
            Compare up to 3 players side-by-side across per game, advanced, shooting, and accolade stats.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Team Timelines</h2>
          <p className="text-sm text-gray-500">
            Browse all 104 NBA and ABA franchises, filter by season, and explore full roster histories.
          </p>
        </div>
      </div>

      {/* Data coverage */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Data Coverage</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-3xl font-bold text-gray-900">5,416</p>
            <p className="text-sm text-gray-500 mt-1">Players</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">104</p>
            <p className="text-sm text-gray-500 mt-1">Franchises</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">30,287</p>
            <p className="text-sm text-gray-500 mt-1">Player Seasons</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">1946</p>
            <p className="text-sm text-gray-500 mt-1">Coverage from</p>
          </div>
        </div>
      </div>
    </div>
  );
}
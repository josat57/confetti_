"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import { toast } from "react-toastify";
import EventSubNav from "@/components/user/events/EventSubNav";
import { clientEventService, Guest, SeatingTable } from "@/services/client-event.service";

export default function EventSeatingPage() {
  const { id } = useParams() as { id: string };
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCapacity, setNewCapacity] = useState(10);
  const [onlyAttending, setOnlyAttending] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await clientEventService.getSeating(id);
      setTables(data.tables);
      setGuests(data.guests);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveTables(next: SeatingTable[]) {
    try {
      const saved = await clientEventService.saveTables(
        id,
        next.map((t) => ({ name: t.name, capacity: t.capacity || 10 }))
      );
      setTables(saved);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't save the tables");
    }
  }

  function addTable(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim() || `Table ${tables.length + 1}`;
    if (tables.some((t) => t.name.toLowerCase() === name.toLowerCase())) return toast.error("There's already a table with that name");
    saveTables([...tables, { name, capacity: newCapacity }]);
    setNewName("");
  }

  function removeTable(table: SeatingTable) {
    const seated = guests.filter((g) => g.tableAssignment === table.name).length;
    if (seated && !confirm(`${table.name} has ${seated} guest(s). Remove it and unseat them?`)) return;
    saveTables(tables.filter((t) => t.name !== table.name));
  }

  async function assign(guest: Guest, table: string) {
    setGuests((prev) => prev.map((g) => (g._id === guest._id ? { ...g, tableAssignment: table || undefined } : g)));
    try {
      await clientEventService.assignSeats(id, [{ guestId: guest._id, table }]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't seat the guest");
      load();
    }
  }

  const seats = (list: Guest[]) => list.reduce((n, g) => n + (g.plusOne ? 2 : 1), 0);
  const listed = useMemo(
    () => (onlyAttending ? guests.filter((g) => g.rsvpStatus === "accepted") : guests.filter((g) => g.rsvpStatus !== "declined")),
    [guests, onlyAttending]
  );
  const unassigned = listed.filter((g) => !g.tableAssignment);

  const GuestRow = ({ guest }: { guest: Guest }) => (
    <li className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-sm truncate">
        {guest.name}
        {guest.plusOne && <span className="text-xs text-gray-500"> +1</span>}
        {guest.rsvpStatus !== "accepted" && <span className="text-xs text-gray-400"> ({guest.rsvpStatus})</span>}
      </span>
      <select
        value={guest.tableAssignment || ""}
        onChange={(e) => assign(guest, e.target.value)}
        className="text-xs border border-gray-200 rounded px-1.5 py-1 max-w-[140px]"
        aria-label={`Table for ${guest.name}`}
      >
        <option value="">Unassigned</option>
        {tables.map((t) => (
          <option key={t.name} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>
    </li>
  );

  return (
    <div className="max-w-6xl">
      <EventSubNav eventId={id} />
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-center py-10 text-gray-600">
          Couldn&apos;t load the seating plan.{" "}
          <button onClick={load} className="text-purple-700 underline">
            Try again
          </button>
        </p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 h-fit">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Not seated ({unassigned.length})</h2>
              <label className="text-xs flex items-center gap-1 text-gray-600">
                <input type="checkbox" checked={onlyAttending} onChange={(e) => setOnlyAttending(e.target.checked)} /> Attending only
              </label>
            </div>
            {guests.length === 0 ? (
              <p className="text-sm text-gray-500">Add guests first, then seat them here.</p>
            ) : unassigned.length === 0 ? (
              <p className="text-sm text-gray-500">Everyone has a seat.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {unassigned.map((g) => (
                  <GuestRow key={g._id} guest={g} />
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <form onSubmit={addTable} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-wrap gap-2 items-end">
              <label className="text-sm flex-1 min-w-[160px]">
                <span className="text-gray-600">Table name</span>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={`Table ${tables.length + 1}`} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
              </label>
              <label className="text-sm w-28">
                <span className="text-gray-600">Seats</span>
                <input type="number" min={1} max={1000} value={newCapacity} onChange={(e) => setNewCapacity(Math.max(1, Number(e.target.value) || 1))} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
              </label>
              <button type="submit" className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-purple-600 rounded-lg">
                <Plus className="w-4 h-4" /> Add table
              </button>
            </form>

            {tables.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center text-gray-500">No tables yet.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {tables.map((table) => {
                  const seated = guests.filter((g) => g.tableAssignment === table.name);
                  const used = seats(seated);
                  const over = table.capacity != null && used > table.capacity;
                  return (
                    <div key={table.name} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border ${over ? "border-red-300" : "border-transparent"}`}>
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold">{table.name}</h3>
                        <button onClick={() => removeTable(table)} className="p-1 text-gray-400 hover:text-red-600" title="Remove table">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className={`text-xs flex items-center gap-1 ${over ? "text-red-600" : "text-gray-500"}`}>
                        <Users className="w-3.5 h-3.5" /> {used}
                        {table.capacity != null ? ` / ${table.capacity} seats` : " seated"}
                        {over && " — over capacity"}
                      </p>
                      <ul className="mt-2 divide-y divide-gray-50">
                        {seated.map((g) => (
                          <GuestRow key={g._id} guest={g} />
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

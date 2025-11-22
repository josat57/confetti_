"use client";

import { useState } from "react";
import { Guest } from "@/types/guest";
import { Plus, Trash2, Download, Users } from "lucide-react";

interface Table {
  id: string;
  number: number;
  capacity: number;
  guests: Guest[];
}

interface SeatingChartProps {
  guests: Guest[];
  onUpdateSeating: (
    guestId: string,
    tableNumber: number,
    seatNumber: number
  ) => void;
}

export default function SeatingChart({
  guests,
  onUpdateSeating,
}: SeatingChartProps) {
  const [tables, setTables] = useState<Table[]>([
    { id: "1", number: 1, capacity: 8, guests: [] },
  ]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Get guests who have accepted and don't have seating assigned
  const unassignedGuests = guests.filter(
    (g) => g.rsvpStatus === "Accepted" && !g.tableNumber
  );

  // Organize guests by table
  const organizedTables = tables.map((table) => ({
    ...table,
    guests: guests.filter((g) => g.tableNumber === table.number),
  }));

  const addTable = () => {
    const newTableNumber = Math.max(...tables.map((t) => t.number), 0) + 1;
    setTables([
      ...tables,
      {
        id: String(newTableNumber),
        number: newTableNumber,
        capacity: 8,
        guests: [],
      },
    ]);
  };

  const removeTable = (tableId: string) => {
    if (tables.length === 1) {
      alert("You must have at least one table");
      return;
    }
    setTables(tables.filter((t) => t.id !== tableId));
  };

  const updateTableCapacity = (tableId: string, capacity: number) => {
    setTables(tables.map((t) => (t.id === tableId ? { ...t, capacity } : t)));
  };

  const assignGuestToTable = (guest: Guest, tableNumber: number) => {
    const table = organizedTables.find((t) => t.number === tableNumber);
    if (!table) return;

    const nextSeatNumber = table.guests.length + 1;
    if (nextSeatNumber > table.capacity) {
      alert("This table is full");
      return;
    }

    onUpdateSeating(guest._id, tableNumber, nextSeatNumber);
  };

  const removeGuestFromTable = (guest: Guest) => {
    onUpdateSeating(guest._id, 0, 0);
  };

  const exportSeatingChart = () => {
    let csvContent =
      "Table,Seat,Guest Name,Email,Category,Dietary Restrictions\n";

    organizedTables.forEach((table) => {
      table.guests
        .sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0))
        .forEach((guest) => {
          csvContent += `${table.number},${guest.seatNumber || ""},${
            guest.name
          },${guest.email || ""},${guest.category},${
            guest.dietaryRestrictions || ""
          }\n`;
        });
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seating_chart.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Seating Chart</h3>
          <p className="text-sm text-gray-600 mt-1">
            Drag guests to tables or click to assign seating
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportSeatingChart}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={addTable}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" />
            Add Table
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unassigned Guests */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Unassigned Guests ({unassignedGuests.length})
            </h4>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {unassignedGuests.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  All guests have been assigned
                </p>
              ) : (
                unassignedGuests.map((guest) => (
                  <div
                    key={guest._id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-500 cursor-pointer transition-colors"
                    onClick={() => setSelectedGuest(guest)}
                  >
                    <p className="font-medium text-sm text-gray-900">
                      {guest.name}
                    </p>
                    <p className="text-xs text-gray-600">{guest.category}</p>
                    {guest.dietaryRestrictions && (
                      <p className="text-xs text-orange-600 mt-1">
                        {guest.dietaryRestrictions}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizedTables.map((table) => (
              <div
                key={table.id}
                className="bg-white rounded-lg shadow p-4 border-2 border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900">
                      Table {table.number}
                    </h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={table.capacity}
                        onChange={(e) =>
                          updateTableCapacity(
                            table.id,
                            parseInt(e.target.value) || 8
                          )
                        }
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                        min="1"
                        max="20"
                      />
                      <span className="text-sm text-gray-600">seats</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTable(table.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>
                      {table.guests.length} / {table.capacity} occupied
                    </span>
                  </div>

                  {/* Seats */}
                  <div className="space-y-2 min-h-[200px]">
                    {Array.from({ length: table.capacity }).map((_, index) => {
                      const seatNumber = index + 1;
                      const guest = table.guests.find(
                        (g) => g.seatNumber === seatNumber
                      );

                      return (
                        <div
                          key={seatNumber}
                          className={`p-2 rounded border-2 border-dashed transition-colors ${
                            guest
                              ? "bg-teal-50 border-teal-300"
                              : "bg-gray-50 border-gray-300 hover:border-teal-400"
                          }`}
                          onClick={() => {
                            if (!guest && selectedGuest) {
                              assignGuestToTable(selectedGuest, table.number);
                              setSelectedGuest(null);
                            }
                          }}
                        >
                          {guest ? (
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {seatNumber}. {guest.name}
                                </p>
                                {guest.dietaryRestrictions && (
                                  <p className="text-xs text-orange-600">
                                    {guest.dietaryRestrictions}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeGuestFromTable(guest);
                                }}
                                className="text-red-600 hover:text-red-800 ml-2"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">
                              Seat {seatNumber} - Empty
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Guest Indicator */}
      {selectedGuest && (
        <div className="fixed bottom-4 right-4 bg-teal-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium">
            Click on a table to assign: {selectedGuest.name}
          </p>
          <button
            onClick={() => setSelectedGuest(null)}
            className="text-xs underline mt-1"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// src/components/AddExpenseModal.tsx
"use client";
import { useState } from "react";

interface Props {
  tripId: string;
  onClose: () => void;
  onAdded: () => void;
}

const CATEGORIES = ["transportation", "accommodation", "food", "activities", "misc"];

export default function AddExpenseModal({ tripId, onClose, onAdded }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [paidBy, setPaidBy] = useState("You");
  const [splitWith, setSplitWith] = useState("You");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    if (!name || !amount) { setError("Name and amount are required."); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          amount: Number(amount),
          category,
          paidBy,
          splitWith: splitWith.split(",").map((s) => s.trim()).filter(Boolean),
          date,
        }),
      });
      if (res.ok) onAdded();
      else setError("Failed to add expense.");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-sm font-semibold">Add Expense</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="2" y1="2" x2="12" y2="12" /><line x1="12" y1="2" x2="2" y2="12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Description *</label>
            <input className="form-input" placeholder="e.g., Hotel booking" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Amount (INR) *</label>
              <input className="form-input" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Date</label>
              <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Category</label>
            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Paid By</label>
              <input className="form-input" placeholder="You" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Split With (comma-separated)</label>
              <input className="form-input" placeholder="You, Sarah, Mike" value={splitWith} onChange={(e) => setSplitWith(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 grid grid-cols-2 gap-2.5">
          <button className="btn btn-white w-full justify-center" onClick={onClose}>Cancel</button>
          <button className="btn btn-black w-full justify-center" onClick={handleAdd} disabled={loading}>
            {loading ? "Adding…" : "Add Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}

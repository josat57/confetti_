"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Loader2, Trash2, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import { useCompany } from "@/components/company/CompanyContext";
import { organizationService, naira, OrgInvite, OrgMember, OrgRole } from "@/services/organization.service";

const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
const ROLES: Array<{ value: OrgRole; label: string; help: string }> = [
  { value: "requester", label: "Requester", help: "Creates events and asks for purchases to be approved" },
  { value: "approver", label: "Approver", help: "Approves purchases, sees reports and invoices" },
  { value: "admin", label: "Admin", help: "Everything, including people, budgets and billing" },
];

/** Members, invitations, company details, departments and budgets */
export default function PeoplePage() {
  const { org, reload } = useCompany();
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invites, setInvites] = useState<OrgInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState({ email: "", role: "requester" as OrgRole, department: "" });
  const [details, setDetails] = useState<Record<string, any>>({});
  const [budgets, setBudgets] = useState<Array<{ department: string; amount: number | "" }>>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const isAdmin = org?.me?.role === "admin";
  const year = new Date().getFullYear();

  const load = useCallback(async () => {
    try {
      const data = await organizationService.members();
      setMembers(data.members);
      setInvites(data.invites);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!org) return;
    setDetails({
      name: org.name,
      legalName: org.legalName || "",
      rcNumber: org.rcNumber || "",
      vatNumber: org.vatNumber || "",
      billingEmail: org.billingEmail || "",
      phone: org.phone || "",
      street: org.address?.street || "",
      city: org.address?.city || "",
      state: org.address?.state || "",
      departments: org.departments.join(", "),
      approvalThreshold: org.approvalThreshold || 0,
    });
    setBudgets(
      org.departments.map((d) => ({ department: d, amount: org.budgets.find((b) => b.department === d && b.year === year)?.amount ?? "" }))
    );
  }, [org, year]);

  if (!org) return null;

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setBusy("invite");
    try {
      const { link } = await organizationService.invite({ ...invite, department: invite.department || undefined });
      toast.success(`Invitation sent to ${invite.email}`);
      navigator.clipboard?.writeText(link).catch(() => {});
      setInvite({ email: "", role: "requester", department: "" });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't send the invitation");
    } finally {
      setBusy(null);
    }
  }

  async function changeMember(m: OrgMember, body: { role?: OrgRole; department?: string }) {
    try {
      const data = await organizationService.updateMember(m.user._id, body);
      setMembers(data.members);
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't update");
    }
  }

  async function removeMember(m: OrgMember) {
    if (!confirm(`Remove ${m.user.name} from the company?`)) return;
    try {
      const data = await organizationService.removeMember(m.user._id);
      setMembers(data.members);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't remove");
    }
  }

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    setBusy("details");
    try {
      await organizationService.update({
        name: details.name,
        legalName: details.legalName,
        rcNumber: details.rcNumber,
        vatNumber: details.vatNumber,
        billingEmail: details.billingEmail,
        phone: details.phone,
        address: { street: details.street, city: details.city, state: details.state },
        departments: String(details.departments).split(",").map((d: string) => d.trim()).filter(Boolean),
        approvalThreshold: Number(details.approvalThreshold) || 0,
      } as any);
      toast.success("Saved");
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't save");
    } finally {
      setBusy(null);
    }
  }

  async function saveBudgets(e: React.FormEvent) {
    e.preventDefault();
    setBusy("budgets");
    try {
      await organizationService.setBudgets(budgets.filter((b) => b.amount !== "").map((b) => ({ department: b.department, year, amount: Number(b.amount) })));
      toast.success("Budgets saved");
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't save the budgets");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900 mb-3">People</h1>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        ) : (
          <ul className="divide-y divide-gray-100">
            {members.map((m) => (
              <li key={m.user._id} className="py-3 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[180px]">
                  <p className="font-medium text-gray-900">{m.user.name}</p>
                  <p className="text-xs text-gray-500">{m.user.email}</p>
                </div>
                {isAdmin ? (
                  <>
                    <select value={m.role} onChange={(e) => changeMember(m, { role: e.target.value as OrgRole })} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm" aria-label="Role">
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <select value={m.department || ""} onChange={(e) => changeMember(m, { department: e.target.value })} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm" aria-label="Department">
                      <option value="">No department</option>
                      {org.departments.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                    <button onClick={() => removeMember(m)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" aria-label={`Remove ${m.user.name}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-gray-600 capitalize">
                    {m.role}
                    {m.department ? ` · ${m.department}` : ""}
                  </span>
                )}
              </li>
            ))}
            {invites.map((i) => (
              <li key={i._id} className="py-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="flex-1">
                  {i.email} · invited as {i.role}
                  {i.department ? ` · ${i.department}` : ""}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => organizationService.revokeInvite(i._id).then(load)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {isAdmin && (
          <form onSubmit={sendInvite} className="mt-4 pt-4 border-t border-gray-100 grid sm:grid-cols-4 gap-2">
            <input className={`${input} sm:col-span-2`} type="email" required placeholder="Colleague's email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
            <select className={input} value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value as OrgRole })} aria-label="Role">
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <select className={input} value={invite.department} onChange={(e) => setInvite({ ...invite, department: e.target.value })} aria-label="Department">
              <option value="">No department</option>
              {org.departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <p className="sm:col-span-3 text-xs text-gray-500">{ROLES.find((r) => r.value === invite.role)?.help}</p>
            <button disabled={busy === "invite"} className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50">
              <UserPlus className="w-4 h-4" /> Invite
            </button>
          </form>
        )}
      </div>

      {isAdmin && (
        <>
          <form onSubmit={saveBudgets} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">Department budgets for {year}</h2>
            {budgets.length === 0 ? (
              <p className="text-sm text-gray-500">Add departments below to set their budgets.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {budgets.map((b, i) => (
                  <label key={b.department} className="text-sm text-gray-700">
                    {b.department} (₦)
                    <input
                      type="number"
                      min={0}
                      className={input}
                      value={b.amount}
                      onChange={(e) => setBudgets(budgets.map((x, j) => (j === i ? { ...x, amount: e.target.value === "" ? "" : Number(e.target.value) } : x)))}
                    />
                  </label>
                ))}
              </div>
            )}
            {budgets.length > 0 && (
              <button disabled={busy === "budgets"} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50">
                Save budgets
              </button>
            )}
          </form>

          <form onSubmit={saveDetails} className="bg-white rounded-xl border border-gray-200 p-5 grid sm:grid-cols-2 gap-3">
            <h2 className="sm:col-span-2 font-semibold text-gray-900">Company details (shown on invoices)</h2>
            {[
              ["name", "Company name"],
              ["legalName", "Registered name"],
              ["rcNumber", "RC number"],
              ["vatNumber", "VAT / TIN"],
              ["billingEmail", "Billing email"],
              ["phone", "Phone"],
              ["street", "Street"],
              ["city", "City"],
              ["state", "State"],
            ].map(([key, label]) => (
              <label key={key} className="text-xs text-gray-500">
                {label}
                <input className={input} value={details[key] ?? ""} onChange={(e) => setDetails({ ...details, [key]: e.target.value })} />
              </label>
            ))}
            <label className="sm:col-span-2 text-xs text-gray-500">
              Departments (separated by commas)
              <input className={input} value={details.departments ?? ""} onChange={(e) => setDetails({ ...details, departments: e.target.value })} />
            </label>
            <label className="text-xs text-gray-500">
              Approve automatically up to (₦, 0 = always ask)
              <input type="number" min={0} className={input} value={details.approvalThreshold ?? 0} onChange={(e) => setDetails({ ...details, approvalThreshold: e.target.value })} />
            </label>
            <p className="text-xs text-gray-500 self-end">
              {Number(details.approvalThreshold) > 0 ? `Purchases up to ${naira(Number(details.approvalThreshold))} won't need an approver.` : "Every purchase needs an approver."}
            </p>
            <button disabled={busy === "details"} className="sm:col-span-2 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50">
              Save details
            </button>
          </form>
        </>
      )}
      {!isAdmin && (
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <Copy className="w-4 h-4" /> Only company admins can change people, budgets and details.
        </p>
      )}
    </div>
  );
}

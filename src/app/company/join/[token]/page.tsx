"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { useCompany } from "@/components/company/CompanyContext";
import { organizationService, setActiveCompany } from "@/services/organization.service";

/** Accept an invitation to a company account */
export default function JoinCompanyPage() {
  const { token } = useParams() as { token: string };
  const router = useRouter();
  const { reload } = useCompany();
  const [invite, setInvite] = useState<{ organization: string; email: string; role: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    organizationService
      .previewInvite(token)
      .then(setInvite)
      .catch(() => setError("This invitation isn't valid. Ask for a new one."));
  }, [token]);

  async function accept() {
    setBusy(true);
    setError("");
    try {
      const joined = await organizationService.acceptInvite(token);
      setActiveCompany(joined._id);
      await reload();
      router.push("/company");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Couldn't accept the invitation");
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-6 text-center">
      <Building2 className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
      {!invite && !error && <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />}
      {invite && (
        <>
          <h1 className="text-lg font-semibold text-gray-900">Join {invite.organization}</h1>
          <p className="text-sm text-gray-600 mt-1">
            You&apos;ve been invited as {invite.role === "admin" ? "an admin" : invite.role === "approver" ? "an approver" : "a requester"} ({invite.email}).
          </p>
          <button onClick={accept} disabled={busy} className="mt-5 w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {busy ? "Joining…" : "Accept invitation"}
          </button>
        </>
      )}
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/contexts/AuthContext";
import { organizationService, Organization, CompanyMembership, getActiveCompany, setActiveCompany } from "@/services/organization.service";
import { CompanyContext } from "@/components/company/CompanyContext";

const DASHBOARDS: Record<string, string> = { user: "/user/dashboard", "event-planner": "/planner/dashboard" };
const TABS = [
  { label: "Overview", href: "/company" },
  { label: "Events", href: "/company/events" },
  { label: "Approvals", href: "/company/approvals" },
  { label: "Reports", href: "/company/reports", roles: ["admin", "approver"] },
  { label: "Billing", href: "/company/billing", roles: ["admin", "approver"] },
  { label: "People & settings", href: "/company/people" },
];

/** Corporate account area (clients and planners) */
export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const { verifyUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState("user");
  const [org, setOrg] = useState<Organization | null>(null);
  const [companies, setCompanies] = useState<CompanyMembership[]>([]);

  const reload = useCallback(async () => {
    try {
      const list = await organizationService.mine();
      setCompanies(list);
      // Forget a company the user has left
      const active = getActiveCompany();
      if (active && !list.some((c) => c._id === active)) setActiveCompany(list[0]?._id || null);
      setOrg(list.length ? await organizationService.get() : null);
    } catch {
      setOrg(null);
    }
  }, []);

  const switchTo = useCallback(
    async (id: string) => {
      setActiveCompany(id);
      await reload();
      router.push("/company");
    },
    [reload, router]
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await verifyUser();
        if (!res?.userData) {
          router.push(`/sign-in?callbackUrl=${encodeURIComponent(pathname || "/company")}`);
          return;
        }
        if (res.userData.role === "vendor") {
          router.push("/vendor/dashboard");
          return;
        }
        setRole(res.userData.role);
        await reload();
        setReady(true);
      } catch {
        router.push("/sign-in");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const dashboardHref = DASHBOARDS[role] || "/";
  const joining = pathname?.startsWith("/company/join");
  return (
    <CompanyContext.Provider value={{ org, companies, reload, switchTo, dashboardHref }}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href={dashboardHref} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Link>
              <span className="text-gray-300">|</span>
              <Building2 className="w-5 h-5 text-indigo-600" />
              {companies.length > 1 && org ? (
                <select
                  value={org._id}
                  onChange={(e) => (e.target.value === "new" ? router.push("/company?new=1") : switchTo(e.target.value))}
                  className="font-semibold text-gray-900 border border-gray-200 rounded-lg px-2 py-1 text-sm"
                  aria-label="Company"
                >
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="new">+ New company</option>
                </select>
              ) : (
                <p className="font-semibold text-gray-900">{org?.name || "Company account"}</p>
              )}
              {org?.me && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 capitalize">{org.me.role}</span>}
            </div>
            {org && org.contract.status !== "active" && (
              <Link href="/company/billing" className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                Contract {org.contract.status === "none" ? "not set up" : org.contract.status}
              </Link>
            )}
          </div>
          {org && !joining && (
            <nav className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
              {TABS.filter((t) => !t.roles || t.roles.includes(org.me?.role || "")).map((t) => {
                const active = t.href === "/company" ? pathname === "/company" : pathname?.startsWith(t.href);
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 ${active ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </CompanyContext.Provider>
  );
}

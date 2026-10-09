"use client";

import { createContext, useContext } from "react";
import type { CompanyMembership, Organization } from "@/services/organization.service";

export interface CompanyState {
  org: Organization | null;
  /** Every company the user belongs to */
  companies: CompanyMembership[];
  reload: () => Promise<void>;
  /** Work in another company */
  switchTo: (id: string) => Promise<void>;
  /** The signed-in user's dashboard, for "back" links */
  dashboardHref: string;
}

export const CompanyContext = createContext<CompanyState>({ org: null, companies: [], reload: async () => {}, switchTo: async () => {}, dashboardHref: "/" });
export const useCompany = () => useContext(CompanyContext);

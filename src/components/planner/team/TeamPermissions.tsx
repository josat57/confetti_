"use client";

import { Check, X } from "lucide-react";
import { TeamRole, teamService } from "@/services/planner/team.service";

interface TeamPermissionsProps {
  currentRole: TeamRole;
  onRoleChange?: (role: TeamRole) => void;
  readOnly?: boolean;
}

export default function TeamPermissions({
  currentRole,
  onRoleChange,
  readOnly = false,
}: TeamPermissionsProps) {
  const roles: TeamRole[] = ["Admin", "Manager", "Coordinator"];

  const permissions = [
    { key: "canCreateEvents", label: "Create Events" },
    { key: "canEditEvents", label: "Edit Events" },
    { key: "canDeleteEvents", label: "Delete Events" },
    { key: "canManageTasks", label: "Manage Tasks" },
    { key: "canManageGuests", label: "Manage Guests" },
    { key: "canManageBudget", label: "Manage Budget" },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Role Permissions</h3>
        <p className="text-sm text-gray-600 mt-1">
          Different roles have different levels of access
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Permission
              </th>
              {roles.map((role) => (
                <th
                  key={role}
                  className="px-4 py-3 text-center text-sm font-medium text-gray-700"
                >
                  <div className="flex flex-col items-center gap-1">
                    {!readOnly && onRoleChange ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={currentRole === role}
                          onChange={() => onRoleChange(role)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span>{role}</span>
                      </label>
                    ) : (
                      <span
                        className={
                          currentRole === role ? "font-bold text-teal-600" : ""
                        }
                      >
                        {role}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {permissions.map((permission) => (
              <tr key={permission.key} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {permission.label}
                </td>
                {roles.map((role) => {
                  const rolePerms = teamService.getRolePermissions(role);
                  const hasPermission =
                    rolePerms[permission.key as keyof typeof rolePerms];

                  return (
                    <td key={role} className="px-4 py-3 text-center">
                      {hasPermission ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
                          <X className="w-4 h-4 text-red-600" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role descriptions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        <div className="text-sm">
          <span className="font-medium text-gray-900">Admin:</span>
          <span className="text-gray-600 ml-2">
            Full access to all features and settings
          </span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-900">Manager:</span>
          <span className="text-gray-600 ml-2">
            Can create and manage events, tasks, and budgets
          </span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-900">Coordinator:</span>
          <span className="text-gray-600 ml-2">
            Can manage tasks and guests, limited event editing
          </span>
        </div>
      </div>
    </div>
  );
}

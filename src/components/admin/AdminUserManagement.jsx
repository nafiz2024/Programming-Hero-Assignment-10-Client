"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  Eye,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  UserCog,
  Users,
  X,
} from "lucide-react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Pagination from "@/components/ui/Pagination";
import TableSkeleton from "@/components/ui/TableSkeleton";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { adminApi } from "@/lib/api";
import {
  adminSubscriptions,
  adminUserRoles,
  adminUserStatuses,
  buildAdminCreatorSummaryCards,
  filterAdminUsers,
  getSubscriptionBadgeClass,
  getUserRoleBadgeClass,
  getUserStatusBadgeClass,
  normalizeAdminUsers,
  paginateItems,
} from "@/lib/admin";
import { toastError, toastSuccess, toastWarning } from "@/lib/toast";

const PAGE_SIZE = 10;

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function SummaryCard({ accent, label, trend, trendTone, value }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
          <Users className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
          <p className={`mt-1 text-xs ${trendTone}`}>{trend} vs last 7 days</p>
        </div>
      </div>
    </div>
  );
}

function UserActionMenu({
  isCreatorMode,
  isOpen,
  onChangeRole,
  onDelete,
  onView,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute right-0 top-12 z-30 w-48 rounded-[20px] border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
      <button
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
        onClick={onView}
        type="button"
      >
        <Eye className="h-4 w-4" />
        {isCreatorMode ? "View Creator" : "View Profile"}
      </button>
      <button
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-primary transition hover:bg-primary/5"
        onClick={onChangeRole}
        type="button"
      >
        <UserCog className="h-4 w-4" />
        Change Role
      </button>
      <button
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
        onClick={onDelete}
        type="button"
      >
        <Trash2 className="h-4 w-4" />
        Delete User
      </button>
    </div>
  );
}

function ProfilePreviewModal({ isCreatorMode, onClose, user }) {
  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_36px_120px_rgba(15,23,42,0.18)]">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
              {isCreatorMode ? "Creator Overview" : "User Overview"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Quick profile snapshot for moderation and account management.
            </p>
          </div>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-[26px] bg-[linear-gradient(135deg,rgba(98,91,246,0.96),rgba(59,130,246,0.88))] p-5 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <UserAvatar
                alt={user.name}
                className="h-20 w-20 border-4 border-white/20 bg-white/10 text-xl text-white"
                fallback={user.initials}
                src={user.image}
              />
              <div>
                <p className="text-2xl font-semibold tracking-tight">{user.name}</p>
                <p className="mt-1 text-sm text-white/80">{user.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full bg-white/16 px-3 py-1 text-xs font-medium text-white">
                    {user.role}
                  </span>
                  <span className="inline-flex rounded-full bg-white/16 px-3 py-1 text-xs font-medium text-white">
                    {user.subscription}
                  </span>
                  <span className="inline-flex rounded-full bg-white/16 px-3 py-1 text-xs font-medium text-white">
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:min-w-[260px]">
              <div className="rounded-2xl border border-white/12 bg-white/10 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-white/60">Prompts</p>
                <p className="mt-2 text-xl font-semibold">{formatNumber(user.totalPrompts)}</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-white/60">Copies</p>
                <p className="mt-2 text-xl font-semibold">{formatNumber(user.totalCopies)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-sm font-semibold text-slate-900">Account Information</p>
            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Joined</dt>
                <dd className="font-medium text-slate-900">{user.joinedLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Role</dt>
                <dd className="font-medium text-slate-900">{user.role}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Subscription</dt>
                <dd className="font-medium text-slate-900">{user.subscription}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Status</dt>
                <dd className="font-medium text-slate-900">{user.status}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-sm font-semibold text-slate-900">
              {isCreatorMode ? "Creator Performance" : "Account Activity"}
            </p>
            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Approved Prompts</dt>
                <dd className="font-medium text-slate-900">{formatNumber(user.approvedPrompts)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Total Reviews</dt>
                <dd className="font-medium text-slate-900">{formatNumber(user.totalReviews)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Average Rating</dt>
                <dd className="font-medium text-slate-900">{user.averageRating.toFixed(1)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Total Copies</dt>
                <dd className="font-medium text-slate-900">{formatNumber(user.totalCopies)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Bio</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{user.bio}</p>
        </div>
      </div>
    </div>
  );
}

function RoleModal({ onClose, onSubmit, role, setRole, user, isSubmitting }) {
  if (!user) {
    return null;
  }

  const hasChangedRole = String(role || "").toLowerCase() !== String(user.role || "").toLowerCase();

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_36px_120px_rgba(15,23,42,0.18)]">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">Change User Role</h3>
            <p className="mt-2 text-sm text-slate-500">
              Update platform access for {user.name}.
            </p>
          </div>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-[1.15fr,0.85fr]">
          <div>
            <div className="mb-4 flex items-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <UserAvatar
                alt={user.name}
                className="h-12 w-12 bg-brand-gradient text-sm text-white"
                fallback={user.initials}
                src={user.image}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Select New Role</span>
              <select
                className="min-h-[52px] w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-primary/40"
                onChange={(event) => setRole(event.target.value)}
                value={role}
              >
                {adminUserRoles.slice(1).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-[24px] border border-primary/10 bg-primary/5 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Role Change Information
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Changing this user role updates their permissions, route access, and dashboard
              experience across the platform.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button onPress={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={!hasChangedRole} isLoading={isSubmitting} onPress={onSubmit}>
            Update Role
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ isSubmitting, onClose, onSubmit, user }) {
  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_36px_120px_rgba(15,23,42,0.18)]">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">Delete User</h3>
            <p className="mt-2 text-sm text-slate-500">
              This action cannot be undone. All account data will be permanently removed.
            </p>
          </div>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4">
          <p className="text-sm leading-6 text-rose-600">
            Are you sure you want to delete <span className="font-semibold">{user.name}</span>? This
            will remove the account, prompt ownership, and moderation history tied to this user.
          </p>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
          <UserAvatar
            alt={user.name}
            className="h-12 w-12 bg-brand-gradient text-sm text-white"
            fallback={user.initials}
            src={user.image}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button onPress={onClose} variant="secondary">
            Cancel
          </Button>
          <Button isLoading={isSubmitting} onPress={onSubmit} variant="danger">
            Delete User
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUserManagement({ mode = "users" }) {
  const { authLoading, canLoadAdminData, isAdmin } = useAdminAccess();
  const isCreatorMode = mode === "creators";
  const [state, setState] = useState({
    status: "loading",
    error: "",
    users: [],
  });
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    role: adminUserRoles[0],
    subscription: adminSubscriptions[0],
    status: adminUserStatuses[0],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState("");
  const [previewUser, setPreviewUser] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);
  const [nextRole, setNextRole] = useState("User");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionState, setActionState] = useState({
    role: false,
    remove: false,
  });

  async function loadUsers() {
    setState((current) => ({
      ...current,
      status: current.users.length > 0 ? "refreshing" : "loading",
      error: "",
    }));

    try {
      const response = await adminApi.getUsers();
      const normalizedUsers = normalizeAdminUsers(response);

      setState({
        status: "success",
        error: "",
        users: normalizedUsers,
      });
    } catch (error) {
      setState({
        status: "error",
        error: error.message || "Unable to load users.",
        users: [],
      });
    }
  }

  useEffect(() => {
    if (!canLoadAdminData) {
      return;
    }

    const timer = window.setTimeout(() => {
      loadUsers();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [canLoadAdminData]);

  const scopedUsers = useMemo(() => {
    if (!isCreatorMode) {
      return state.users;
    }

    return state.users.filter((user) => user.role === "Creator");
  }, [isCreatorMode, state.users]);

  const filteredUsers = useMemo(
    () =>
      filterAdminUsers(scopedUsers, {
        query,
        role: isCreatorMode ? adminUserRoles[0] : filters.role,
        subscription: filters.subscription,
        status: filters.status,
      }),
    [filters.role, filters.status, filters.subscription, isCreatorMode, query, scopedUsers],
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginatedUsers = paginateItems(filteredUsers, page, PAGE_SIZE);
  const creatorCards = buildAdminCreatorSummaryCards(scopedUsers);

  function resetFilters() {
    setQuery("");
    setFilters({
      role: adminUserRoles[0],
      subscription: adminSubscriptions[0],
      status: adminUserStatuses[0],
    });
    setCurrentPage(1);
  }

  function exportUsers() {
    const rows = filteredUsers.map((user) => ({
      Name: user.name,
      Email: user.email,
      Role: user.role,
      Subscription: user.subscription,
      Status: user.status,
      TotalPrompts: user.totalPrompts,
      ApprovedPrompts: user.approvedPrompts,
      TotalCopies: user.totalCopies,
      AverageRating: user.averageRating,
      Joined: user.joinedLabel,
    }));
    const headers = Object.keys(rows[0] || {
      Name: "",
      Email: "",
      Role: "",
      Subscription: "",
      Status: "",
      TotalPrompts: "",
      ApprovedPrompts: "",
      TotalCopies: "",
      AverageRating: "",
      Joined: "",
    });
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = isCreatorMode ? "promptflow-creators.csv" : "promptflow-users.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleRoleUpdate() {
    if (!roleTarget) {
      return;
    }

    if (String(nextRole || "").toLowerCase() === String(roleTarget.role || "").toLowerCase()) {
      toastWarning("Please choose a different role before updating.");
      return;
    }

    setActionState((current) => ({ ...current, role: true }));

    try {
      const response = await adminApi.updateUserRole(roleTarget.id, { role: nextRole.toLowerCase() });
      const updatedUsers = normalizeAdminUsers({
        users: state.users.map((user) =>
          user.id === roleTarget.id ? { ...user, ...(response?.user || {}), role: nextRole } : user,
        ),
      });

      setState((current) => ({
        ...current,
        users: updatedUsers,
      }));
      toastSuccess("User role updated successfully");
      setRoleTarget(null);
    } catch (error) {
      toastError(error.message || "Unable to update this role.");
    } finally {
      setActionState((current) => ({ ...current, role: false }));
    }
  }

  async function handleDeleteUser() {
    if (!deleteTarget) {
      return;
    }

    setActionState((current) => ({ ...current, remove: true }));

    try {
      await adminApi.deleteUser(deleteTarget.id);
      toastSuccess("User deleted successfully");
      setDeleteTarget(null);
      await loadUsers();
    } catch (error) {
      toastError(error.message || "Unable to delete this user.");
    } finally {
      setActionState((current) => ({ ...current, remove: false }));
    }
  }

  function openRoleModal(user) {
    setActiveMenuId("");
    setRoleTarget(user);
    setNextRole(user.role);
  }

  function openDeleteModal(user) {
    setActiveMenuId("");
    setDeleteTarget(user);
  }

  function openPreview(user) {
    setActiveMenuId("");
    setPreviewUser(user);
  }

  if (authLoading) {
    return <TableSkeleton columns={isCreatorMode ? 9 : 8} rows={8} />;
  }

  if (!isAdmin) {
    return null;
  }

  if (state.status === "loading") {
    return <TableSkeleton columns={isCreatorMode ? 9 : 8} rows={8} />;
  }

  if (state.status === "error") {
    return (
      <ErrorState
        description={state.error}
        onRetry={loadUsers}
        title={isCreatorMode ? "Unable to load creators" : "Unable to load users"}
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-950 md:text-[2.35rem]">
              {isCreatorMode ? "All Creators" : "All Users"}
            </h1>
            <p className="mt-2 text-base text-slate-500">
              {isCreatorMode
                ? "Review creator accounts, growth, and monetization readiness."
                : "Manage and monitor all platform users."}
            </p>
          </div>

          <Button
            className="min-w-[180px] justify-center"
            onPress={exportUsers}
            variant="solid"
          >
            <Download className="h-4 w-4" />
            {isCreatorMode ? "Export Creators" : "Export Users"}
          </Button>
        </div>

        {isCreatorMode ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {creatorCards.map((card) => (
              <SummaryCard key={card.id} {...card} />
            ))}
          </section>
        ) : null}

        <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5">
            <div className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder={
                  isCreatorMode
                    ? "Search creators by name or email..."
                    : "Search users by name or email..."
                }
                type="text"
                value={query}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {!isCreatorMode ? (
                <select
                  className="min-h-[52px] rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                  onChange={(event) => {
                    setFilters((current) => ({ ...current, role: event.target.value }));
                    setCurrentPage(1);
                  }}
                  value={filters.role}
                >
                  {adminUserRoles.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : null}

              <select
                className="min-h-[52px] rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                onChange={(event) => {
                  setFilters((current) => ({ ...current, subscription: event.target.value }));
                  setCurrentPage(1);
                }}
                value={filters.subscription}
              >
                {adminSubscriptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                className="min-h-[52px] rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                onChange={(event) => {
                  setFilters((current) => ({ ...current, status: event.target.value }));
                  setCurrentPage(1);
                }}
                value={filters.status}
              >
                {adminUserStatuses.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <button
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                onClick={resetFilters}
                type="button"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Filters
              </button>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-6">
              <EmptyState
                actionLabel="Reset Filters"
                description={
                  isCreatorMode
                    ? "No creators match the current filters."
                    : "No users match the current filters."
                }
                onAction={resetFilters}
                title={isCreatorMode ? "No creators found" : "No users found"}
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto xl:block">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                      <th className="px-5 py-4">{isCreatorMode ? "Creator" : "User"}</th>
                      <th className="px-4 py-4">Email</th>
                      {!isCreatorMode ? <th className="px-4 py-4">Role</th> : null}
                      <th className="px-4 py-4">Subscription</th>
                      <th className="px-4 py-4">Total Prompts</th>
                      {isCreatorMode ? <th className="px-4 py-4">Approved Prompts</th> : null}
                      {isCreatorMode ? <th className="px-4 py-4">Total Copies</th> : null}
                      {isCreatorMode ? <th className="px-4 py-4">Average Rating</th> : null}
                      {!isCreatorMode ? <th className="px-4 py-4">Status</th> : <th className="px-4 py-4">Joined</th>}
                      {!isCreatorMode ? <th className="px-4 py-4">Joined</th> : null}
                      <th className="px-4 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="border-b border-slate-100 align-top">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              alt={user.name}
                              className="h-12 w-12 bg-brand-gradient text-sm text-white"
                              fallback={user.initials}
                              src={user.image}
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                              <p className="truncate text-xs text-slate-500">{user.bio}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{user.email}</td>
                        {!isCreatorMode ? (
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getUserRoleBadgeClass(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                        ) : null}
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getSubscriptionBadgeClass(user.subscription)}`}>
                            {user.subscription}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-700">
                          {formatNumber(user.totalPrompts)}
                        </td>
                        {isCreatorMode ? (
                          <>
                            <td className="px-4 py-4 text-sm font-medium text-slate-700">
                              {formatNumber(user.approvedPrompts)}
                            </td>
                            <td className="px-4 py-4 text-sm font-medium text-slate-700">
                              {formatNumber(user.totalCopies)}
                            </td>
                            <td className="px-4 py-4">
                              <div className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                {user.averageRating.toFixed(1)}
                              </div>
                            </td>
                          </>
                        ) : (
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getUserStatusBadgeClass(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                        )}
                        <td className="px-4 py-4 text-sm text-slate-600">{user.joinedLabel}</td>
                        {!isCreatorMode ? null : null}
                        {!isCreatorMode ? (
                          <td className="px-4 py-4">
                            <div className="relative flex justify-end">
                              <button
                                className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 text-sm font-medium text-primary transition hover:bg-primary/10"
                                onClick={() => setActiveMenuId((current) => (current === user.id ? "" : user.id))}
                                type="button"
                              >
                                Actions
                                <ChevronDown className="h-4 w-4" />
                              </button>
                              <UserActionMenu
                                isCreatorMode={false}
                                isOpen={activeMenuId === user.id}
                                onChangeRole={() => openRoleModal(user)}
                                onDelete={() => openDeleteModal(user)}
                                onView={() => openPreview(user)}
                              />
                            </div>
                          </td>
                        ) : null}
                        {isCreatorMode ? (
                          <td className="px-4 py-4">
                            <div className="relative flex justify-end">
                              <button
                                className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 text-sm font-medium text-primary transition hover:bg-primary/10"
                                onClick={() => setActiveMenuId((current) => (current === user.id ? "" : user.id))}
                                type="button"
                              >
                                Actions
                                <ChevronDown className="h-4 w-4" />
                              </button>
                              <UserActionMenu
                                isCreatorMode
                                isOpen={activeMenuId === user.id}
                                onChangeRole={() => openRoleModal(user)}
                                onDelete={() => openDeleteModal(user)}
                                onView={() => openPreview(user)}
                              />
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 p-5 xl:hidden">
                {paginatedUsers.map((user) => (
                  <div key={user.id} className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        alt={user.name}
                        className="h-12 w-12 bg-brand-gradient text-sm text-white"
                        fallback={user.initials}
                        src={user.image}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                          {!isCreatorMode ? (
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getUserRoleBadgeClass(user.role)}`}>
                              {user.role}
                            </span>
                          ) : null}
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getSubscriptionBadgeClass(user.subscription)}`}>
                            {user.subscription}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                        <p className="mt-3 text-sm text-slate-600">{user.bio}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Prompts</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{formatNumber(user.totalPrompts)}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Copies</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{formatNumber(user.totalCopies)}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Rating</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {user.averageRating.toFixed(1)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Joined</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{user.joinedLabel}</p>
                      </div>
                    </div>

                    {!isCreatorMode ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getUserStatusBadgeClass(user.status)}`}>
                          {user.status}
                        </span>
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button onPress={() => openPreview(user)} size="sm" variant="secondary">
                        {isCreatorMode ? "View Creator" : "View Profile"}
                      </Button>
                      <Button onPress={() => openRoleModal(user)} size="sm" variant="secondary">
                        Change Role
                      </Button>
                      <Button onPress={() => openDeleteModal(user)} size="sm" variant="danger">
                        Delete User
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {filteredUsers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(page * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}{" "}
                  {isCreatorMode ? "creators" : "users"}
                </p>
                <Pagination currentPage={page} onPageChange={setCurrentPage} totalPages={totalPages} />
              </div>
            </>
          )}
        </section>
      </div>

      <ProfilePreviewModal
        isCreatorMode={isCreatorMode}
        onClose={() => setPreviewUser(null)}
        user={previewUser}
      />
      <RoleModal
        isSubmitting={actionState.role}
        onClose={() => setRoleTarget(null)}
        onSubmit={handleRoleUpdate}
        role={nextRole}
        setRole={setNextRole}
        user={roleTarget}
      />
      <DeleteModal
        isSubmitting={actionState.remove}
        onClose={() => setDeleteTarget(null)}
        onSubmit={handleDeleteUser}
        user={deleteTarget}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { CalendarDays, Camera, PencilLine, Save, ShieldCheck, UserRound } from "lucide-react";

import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import MotionReveal from "@/components/shared/MotionReveal";
import Button from "@/components/ui/Button";
import DashboardSkeleton from "@/components/ui/DashboardSkeleton";
import ErrorState from "@/components/ui/ErrorState";
import ResponsiveDrawer from "@/components/ui/ResponsiveDrawer";
import UserAvatar from "@/components/ui/UserAvatar";
import { useDashboard } from "@/hooks/useDashboard";
import { formatDashboardDate } from "@/lib/dashboard";
import { toastSuccess } from "@/lib/toast";

function ProfileRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-4 last:border-b-0">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export default function DashboardProfile() {
  const { error, refreshDashboard, stats, status, updateProfileLocally, user } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    image: "",
    bio: "",
  });

  function openEditor() {
    setForm({
      name: user.name,
      image: user.image,
      bio: user.bio,
    });
    setIsEditing(true);
  }

  function handleSave() {
    updateProfileLocally(form);
    setIsEditing(false);
    toastSuccess("Profile updated locally");
  }

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (status === "error") {
    return <ErrorState description={error} onRetry={refreshDashboard} title="Unable to load profile" />;
  }

  if (!user) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <div className="space-y-6">
        <DashboardPageHeader crumbs={["Dashboard", "Profile"]} description="Manage your public account details and preferences." title="Profile" />

        <MotionReveal preset="viewportReveal">
          <section className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,rgba(139,92,246,0.92),rgba(99,102,241,0.88),rgba(56,189,248,0.82))] p-6 text-white shadow-[0_26px_70px_rgba(99,102,241,0.24)] md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <UserAvatar
                    alt={user.name}
                    className="h-28 w-28 border-4 border-white/70 bg-white/15 text-3xl text-white shadow-lg"
                    fallback={user.initials}
                    src={user.image || user.picture || user.photoURL || user.avatar || user.photo}
                  />
                  <button
                    className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white text-slate-900 shadow-md"
                    onClick={openEditor}
                    type="button"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <h2 className="text-4xl font-semibold tracking-tight">{user.name}</h2>
                  <div className="mt-3 flex items-center gap-2 text-lg text-white/85">
                    <span>{user.email}</span>
                    <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">{user.role}</span>
                    <span className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-900">{user.subscription} plan</span>
                  </div>
                </div>
              </div>
              <Button className="bg-slate-950 text-white hover:bg-slate-900" onPress={openEditor} variant="secondary">
                <PencilLine className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </section>
        </MotionReveal>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <MotionReveal preset="viewportReveal">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Account Information</h2>
                  <p className="mt-1 text-sm text-slate-500">Current profile details and account identity.</p>
                </div>
              </div>

              <div className="space-y-1">
                <ProfileRow label="Full Name" value={user.name} />
                <ProfileRow label="Email Address" value={user.email} />
                <ProfileRow label="Bio" value={user.bio} />
                <ProfileRow label="Role" value={user.role} />
                <ProfileRow label="Joined" value={formatDashboardDate(user.createdAt)} />
                <ProfileRow label="Last Updated" value={formatDashboardDate(user.updatedAt, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  onPress={openEditor}
                  variant="secondary"
                >
                  <Camera className="h-4 w-4" />
                  Change Photo
                </Button>
                <Button onPress={openEditor}>
                  <PencilLine className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </section>
          </MotionReveal>

          <div className="space-y-6">
            <MotionReveal preset="viewportReveal">
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Activity Summary</h2>
                    <p className="mt-1 text-sm text-slate-500">Derived from your available dashboard data.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {stats.slice(0, 4).map((stat) => (
                    <div key={stat.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <p className="mt-1 text-lg font-semibold text-slate-950">{stat.value}</p>
                      </div>
                      <p className="text-right text-sm text-slate-500">{stat.meta}</p>
                    </div>
                  ))}
                </div>
              </section>
            </MotionReveal>

            <MotionReveal preset="viewportReveal">
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Subscription Information</h2>
                <div className="mt-5 rounded-[24px] border border-emerald-200 bg-emerald-50/80 p-5">
                  <p className="text-xl font-semibold text-emerald-700">{user.subscription} plan</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-700/80">
                    Premium billing is not connected yet, but your dashboard is ready for the upgrade flow.
                  </p>
                </div>
                <Button
                  className="mt-5 w-full"
                  onPress={() => toastSuccess("Premium upgrade flow will be connected later.")}
                >
                  Upgrade to Premium
                </Button>
              </section>
            </MotionReveal>
          </div>
        </div>
      </div>

      <ResponsiveDrawer isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile">
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              onChange={(event) => setForm((currentForm) => ({ ...currentForm, name: event.target.value }))}
              value={form.name}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Avatar URL</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              onChange={(event) => setForm((currentForm) => ({ ...currentForm, image: event.target.value }))}
              placeholder="https://example.com/avatar.jpg"
              value={form.image}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Bio</span>
            <textarea
              className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              onChange={(event) => setForm((currentForm) => ({ ...currentForm, bio: event.target.value }))}
              value={form.bio}
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <Button
              className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              onPress={() => setIsEditing(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onPress={handleSave}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </ResponsiveDrawer>
    </>
  );
}

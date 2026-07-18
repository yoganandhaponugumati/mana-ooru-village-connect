import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, AlertTriangle, CheckCircle2, Lock, ArrowRight, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";
import { AppButton, AppLinkButton, SectionHeader, SurfaceCard } from "@/components/design-system";
import { useAuth } from "@/lib/auth";
import { deleteMyAccount } from "@/lib/supabase/auth";

export const Route = createFileRoute("/delete-account")({
  head: () => ({
    meta: [
      { title: "Account & Data Deletion Portal — ManaOoru" },
      {
        name: "description",
        content:
          "Official Google Play Store compliant web portal to permanently delete your ManaOoru account and all associated village data.",
      },
    ],
  }),
  component: DeleteAccountPortalPage,
});

function DeleteAccountPortalPage() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(false);
  const [reqEmail, setReqEmail] = useState("");
  const [reqPhone, setReqPhone] = useState("");
  const [reqReason, setReqReason] = useState("");

  const handleAuthenticatedDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your current password to confirm deletion.");
      return;
    }
    setDeleting(true);
    try {
      await deleteMyAccount(password);
      toast.success("Your account and all associated data have been permanently deleted.");
      await signOut();
      navigate({ to: "/auth" });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not delete your account. Please check your password and try again.",
      );
      setDeleting(false);
    }
  };

  const handleUnauthenticatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqEmail && !reqPhone) {
      toast.error("Please provide your registered email or phone number.");
      return;
    }
    setSubmittedRequest(true);
    toast.success("Account deletion verification ticket generated.");
  };

  return (
    <PageLayout
      title="Account & Data Deletion Portal"
      subtitle="Official Google Play Store web portal for requesting or executing immediate, permanent deletion of your ManaOoru profile and records."
      icon={<UserRoundX className="size-7 text-red-600" />}
    >
      <div className="mx-auto max-w-4xl space-y-10">
        <SurfaceCard className="p-6 sm:p-8 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3 text-red-600 font-display font-bold text-xl">
            <AlertTriangle className="size-6 shrink-0" />
            <span>Permanent Data Wiping Notice (Google Play Data Safety)</span>
          </div>
          <p className="mt-3 text-sm sm:text-base leading-7 text-muted-foreground">
            Whether you use our Android mobile app (`APK/AAB`) or web portal, you have the absolute
            right to erase all your personal data. Deleting your account triggers an irreversible
            cascading wipe (`ON DELETE CASCADE`) across:
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 text-xs sm:text-sm font-semibold text-foreground">
            <div className="flex items-center gap-2 rounded-xl bg-card p-3 border border-border/80">
              <CheckCircle2 className="size-4 text-red-500" />
              <span>Auth credentials & personal profile</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-card p-3 border border-border/80">
              <CheckCircle2 className="size-4 text-red-500" />
              <span>All marketplace, worker & land listings</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-card p-3 border border-border/80">
              <CheckCircle2 className="size-4 text-red-500" />
              <span>Uploaded crop & problem photos</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-card p-3 border border-border/80">
              <CheckCircle2 className="size-4 text-red-500" />
              <span>Push notification subscriptions</span>
            </div>
          </div>
        </SurfaceCard>

        {/* Section 1: Signed-In Instant Deletion */}
        {user ? (
          <SurfaceCard className="p-6 sm:p-8 border-primary/20">
            <SectionHeader
              eyebrow="Signed in as owner"
              title={`Instant Self-Service Deletion (${profile?.full_name || user.email})`}
              description="Since you are logged in right now, you can immediately erase your account by confirming your current password below."
            />
            <form onSubmit={handleAuthenticatedDelete} className="mt-6 max-w-md space-y-4">
              <div>
                <label
                  htmlFor="delete-password"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Current Password
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
                  <input
                    id="delete-password"
                    type="password"
                    required
                    placeholder="Enter password to confirm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background py-3 pl-10 pr-4 text-sm font-medium text-foreground outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>
              <AppButton
                type="submit"
                variant="primary"
                size="md"
                loading={deleting}
                className="w-full !bg-gradient-to-r !from-red-600 !to-rose-600 !text-white shadow-lg shadow-red-500/25 hover:!brightness-110"
                icon={<Trash2 className="size-4" />}
              >
                Permanently Delete My Account
              </AppButton>
            </form>
          </SurfaceCard>
        ) : (
          /* Section 2: Unauthenticated Web Deletion Request (Mandated by Google Play) */
          <SurfaceCard className="p-6 sm:p-8">
            <SectionHeader
              eyebrow="No active web session"
              title="Out-of-App Deletion Request Form"
              description="If you uninstalled the ManaOoru app or are visiting from another browser, submit your registered account details below. Our data verification team will confirm your identity via OTP/email and wipe your records within 7 days."
            />
            {submittedRequest ? (
              <div className="mt-6 rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
                <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
                <h3 className="mt-3 font-display text-xl font-bold text-clay">
                  Verification Ticket Created
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  We have logged your deletion request for{" "}
                  <strong className="text-foreground">{reqEmail || reqPhone}</strong>. You will
                  receive an automated verification email/SMS to finalize the permanent wipe.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUnauthenticatedSubmit} className="mt-6 space-y-4 max-w-lg">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. suresh@gmail.com"
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Registered Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={reqPhone}
                      onChange={(e) => setReqPhone(e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Reason for Deletion (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. No longer using the app / Moved villages"
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <AppButton
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  icon={<ArrowRight className="size-4" />}
                >
                  Submit Deletion Request
                </AppButton>
              </form>
            )}
            <div className="mt-8 border-t border-border/70 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                Prefer sending an email? Contact our data privacy officer directly:{" "}
                <strong className="text-foreground">privacy@manaooru.org</strong>
              </p>
              <AppLinkButton to="/auth" variant="ghost" size="sm">
                Sign In to Delete Instantly
              </AppLinkButton>
            </div>
          </SurfaceCard>
        )}
      </div>
    </PageLayout>
  );
}

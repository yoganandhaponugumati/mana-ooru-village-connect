import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ChevronRight, Plus, Vote } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { AppButton, EmptyState, SurfaceCard } from "@/components/design-system";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/polls")({
  head: () => ({ meta: [{ title: "Gram Sabha Polls - GramMitra" }] }),
  component: PollsPage,
});

type PollOption = { id: string; label: string };
type Poll = {
  id: string;
  question: string;
  description: string | null;
  options: PollOption[];
  status: "open" | "closed";
  created_at: string;
  ends_at: string;
  village_id: string;
};

type PollVote = {
  poll_id: string;
  option_id: string;
};

function PollsPage() {
  const { user, role, profile } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<PollOption[]>([
    { id: "1", label: "Yes" },
    { id: "2", label: "No" },
  ]);

  const isAdmin = role === "village_admin" || role === "super_admin";
  const villageId = profile?.village_id;

  const pollsQuery = useQuery({
    queryKey: ["polls", villageId],
    queryFn: async () => {
      let q = (supabase as any)
        .from("village_polls")
        .select("*")
        .order("created_at", { ascending: false });

      if (!isAdmin && villageId) {
        q = q.eq("village_id", villageId);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as Poll[];
    },
    enabled: !!villageId || isAdmin,
  });

  const votesQuery = useQuery({
    queryKey: ["poll_votes", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("poll_votes")
        .select("*")
        .eq("voter_id", user?.id);
      if (error) throw error;
      return (data || []) as PollVote[];
    },
    enabled: !!user,
  });

  // Calculate vote counts (Admin only or public after closed)
  const allVotesQuery = useQuery({
    queryKey: ["all_poll_votes"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("poll_votes")
        .select("poll_id, option_id");
      if (error) throw error;
      return data || [];
    },
  });

  const createPollMutation = useMutation({
    mutationFn: async () => {
      if (!question.trim()) throw new Error("Question is required");
      if (options.length < 2) throw new Error("At least 2 options are required");
      if (options.some((o) => !o.label.trim())) throw new Error("All options must have text");

      const { error } = await (supabase as any).from("village_polls").insert({
        question,
        description,
        options,
        village_id: villageId,
        ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Poll created successfully");
      setShowForm(false);
      setQuestion("");
      setDescription("");
      setOptions([
        { id: "1", label: "Yes" },
        { id: "2", label: "No" },
      ]);
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      const { error } = await (supabase as any).from("poll_votes").insert({
        poll_id: pollId,
        option_id: optionId,
        voter_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vote recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["poll_votes"] });
      queryClient.invalidateQueries({ queryKey: ["all_poll_votes"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const myVotes = new Set(votesQuery.data?.map((v) => v.poll_id) || []);

  const getVoteCount = (pollId: string, optionId: string) => {
    return (
      allVotesQuery.data?.filter((v: any) => v.poll_id === pollId && v.option_id === optionId)
        .length || 0
    );
  };

  const getTotalVotes = (pollId: string) => {
    return allVotesQuery.data?.filter((v: any) => v.poll_id === pollId).length || 0;
  };

  return (
    <PageLayout
      title="Gram Sabha Polls"
      subtitle="Participate in village decision-making. Cast your vote securely and view live community consensus."
      icon={<Vote className="size-6 text-primary" />}
      heroAction={
        isAdmin ? (
          <AppButton
            variant="primary"
            icon={<Plus className="size-4" />}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Create New Poll"}
          </AppButton>
        ) : undefined
      }
    >
      {showForm && isAdmin && (
        <SurfaceCard className="mb-8 p-6 sm:p-8">
          <h3 className="font-display text-xl font-bold text-clay mb-6">Create Community Poll</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Question
              </label>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                placeholder="e.g., Should we allocate funds for a new library?"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                placeholder="Add more context about this decision..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Options
              </label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={opt.id} className="flex gap-2">
                    <input
                      value={opt.label}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[i].label = e.target.value;
                        setOptions(newOpts);
                      }}
                      className="flex-1 rounded-xl border border-input bg-background px-4 py-2 text-sm"
                      placeholder={`Option ${i + 1}`}
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 text-red-600 font-bold"
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setOptions([...options, { id: Math.random().toString(), label: "" }])
                }
                className="mt-2 text-xs font-bold text-primary hover:underline"
              >
                + Add Option
              </button>
            </div>
            <div className="pt-4 flex justify-end">
              <AppButton
                onClick={() => createPollMutation.mutate()}
                loading={createPollMutation.isPending}
              >
                Publish Poll
              </AppButton>
            </div>
          </div>
        </SurfaceCard>
      )}

      {pollsQuery.isPending ? (
        <div className="text-center py-12 text-muted-foreground font-semibold">
          Loading polls...
        </div>
      ) : pollsQuery.data?.length === 0 ? (
        <EmptyState
          icon={<Vote className="size-6" />}
          title="No active polls"
          description="There are currently no active Gram Sabha polls. Check back later."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {pollsQuery.data?.map((poll) => {
            const hasVoted = myVotes.has(poll.id);
            const totalVotes = getTotalVotes(poll.id);
            const myVote = votesQuery.data?.find((v) => v.poll_id === poll.id)?.option_id;

            return (
              <SurfaceCard key={poll.id} className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      poll.status === "open"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {poll.status === "open" ? "Active Poll" : "Closed"}
                  </span>
                  {hasVoted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                      <CheckCircle2 className="size-3" /> Voted
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    Total votes: {totalVotes}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-clay leading-tight">
                  {poll.question}
                </h3>
                {poll.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{poll.description}</p>
                )}

                <div className="mt-6 space-y-3">
                  {poll.options.map((opt) => {
                    const count = getVoteCount(poll.id, opt.id);
                    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isMyVote = myVote === opt.id;

                    if (hasVoted || poll.status === "closed") {
                      return (
                        <div
                          key={opt.id}
                          className="relative overflow-hidden rounded-xl bg-muted/40 border border-border"
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="relative flex items-center justify-between p-3 text-sm font-semibold">
                            <span className="flex items-center gap-2 text-clay">
                              {opt.label}
                              {isMyVote && <CheckCircle2 className="size-4 text-emerald-600" />}
                            </span>
                            <span className="text-muted-foreground">
                              {percentage}% ({count})
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={opt.id}
                        onClick={() => voteMutation.mutate({ pollId: poll.id, optionId: opt.id })}
                        disabled={voteMutation.isPending || !user}
                        className="w-full flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm font-bold text-primary transition hover:bg-primary/10 hover:border-primary/40 disabled:opacity-50 text-left"
                      >
                        {opt.label}
                        <ChevronRight className="size-4 opacity-50" />
                      </button>
                    );
                  })}
                </div>

                {!user && (
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    Sign in to participate in this poll.
                  </p>
                )}
              </SurfaceCard>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import InvitationCard from "@/components/user/events/InvitationCard";
import { clientEventService, InvitationDesign, RsvpStatus } from "@/services/client-event.service";

type Answer = Exclude<RsvpStatus, "pending">;
const CHOICES: Array<{ value: Answer; label: string }> = [
  { value: "accepted", label: "Joyfully accept" },
  { value: "tentative", label: "Maybe" },
  { value: "declined", label: "Regretfully decline" },
];
const THANKS: Record<Answer, string> = {
  accepted: "Wonderful! We can't wait to celebrate with you.",
  tentative: "Thanks for letting us know. Update your answer here any time.",
  declined: "We'll miss you. Thank you for letting us know.",
};

/** Public RSVP page guests open from their invitation (no account needed) */
export default function RsvpPage() {
  const { token } = useParams() as { token: string };
  const [invitation, setInvitation] = useState<InvitationDesign | null>(null);
  const [guestName, setGuestName] = useState("");
  const [canRespond, setCanRespond] = useState(true);
  const [status, setStatus] = useState<Answer | null>(null);
  const [plusOneName, setPlusOneName] = useState("");
  const [dietary, setDietary] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Answer | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    clientEventService
      .getRsvp(token)
      .then((data) => {
        setInvitation(data.invitation);
        setGuestName(data.guest.name);
        setCanRespond(data.canRespond);
        if (data.guest.rsvpStatus !== "pending") setStatus(data.guest.rsvpStatus as Answer);
        setPlusOneName(data.guest.plusOneName);
        setDietary(data.guest.dietaryRestrictions.join(", "));
        setMessage(data.guest.rsvpMessage);
      })
      .catch(() => setInvalid(true))
      .finally(() => setLoading(false));
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!status) return setError("Please choose an answer");
    setSubmitting(true);
    setError("");
    try {
      await clientEventService.submitRsvp(token, {
        status,
        plusOneName: invitation?.allowPlusOnes && status === "accepted" ? plusOneName : "",
        dietaryRestrictions: dietary.split(",").map((d) => d.trim()).filter(Boolean),
        message,
      });
      setSubmitted(status);
    } catch (err: any) {
      setError(err?.response?.data?.message || "We couldn't save your reply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </main>
    );
  }

  if (invalid || !invitation) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6 text-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">This invitation link isn&apos;t valid</h1>
          <p className="text-gray-600 mt-2 text-sm">Please check the link, or ask your host to send it again.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4 sm:py-12">
      <div className="max-w-xl mx-auto space-y-5">
        <InvitationCard design={invitation} guestName={guestName} />

        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-900">Thank you, {guestName.split(" ")[0]}!</p>
              <p className="text-gray-600 mt-1">{THANKS[submitted]}</p>
              <button onClick={() => setSubmitted(null)} className="mt-4 text-sm text-purple-700 underline">
                Change my answer
              </button>
            </div>
          ) : !canRespond ? (
            <p className="text-center text-gray-700">
              RSVPs for this event have closed.
              {status ? ` Your answer: ${CHOICES.find((c) => c.value === status)?.label}.` : ""} Please contact your host with any changes.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <fieldset>
                <legend className="font-semibold text-gray-900 mb-3">Will you attend?</legend>
                <div className="grid gap-2">
                  {CHOICES.map((choice) => (
                    <label
                      key={choice.value}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer text-base ${
                        status === choice.value ? "border-purple-600 bg-purple-50" : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="rsvp"
                        value={choice.value}
                        checked={status === choice.value}
                        onChange={() => setStatus(choice.value)}
                        className="w-5 h-5 accent-purple-600"
                      />
                      {choice.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {status === "accepted" && invitation.allowPlusOnes && (
                <label className="block">
                  <span className="text-sm text-gray-700">Bringing someone? Their name (optional)</span>
                  <input
                    value={plusOneName}
                    onChange={(e) => setPlusOneName(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-base"
                    autoComplete="off"
                  />
                </label>
              )}
              {status !== "declined" && (
                <label className="block">
                  <span className="text-sm text-gray-700">Dietary needs (optional)</span>
                  <input
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    placeholder="e.g. vegetarian, no nuts"
                    className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-base"
                  />
                </label>
              )}
              <label className="block">
                <span className="text-sm text-gray-700">A note for the hosts (optional)</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-base"
                />
              </label>
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl text-white text-base font-semibold disabled:opacity-60"
                style={{ background: invitation.accentColor }}
              >
                {submitting ? "Sending…" : "Send my reply"}
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-gray-400">Sent with Confetti</p>
      </div>
    </main>
  );
}

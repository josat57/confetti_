"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import { messagingService } from "@/services/messaging.service";

/** Inbox for the dashboard the user is in */
export function messagesPathFor(pathname: string | null) {
  if (pathname?.startsWith("/vendor")) return "/vendor/dashboard/messages";
  if (pathname?.startsWith("/planner")) return "/planner/dashboard/messages";
  return "/user/dashboard/messages";
}

interface MessageButtonProps {
  /** User id, or vendor id from the vendor directory */
  participantId: string;
  subject?: string;
  relatedBooking?: string;
  relatedEvent?: string;
  label?: string;
  className?: string;
}

/** Opens (or starts) the conversation with someone and goes to the inbox. */
export default function MessageButton({
  participantId,
  subject,
  relatedBooking,
  relatedEvent,
  label = "Message",
  className = "flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-purple-300 hover:text-purple-600 transition-colors disabled:opacity-50",
}: MessageButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [opening, setOpening] = useState(false);

  async function open(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (opening) return;
    setOpening(true);
    try {
      const conversation = await messagingService.createConversation({
        participantId,
        subject,
        relatedBooking,
        relatedEvent,
      });
      router.push(`${messagesPathFor(pathname)}?c=${conversation._id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Couldn't open the conversation");
      setOpening(false);
    }
  }

  return (
    <button type="button" onClick={open} disabled={opening || !participantId} className={className}>
      {opening ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}

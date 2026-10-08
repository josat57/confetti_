"use client";

import MessagesInbox from "@/components/messages/MessagesInbox";

export default function VendorMessagesPage() {
  return (
    <MessagesInbox
      theme="purple"
      role="vendor"
      emptyHint="When clients or planners message you, conversations will appear here."
    />
  );
}

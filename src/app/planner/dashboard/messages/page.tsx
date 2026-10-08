"use client";

import MessagesInbox from "@/components/messages/MessagesInbox";

export default function MessagesPage() {
  return (
    <MessagesInbox
      theme="teal"
      role="planner"
      emptyHint="Message a vendor from the vendor directory, or wait for a vendor to reply."
    />
  );
}

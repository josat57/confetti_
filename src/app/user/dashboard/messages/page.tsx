"use client";

import MessagesInbox from "@/components/messages/MessagesInbox";

export default function UserMessagesPage() {
  return (
    <MessagesInbox
      theme="purple"
      role="user"
      emptyHint="Use “Message” on a vendor in Find Vendors or on a booking to start a conversation."
    />
  );
}

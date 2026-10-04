import WatchPartyRoom from "@/components/WatchPartyRoom";

// Later: move to app/room/[roomId]/page.tsx and read roomId from params.
export default function Page() {
  return <WatchPartyRoom roomId="12345" />;
}

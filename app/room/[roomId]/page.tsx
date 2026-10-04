import WatchPartyRoom from "@/components/WatchPartyRoom";

// Next 14: params is a plain object (in Next 15 it's a Promise: `await params`).
export default function RoomPage({ params }: { params: { roomId: string } }) {
  return <WatchPartyRoom roomId={params.roomId} />;
}

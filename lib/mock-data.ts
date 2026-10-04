import type { ChatMessage, Participant, Role } from "./types";

export const SELF_ID = "u-you";
export const MOCK_GUEST_ID = "u-maya";

/** Swap for a real source. Any CORS-friendly mp4 works. */
export const MOCK_VIDEO_SRC =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const BASE_PARTICIPANTS: Participant[] = [
  { id: SELF_ID, name: "You", role: "host", color: "bg-indigo-500" },
  { id: MOCK_GUEST_ID, name: "Maya", role: "guest", color: "bg-fuchsia-500" },
  { id: "u-jordan", name: "Jordan", role: "guest", color: "bg-emerald-500" },
];

/** Dev helper: sets the local user's role (and gives Maya the other one). */
export function mockParticipants(selfRole: Role): Participant[] {
  return BASE_PARTICIPANTS.map((p) => {
    if (p.id === SELF_ID) return { ...p, role: selfRole };
    if (p.id === MOCK_GUEST_ID) return { ...p, role: selfRole === "host" ? "guest" : "host" };
    return p;
  });
}

// Fixed timestamps (not Date.now()) so server and client render identically.
export const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "m1", senderId: MOCK_GUEST_ID, author: "Maya", text: "Ready when you are. I've got snacks 🍿", sentAt: Date.UTC(2026, 9, 4, 20, 2) },
  { id: "m2", senderId: SELF_ID, author: "You", text: "Starting in a sec, let me sync the video.", sentAt: Date.UTC(2026, 9, 4, 20, 2, 40) },
  { id: "m3", senderId: MOCK_GUEST_ID, author: "Maya", text: "Wait, did you just skip the intro?", sentAt: Date.UTC(2026, 9, 4, 20, 3) },
  { id: "m4", senderId: SELF_ID, author: "You", text: "Never. We're watching every second.", sentAt: Date.UTC(2026, 9, 4, 20, 4) },
];

export const MOCK_REPLIES = [
  "Ha, same here.",
  "Okay this part is so good.",
  "Pause, I need more snacks.",
  "Did you see that?",
];

const YT_ID = /^[\w-]{11}$/;

/**
 * Turns pasted text into a Vidstack `src` string.
 *  - YouTube links or bare IDs → "youtube/<id>"
 *  - Direct .mp4 / .webm / .m3u8 / .mov URLs → the URL itself
 * Returns null if it isn't something we can play.
 */
export function parseVideoSource(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (YT_ID.test(value)) return `youtube/${value}`;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.replace(/^(www|m)\./, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0];
  } else if (host === "youtube.com" || host === "music.youtube.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else id = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/)?.[1] ?? null;
  }
  if (id && YT_ID.test(id)) return `youtube/${id}`;

  if (/\.(mp4|webm|m3u8|mov)$/i.test(url.pathname)) return url.toString();
  return null;
}

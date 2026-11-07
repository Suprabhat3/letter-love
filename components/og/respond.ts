/**
 * Turn a generated preview image into a response link crawlers can rely on.
 *
 * `ImageResponse` streams its PNG (chunked, no Content-Length) and the route
 * is rendered fresh on every hit — ~1s+ of database read and font fetching.
 * Discord and Twitter wait for that; WhatsApp's crawler is impatient and
 * quietly shows no image. So the bytes are buffered (a real Content-Length),
 * and the CDN is told to keep them, making every fetch after the first an
 * instant cache hit.
 *
 * `stale-while-revalidate` keeps an edited card's preview correct within the
 * hour without ever making a crawler wait on a regeneration.
 */
export async function crawlerFriendly(
  image: Response,
  { maxAgeSec = 3600 }: { maxAgeSec?: number } = {},
): Promise<Response> {
  const body = await image.arrayBuffer();
  return new Response(body, {
    status: image.status,
    headers: {
      "Content-Type": image.headers.get("Content-Type") ?? "image/png",
      "Content-Length": String(body.byteLength),
      "Cache-Control": `public, max-age=${maxAgeSec}, s-maxage=${maxAgeSec}, stale-while-revalidate=604800`,
    },
  });
}

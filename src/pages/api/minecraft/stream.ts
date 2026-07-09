import type { APIRoute } from "astro";
import { corsHeaders, corsPreflightResponse } from "../../../lib/minecraft/http";
import { minecraftLiveService } from "../../../lib/minecraft/minecraft-live-service";

export const prerender = false;

const SNAPSHOT_INTERVAL_MS = 4_000;

const encodeSseEvent = (event: string, data: unknown) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

export const GET = (({ request }) => {
  const encoder = new TextEncoder();
  let intervalId: ReturnType<typeof setInterval> | undefined;
  let isClosed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const sendSnapshot = () => {
        if (isClosed) {
          return;
        }

        void minecraftLiveService
          .getSnapshot()
          .catch(() => minecraftLiveService.getFallbackSnapshot())
          .then((snapshot) => {
            if (isClosed) {
              return;
            }

            controller.enqueue(encoder.encode(encodeSseEvent("snapshot", snapshot)));
          })
          .catch(() => {
            isClosed = true;
            if (intervalId) {
              clearInterval(intervalId);
            }
          });
      };

      const closeStream = () => {
        if (isClosed) {
          return;
        }

        isClosed = true;
        if (intervalId) {
          clearInterval(intervalId);
        }

        try {
          controller.close();
        } catch {
          // The client may already have disconnected.
        }
      };

      request.signal.addEventListener("abort", closeStream, { once: true });

      sendSnapshot();
      intervalId = setInterval(sendSnapshot, SNAPSHOT_INTERVAL_MS);
    },

    cancel() {
      isClosed = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      ...corsHeaders(request),
    },
  });
}) satisfies APIRoute;

export const OPTIONS = (({ request }) => corsPreflightResponse(request)) satisfies APIRoute;

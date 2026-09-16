// @ts-expect-error
import { render } from "../dist/server/entry-server.js";

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const template = await (
        await env.ASSETS.fetch(new URL("/index.html", url))
      ).text();
      const { html } = await render(url.href);

      return new Response(template.replace("<!--app-->", html), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch (err) {
      console.error(err);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;

import { createAuthClient } from "@/lib/auth-server";
import { AUTH_PRIVATE_HEADERS, getAuthConfig, safeRedirect } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Starts Google sign-in. Supabase returns to /auth/callback with a browser-bound
 * PKCE code, which the existing callback exchanges exactly like email links. */
export async function GET(request: Request) {
  const config = getAuthConfig();
  const origin = config?.siteUrl || new URL(request.url).origin;
  const redirect = (location: string) => new Response(null, { status: 303, headers: { ...AUTH_PRIVATE_HEADERS, Location: location } });
  if (!config) return redirect(new URL("/login?error=config-unavailable", origin).toString());
  const next = safeRedirect(new URL(request.url).searchParams.get("next"));
  try {
    const client = await createAuthClient();
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: new URL(`/auth/callback?next=${encodeURIComponent(next)}`, origin).toString(), skipBrowserRedirect: true },
    });
    const target = data?.url ? new URL(data.url) : null;
    // Only follow a redirect to this project's own Supabase Auth server.
    if (error || !target || target.origin !== config.url) return redirect(new URL("/login?error=auth-unavailable", origin).toString());
    return redirect(target.toString());
  } catch {
    return redirect(new URL("/login?error=auth-unavailable", origin).toString());
  }
}

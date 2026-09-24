const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

function getKey(currentName: string, legacyName: string) {
  const current = Deno.env.get(currentName);
  if (current) return JSON.parse(current).default;
  return Deno.env.get(legacyName) || '';
}

function apiHeaders(key: string) {
  const headers: Record<string, string> = { apikey: key };
  if (!key.startsWith('sb_')) headers.Authorization = `Bearer ${key}`;
  return headers;
}

const genericError = () => new Response(
  JSON.stringify({ error: 'Incorrect username or password.' }),
  { status: 401, headers: corsHeaders },
);

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers: corsHeaders });

  try {
    const { username, password } = await request.json();
    if (!/^[a-z0-9_]{3,24}$/.test(username || '') || typeof password !== 'string' || password.length < 6 || password.length > 128) {
      return genericError();
    }

    const url = Deno.env.get('SUPABASE_URL') || '';
    const publishableKey = getKey('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY');
    const secretKey = getKey('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !publishableKey || !secretKey) return genericError();
    const profileResponse = await fetch(
      `${url}/rest/v1/profiles?select=id&username=eq.${encodeURIComponent(username)}&username_confirmed=eq.true&limit=1`,
      { headers: apiHeaders(secretKey) },
    );
    if (!profileResponse.ok) return genericError();
    const [profile] = await profileResponse.json();
    if (!profile) return genericError();

    const userResponse = await fetch(`${url}/auth/v1/admin/users/${profile.id}`, { headers: apiHeaders(secretKey) });
    if (!userResponse.ok) return genericError();
    const authUser = await userResponse.json();
    const email = authUser?.email;
    if (!email) return genericError();

    const authResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: publishableKey },
      body: JSON.stringify({ email, password }),
    });
    if (!authResponse.ok) return genericError();

    const session = await authResponse.json();
    return new Response(JSON.stringify(session), { status: 200, headers: corsHeaders });
  } catch {
    return genericError();
  }
});

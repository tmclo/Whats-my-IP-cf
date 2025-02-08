interface IpResponse {
  ip: string;
  country?: string;
  city?: string;
  timestamp: string;
}

interface CfProperties {
  city?: string;
  country?: string;
  continent?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const clientIp = request.headers.get('cf-connecting-ip') || '';
    const country = request.headers.get('cf-ipcountry') || undefined;
    const cf = (request as Request & { cf?: CfProperties }).cf;
    const city = cf?.city;

    const response: IpResponse = {
      ip: clientIp,
      country,
      city,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  },
} satisfies ExportedHandler<Env>;

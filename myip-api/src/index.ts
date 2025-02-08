interface IpResponse {
  ip: string;
  country?: string;
  city?: string;
  asn?: string;
  asOrganization?: string;
  timestamp: string;
  id?: string;
}

interface CfProperties {
  city?: string;
  country?: string;
  continent?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  asn?: number;
  asOrganization?: string;
}

interface Env {
  IP_INFO: KVNamespace;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

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

    // Handle result retrieval
    if (url.pathname.startsWith('/result/')) {
      const id = url.pathname.split('/')[2];
      if (!id) {
        return new Response('Invalid ID', { status: 400 });
      }

      const storedData = await env.IP_INFO.get(id);
      if (!storedData) {
        return new Response('Not found', { status: 404 });
      }

      return new Response(storedData, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store',
        },
      });
    }

    // Handle IP info request
    const clientIp = request.headers.get('cf-connecting-ip') || '';
    const country = request.headers.get('cf-ipcountry') || undefined;
    const cf = (request as Request & { cf?: CfProperties }).cf;
    const city = cf?.city;
    const asn = cf?.asn ? `AS${cf.asn}` : undefined;
    const asOrganization = cf?.asOrganization;
    const id = generateId();

    const response: IpResponse = {
      ip: clientIp,
      country,
      city,
      asn,
      asOrganization,
      timestamp: new Date().toISOString(),
      id,
    };

    // Store in KV with 24-hour expiration
    ctx.waitUntil(
      env.IP_INFO.put(id, JSON.stringify(response), {
        expirationTtl: 86400, // 24 hours
      })
    );

    return new Response(JSON.stringify(response, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  },
} satisfies ExportedHandler<Env>;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle result pages
    if (url.pathname.startsWith('/result/')) {
      const response = await fetch(new URL('/index.html', url.origin));
      return new Response(response.body, {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
        },
      });
    }

    // Handle static assets
    if (url.pathname.endsWith('.css')) {
      const response = await fetch(request);
      return new Response(response.body, {
        headers: {
          'content-type': 'text/css',
        },
      });
    }

    if (url.pathname.endsWith('.js')) {
      const response = await fetch(request);
      return new Response(response.body, {
        headers: {
          'content-type': 'application/javascript',
        },
      });
    }

    // Default response
    return fetch(request);
  },
};
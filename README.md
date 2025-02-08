# What's My IP - Cloudflare Edition

A modern, clean "What's My IP" application built with Cloudflare Pages and Workers. Features dark mode support, location detection, and a responsive design.

## Live Demo

- Frontend: https://myip.pinguin.uk
- API: https://myip-api.aa2.workers.dev

## Features

- 🌍 IP Address Detection
- 📍 Location Information
- 🌓 Dark Mode Support
- 📋 Copy to Clipboard
- 🔄 Auto-refresh Capability
- 📱 Responsive Design

## Project Structure

```
.
├── myip-api/           # Cloudflare Worker API
│   ├── src/           # Source code
│   │   └── index.ts   # API implementation
│   └── wrangler.toml  # Worker configuration
│
└── myip-frontend/     # Frontend application
    ├── index.html     # Main HTML file
    ├── styles.css     # Styling
    └── script.js      # Frontend logic
```

## Setup Requirements

- Node.js (Latest LTS recommended)
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare Account

## Development Setup

1. Clone the repository:
   ```bash
   git clone git@github.com:tmclo/Whats-my-IP-cf.git
   cd Whats-my-IP-cf
   ```

2. Install dependencies for API:
   ```bash
   cd myip-api
   npm install
   ```

3. Configure Wrangler:
   - Update `myip-api/wrangler.toml` with your account ID
   - Update `myip-frontend/.wrangler/config/default.toml` with your account ID

4. Local Development:
   ```bash
   # For API
   cd myip-api
   npm run dev

   # For Frontend
   cd myip-frontend
   npx http-server
   ```

## Deployment

### API Deployment
```bash
cd myip-api
wrangler deploy
```

### Frontend Deployment
```bash
cd myip-frontend
wrangler pages deploy .
```

## Configuration

### API Configuration
The API uses Cloudflare Workers and requires the following configuration in `wrangler.toml`:

```toml
name = "myip-api"
main = "src/index.ts"
compatibility_date = "2025-02-04"
account_id = "your_account_id"
```

### Frontend Configuration
Frontend configuration is managed through `.wrangler/config/default.toml`:

```toml
name = "myip"
account_id = "your_account_id"
compatibility_date = "2024-02-08"
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
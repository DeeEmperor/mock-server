# MockFlow

MockFlow is a powerful, self-hosted Mock API Server designed for developers who need reliable, dynamic, and low-latency mock endpoints for testing and prototyping.

## Features

- **Dynamic Routing**: Define mock endpoints with ease using the intuitive React dashboard.
- **Wildcard Routes**: Use `api/*` to catch entire path families with a single rule.
- **Advanced Matching**: Return different responses for the same URL based on headers, query params, or request body fields.
- **Latency Simulation**: Simulate real-world network conditions by adding custom delays to your mock responses.
- **History Tab**: Keep track of all incoming requests with a detailed log (auto-rotates at 500 entries).
- **Faker Integration**: Generate realistic mock data on the fly using built-in Faker.js templates.
- **Zero-dependency Storage**: Uses SQLite — no database server, no account, no setup. Data is stored in a local `.db` file.
- **Universal Build**: A unified architecture that serves the frontend and backend from a single Node.js instance.

## Local Setup (Recommended)

> **Requirements:** Node.js v18+. That's it — no database to install.

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/mock-server.git
cd mock-server
```

### 2. Install dependencies

```bash
npm run install-all
```

### 3. Start the development server

```bash
npm run dev
```

MockFlow will be running at **http://localhost:3000**.

Your mock configurations and request logs are stored in `backend/mockflow.db` — a local SQLite file that is created automatically on first run and ignored by git.

---

## How It Works

Every mock endpoint you create is available at:

```
http://localhost:3000/mock/{your-path}
```

The admin dashboard (the UI) is available at:

```
http://localhost:3000/
```

### Wildcard Routes

Use `/*` at the end of a path to match any sub-path:

| Rule | Matches |
|---|---|
| `api/*` | `api/users`, `api/v1/posts`, `api/x/y/z` |

Exact rules always take priority over wildcard rules.

### Dynamic Faker Data

Inject randomized data into response bodies:

```json
{
  "name": "{{faker:person.fullName}}",
  "email": "{{faker:internet.email}}",
  "id": "{{faker:string.uuid}}"
}
```

### Advanced Matching

Define multiple responses for the same URL path by adding match rules. The server checks **header**, **query param**, or **body field** values to pick the right mock.

---

## Backup & Restore

Use the **Settings** page to export your entire mock configuration as a JSON file and restore it at any time.

---

Built with ❤️ for the Developer Community. Dave!

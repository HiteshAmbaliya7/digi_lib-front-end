# PDF Manager — React + Vite Frontend

A simple, responsive frontend for a role-based PDF sharing app.

- **User** role: view and download PDFs.
- **Admin** role: upload PDFs, plus a dashboard to view/add/remove users.
- JWT returned by your backend on login/signup is stored in a cookie and
  attached to every API call automatically.

## 1. Install & run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## 2. Point it at your backend

Two options:

**Option A — Dev proxy (recommended for local dev)**
Edit `vite.config.js` and set the `target` under `server.proxy['/api']`
to your backend URL (default assumes `http://localhost:5000`). Keep
`VITE_API_BASE_URL=/api` in your `.env`.

**Option B — Direct URL**
Copy `.env.example` to `.env` and set:
```
VITE_API_BASE_URL=https://your-backend.example.com/api
```

## 3. Expected backend API contract

The frontend calls these endpoints — implement them on your backend
(or adjust `src/api/axios.js` / page files to match your existing API).

| Method | Endpoint                | Auth        | Purpose                          |
|--------|--------------------------|-------------|-----------------------------------|
| POST   | `/auth/login`            | Public      | `{ email, password }` → `{ token }` |
| POST   | `/auth/signup`           | Public      | `{ name, email, mobile, password }` → `{ token }` |
| GET    | `/pdfs`                  | Any user    | → `{ pdfs: [{ id, filename, uploadedAt }] }` |
| POST   | `/pdfs/upload`           | Admin only  | multipart form field `pdf` |
| GET    | `/pdfs/:id/download`     | Any user    | returns the file (blob) |
| GET    | `/admin/users`           | Admin only  | → `{ users: [{ id, name, email, mobile, role }] }` |
| POST   | `/admin/users`           | Admin only  | `{ name, email, mobile, password, role }` |
| DELETE | `/admin/users/:id`       | Admin only  | removes a user |

**Important:** the JWT payload returned from `/auth/login` and
`/auth/signup` must include `name`, `email`, and `role` claims (plus the
standard `exp`), since the frontend decodes the token client-side
(via `jwt-decode`) to know who's logged in and whether they're an admin.
Example payload:
```json
{ "name": "Jane Doe", "email": "jane@example.com", "role": "admin", "exp": 1730000000 }
```

The frontend never trusts the client-side role for authorization — your
backend must also check the role server-side on `/pdfs/upload` and all
`/admin/*` routes.

## 4. Editing styles

All styling is plain CSS, one file per feature, under `src/styles/`.
Global colors/spacing live as CSS variables at the top of `src/index.css`
— change those to re-theme the whole app quickly.

- `index.css` — variables, layout, buttons, cards (global)
- `styles/Auth.css` — login & signup pages
- `styles/Home.css` — PDF list & upload page
- `styles/Admin.css` — admin dashboard
- `styles/Navbar.css` — top navigation bar
- `styles/Loader.css` — loading spinner

## 5. Packages used

Only actively maintained, widely used packages with no known
vulnerabilities at time of writing:
- `react`, `react-dom` — UI
- `react-router-dom` — routing
- `axios` — HTTP client
- `js-cookie` — cookie storage for the JWT
- `jwt-decode` — read the role/name out of the JWT client-side

Run `npm audit` after installing to double check against the latest
advisory database for your environment.

## 6. Build for production

```bash
npm run build
```
Output goes to `dist/`, ready to deploy to any static host (make sure
your backend's CORS settings allow that origin).

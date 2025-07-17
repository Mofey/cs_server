# Coming Soon Notification API

A simple Node.js/Express service that lets users subscribe their email for a “Coming Soon” landing page.  
It saves subscribers in a PostgreSQL database and sends email notifications (both admin alert and user confirmation) via Gmail SMTP.

---

## 📌 Features

- Accepts subscriber email via JSON POST  
- Inserts email into a PostgreSQL database (`subscribers` table)  
- Sends an admin notification email  
- Sends a welcome/confirmation email to the subscriber  
- Manual CORS middleware (configurable via environment variable)  

---

## ⚙️ Prerequisites

- Node.js v16+  
- npm or yarn  
- PostgreSQL database (e.g., Neon, Supabase, AWS RDS)  
- Gmail account with App Password enabled  

---

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Mofey/cs_server.git
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Create a `.env` file**

## 🧪 Environment Variables

Create a `.env` file in the root directory with the following:

```env
# Server
PORT=5000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# PostgreSQL
PGHOST=your-db-host
PGDATABASE=your-db-name
PGUSER=your-db-user
PGPASSWORD=your-db-password
PGPORT=5432

# Gmail SMTP (App Password required)
GMAIL_USER=your@gmail.com
GMAIL_PASS=your_app_password
```

---

## 🛢️ Database Setup

Ensure your PostgreSQL database has the `subscribers` table:

```sql
CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ▶️ Running the Server

```bash
npm run dev    # for development with hot reload
# or
npm start      # for production
```

Server will be available at `http://localhost:5000`.

---

## 📬 API Endpoints

### `POST /api/notify`

Saves an email to the database and sends confirmation/notification emails.

- **Request Body**

  ```json
  {
    "email": "user@example.com"
  }
  ```

- **Success Response**

  ```json
  { "success": true }
  ```

- **Error Responses**

  ```json
  { "error": "Email required" }
  ```

  ```json
  { "error": "Failed to save or send email" }
  ```

---

### `GET /`

Basic health check.

- **Response**

  ```
  🚀 Server is running!
  ```

---

## 🌐 CORS Configuration

This app uses a **manual CORS middleware**.  
Allowed origins must be listed in the `ALLOWED_ORIGINS` env variable, separated by commas.

---

## 📦 Deployment Notes (Vercel)

To deploy this on **Vercel**:

- Make sure your `app` is exported as default (done in the script).
- Add a `vercel.json` in your root:

  ```json
  {
    "version": 2,
    "builds": [{ "src": "index.ts", "use": "@vercel/node" }],
    "routes": [{ "src": "/(.*)", "dest": "/index.ts" }]
  }
  ```

- Add the required environment variables in your Vercel dashboard.

---

## 📄 License

MIT © [Mofey](https://github.com/Mofey)
# Production Deployment Guide (100% Lifetime Free Tier Stack)

This guide details how to launch the **Alternative Credit Intelligence Platform** in production using 100% lifetime-free hosting and database services.

---

## 🏛️ Architecture Overview

```mermaid
graph TD
    User([End User]) -->|Accesses Marketing/Landing| Landing[Vercel / Netlify Free Hosting]
    User -->|Accesses Dashboard App| Frontend[Vercel Next.js 15 Free App]
    Frontend -->|Queries API /api/*| Backend[Render Free Tier Web Service]
    Backend -->|Flexible Query| DB[(Neon Serverless Postgres / Supabase)]
    Backend -.->|Optional Document Store| Mongo[(MongoDB Atlas M0 Free Tier)]
```

---

## 1. 🗄️ Database Setup (Choose Your Lifetime-Free Database)

To ensure this app runs at zero cost forever, you can use either **Neon PostgreSQL** (serverless SQL, highly recommended) or **MongoDB Atlas** (NoSQL documents).

### Option A: Neon Serverless PostgreSQL (Recommended)
Neon.tech provides a serverless PostgreSQL database with a generous free tier of **0.5 GB storage**, active for life.

1. Go to [Neon.tech](https://neon.tech/) and sign up for a free account.
2. Create a new project named `Alternative-Credit-Intelligence`.
3. In the Neon Dashboard, copy the connection string from the **Connection Details** box. It will look like this:
   ```text
   postgresql://alex:abc123xyz@ep-cool-butterfly-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Keep this connection string ready. You will use it as the `DATABASE_URL` env variable.

### Option B: MongoDB Atlas Free Tier (M0 Sandbox)
MongoDB Atlas offers a **512 MB M0 Cluster** that is forever free and does not require a credit card.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register.
2. Select the **M0 Free Tier** cluster when creating a deployment.
3. Choose your preferred region (e.g., AWS / Mumbai or N. Virginia).
4. Create a database user (e.g., username: `aci-admin`, password: generate a secure one) and configure the IP access list to allow connection from anywhere (`0.0.0.0/0`) since Render uses dynamic IPs.
5. Retrieve your connection string. It will look like:
   ```text
   mongodb+srv://aci-admin:<password>@cluster0.abcde.mongodb.net/credit_scoring?retryWrites=true&w=majority
   ```
6. Set the `DATABASE_URL` environment variable using this string.

---

## 2. 🚀 Deploy the FastAPI Backend (Render Free Tier)

Render provides free hosting for web apps (with automatic spin-down after 15 minutes of inactivity).

### Step-by-Step Backend Deployment:
1. Push your repository to **GitHub** (private or public).
2. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
3. Select and connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `alternative-credit-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker` (Render will automatically read the `backend/Dockerfile`)
   - **Instance Type**: `Free`
5. Click **Advanced** and add the following **Environment Variables**:
   
   | Key | Value | Notes |
   |-----|-------|-------|
   | `ENVIRONMENT` | `production` | Enables production mode |
   | `API_PREFIX` | `/api` | Base routing prefix |
   | `DATABASE_URL` | *Your Neon or Mongo Connection String* | The database string from Step 1 |
   | `JWT_SECRET_KEY` | *Generates a 32-character random string* | Used to sign auth tokens |
   | `BACKEND_CORS_ORIGINS` | `https://alternative-credit-frontend.vercel.app` | Replace with your Vercel frontend URL |
   | `AUTO_CREATE_TABLES` | `True` | Initializes Neon tables on startup |
   | `ML_MODEL_DIR` | `app/ml/artifacts` | Path to ML models |
   | `ML_MODEL_VERSION` | `sprint2-credit-score-v1` | Version tag |
   | `ML_SYNTHETIC_TRAINING_ROWS` | `1200` | Mock data rows if retrained |
   | `ML_RANDOM_SEED` | `42` | Consistent ML results |

6. Click **Create Web Service**.
7. Render will pull the backend code, build the Docker container, spin up the service, and automatically initialize all database tables.

---

## 3. 🖥️ Deploy the Dashboard App (Vercel Free Tier)

Vercel is the premier platform for Next.js and has a 100% free Hobby tier with high performance.

### Step-by-Step Frontend Deployment:
1. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New > Project**.
2. Select your GitHub repository.
3. Configure the Project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
4. Add the following **Environment Variable**:
   
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://alternative-credit-backend.onrender.com/api` *(Use your actual Render URL)* |

5. Click **Deploy**. Vercel will build the Next.js bundle and publish your dashboard app to a premium, SSL-secured domain.

---

## 4. 🌐 Deploy the Stunning Landing Website (Vercel or Netlify Free)

To deploy the premium, animated HTML/CSS/JS marketing landing page we built in `website/index.html`:

### Option A: Hosting via Vercel (Recommended)
1. You can deploy the `website/` directory directly to Vercel as a static site.
2. In the Vercel Dashboard, click **Add New > Project**.
3. Select your GitHub repository.
4. Set the **Root Directory** to `website`.
5. Keep the build settings as default. Vercel will serve your gorgeous interactive credit scoring landing page statically, with superfast CDN performance.

### Option B: Hosting via Netlify
1. Log in to [Netlify](https://www.netlify.com/).
2. Select **Add new site > Import from Git**.
3. Choose the repository and set the base directory to `website`.
4. Click **Deploy** to go live!

---

## 🛠️ Verification & Initial Setup

Once both the frontend and backend are successfully deployed:
1. **Train the ML Model**: Since Render's build environment doesn't bundle the trained model state dynamically, run the initial model training.
   Make a `POST` request to:
   ```text
   https://your-render-backend-url.onrender.com/api/ml/retrain-model
   ```
   Or register a new user in the deployed app, upload a sample CSV statement, and the ML pipeline will auto-initialize!
2. Open your stunning landing page at `https://alternative-credit.vercel.app` (or Netlify URL), try out the interactive credit score calculator, and navigate to the dashboard app.

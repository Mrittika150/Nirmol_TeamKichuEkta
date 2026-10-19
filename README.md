# Nirmol

**A Bangla-first air quality platform for Bangladesh.**

Nirmol combines air quality forecasting, personalized exposure guidance, and citizen pollution reporting to help people make informed decisions about air pollution.

The project includes public environmental tools, optional authentication, protected user features, machine learning workflows, and community-driven pollution monitoring.

## Table of Contents

- [Project Overview](#project-overview)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Database and Feature Status](#database-and-feature-status)
- [Experimental Forecast Publisher](#experimental-forecast-publisher)
- [Dependency and Runtime Verification](#dependency-and-runtime-verification)
- [Data Attribution](#data-attribution)
- [Documentation](#documentation)

## Project Overview

Nirmol is designed to make environmental information more accessible through localized air quality insights and practical guidance.

Key components include:

- **Air Quality Forecasting:** Python-based data ingestion and hourly forecasting workflows.
- **Personalized Guidance:** Public-facing environmental advice through the AI-powered advisor.
- **Citizen Reporting:** Pollution reporting with a local backend and user interface.
- **Community Map:** Community pollution summaries and geographic visualization.
- **Authentication and User Settings:** Optional Supabase authentication and protected account features.

AI-powered reporting and advisor features are optional and disabled by default.

## Repository Structure

```text
web/                    Next.js application, public tools, authentication,
                        and protected My Nirmol features
jobs/                   Python ingestion and forecasting jobs
ml/                     Data audits, notebooks, and trained model artifacts
supabase/migrations/    Database schema migrations
.github/workflows/      Scheduled GitHub Actions workflows
docs/                   Project plans, implementation reports, and handoff docs
```

## Getting Started

### Prerequisites

- Node.js 22 or newer
- Python 3.14 for offline model verification
- npm
- Git

### 1. Run the Web Application

Navigate to the web application directory and install the dependencies:

```bash
cd web
npm ci
npm run dev
```

Open the local URL displayed in your terminal.

Public environmental tools can be accessed without creating an account.

### 2. Configure Optional Authentication

Authentication requires a valid Supabase project configuration.

1. Copy `.env.example` to `web/.env.local`, adjusting the source and destination paths as necessary for your working directory.
2. Configure the actual public Supabase URL and public client key.
3. Set `NIRMOL_SITE_URL` to the canonical application origin.

Production authentication requires an explicitly configured HTTPS origin.

Email confirmation, password recovery redirects, and browser-bound PKCE callbacks must be configured and verified separately.

**Google OAuth is deferred.** Google authentication setup and anonymous sign-in are not required for local development.

### 3. Database Migrations and Feature Setup

**Important:** Several migrations and external integrations remain unverified. Do not apply them directly to production.

| Migration | Feature | Status |
|---|---|---|
| `0002_forecast_publication.sql` | A06 atomic forecast publisher | Unverified; do not apply |
| `0003_account_settings.sql` | Account settings storage | Unapplied |
| `0004_reporting.sql` | F06 citizen reporting | Unapplied |
| `0005_community_moderation.sql` | Phase 3 community and moderation | Unapplied |
| `0006_advisor_quotas.sql` | F08 AI advisor quotas | Unapplied |

Before testing any migration, review its implementation and follow the relevant feature documentation. Use a disposable test environment and verify the schema, permissions, and required integrations before considering deployment.

**Do not bulk-apply migrations.** In particular, migration `0002_forecast_publication.sql` has not been verified against a disposable PostgreSQL database or the deployed schema.

Feature-specific requirements:

- **F06 — Citizen Reporting:** The local reporting backend and UI are implemented. Follow the [F06 reporting implementation guide](docs/f06-reporting-implementation.md) for the reviewed, disposable-environment-only setup.
- **Phase 3 — Community and Moderation:** Includes `/community` and `/moderation`. Review the [Community Map and Moderation guide](docs/community-map-moderation.md) for implementation contracts, verification steps, and secure test-reviewer provisioning.
- **F08 — AI Advisor:** The `/advisor` route provides public-facing advice. It requires a server-only Gemini API key, a guest-cookie secret, and a secure quota backend. The feature fails closed when its required quota infrastructure is unavailable. See the [F08 architecture and verification guide](docs/f08-ai-advisor.md).

Production enforcement for database access, storage, and external providers has not been fully verified. Local implementation and UI availability should not be interpreted as production readiness.

### 4. Verify the Forecasting Model Offline

The offline verification workflow uses the actual model artifacts and test fixtures without calling external providers or publishing forecasts.

Create and activate a Python 3.14 virtual environment, then install the hash-locked dependencies:

```bash
python -m venv .venv
```

Activate the environment using the appropriate command for your operating system. On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the dependencies and run the verification:

```bash
python -m pip install \
  --require-hashes \
  --only-binary=:all: \
  -r jobs/requirements.txt

python -B jobs/forecast_runtime.py
```

Run these commands from the repository root. The requirements file must contain compatible, hash-pinned dependencies for the selected Python environment.

This verification does not publish forecasts or validate external database configuration.

## Experimental Forecast Publisher

**Status: Disabled. Do not enable in integration or production environments.**

The A06 atomic publisher and `supabase/migrations/0002_forecast_publication.sql` have not been verified against a disposable PostgreSQL database or the deployed schema.

Keep the GitHub Actions repository variable `NIRMOL_ATOMIC_PUBLISHER_ENABLED` absent or set to `false`. Check organization, repository, and environment-level variable scopes to ensure that no higher-priority configuration enables publication unexpectedly.

For local development, Vercel, and other job environments, omit the variable or explicitly set it to `false`. It does not need to be added to `.env.example` or configured as a secret.

### Publisher Safeguards

- Both the Python command and direct `save()` calls require the exact process environment value `true`. All other values disable publication.
- The GitHub Actions workflow checks the repository variable and forwards its actual value to Python.
- Credentials alone do not enable forecast publication.
- `--dry-run` generates forecasts without database writes, but still fetches provider data.
- Publication failures do not fall back to the previous split-write implementation.
- Normal application reads and CAMS fallback do not require the publisher flag.

These safeguards do not verify external environment settings or establish that the publisher is production-ready.

Any future activation requires explicit approval and successful verification against a disposable PostgreSQL database and the intended schema.

## Dependency and Runtime Verification

Dependency security findings, Python 3.14 compatibility, hash-locked installation, offline model checks, and known verification limitations are documented in the [A12/A13 Engineering Report](docs/a12-a13-hardening.md).

These checks cover the documented local verification workflow. They do **not** authorize or enable the A06 forecast publisher.

## Data Attribution

Nirmol uses external environmental datasets and geographic resources under their respective terms.

- **Weather and Air Quality:** Data from [Open-Meteo](https://open-meteo.com/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- **Historical Training Measurements:** Data sources, including [OpenAQ](https://openaq.org/), are documented in the model evaluation and station audit.
- **Community Map Boundaries:** Uses a bundled country outline from [geoBoundaries](https://www.geoboundaries.org/) under CC0.
- **Map Background Tiles:** Optional [OpenStreetMap](https://www.openstreetmap.org/) tiles require appropriate attribution and compliance with the [OpenStreetMap Foundation Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/).

Street routing is not currently implemented.

## Documentation

For implementation details, verification procedures, and deployment constraints, consult the following project documents:

- [Project Plan](docs/plan.md)
- [Team Handoff and Deployment Notes](docs/team-handoff.md)
- [F06 Reporting Implementation](docs/f06-reporting-implementation.md)
- [Community Map and Moderation](docs/community-map-moderation.md)
- [F08 AI Advisor Architecture and Verification](docs/f08-ai-advisor.md)
- [A12/A13 Dependency and Runtime Hardening](docs/a12-a13-hardening.md)

---

*Development and deployment status should be assessed using the feature-specific verification documentation. Implemented functionality does not necessarily indicate that its database migrations, external integrations, or production deployment have been verified.*

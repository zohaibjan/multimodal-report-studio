# Multimodal Report Studio

A FastAPI and React reference application for turning audio notes and photographs into editable,
structured observations and Word reports. Local Whisper transcription, OpenAI text processing, filesystem uploads and SQLite audit storage.

## Workflow

Enter report details → upload or record audio → review the transcript → review extracted observations
and associate photographs → generate/download a DOCX report. Manual transcript entry is also available.
Legacy API field names are retained for compatibility; the public UI and examples use generic branding.

## Run locally

Requires Python 3.11+, Node.js 20+ and FFmpeg on PATH. Use your own service account.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
# Configure OPENAI_API_KEY and OPENAI_MODEL.
cd backend
python scripts/create_template.py
uvicorn main:app --host 127.0.0.1 --port 8000
```

In another terminal, from the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Use the local URL printed by Vite. The example API URL is `http://localhost:8000`.
Local Whisper audio processing requires FFmpeg and downloads the selected model on first use. Transcripts sent for summarisation go to OpenAI; this app is not entirely offline.
Keep credentials and private key files outside Git. The generic Word template is generated from
source; no private report binary is shipped. Example `DEMO-*` categories are invented and are not
regulatory standards. Review observations and references before using a report.

## Public scope and validation

The React UI, FastAPI routes, audio validation, reporting and service adapter are included.
Private photos, report templates, codebooks, organisation branding and deployment configuration
are excluded. Browser telemetry is disabled. SQLite data is created locally and excluded from Git.
The browser tour uses a synthetic placeholder where applicable.

```bash
# From backend/, after installing requirements:
pip install httpx
python -m unittest discover -s tests -v
# From frontend/:
npm run build
```

7 offline tests pass for report generation, template metadata and API/CSRF behavior plus upload-path containment.
The Vite production build passes. Real audio inference, photo inference, live service credentials,
and the full upload-to-report flow have not been validated against a live account in this release.
This is a local demo: bind the API to loopback. Add proper authentication, isolation, quotas and
retention controls before hosting it for multiple users. CSRF tokens are not user authentication.

## Public edition

This is a separately prepared portfolio edition with fresh history. Private deployment settings,
credentials, operational records, uploads, backups and organisation-specific assets are excluded.
See [PUBLIC_EDITION.md](PUBLIC_EDITION.md). No deployment workflows are included.

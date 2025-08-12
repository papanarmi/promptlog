# Security Hardening Summary and Next Steps

This document summarizes the security improvements applied to the app and outlines recommended next steps. It is intentionally ignored by Git to keep operational details private.

## Changes Implemented

- Environment protection
  - Added `.env*` ignores in `.gitignore` to prevent committing secrets.
  - Confirmed no service role or private keys are present in the client code.

- Browser-side auth hardening
  - Enabled PKCE flow for Supabase auth in `src/lib/supabaseClient.ts`:
    - `auth.flowType: 'pkce'` (stronger in-browser auth vs. implicit).

- Content Security Policy (CSP)
  - Injected a strict CSP meta tag in `index.html`:
    - Restricts `default-src`/`script-src` to `'self'`.
    - Allows fonts/styles only from Google Fonts.
    - Limits `connect-src` to Supabase domains (HTTP/WS) only.
    - Blocks `object-src`, frames, and restricts `base-uri` and `form-action`.
  - Added `meta name="referrer" content="no-referrer"`.

- Database hardening (Supabase)
  - Fixed advisor warning: set a fixed `search_path` on `public.update_updated_at_column`:
    - `alter function public.update_updated_at_column() set search_path to pg_catalog, public;`
  - Verified RLS-driven design remains intact for application tables.

- Dependencies
  - Ran `npm audit fix`; non-breaking advisories patched.
  - Remaining advisories suggest upgrading Vite to a newer major (breaking). Current tree uses `vite@5.4.19` with `esbuild@0.21.5`. Schedule a separate PR for major upgrades.

## What to Configure in Supabase (Console)

- Enable leaked password protection: see Supabase Auth settings.
- Enable and enforce MFA where appropriate.
- Review and enforce RLS for all tables accessed by the app. Ensure policies scope access by `auth.uid()`.
- Rotate keys periodically; never expose service role keys to the client.

## CSP Notes

- The current CSP allows connections only to Supabase (including WS). When deploying, update `connect-src`, `img-src`, etc., to include your CDN/domain as needed.
- Additional headers to set at the CDN/reverse proxy (server-side):
  - `Strict-Transport-Security` (HSTS)
  - `X-Content-Type-Options: nosniff`
  - `Permissions-Policy` (only required features)
  - `X-Frame-Options: DENY` (CSP `frame-ancestors 'none'` already covers)

## Operational Next Steps

1) Supabase console
   - Turn on leaked-password protection and MFA.
   - Confirm email templates and redirect URLs are correct.

2) App configuration
   - Prepare production `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` via secure CI/CD secrets.
   - Update CSP domains for production origin/CDN.

3) Database
   - Review RLS policies on all app tables (owner-only reads/writes as needed).
   - Keep `search_path` locked for all user-defined functions.

4) Dependencies
   - Plan a controlled upgrade to the latest Vite and React plugin.
   - Re-run `npm audit` regularly in CI and address new advisories.

5) Monitoring & incident response
   - Add logging/monitoring for auth errors and policy denials.
   - Document key rotation and incident response procedures.

## Quick Verification Checklist

- No private/service-role keys in the repo or client code.
- Build succeeds with CSP enabled.
- Auth works with PKCE and protected routes gate unauthenticated access.
- RLS blocks access when not authenticated and allows access for the owner.
- `npm audit` clean for non-breaking issues; plan upgrades for the rest.



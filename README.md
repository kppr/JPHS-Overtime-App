# JPHS Overtime — standalone Node.js app

This app runs on your own Node.js server. It does **not** run inside or require access to Google Sheets. SQLite stores overtime records, user access, month status, sessions and the audit trail. Google Identity Services supplies sign-in; the server verifies each Google ID token before granting a session.

## Workflow

| Role | Access |
| --- | --- |
| Employee | Their overtime entry form and counts of total, current-month and pending submissions. The assigned employee name, designation, department and manager appear automatically. |
| Manager | Mapped employees and their overtime entries; may correct a pending entry with a reason, approve, or disapprove with a reason. |
| HR | Reports by month, employee and department; user details and employee-to-manager mapping; corrections to manager-approved entries; month finalisation and reopening. |

Working-day extra time under 30 minutes yields zero. Eligible working-day minutes round to the nearest half hour. Sunday, weekoff, holiday and special designated days convert worked time at 8/6 and then round to the nearest half hour. Eight eligible hours equal one paid day. The app counts **pending and approved eligible hours** toward the 80-hour employee/month cap, and checks it in a SQLite write transaction. An entry at exactly 80 hours is permitted. Disapproved entries release capacity. Each entry must remain within a single month; split an overnight month-end interval.

## Setup

1. Install **Node.js 22 or later**. On a server with persistent disk, run `npm install` in this directory.
2. In Google Cloud Console, create a **Web application OAuth client ID**. Add the exact app origin (for example `https://overtime.jphschool.com`) to **Authorized JavaScript origins**. Configure the consent screen for your organisation. The app uses the Google Sign-In button and verifies the returned ID token on the server.
3. Copy `.env.example` to `.env`. Set `GOOGLE_CLIENT_ID` to that web client ID, `PUBLIC_ORIGIN` to the exact public origin **without a trailing slash**, and `BOOTSTRAP_ADMIN_EMAIL` to the HR Google email that will first sign in. Set `GOOGLE_HOSTED_DOMAIN` to your actual Workspace domain, or remove it if approved users legitimately belong to multiple domains. Protect the `.env` file.
4. Set `DB_PATH` to a location on **persistent disk**. Use HTTPS in production and put the Node app behind a reverse proxy such as Nginx. If the proxy terminates HTTPS, set `TRUST_PROXY=1`. Back up the SQLite database regularly; do not host it on ephemeral storage.
5. Run `npm start` and open `PUBLIC_ORIGIN`. Sign in using the bootstrap HR account. The first successful Google login creates that one HR account. Subsequent accounts must be added by HR under **User details**. Add each manager first, then each employee with their employee code and assigned manager. The 75 reference employee names/codes/categories are seeded only when the database is new. Fill missing designation and department in User details.

## Deployment and access notes

- The server's `GOOGLE_CLIENT_ID` must match the browser's client ID. Login rejects unverified Google IDs and, when configured, accounts without the required Google Workspace hosted-domain claim. Email must also match an active HR-managed user record. A Google account's stable `sub` is bound to that record at first successful login.
- Users need **only the web app URL**. They do not need access to a Google Sheet or SQLite file.
- Set `NODE_ENV=production` and `PUBLIC_ORIGIN=https://...` so the session cookie is marked `Secure`. Do not expose the app directly over public HTTP.
- No employee email or manager mapping was present in the source workbook. HR must verify these links. The app cannot verify a working-day punch is beyond a person's actual scheduled shift; managers must check the roster.
- Run `npm test` for the calculation rules. The full Google login and database workflow should be tested on the deployed server with one employee, manager and HR account before staff rollout.

## File layout

- `src/server.js`: HTTP API, Google login, session and CSRF handling.
- `src/service.js`: role checks, entry decisions, corrections, reports and month locks.
- `src/db.js`: SQLite schema and employee starter data.
- `src/rules.js`: overtime calculations and 80-hour cap.
- `public/`: standalone browser interface.
- `employee-seed.json`: names, codes and source categories extracted from the supplied workbook.

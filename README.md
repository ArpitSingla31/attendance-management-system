# Attendance Management System

## Start locally

1. In PowerShell, run `Copy-Item .env.example .env`. Edit `.env` in the project root and fill in the values. Keep `.env` private; it is ignored by Git.
2. In MongoDB Atlas, create a database user, grant it access to the `attendance` database, and allow your development IP in Network Access. Put the cluster URL in `MONGODB_URI` and the username/password in `MONGODB_USERNAME` and `MONGODB_PASSWORD`. This keeps reserved password characters out of the URI.
3. Generate two different random JWT secrets by running `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` twice. Put the two outputs in `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`. Do not reuse the MongoDB password.
4. Optionally provide `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, and `BOOTSTRAP_ADMIN_NAME` for the first startup. The server creates one Application Admin only when none exists. Remove the bootstrap password from `.env` after creation.
5. In Firebase Console → Authentication → Sign-in method, enable **Google** and **Phone**. Add `localhost` plus your deployed domain under Authorized domains, and configure the SMS region policy for the countries you support. Firebase phone auth uses reCAPTCHA and Firebase's SMS quota/billing rules.
6. The client values in `.env.example` are the public Firebase Web app config you supplied. For server token verification, create a Firebase service account key from Project settings → Service accounts. Save the JSON outside the repository and set `GOOGLE_APPLICATION_CREDENTIALS` to its path and `FIREBASE_PROJECT_ID=attendance-management-sy-7ed53`. Keep that private key out of Git and chat.
7. Start the API with `npm run server` and the UI in another terminal with `npm run dev`. Vite proxies `/api` calls to port 4000.

The API refuses to start if the database URI or JWT secrets are missing. Do not put database credentials or signing secrets in `VITE_*` variables: those values are exposed to browser users.

## Authentication and roles

- Password login by work email or assigned employee code and Employee self-signup are implemented. Signup always creates an Employee, even if a client submits another role.
- Continue with Google uses Firebase Authentication. New Google accounts become Employees; an existing account is linked only after Firebase verifies the same email. The backend validates the Firebase ID token with Firebase Admin before issuing the app's HttpOnly cookies. Firebase browser persistence is memory-only; the Firebase ID token is not stored in local storage.
- Mobile OTP uses Firebase Phone Authentication and reCAPTCHA. Enter numbers in international format such as `+919876543210`; new phone-only accounts need a name and are created as Employees. Firebase verifies the SMS code; the backend verifies the resulting Firebase ID token before issuing app cookies.
- Passwords are hashed with bcrypt. Email is normalized to lowercase and protected by a unique database index; duplicate accounts return HTTP 409.
- Access JWTs last 15 minutes. Rotating refresh JWTs last 7 days. Both are HttpOnly cookies; the browser never reads or stores either token in local storage. Refresh-token hashes are stored in MongoDB, and logout revokes the active refresh token.
- Cookie attributes use `SameSite=Lax`; production cookies use `Secure`. Keep the browser and API on the same site (or add a deliberate CSRF strategy before moving them to different sites).
- Role ladder: Employee → Manager → Organization Admin → Application Admin. Organization Admins can assign Employee or Manager roles to users in their organization. Application Admins can assign any role. Access checks also run in the API.
- Every signup starts as an Employee. To sign in as a Manager, create their account first; an Application Admin or Organization Admin then opens **Staff & access**, changes the account's role to Manager, and assigns employees to that manager. Sign out and sign back in after the role change. Login has no role selector, so users cannot grant themselves privileges.
- Staff & access also saves a position (for example, cleaner, server, office assistant, or supervisor), employment type (full-time, part-time, contract, temporary, daily wage, intern, or support staff), optional employee code, and reporting manager. Position and employment type describe the job; role controls system permissions.
- Employees with a manager assigned can submit leave from **Apply for Leave**. The form confirms it was sent and shows a request ID; **My requests** stores its Pending, Approved, or Rejected status and the approver. Managers see requests assigned to them in **Team Approvals** and the Manager Dashboard. Only the assigned manager, an in-scope Organization Admin, or an Application Admin can decide a pending request. Changing an employee's manager affects new requests; a request already sent remains with its original approver.
- The **Holiday Calendar** includes Haryana 2026 public holiday dates as references and combines them with organization-specific dates. Confirm which dates your workplace observes; Organization Admins and Application Admins can add company dates. Diwali 2026 is shown as a festival date falling on Sunday, not as an extra workday closure.
- Managers set a team shift start, end, and grace period on their Manager Dashboard, and can override the schedule for each assigned employee. Employees use their personal schedule when set, otherwise their manager's team schedule, otherwise `ATTENDANCE_SHIFT_START` (`09:30`), `ATTENDANCE_SHIFT_END` (`18:00`), and `ATTENDANCE_GRACE_MINUTES` (`15`) in `ATTENDANCE_TIME_ZONE` (`Asia/Kolkata`). An end time earlier than the start means the shift ends the following day. The live indicator shows neutral **Before shift**/**After shift** outside the scheduled window; during the window, on-time is green, the grace period is yellow, and late is red. Attendance history keeps the schedule used when each punch was recorded.
- To create a first Manager from `.env`, set `BOOTSTRAP_MANAGER_NAME`, `BOOTSTRAP_MANAGER_EMAIL`, `BOOTSTRAP_MANAGER_PASSWORD` (10–128 characters), and optionally `BOOTSTRAP_MANAGER_EMPLOYEE_CODE`, then start the API once. Use that email or employee code plus password at the sign-in screen. These variables only create a Manager if that email is not already registered; an existing account must be promoted by an Application Admin. Remove bootstrap values after setup. A MongoDB manager `_id` is not a login credential.
- **Attendance Log** saves one check-in and check-out record per employee per work date. The default work date/time zone is `Asia/Kolkata`; set `ATTENDANCE_TIME_ZONE` in the server `.env` to your office’s IANA zone if needed. Managers see their assigned reports; administrators see their permitted organization scope. This records manual web punches; it is not connected to biometric hardware, GPS, payroll, or shift rules.
- Phone OTP uses one reusable invisible reCAPTCHA verifier during the sign-in screen lifetime. Firebase Console must have Phone enabled, the app domain authorized, and SMS allowed for your region. Firebase test phone numbers can be configured there for development. The application cannot make Firebase send an SMS if the Firebase project, domain, SMS quota, or billing/region settings reject it.
- Email OTP needs an email delivery provider and verified sender; additional passwordless sign-in needs an identity provider; biometric sign-in should use WebAuthn/passkeys and a server challenge, never a browser fingerprint or raw biometric data.
- Multi-organization provisioning/invitations are not built yet. Add an organization and membership/invitation flow before using Organization Admin for more than one tenant.

## API and Postman

Import `postman/Attendance API.postman_collection.json` into Postman. Use the collection variables to set the API URL and test-account credentials. Postman keeps the HttpOnly cookies in its cookie jar automatically.

Endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API status |
| POST | `/api/auth/signup` | Create an Employee account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/firebase` | Verify a Firebase Google or phone ID token and issue app cookies |
| POST | `/api/auth/refresh` | Rotate session tokens |
| POST | `/api/auth/logout` | Revoke refresh token and clear cookies |
| GET | `/api/auth/me` | Current account (access cookie required) |
| GET | `/api/admin/users` | List users (Organization Admin or Application Admin) |
| PATCH | `/api/admin/users/:id/role` | Assign a role subject to the caller's authority |
| PATCH | `/api/admin/users/:id/work-profile` | Set position, employment type, employee code, and reporting manager |
| GET / POST | `/api/leaves` | View scoped leave requests / submit a leave request |
| PATCH | `/api/leaves/:id/decision` | Approve or reject a pending request within the caller's scope |
| GET | `/api/holidays` | View shared company holidays |
| POST | `/api/holidays` | Add a holiday (admin only) |
| DELETE | `/api/holidays/:id` | Remove a holiday (admin only) |
| GET | `/api/attendance` | View attendance records within the caller's scope |
| POST | `/api/attendance/check-in` | Record today's check-in |
| POST | `/api/attendance/check-out` | Close the open attendance record |
| GET / PATCH | `/api/manager/shift-settings` | View or update a Manager’s team shift schedule |

The Postman collection checks signup, attempted role escalation, duplicate signup, session refresh, login, invalid password, and Employee denial from an admin endpoint. Create a manager and both admin roles through the admin UI/DB when running the additional authorization matrix. Never test using production accounts.

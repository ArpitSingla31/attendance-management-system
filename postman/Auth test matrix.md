# Authentication and authorization test matrix

Run these only against a disposable development database. The collection in this folder automates the basic Employee flow; use a separate Postman environment for admin accounts and never export cookie values.

## Signup and login

| Case | Expected result |
| --- | --- |
| Valid signup | `201`, Employee role, HttpOnly access and refresh cookies |
| Submit `role: Application Admin` during signup | Still `201` as Employee |
| Duplicate email with changed letter case | `409`, no second user |
| Invalid email, blank/short name, password under 10 or over 128 chars | `400`, no user created |
| Correct password | `200`, same safe user shape; no password/hash/token in JSON |
| Wrong password and unknown email | Same generic `401` response |
| Disabled account | `401` |
| Repeated login attempts | Rate limited after configured threshold |
| Firebase Google sign-in with a verified account | `200`, Employee for new users, app cookies issued only after Firebase Admin verification |
| Unverified Google email, invalid/expired/revoked ID token, or token from another Firebase project | Rejected; no session cookies |
| Google login for an existing password account with the same verified email | Account is linked to that Firebase UID, then signed in |
| A different Firebase UID is already linked to that email | `409`; no account takeover |
| New Google account submits an elevated role in profile/token data | Created as Employee |
| Phone OTP with a valid E.164 number and correct SMS code | Firebase verifies it; app session is issued after backend ID token verification |
| Wrong/expired code, malformed phone number, blocked reCAPTCHA, or SMS quota reached | No app session; show recoverable error or Firebase's rate-limit response |
| New phone number | Name is required; a phone-only Employee account is created without a fabricated email |
| Existing phone account | Phone number is already verified by Firebase; successful sign-in does not change its role |

## Cookies and session lifetime

| Case | Expected result |
| --- | --- |
| Login/signup response | Both cookies have `HttpOnly`; refresh cookie is scoped to `/api/auth`; production cookies also have `Secure` |
| Access cookie sent to `/api/auth/me` | `200` and safe user |
| No cookie, malformed access token, or expired access token | Protected route returns `401` |
| Valid refresh cookie | `200`, new access and refresh cookies; prior refresh token is no longer accepted |
| Missing/expired/replayed refresh cookie | `401` and cookies cleared |
| Logout | `204`; refresh token revoked in DB; later refresh returns `401` |
| Access after logout | Existing access token may remain valid for up to its 15-minute expiry; refresh is revoked immediately |

## Role authorization

Create one account for each role. Promote test users with the Application Admin, then log in as each role before running its row. The API is authoritative; hiding a menu item is not a security boundary.

| Role | `/api/admin/users` | Role assignment |
| --- | --- | --- |
| Employee | `403` | `403` |
| Manager | `403` | `403` |
| Organization Admin | `200`, users in its organization only | Can assign Employee or Manager; cannot assign either admin role |
| Application Admin | `200`, all users | Can assign all four roles |

Also verify unknown role gives `400`, out-of-organization target gives `404`, and missing/invalid auth gives `401`. Try to promote during public signup and to change role by editing browser state; neither may grant privileges. Test a role change against a previously issued access token and confirm updated privileges take effect after refresh/access expiry (access JWTs last at most 15 minutes).

## Limits of this run

The app currently has no email sender, SSO provider, OTP provider, WebAuthn setup, or multi-tenant invitation flow. OTP delivery, identity-provider callback failures, passkey enrollment/replay, and organization boundary cases need those integrations before they can be exercised. The Atlas URI supplied so far contains a placeholder password, so live database cases cannot pass until a real URI is put into local `.env` and Atlas allows the development IP.

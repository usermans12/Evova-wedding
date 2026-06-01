# Security Specification & Threat Model (TDD)

## 1. Data Invariants
*   **Client Records Separation**: A client can only read, create, or update their own account details (`/clients/{clientId}`).
*   **Wishes Authenticity**: Submitting a wish/RSVP (`/clients/{clientId}/wishes/{wishId}`) must ensure that the containing client exists and the status of the client is not suspended (`/clients/{clientId}`).
*   **Temporal and System Fields integrity**: `createdAt` timestamps cannot be changed, and admin-only settings cannot be bypassed by regular users.
*   **Public Access**: Public guests can read client wedding metadata if the client's account is verified and active (`status == 'active'` and `visibility == 'public'`).
*   **No Unsigned Updates**: Unauthorized anonymous guest or non-owner cannot overwrite client metadata.

## 2. "Dirty Dozen" Threat Payloads (Targeting Firestore)
These payloads are designed to challenge our Zero-Trust Firestore Security model and must fail with `PERMISSION_DENIED`:

1.  **Identity Spoofing (Client Profile Creation as another user)**
    *   *Target URL*: `/clients/hacker_uid`
    *   *Payload*: `{ "id": "hacker_uid", "name": "Hack", "username": "hack", "email": "admin@evova.com", "status": "active", "slug": "admin-hack", "createdAt": "2026-05-31T00:00:00Z" }`
    *   *User Context*: Authenticated as `victim_uid` targeting `hacker_uid` profile, or setting owned/creator field spoofing.
2.  **Privilege Escalation (Self-activating suspended account)**
    *   *Target ID*: `/clients/victim_uid`
    *   *Payload*: `{ "status": "active" }` (Affecting field `status` directly while suspended and attempting update)
3.  **Resource Poisoning (Overly large string injection)**
    *   *Target ID*: `/clients/victim_uid/wishes/over_size_wish`
    *   *Payload*: `{ "id": "over_size_wish", "name": "A" * 100000, "wish": "Congratulations!", "attendance": "Hadir", "createdAt": "2026-05-31T00:00:00Z" }`
4.  **Malicious Path Injection (Overriding templates collection)**
    *   *Target ID*: `/templates/tpl-blue-hydrangea`
    *   *Payload*: `{ "isActive": false, "name": "Malicious Theme Override" }`
    *   *User Context*: Authenticated as ordinary client (not admin / superadmin).
5.  **Audit Log Forgery (Deception)**
    *   *Target ID*: `/logs/fake_log_id`
    *   *Payload*: `{ "activity": "Backdoor injected successfully", "status": "SUKSES", "userName": "superadmin" }`
    *   *User Context*: Unauthenticated or regular authenticated client.
6.  **Immutable Bypass (Updating createdAt value)**
    *   *Target ID*: `/clients/victim_uid`
    *   *Payload*: `{ "createdAt": "2010-01-01T00:00:00Z" }`
7.  **Private Data Extraction (Reading private client profile of another owner)**
    *   *Target ID*: `/clients/private_client_uid`
    *   *User Context*: Authenticated as `attacker_uid`.
8.  **Guest Spam (Creating wish under suspended client)**
    *   *Target ID*: `/clients/suspended_client_uid/wishes/wish_spam`
    *   *Payload*: `{ "id": "wish_spam", "name": "Spammer", "wish": "Ad-link spam", "attendance": "Hadir", "createdAt": "2026-05-31T00:00:00Z" }`
9.  **Vague Wish (Schema Violation)**
    *   *Target ID*: `/clients/active_client_uid/wishes/vague`
    *   *Payload*: `{ "id": "vague", "name": "John", "wish": "Yo", "attendance": "Mungkin" }` (Invalid enum for attendance)
10. **State short-circuit (Manually updating visibility fields to bypass packages)**
    *   *Target ID*: `/clients/victim_uid`
    *   *Payload*: `{ "visibility": "public" }` while the package should lock it.
11. **Malicious Client ID format**
    *   *Target ID*: `/clients/some_invalid-characters!!!`
12. **Blanket Query Scraping without filters**
    *   *Query*: Reading `/clients` collection without passing specific `userId` or `slug` filter criteria.

## 3. Red Team Test Runner Blueprint
```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe("Zero-Trust Firestore Rules TDD", () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "evova-wedding-digital"
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it("should block identity spoofing (hacker altering victim profile)", async () => {
    const hackerDb = testEnv.authenticatedContext("hacker_uid").firestore();
    await assertFails(hackerDb.doc("clients/victim_uid").set({
      id: "victim_uid",
      name: "Spoofed",
      email: "victim@example.com"
    }));
  });
});
```

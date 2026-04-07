# WedPass Backend

Simple NestJS backend for:

- creating events
- registering invitees
- checking invitees in with an access code
- showing event metrics for the host dashboard

## 1. Folder structure first

```text
src/
  common/
    controllers/
      app.controller.ts
    utils/
      code-generator.ts
  modules/
    events/
      dto/
        create-event.dto.ts
      schemas/
        event.schema.ts
      events.controller.ts
      events.module.ts
      events.service.ts
    invitees/
      dto/
        create-invitee.dto.ts
      schemas/
        invitee.schema.ts
      invitees.controller.ts
      invitees.module.ts
      invitees.service.ts
    check-in/
      dto/
        check-in.dto.ts
      check-in.controller.ts
      check-in.module.ts
      check-in.service.ts
    metrics/
      metrics.controller.ts
      metrics.module.ts
      metrics.service.ts
  app.module.ts
  main.ts
```

## 2. How the backend is designed

### Event module

This handles the host creating an event.

When an event is created, the backend also generates:

- `inviteeToken`: used to build the invitee form link
- `usherToken`: used to build the protected usher link

### Invitee module

This handles the invitee filling the public form.

When the invitee submits their name:

- the backend checks the invitee link token
- the backend checks the event guest limit
- the backend creates a unique `accessCode` like `ABC-1234`

### Check-in module

This is the main feature for ushers.

The frontend sends:

- the invitee `accessCode`
- the usher token in the request header

The backend then returns:

- `invalid`
- `already_checked`
- or `valid`

### Metrics module

This gives the host dashboard simple event numbers:

- total invitees
- checked-in count
- remaining count

## 3. Environment variables

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/wedpass
FRONTEND_BASE_URL=http://localhost:3001
```

## 4. Run the project

```bash
npm install
npm run start:dev
```

Base URL:

```text
http://localhost:3000/api
```

## 5. API step by step

### A. Create event

`POST /api/events`

Request:

```json
{
  "name": "David & Sarah Wedding",
  "date": "2026-12-20T10:00:00.000Z",
  "guestLimit": 300
}
```

Response:

```json
{
  "message": "Event created successfully",
  "eventId": "67ec0f0a6b0f75a1f2f8c001",
  "name": "David & Sarah Wedding",
  "date": "2026-12-20T10:00:00.000Z",
  "guestLimit": 300,
  "inviteeLink": "http://localhost:3001/invite/abc123inviteetoken",
  "usherLink": "http://localhost:3001/usher/xyz987ushertoken"
}
```

Simple meaning:

- host creates event
- backend returns the event details
- backend also returns the 2 links the frontend can use

### B. Register invitee

`POST /api/invitees`

Request:

```json
{
  "inviteeToken": "abc123inviteetoken",
  "name": "John Doe"
}
```

Response:

```json
{
  "message": "Invitee registered successfully",
  "inviteeId": "67ec0f3a6b0f75a1f2f8c020",
  "eventId": "67ec0f0a6b0f75a1f2f8c001",
  "name": "John Doe",
  "accessCode": "ABC-1234"
}
```

Simple meaning:

- the invitee opens the public invitee link
- enters their name
- backend creates their access code

### C. Check in invitee

`POST /api/check-in`

Headers:

```text
x-usher-token: xyz987ushertoken
```

Request:

```json
{
  "accessCode": "ABC-1234"
}
```

If code is valid:

```json
{
  "status": "valid",
  "message": "valid",
  "name": "John Doe"
}
```

If code does not exist:

```json
{
  "status": "invalid",
  "message": "invalid"
}
```

If code was already used:

```json
{
  "status": "already_checked",
  "message": "code used",
  "name": "John Doe"
}
```

Simple meaning:

- usher enters or scans the access code
- backend checks if the code exists
- backend checks if the code was already used
- backend marks the invitee as checked in if valid

### D. Get metrics

`GET /api/metrics/:eventId`

Example:

`GET /api/metrics/67ec0f0a6b0f75a1f2f8c001`

Response:

```json
{
  "eventId": "67ec0f0a6b0f75a1f2f8c001",
  "totalInvitees": 120,
  "checkedInCount": 84,
  "remainingCount": 36
}
```

Simple meaning:

- host dashboard calls this endpoint
- backend returns the numbers needed for the UI

## 6. How Next.js should call check-in

Simple frontend example:

```ts
async function checkInGuest(accessCode: string, usherToken: string) {
  const response = await fetch('http://localhost:3000/api/check-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-usher-token': usherToken,
    },
    body: JSON.stringify({
      accessCode,
    }),
  });

  return response.json();
}
```

Example usage:

```ts
const result = await checkInGuest('ABC-1234', usherToken);

if (result.status === 'valid') {
  console.log(`Welcome ${result.name}`);
}

if (result.status === 'already_checked') {
  console.log('This code has already been used');
}

if (result.status === 'invalid') {
  console.log('Invalid code');
}
```

## 7. Why this structure is clean

- each feature has its own module
- each module has its own controller and service
- schemas stay close to the feature that uses them
- shared helpers stay in `common`
- no microservices
- no unnecessary abstraction

This is simple enough to grow later without becoming messy.

## 8. What to do next anytime you want to create a backend

Use this order:

1. Write the main features first.
2. Split the features into modules.
3. Create the schema for each main resource.
4. Write the service logic before writing too much controller code.
5. Keep controllers thin and let services do the real work.
6. Add simple validation early.
7. Test the main flow first, not every tiny detail first.
8. Add auth, logging, and rate limiting when the core flow already works.

Simple mindset:

- start small
- keep one responsibility per module
- only add complexity when the product actually needs it

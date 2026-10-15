# CS440 NoSQL injection lab

This local teaching lab reproduces query-operator injection and compares five configurations. It uses synthetic accounts and two dedicated MongoDB instances. The hardened path validates the credential contract and checks salted scrypt hashes in a separate account collection.

## Verified environment

MongoDB 7.0.0, Node v23.6.1, Express 5.1.0, MongoDB driver 6.20.0, macOS arm64. The installed MongoDB 7.0.0 binary supplies the recorded teaching environment. This old patch is not a deployment recommendation. Other versions need their own recorded test run.

The native start and test path was executed here. Docker was not running and is not required. A second physical machine has not been tested.

## Start

Install Node.js and a compatible local MongoDB server binary first. The `mongod` executable must be on PATH. The source uses Node >=20. To reproduce the exact captured environment, match the recorded versions.

Open a terminal in this folder:

```sh
npm ci
npm start
```

Wait for `LOCAL LAB READY`, then open [the local lab](http://127.0.0.1:4400).

On a teammate machine, `npm ci` downloads only the packages pinned by package-lock.json. The application uses Node's built-in scrypt and does not require a native password-hashing package.

The runner starts only its own database processes, using `.state/main` and `.state/noscripting`. It binds database ports 54171 and 54172 and app port 4400 to 127.0.0.1. It enables MongoDB authentication and generates local service credentials in `.state`, with restricted file permissions. Existing database services are not reused. Stop the foreground runner with Ctrl+C.

If `mongod` is elsewhere, set `MONGOD_BINARY` to its executable path before starting. If a required port is occupied, stop the conflicting copy of this lab or choose an available environment. Do not point the lab at an existing database.

## Run the experiments

Keep the first terminal running. In a second terminal in this folder:

```sh
npm test
```

The experiment runner checks 15 credential cases across five modes, twice. For every login it checks the status, session decision, selected account where deterministic, actual find-command count and protected access. It separately checks that scripting-disabled MongoDB rejects a harmless `$where` predicate and that the read-only account cannot insert a synthetic record. It also checks malformed JSON and requests with a disallowed Origin.

The recorded run passes 150 login configuration/case checks, 150 protected-access checks and 10 additional HTTP checks. It also checks the database controls and absence of plaintext passwords in `accounts_hashed`.

Results are written to `evidence/results.json` and `evidence/results.csv`. A test failure stops the run. Preserve a failing output for investigation rather than reporting success from an earlier file.

## Configurations

| Mode ID | Behaviour |
|---|---|
| `baseline` | Deliberately unsafe credential predicate and session on match |
| `noscripting` | Same toy code, different database instance with `--noscripting` |
| `readonly` | Same toy code, database account with the lab database's `read` role |
| `validated` | Credential contract enforcement, followed by the same toy query |
| `hardened` | Credential contract, username lookup in hash-only records, separate password verification |

The validated contract enforces exactly the username and password fields, non-empty strings, and length limits. For C04, only the password's object type violates that contract. Comparing validated mode with baseline isolates rejection of that object. Comparing the full hardened mode changes additional design elements.

The lab deliberately retains a plaintext `users` collection for reproduction. The `accounts_hashed` collection contains no plaintext password field. A production system would remove the toy collection and the vulnerable routes entirely.

## Demo fixtures

Wrong password:

```json
{"username":"alice","password":"wrong-password"}
```

Operator object:

```json
{"username":"alice","password":{"$ne":""}}
```

Valid synthetic credentials:

```json
{"username":"alice","password":"Alice-Lab-Only-440!"}
```

Operator-looking text:

```json
{"username":"alice","password":"{\"$ne\":\"\"}"}
```

The browser has preset buttons for these requests. It displays the redacted predicate, session decision and synthetic protected note. On every new login attempt the app revokes the old session, so an earlier successful login cannot make a rejected request appear to authenticate.

## Reset and stop

Every start reseeds the two dedicated lab databases. While the service runs, `npm run reset` resets only the lab's synthetic `users` and `accounts_hashed` collections. Reload the browser and use Clear session before rehearsal.

Ctrl+C in the start terminal shuts down the app and the database child processes. You may delete this package's `.state` directory after stopping the lab if you want a completely fresh local lab state. Its credentials and database files are generated test data.

## Evidence and scope

The requests log redacts ordinary password strings and retains the operator object's structure. Results include environment metadata and authenticated role identities, but omit service-account secrets and stored hashes.

Recorded results establish this local application mechanism. They do not measure deployed prevalence, demonstrate a MongoDB server defect, establish arbitrary administrator access, or certify complete production security. The app uses HTTP on loopback and an in-memory session store for classroom use. It has no deployment claim.

## Presentation preparation

Run the lab on the presentation machine before class. Confirm both positive and negative controls, then leave it running. Keep the slide deck and offline demo backup open locally. The first startup performs memory-hard password hashing and should finish before the talk begins.

Do not copy `.state`, `.npm-cache` or `node_modules` into a shared submission. Share the supplied source, lockfile and redacted evidence. The project ZIP excludes those generated directories.

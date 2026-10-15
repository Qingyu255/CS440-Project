# CS440 NoSQL Injections: Q&A defence pack

Use the short answer first. Add the technical follow-up only when the question needs it. Everyone should be able to explain the complete request-to-session mechanism, even when another member presents that slide.

The evidence in this pack comes from `nosql-lab/evidence/results.json` and the supplied source. The experiment covers MongoDB 7.0.0, Node v23.6.1, Express 5.1.0 and MongoDB driver 6.20.0. It contains 15 request cases across five configurations, repeated twice. Each login observation has a protected-endpoint check. The independent scripting and database-permission probes confirm the control configurations.

## 1. Why can valid JSON be dangerous?

**Short answer:** Valid JSON establishes syntactic validity. Our login contract needs credential strings. An object containing a query operator violates that contract even though the parser accepts it.

**Technical follow-up:** `express.json` produces a JavaScript object. The vulnerable application directly supplies its `password` value to a MongoDB filter. MongoDB interprets the nested `$ne` as a predicate. The breach happens where the application promotes client input into query structure.

**Evidence:** C04 succeeds in the toy modes. C06, which supplies operator-looking text as a string, fails to authenticate.

## 2. Does using a native database driver prevent injection?

**Short answer:** The driver serialises the filter the application gives it. The application still needs to control which values and operators enter that filter.

**Technical follow-up:** A structured filter avoids some string-concatenation errors. However, a nested client-supplied object can already represent an operator. Our code passes that object intact. A different driver or ODM may apply casting or validation, so its behaviour needs separate testing. [OWASP NoSQL guidance](https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html).

## 3. Is this a vulnerability in MongoDB itself?

**Short answer:** Our experiment demonstrates unsafe application use of a supported query operator.

**Technical follow-up:** The server executes the predicate correctly. The application expected a literal password value and accepted a predicate instead, then used the result as proof of identity. We have not demonstrated a defect in MongoDB's query engine.

## 4. What exactly does `$ne: ""` do?

**Short answer:** It matches a field whose value differs from the empty string. It can also match documents lacking that field.

**Technical follow-up:** In C04, the username is the literal unique value `alice`, and her seeded password is non-empty. Both conditions match. We make no claim that this condition is true for every record or every dataset. BSON types and missing-field semantics also matter. [MongoDB `$ne` documentation](https://www.mongodb.com/docs/manual/reference/operator/query/ne/).

## 5. How do you know the attack selects Alice?

**Short answer:** Her username remains a literal equality condition, and the collection enforces unique usernames.

**Technical follow-up:** The attack changes only the password predicate. Broad predicates in both fields may match several records. `findOne` returns a match without guaranteeing that it is an administrator. C13 records the actual selected account but does not claim arbitrary account selection.

## 6. Why does the demonstration use plaintext passwords?

**Short answer:** The deliberately vulnerable collection makes the credential-query mechanism visible. We label that teaching simplification and keep the final path in a separate hash-only collection.

**Technical follow-up:** `users` contains the toy plaintext records. `accounts_hashed` contains salted hashes and no plaintext password field. Our automated checks verify that separation. The hardened path fetches by username and then verifies the password independently.

**Boundary:** Plaintext credential storage is not a production recommendation. [OWASP Password Storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

## 7. Would correct password-hash verification stop this bypass?

**Short answer:** Yes, for this illustrated password-filter bypass. The app must verify that the supplied password corresponds to the selected account's hash before creating a session.

**Technical follow-up:** Our hardened path rejects the object before lookup. Valid strings reach the password verifier. Correct credentials succeed and wrong credentials fail. Hash verification does not establish the safety of unrelated search, authorisation or update queries.

## 8. Why use scrypt rather than a fast hash?

**Short answer:** Password storage needs a salted, deliberately expensive password-hashing scheme. A fast digest allows much faster offline guessing.

**Technical follow-up:** The lab uses Node's built-in scrypt with N=131072, r=8 and p=1, a fresh 16-byte random salt and a 64-byte output. This avoids an additional native dependency while using OWASP's documented scrypt parameter baseline. The verifier compares equal-length derived keys with `timingSafeEqual`. The broader deployment still needs account, session and abuse controls. [OWASP Password Storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

## 9. Does disabling server-side JavaScript stop the attack?

**Short answer:** It did not stop C04. The attack uses a normal query operator.

**Technical follow-up:** We separately tested a harmless `$where` expression. It succeeds on the scripting-enabled instance and fails with error 6108304 on the instance launched with `--noscripting`. The runner requires that specific MongoDB error. Unexpected execution, network failures, unrelated database errors and assertion failures make the check fail. This confirms that scripting was actually disabled. C04 still creates an Alice session on that instance.

**Evidence:** Appendix 19 and `controls.noscripting` in results.json.

## 10. Does read-only database access prevent false authentication?

**Short answer:** It did not prevent this failure, which needs a read and an incorrect application decision.

**Technical follow-up:** The `labreader` account has the `read` role on the dedicated lab database. A synthetic insert fails with error 13, Unauthorized. A users-collection lookup is allowed. The app can therefore make a false identity decision from a permitted read. Limiting database privileges remains valuable because it constrains other possible effects. [MongoDB role documentation](https://www.mongodb.com/docs/manual/reference/built-in-roles/).

## 11. Would TLS or encryption prevent this injection?

**Short answer:** TLS protects traffic in transit. The application must still enforce its credential contract after receiving that traffic.

**Technical follow-up:** An attacker can submit the same malicious object over an encrypted connection. Encryption does not decide whether an input may represent a database predicate. Our experiment does not compare transport-encryption configurations.

## 12. Why not remove every dollar sign?

**Short answer:** This login endpoint has a simple input contract: exactly the allowed credential fields, with string values and specified lengths. Enforcing that contract is more precise than rejecting characters across an arbitrary serialised request.

**Technical follow-up:** A legitimate password could contain a dollar sign as a literal character. C06 establishes the distinction between operator syntax as an object and operator-looking text as a string. More expressive APIs need field and operator policies suited to their business requirements.

## 13. Does every browser login form produce this object?

**Short answer:** No. Parsing and content type determine the value the application receives.

**Technical follow-up:** Our endpoint receives `application/json` and uses `express.json`. A regular text input may produce only a string. Attackers can send an HTTP request directly, so the server must enforce the contract even when the UI normally supplies strings. PHP array parsing in the assigned paper is a different input path into an analogous trust-boundary failure.

## 14. What did the experiment actually hold constant?

**Short answer:** The request fixtures, synthetic account data, application stack and intended login behaviour. We varied the selected defence configuration.

**Technical follow-up:** Scripting-disabled mode uses a separate instance of the same installed MongoDB binary and the same seeded records. Read-only mode changes the service account on the main instance. Validated mode adds the credential contract to the toy query. Hardened mode also uses a hash-only account lookup and separate verification.

**Limit:** The full hardened path changes several design elements. We use the validation-only comparison to isolate the request contract for C04. We cannot attribute every difference in the complete path to a single change.

## 15. How do you know rejection happened before a database query?

**Short answer:** We count real MongoDB `find` command events associated with the request's unique comment ID.

**Technical follow-up:** The validation branch returns before filter construction. The response records zero `findCommands`, and the test asserts that count. The vulnerable C04 requests record one. This count concerns the login's `find` operation, rather than every background driver command.

## 16. What does repeating the test twice establish?

**Short answer:** The two passes agree within this environment and the supplied fixtures.

**Technical follow-up:** They give evidence of reproducibility, not a statistical attack-success rate across deployed applications. Fifteen cases across five modes and two runs produce 150 login observations. Each has a protected-access check. Ten additional HTTP checks cover malformed JSON and disallowed origins.

**Limit:** We have not independently run the package on a second physical machine. The teammate run is a remaining rehearsal gate, with instructions supplied.

## 17. What is original in your project?

**Short answer:** The implemented local lab, controlled comparison, captured evidence and reasoned assessment of the mechanism and controls.

**Technical follow-up:** We cite the existing attack and describe the work as a reproduction and extension. We did not discover a new vulnerability. The value comes from testing concrete claims and explaining why superficially relevant controls have different effects.

## 18. Why use an article from 2016?

**Short answer:** It supplies the assigned foundation and illustrates a durable application trust-boundary problem. We distinguish its historical examples from our tested environment and current documentation.

**Technical follow-up:** Our local reproduction uses MongoDB 7.0.0. The claim that server-side JavaScript functions became deprecated in 8.0 comes from version-specific documentation, not an 8.0 experiment. We avoid carrying historical adoption numbers, driver flaws or browser behaviour into claims about today's deployments. [MongoDB 8.0 documentation](https://www.mongodb.com/docs/v8.0/core/server-side-javascript/).

## 19. Does deprecation mean `$where` cannot run?

**Short answer:** No. Deprecation, configuration disablement and feature removal are different states.

**Technical follow-up:** The 8.0 documentation describes deprecation and warnings, and separately explains how to disable server-side scripting. We measured enablement and disablement in our 7.0.0 lab. We do not infer current availability from the word “deprecated.”

## 20. How does this relate to CS440 security objectives?

**Short answer:** The app establishes a false identity, then exposes protected data. Our live example demonstrates an authentication failure with a confidentiality consequence.

**Technical follow-up:** Authentication establishes identity. Authorisation governs what that identity may do. A false session causes later checks to operate on the wrong premise. Integrity and availability consequences depend on permitted operations and query behaviour. We have not demonstrated unauthorised writes or denial of service in this experiment.

## 21. Is CSRF another operator injection?

**Short answer:** It concerns a different trust boundary between a browser, its credentials and an API.

**Technical follow-up:** The assigned paper discusses browser-origin violations alongside database injection mechanisms. We identify it as adjacent rather than treating all attack categories as the same cause. Our JSON-login experiment does not reproduce the paper's historical browser/API attack.

## 22. Does the “union query” label mean SQL UNION works in MongoDB?

**Short answer:** No. The article uses SQL-inspired terminology for changing query logic and returned results.

**Technical follow-up:** Explain the actual operator and application construction for the example under discussion. The label alone does not establish a shared query language or transferable payload.

## 23. Does this prove the hardened app is completely secure?

**Short answer:** It establishes the tested credential contract and login behaviour for this local teaching path.

**Technical follow-up:** A deployment needs further controls for sessions, authentication abuse, account recovery, operational secrets and the other endpoints. Our lab keeps the trace display and vulnerable alternatives for teaching. Those features are not a deployment template. State the tested scope confidently and precisely.

## 24. What open problem follows from your results?

**Short answer:** How to support useful client-selected filters while ensuring tenant or ownership restrictions always remain in force.

**Technical follow-up:** Compare a restricted filter language with a query builder that keeps mandatory authorisation predicates outside client control. Test both legitimate queries and attempts to override mandatory constraints. This is proposed future work, not a completed experiment or a claim of a novel unsolved research field.

## 25. What happens if the demo fails during the presentation?

**Short answer:** We switch to captured evidence and explain the same request, predicate and session outcome.

**Technical follow-up:** The deck contains the observed four-stage sequence and appendix evidence. A 90-second silent backup video presents the four real captured states. The presenter narrates it. This preserves the explanation without relying on live startup, network access or last-minute payload entry.

## Cross-member rehearsal

Run one practice round in which each person answers a question outside their assigned presentation block. Use these checks:

- Can the answer identify attacker control and application assumptions?
- Does it connect the payload to the exact predicate and session decision?
- Does it distinguish source claims from our observations?
- Does it state the relevant limit without evading the question?
- Can the speaker point to the appropriate appendix or evidence file?

If a question goes beyond the experiment, give the established result and explain the additional test needed. Avoid inventing a confident answer to preserve the appearance of expertise.


## 26. Is one injection mechanism enough for the topic?

**Short answer:** Our presentation maps the wider attack landscape, studies one mechanism experimentally, and adds a technical contrast with JavaScript injection. The rubric sets no attack-count minimum.

**Technical follow-up:** Operator injection receives the detailed input-to-query explanation, live authentication consequence, control comparison and functional checks. The fifteen fixtures cover variations and controls within that study. The other mechanisms are literature coverage, with JavaScript injection as an explicit conceptual comparison. We do not count them as additional completed experiments.

## 27. Does requiring strings prevent JavaScript injection?

**Short answer:** A type check can accept a string that an application later incorporates into executable source. The defence must match how the input is interpreted.

**Technical follow-up:** This comparison concerns code executed by MongoDB's scripting engine. The application backend language is a separate choice. This illustrative unsafe construction concatenates client input into a JavaScript expression:

```js
const expression = "this.username === '" + input + "'";
users.find({ $where: expression });
```

This is a conceptual example, not code used by the lab's login endpoint or a measured exploit. Quotes and expression syntax in `input` can alter the resulting program. Prefer an application-owned ordinary query for this lookup, and disable server-side scripting when unused. If a system needs scripting, keep untrusted values out of executable source construction. [MongoDB 7.0 `$where`](https://www.mongodb.com/docs/v7.0/reference/operator/query/where/), [authors' discussion](https://www.infoq.com/articles/nosql-injections-analysis/).

## 28. Does your `$where` probe demonstrate JavaScript injection?

**Short answer:** It demonstrates whether the scripting configuration is active. It uses a fixed harmless expression with no attacker-controlled source construction.

**Technical follow-up:** The enabled instance must find Alice; the disabled instance must return MongoDB's specific disabled-scripting error. This validates a control used in our operator-injection comparison. A second injection experiment would need a separate vulnerable construction, an attacker-controlled input, observed unintended behaviour and its own defence checks. We have not claimed that experiment.

## Experiment-integrity challenges

**Could an old cookie make a rejected request appear successful?** The supplementary regressions first authenticate, then send a failed login using that existing cookie and replay the old token against the protected endpoint. They require access to fail. The two validated modes also run this sequence with the operator object. The ordinary matrix's protected checks alone would not establish old-token revocation.

**What if your control check is broken?** Unit tests deliberately make the disabled-scripting probe execute successfully or fail for unrelated reasons. Those paths must fail the observation. The live probe must receive the specific MongoDB scripting-disabled error. We test the measurement mechanism as well as the application.

**Why is this an extension rather than a new vulnerability?** The injection is prior work. The extension is the controlled comparison and inspectable evidence connecting request shape, actual command issuance, session creation and protected access. Our claim ledger identifies those boundaries.

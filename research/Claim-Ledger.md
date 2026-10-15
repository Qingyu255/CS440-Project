# Claim ledger

This ledger separates prior work, documented semantics, measured observations and interpretations. Case IDs refer to `nosql-lab/evidence/results.json`. The main talk uses 13 slides. Supplementary regressions support experiment integrity and do not increase the 150-case matrix count.

| Slides | Claim | Basis | Evidence and boundary |
|---|---|---|---|
| 1, 4 | Operator injection is prior work; our project adapts and evaluates it | Literature | [Authors' republication](https://www.infoq.com/articles/nosql-injections-analysis/); [IBM publication record](https://research.ibm.com/publications/analysis-and-mitigation-of-nosql-injections). We claim reproduction and a controlled comparison, not discovery |
| 2, 5, 6 | An object containing `$ne` expresses a query predicate; operator-looking text stays a literal here | Documentation and observation | [MongoDB `$ne`](https://www.mongodb.com/docs/manual/reference/operator/query/ne/); C04 versus C06. `$ne` can also match a missing field; the selected Alice record has a non-empty password |
| 3, 5 | A match becomes false identity and protected-data access | Observation | C04 baseline creates Alice's session and the protected endpoint returns 200. `server.mjs` shows the decision. Known unique username, accepted JSON object, toy credential filter and session-on-match are required assumptions |
| 7 | We ran 15 cases across five configurations twice | Observation | The 150 unique `(configuration, case, repetition)` records, plus CSV parity. Each record contains a protected-endpoint outcome. This is fixture coverage, not a population sample |
| 8, 20, 21 | The four-stage browser demonstration follows the tested mechanism | Observation | Actual browser captures in `evidence/browser`; offline video is explicitly a sequence of captures. Ordinary passwords in query traces are redacted |
| 9, 19 | Disabling scripting does not stop C04 in this stack | Observation | C04 noscripting 200 / Alice / one find. Independent `$where` probe must fail with an actual MongoDB error 6108304. A successful probe or unrelated failure now fails the runner |
| 9, 19 | Read-only database credentials do not stop C04 | Observation | C04 readonly 200 / Alice / one find. Actual authenticated role is read on cs440_lab; permitted lookup succeeds; insert fails with Unauthorized code 13 |
| 9, 10 | Contract validation rejects C04 before a find while retaining valid login | Observation and interpretation | C04 validated and hardened: 400 / zero finds. C01: 200. C02: 401. Validated mode keeps the same toy query, isolating rejection of the password object for C04 |
| 10, 16 | Full hardened path also verifies a salted scrypt hash | Source and functional observation | `src/passwords.mjs`, `src/server.mjs`, hash-only collection checks. [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). Complete production security is outside the evidence |
| 11 | MongoDB 8.0 deprecates server-side JavaScript functions | Version-specific documentation | [MongoDB 8.0 documentation](https://www.mongodb.com/docs/v8.0/core/server-side-javascript/). Deprecation is distinct from removal. Our recorded experiment uses 7.0.0 |
| 12 | Input, scripting and privilege controls enforce different boundaries | Interpretation | Derived from the mechanism and independent control comparisons. Useful complementary controls need not stop every attack mechanism |
| 13 | Flexible search requires application-controlled ownership predicates | Bounded future question | [OWASP NoSQL guidance](https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html). Proposed follow-up investigation, not a completed result |
| Appendix and Q&A | Earlier authenticated sessions cannot explain a new login's result | Supplementary regression | Existing-cookie tests after wrong-password attempts in every mode; after contract rejection in validated/hardened; logout invalidation. Separate from the main matrix |

## What would falsify the central interpretation?

A C04 success after contract rejection, a find command before the rejection, a valid login that fails after the fix, a scripting probe that executes on the disabled instance, or a read-only control that writes would invalidate the corresponding claim. The runners stop on those outcomes. A driver, parser, dataset or version change requires another recorded run.

## Source access

The assigned SMU library page could not be accessed during preparation. The authors' republication supplies the technical discussion. Its magazine boilerplate conflicts with the IBM publication identity, so the bibliography follows IBM and the DOI. No original paper page or figure number is asserted. The course briefing is supplied separately and is not redistributed in this repository.

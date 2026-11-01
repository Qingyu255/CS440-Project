# CS440 NoSQL Injections speaker script

13 main slides. Planned content: 10:25 including the 90-second demo. Allow about 25 seconds for handovers and navigation. Aim for a measured full run of 10:50 to 11:00. These are rehearsal targets, not measured delivery times.

## Slide 1: NoSQL injections

Speaker: Ercong Kee

Target time: 0:20

Imagine logging in as Alice without knowing her password. Our local experiment does exactly that. We follow one small change in a request through the database and into a false login, then test which defences actually stop it.

Sources: https://research.ibm.com/publications/analysis-and-mitigation-of-nosql-injections
Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Point to the ordinary password and then the object that replaces it. Introduce the consequence before the syntax.

Transition: First, we need just two MongoDB ideas: records and query conditions.

## Slide 2: A query is a test on a record

Speaker: Ercong Kee

Target time: 0:55

NoSQL includes several data models. We study MongoDB's document model, which stores records called documents. A document contains named fields, such as username and password. A query asks which records satisfy a condition, also called a predicate. On the left, the password must equal the supplied text. On the right, dollar-ne means not equal, and the empty quotes mean an empty string. Alice has a non-empty stored password, so that second condition matches her. This deliberately vulnerable teaching record stores plaintext. Our fixed design later uses a password hash.

Sources: https://www.mongodb.com/docs/v7.0/reference/operator/query/ne/
Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Read both conditions aloud in English. Trace the same password field in the record and the two queries. Define empty string explicitly.

Transition: An operator is legitimate database syntax. The failure begins when the client gets to choose it.

## Slide 3: Where the login goes wrong

Speaker: Ercong Kee

Target time: 0:45

The attacker knows Alice's username and controls the JSON request. They cannot connect directly to MongoDB or change the stored records. The application copies the submitted values into a query. MongoDB returns a matching account, and the application creates a session, meaning a remembered login. That session opens Alice's protected notes. The database service account is allowed to read her record, but that permission does not prove the caller knows her password. The application makes the wrong authentication decision.

Sources: https://www.infoq.com/articles/nosql-injections-analysis/
Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Trace the numbered flow. Pause at the application-to-query boundary, then follow the returned record to the session and private notes.

Transition: The assigned paper shows several ways input can cross a boundary like this.

## Slide 4: The paper covers several attack boundaries

Speaker: Pheobe Neo

Target time: 0:40

Ron and colleagues describe five classes. We group their query examples together here, and keep the original names in the small labels. Other inputs can become JavaScript source or an extra protocol command. Their origin-violation example is cross-site request forgery: a browser performs an unwanted action using a user's authority. Our experiment tests the highlighted operator route. Later we compare it with JavaScript injection conceptually. The research question is which controls stop this particular login bypass.

Sources: https://www.infoq.com/articles/nosql-injections-analysis/
https://www.researchgate.net/publication/300367234_Analysis_and_Mitigation_of_NoSQL_Injections

Point at: Start with the highlighted operator route. Sweep across the other boundaries once; do not teach five exploits. Explain CSRF in one sentence.

Transition: Here is the exact request used in our experiment.

## Slide 5: The password value becomes a condition

Speaker: Pheobe Neo

Target time: 1:00

The username stays Alice. The password value becomes an object containing dollar-ne. The vulnerable code passes both values directly into findOne, which asks MongoDB for one matching record. The resulting test is: username equals Alice, and password is not the empty string. Both are true for this synthetic account. The application creates an Alice session even though no correct password was supplied. This needs no JavaScript execution. MongoDB runs an ordinary supported operator. The application allowed the client to change what its password check meant.

Sources: https://www.mongodb.com/docs/v7.0/reference/operator/query/ne/
Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Use the three numbered stages. Point to body.password, then the substituted object, then the matching conditions. Reveal stages if using the optional presentation builds.

Transition: That outcome depends on the input being an object rather than ordinary text.

## Slide 6: An object and a string behave differently

Speaker: Pheobe Neo

Target time: 0:45

These inputs look similar but have different types. The first is an object, so MongoDB recognises the operator and Alice matches. The second is a string containing the same characters. In this query it stays ordinary text and fails to match her stored password. We tested that second case as a negative control. Our bypass also assumes that the endpoint accepts objects, Alice's stored password is non-empty, and any returned record creates a session. Those assumptions define the claim we can test.

Sources: https://www.mongodb.com/docs/v7.0/reference/operator/query/ne/
https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html
Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Follow the two horizontal lanes. Emphasise the outer quotation marks around the second value, not just the $ sign.

Transition: We kept those assumptions fixed while comparing five configurations.

## Slide 7: How we tested the controls

Speaker: Kendrick Poon

Target time: 0:45

We ran fifteen request cases through five configurations, twice. The cases include the attack, correct and wrong passwords, and unexpected input shapes. For each request we recorded the login result, protected-page access and actual MongoDB find commands. Separate probes verified that scripting really was disabled and the read-only account really could not write. The validation-only configuration retains the vulnerable query after validation, so it isolates the effect of rejecting objects. The two runs show repeatability in this lab. They do not estimate attack prevalence.

Sources: Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Trace cases into the five branches, then into the three outcome measures. Mention the independent control probes before discussing results.

Transition: The live demo shows four of those recorded outcomes.

## Slide 8: Same attack, different login decision

Speaker: Kendrick Poon

Target time: 1:30

First, a wrong password fails and Alice's notes stay closed. Next, we replace only the password value with the operator object. The vulnerable path creates an Alice session and opens her synthetic private notes. We submit the identical request to the hardened path. It rejects the input before any database query and denies access. Finally, the correct credentials still log in successfully. That last check matters: rejecting every request would stop the attack but would also break the application. The captured results on this slide preserve the evidence if the live service fails.

Sources: Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Use 15 seconds for wrong password, 25 for bypass, 25 for identical request after the fix, and 25 for correct login. Keep the payload visible. Switch to the video or slide captures within ten seconds of a failure.

Transition: The full comparison tells us why some familiar controls did not stop it.

## Slide 9: Which controls stopped the bypass?

Speaker: Kendrick Poon

Target time: 1:00

The same operator request succeeds in the baseline, with JavaScript disabled, and with a read-only database account. Each sends one find command. Both validation paths reject it before a find command. Correct credentials still work in all five configurations. Disabling scripting does not stop a normal query operator. Read-only access prevents writes, but this bypass needs only a read. The isolated validation comparison identifies the effective change: the application rejects the unexpected password object before building the query. The appendix contains every case, including wrong-password controls.

Sources: Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.
https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html

Point at: Read the attack column first, then query count, then the valid-login column. Red means bypass and green means blocked; always say the text labels as well.

Transition: The minimal fix explains the result. A complete login also needs proper password verification.

## Slide 10: A login needs separate password verification

Speaker: Liu Qingyu

Target time: 0:50

The minimal experimental control rejects non-string credentials. The full login checks the expected fields, non-empty values and length limits. It looks up the account by the validated username only, then verifies the supplied password against a salted scrypt hash. A session is created only after verification succeeds. Hashing protects stored credentials; validation protects how input enters the query. We test both. This remains a teaching implementation: deployment protections such as transport security and rate limiting still need their own design and tests.

Sources: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html
Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Show the rejected object at the input gate. Follow a valid string through the four stages. Keep the minimal control visually separate from the complete design.

Transition: The next distinction explains why a string type check is not a universal injection defence.

## Slide 11: The defence depends on what reads the input

Speaker: Liu Qingyu

Target time: 0:40

Our measured input is an object interpreted by MongoDB's query engine. In a different design, an application may concatenate a string into JavaScript source and pass it to a database scripting feature such as dollar-where. A string type check would accept that input type. The safer design avoids building executable source from client values and disables unused scripting. This is a literature comparison. Our fixed, harmless dollar-where probe only checks configuration; it is not a second injection exploit.

Sources: https://www.mongodb.com/docs/v7.0/reference/operator/query/where/
https://www.infoq.com/articles/nosql-injections-analysis/
https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html

Point at: Follow the two input-to-interpreter lanes. Identify database-side JavaScript explicitly so it is not confused with choosing Node.js as the backend language.

Transition: We can now state what our evidence actually establishes.

## Slide 12: What the experiment establishes

Speaker: Liu Qingyu

Target time: 0:35

Three observations support our conclusion. The operator object creates a false Alice session in the vulnerable path. Validation rejects that same input before a database query. Correct credentials still work after the fix. These claims are about our known account, fifteen request cases and recorded MongoDB stack. We have not demonstrated a JavaScript exploit or measured how common this problem is in deployed systems. That limited claim is still useful because it identifies a concrete mistake and a tested correction.

Sources: Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Tie each sentence to its visible result. Avoid repeating the entire results table.

Transition: The remaining question is how to preserve this control when an API intentionally accepts richer filters.

## Slide 13: The application must keep control of the query

Speaker: Liu Qingyu

Target time: 0:40

For a login, the application should choose the fields and operators, validate the values, and verify the password separately. Rich search APIs are harder because users may legitimately choose filters. For example, a tenant is a customer organisation whose records must stay separate from another customer's records. Our next study would compare allowed fields and operators with a query builder that always adds the tenant restriction. We would test cross-tenant access as well as legitimate search. That is future work, beyond the login result presented today.

Sources: https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html
Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: End on the application rule, then use the tenant-search sketch to make the open problem concrete. Do not imply that the proposed search defence has been tested.

Transition: Thank the audience and invite questions. Use the appendix index in the handover guide to jump directly to evidence.

# CS440 NoSQL Injections section script

12 main slides. Planned content: 9:40 including the 90-second demo. Choose one presenter for each section, then write the assignments into the blanks below. Allow about 25 seconds for handovers and navigation. Aim for a measured full run of 10:10 to 10:30. These are rehearsal targets, not measured delivery times.

## Section A: Problem and article context

Slides 1-3  |  2:00  |  Assigned presenter: ____________________

Section purpose: Introduce the assigned article, teach the minimum MongoDB vocabulary and show where the login decision fails.

Incoming handover: Open with the Alice login consequence.

### Slide 1: NoSQL injections

Target time: 0:20

Today we examine Ron, Shulman-Peleg and Puzanov's 2016 IEEE Security & Privacy article on NoSQL injections. We clarify its attack taxonomy, then reproduce one operator-injection route in a controlled local experiment. Imagine logging in as Alice without knowing her password. We follow one small change in a request through the database and into a false login, then test which defences actually stop it.

Sources: https://research.ibm.com/publications/analysis-and-mitigation-of-nosql-injections
Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Point to the ordinary password and then the object that replaces it. Introduce the consequence before the syntax.

Transition: First, we need just two MongoDB ideas: records and query conditions.

### Slide 2: A query is a test on a record

Target time: 0:55

NoSQL includes several data models. We study MongoDB's document model, which stores records called documents. A document contains named fields, such as username and password. A query asks which records satisfy a condition, also called a predicate. On the left, the password must equal the supplied text. On the right, dollar-ne means not equal, and the empty quotes mean an empty string. Alice has a non-empty stored password, so that second condition matches her. This deliberately vulnerable teaching record stores plaintext. Our fixed design later uses a password hash.

Sources: https://www.mongodb.com/docs/v7.0/reference/operator/query/ne/
Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Read both conditions aloud in English. Trace the same password field in the record and the two queries. Define empty string explicitly.

Transition: An operator is legitimate database syntax. The failure begins when the client gets to choose it.

### Slide 3: Where the login goes wrong

Target time: 0:45

The attacker knows Alice's username and controls the JSON request. They cannot connect directly to MongoDB or change the stored records. The application copies the submitted values into a query. MongoDB returns a matching account, and the application creates a session, meaning a remembered login. That session opens Alice's protected notes. The database service account is allowed to read her record, but that permission does not prove the caller knows her password. The application makes the wrong authentication decision.

Sources: https://www.infoq.com/articles/nosql-injections-analysis/
Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Trace the numbered flow. Pause at the application-to-query boundary, then follow the returned record to the session and private notes.

Transition: The assigned paper shows several ways input can cross a boundary like this.

Section handover: The assigned article shows several ways input can cross a boundary like this.

## Section B: Article scope and operator mechanism

Slides 4-6  |  2:25  |  Assigned presenter: ____________________

Section purpose: Map Ron et al.'s wider taxonomy, then explain the operator route and the object-versus-string control.

Incoming handover: Connect the false-login boundary to Ron et al.'s wider taxonomy.

### Slide 4: Ron et al. describe several injection boundaries

Target time: 0:40

Ron and colleagues describe five classes. We group their query examples together here, and keep the original names in the small labels. Other inputs can become JavaScript source or an extra protocol command. Their origin-violation example is cross-site request forgery: a browser performs an unwanted action using a user's authority. Our experiment tests the highlighted operator route. Later we compare it with JavaScript injection conceptually. The research question is which controls stop this attack from creating a login session.

Sources: https://www.infoq.com/articles/nosql-injections-analysis/
https://www.researchgate.net/publication/300367234_Analysis_and_Mitigation_of_NoSQL_Injections

Point at: Start with the highlighted operator route. Sweep across the other boundaries once; do not teach five exploits. Explain CSRF in one sentence.

Transition: Here is the exact request used in our experiment.

### Slide 5: The password value becomes a condition

Target time: 1:00

The username stays Alice. The password value becomes an object containing dollar-ne. The vulnerable code passes both values directly into findOne, which asks MongoDB for one matching record. The resulting test is: username equals Alice, and password is not the empty string. Both are true for this synthetic account. The application creates an Alice session even though no correct password was supplied. This needs no JavaScript execution. MongoDB runs an ordinary supported operator. The application allowed the client to change what its password check meant.

Sources: https://www.mongodb.com/docs/v7.0/reference/operator/query/ne/
Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Use the three numbered stages. Point to body.password, then the substituted object, then the matching conditions. Reveal stages if using the optional presentation builds.

Transition: That outcome depends on the input being an object rather than ordinary text.

### Slide 6: The parsed type changes the query meaning

Target time: 0:45

These inputs look similar but have different types. The first is an object, so MongoDB recognises the operator and Alice matches. The second is a string containing the same characters. In this query it stays ordinary text and fails to match her stored password. We tested that second case as a negative control. The attack also assumes that the endpoint accepts objects, Alice's stored password is non-empty, and any returned record creates a session. Those assumptions define the claim we can test.

Sources: https://www.mongodb.com/docs/v7.0/reference/operator/query/ne/
https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html
Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Follow the two horizontal lanes. Emphasise the outer quotation marks around the second value, not just the $ sign.

Transition: Now we can submit the same object to the vulnerable and hardened paths.

Section handover: Now we can submit the same object to the vulnerable and hardened paths.

## Section C: Demo and measured results

Slides 7-8  |  2:30  |  Assigned presenter: ____________________

Section purpose: Demonstrate the vulnerable and hardened outcomes, then compare all five tested configurations.

Incoming handover: Move from the mechanism to the unchanged request used in the live demo.

### Slide 7: Same attack, different login decision

Target time: 1:30

We tested fifteen request cases across five configurations twice. This demo shows four recorded outcomes. First, a wrong password fails and Alice's notes stay closed. Next, we replace only the password value with the operator object. The vulnerable path accepts the attack, logs us in as Alice and opens her synthetic private notes. We submit the same attack request to the hardened path. It rejects the object before any database query and denies access. Finally, the correct credentials still log in successfully. That last check matters: rejecting every request would stop the attack but would also break the application. The captured results on this slide preserve the evidence if the live service fails.

Sources: Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Use 15 seconds for wrong password, 25 for the successful attack, 25 for the same attack after the fix, and 25 for correct login. Keep the payload visible. Switch to the video or slide captures within ten seconds of a failure.

Transition: The full comparison tells us why some familiar controls did not stop it.

### Slide 8: Which controls stopped the attack?

Target time: 1:00

The same attack request succeeds in the baseline, with JavaScript disabled, and with a read-only database account. In each case, the app sends one query and logs in as Alice. Both validation paths stop the attack before any query. Correct credentials still work in all five configurations. Disabling scripting does not stop a normal query operator. Read-only access prevents writes, but this attack needs only a read. The isolated validation comparison identifies the effective change: the application rejects the unexpected password object before building the query. The numbers in parentheses are HTTP response codes. They support the result, but the important outcome is whether the attack created a session.

Sources: Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.
https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html

Point at: Read the plain-language attack outcome first, then whether a query was sent, then the correct-login check. Mention the HTTP codes only as secondary evidence.

Transition: The safe login flow explains why the attack stops.

Section handover: The safe login flow explains why the effective controls work.

## Section D: Defence evidence boundary and conclusion

Slides 9-12  |  2:45  |  Assigned presenter: ____________________

Section purpose: Explain the complete login fix, distinguish operator and JavaScript injection, state the evidence boundary and close with future work.

Incoming handover: Use the result matrix to motivate the safe login design.

### Slide 9: A safe login keeps the password out of the query

Target time: 0:50

The attack payload fails at the first step because its password is an object, not text. For a legitimate request, the application accepts only the expected username and password strings. It asks MongoDB for the account using the username alone, so the password cannot change the query. The application then compares the submitted password with the stored hash. A password hash is a one-way stored verifier; the hardened account collection does not store the plaintext password. Only a successful comparison creates a session. This separation is the complete idea: validate the request, look up the account, verify the password and then decide whether to log in.

Sources: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html
Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Start with the sentence explaining why the object is rejected. Then follow the four numbered steps and stress that MongoDB never receives the password as a condition.

Transition: The next distinction explains why a string type check is not a universal injection defence.

### Slide 10: Different injection types need different defences

Target time: 0:40

The left column is our measured attack. A JSON object contains dollar-ne, and MongoDB reads it as a query condition. That makes the filter match without the correct password. Requiring text in login fields and building the query in application code stops this route. The right column comes from the literature. An application may insert user text into JavaScript source, and the JavaScript engine then executes changed program logic. Prevent that by never building code from user text and by disabling scripting when it is unused. We did not demonstrate the JavaScript attack. Our fixed dollar-where probe only checked whether scripting was enabled.

Sources: https://www.mongodb.com/docs/v7.0/reference/operator/query/where/
https://www.infoq.com/articles/nosql-injections-analysis/
https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html

Point at: Compare the columns row by row. State clearly that only the operator route was demonstrated.

Transition: We can now state what our evidence actually establishes.

### Slide 11: What our experiment shows

Target time: 0:35

Three observations support our conclusion. First, the operator object logs the attacker in as Alice in the vulnerable path. Second, validation rejects that same input before MongoDB receives a query. Third, correct credentials still work after the fix. The slide states the security outcome first and places the HTTP response code beneath it as supporting evidence. These claims cover our known account, fifteen request cases and recorded MongoDB stack. We have not demonstrated a JavaScript exploit or measured how common this problem is in deployed systems.

Sources: Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: Read the three security outcomes. Treat the HTTP codes as secondary evidence, not as the explanation.

Transition: The remaining question is how to preserve this control when an API intentionally accepts richer filters.

### Slide 12: The application must keep control of the query

Target time: 0:40

For a login, the application should choose the fields and operators, validate the values, and verify the password separately. Rich search APIs are harder because users may legitimately choose filters. For example, a tenant is a customer organisation whose records must stay separate from another customer's records. Our next study would compare allowed fields and operators with a query builder that always adds the tenant restriction. We would test cross-tenant access as well as legitimate search. That is future work, beyond the login result presented today.

Sources: https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html
Project evidence: nosql-lab/evidence/results.json and results.csv; 15 cases × 5 configurations × 2 runs.

Point at: End on the application rule, then use the tenant-search sketch to make the open problem concrete. Do not imply that the proposed search defence has been tested.

Transition: Thank the audience and invite questions. Use the appendix index in the handover guide to jump directly to evidence.

Section handover: Invite questions and use the appendix responsibility map.

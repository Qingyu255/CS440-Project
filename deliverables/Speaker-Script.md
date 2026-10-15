# CS440 NoSQL Injections: speaker script

13 main slides. Target 11:20, including the 90-second demo. Times are rehearsal targets, not measured delivery durations.

## Slide 1: NoSQL Injections

Target time: 0:25

A login request can be valid JSON and still change the meaning of a database query. We investigated exactly where that change happens, then tested which controls stop it. Our project reproduces a mechanism from Ron and colleagues' 2016 paper and extends it with a controlled local comparison. The question is whether the application preserves its intended credential check.

Sources: https://research.ibm.com/publications/analysis-and-mitigation-of-nosql-injections

## Slide 2: Documents and query predicates

Target time: 0:50

NoSQL covers several database families. We focus on MongoDB, a document database. Its documents contain named fields, and a filter describes which documents to return. Here, the left-hand query looks for one literal username. The right-hand query uses an operator to match usernames that differ from an empty string. Both filters have structured representations, but they express different predicates. The MongoDB driver serialises the filter to BSON for the server. Our web interface receives JSON, which the application parses into JavaScript values. That representation change matters because the application expects credential strings.

Sources: https://www.mongodb.com/docs/manual/reference/operator/query/ne/
https://www.infoq.com/articles/nosql-injections-analysis/

## Slide 3: Application architecture and threat model

Target time: 0:50

The attacker can submit JSON to the login endpoint and knows Alice's username. They cannot alter application code, change the records or connect directly to the database. The application parses the request, constructs a filter and uses its legitimate database service account. The dangerous boundary is where a client-controlled value becomes a query condition. After the database returns an account, the application creates a session. In CS440 terms, the service account's authority to read a record is different from evidence of the end user's identity. False authentication can then expose that user's protected data.

Sources: https://www.infoq.com/articles/nosql-injections-analysis/
https://www.mongodb.com/docs/manual/reference/built-in-roles/

## Slide 4: The assigned paper and our investigation

Target time: 0:45

Ron and colleagues analyse several injection mechanisms and mitigation layers. Our deep dive adapts their operator-based authentication example to JSON and the native MongoDB driver. We also locate it beside JavaScript execution, command-boundary failures and browser-origin attacks. CSRF crosses a separate boundary. The paper establishes the mechanism. Our extension asks a testable question: which controls stop this exact bypass? We compare them with positive and negative controls. We claim a reproduction and controlled extension, with results scoped to the recorded stack.

Sources: https://www.infoq.com/articles/nosql-injections-analysis/
https://research.ibm.com/publications/analysis-and-mitigation-of-nosql-injections

## Slide 5: An object changes the password condition

Target time: 1:10

This is the exact injected request. Alice's username remains a literal string. The password field becomes an object containing the not-equal operator. The vulnerable code passes both values directly into findOne. That produces a filter requiring username equal to Alice and password different from the empty string. Alice's synthetic stored password is non-empty, so her record matches. The application then creates a session without proof that the client knows her password. The object needs no JavaScript execution, and no quote-breaking payload. The database executes a supported predicate. The failure comes from the application's accepted input and its interpretation of the match.

Sources: https://www.mongodb.com/docs/manual/reference/operator/query/ne/
https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html

## Slide 6: Input shape and attack assumptions

Target time: 1:10

The key distinction is an operator object versus operator-looking text. The object changes the query predicate. A string containing those same characters stays a literal value in this filter and fails to match. Our negative control confirms that difference. This example also depends on the application accepting objects and granting a session when a record matches. We use a known unique username, so we can say exactly which account the request selects. The toy reproduction stores synthetic plaintext passwords to expose this mechanism. The final path uses a separate hash-only account collection and verifies the password independently. A broad findOne query does not guarantee an administrator account.

Sources: https://www.mongodb.com/docs/manual/reference/operator/query/ne/
https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

## Slide 7: Controlled experiment

Target time: 0:35

We ran fifteen request cases across five configurations, twice: one hundred and fifty observations. Each records the login decision, protected access and actual database find commands. The fixtures include legitimate credentials, wrong strings and unexpected input shapes. Separate probes check the database roles and require MongoDB's specific scripting-disabled error. Repetition supports local reproducibility. It does not estimate deployed prevalence.

Sources: Local experiment: nosql-lab/evidence/results.json, results.csv and source code.

## Slide 8: Live demonstration

Target time: 1:30

[0-15 seconds] This is our local synthetic lab. First, a wrong password fails and protected notes stay inaccessible. [15-40 seconds] We replace the password string with the operator object. The vulnerable path receives that predicate, matches Alice and creates a session. We can now read her synthetic private notes without supplying her password. [40-65 seconds] We keep the identical request and switch to the hardened path. It rejects the credential contract before constructing a filter or issuing a find command. [65-85 seconds] Finally, valid credentials still authenticate correctly after the fix. [85-90 seconds] The comparison identifies the boundary we restored: credential values remain values. If live playback fails, show the captured states in appendix slides 20 and 21 and narrate the same sequence.

Sources: Local experiment: nosql-lab/evidence/results.json, results.csv and source code.

## Slide 9: Results identify the effective boundary

Target time: 1:05

Here are the observed results for the identical password-operator request. It creates an Alice session in the baseline, with scripting disabled, and with a database account restricted to reads. In each of those cases, one find command runs. Both validation paths reject the request with zero find commands. Every configuration still accepts valid string credentials and rejects the wrong string password. Disabling scripting addresses execution of JavaScript, while this attack uses a normal query operator. Read-only privileges block writes, but the login failure needs only a read. The isolated validation condition lets us attribute the change to type enforcement before discussing the complete authentication design.

Sources: Local experiment: nosql-lab/evidence/results.json, results.csv and source code.

## Slide 10: Validation and independent credential verification

Target time: 0:55

The smallest causal fix rejects objects where the login contract requires strings. It preserves application control over field names and query structure. Our complete path goes further. It validates allowed fields, lengths and types, then looks up an account by its validated username. It retrieves that account from a separate collection containing no plaintext passwords. It verifies the supplied password against a salted scrypt hash before creating the session. The same password object therefore never reaches MongoDB. Password hashing protects credential storage, while contract validation protects query intent. We tested both invalid inputs and legitimate authentication. This local teaching path still does not represent a complete deployed identity system.

Sources: https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html
https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

## Slide 11: Historical mechanisms and present-day evidence

Target time: 0:30

The paper gives us a mechanism to investigate. We reproduced operator injection on MongoDB 7.0.0; our controls make that a bounded empirical claim. Version-specific documentation separately says MongoDB 8.0 deprecates server-side JavaScript functions. Deprecation does not establish removal. Neither that documentation nor our local run establishes current attack prevalence. We retain the paper's query-boundary insight while checking each implementation-dependent claim.

Sources: https://www.mongodb.com/docs/v8.0/core/server-side-javascript/
https://research.ibm.com/publications/analysis-and-mitigation-of-nosql-injections

## Slide 12: Findings and engineering lessons

Target time: 0:45

Our reproduction shows the exact point where a credential value becomes a database predicate and then a false session. The isolated comparison shows that string validation blocks that mechanism before a query. The scripting and privilege controls remain useful, but their boundaries differ from the input contract. Finally, the functional controls show that the fixed path retains correct authentication. The engineering lesson is to define and enforce each endpoint's accepted query structure, then verify the actual security decision. Testing only whether a malicious-looking string gets rejected would have missed the important difference between a literal value and an operator object.

Sources: Local experiment: nosql-lab/evidence/results.json, results.csv and source code.

## Slide 13: Flexible filters need enforceable access policies

Target time: 0:50

Our login contract can require strings, but search APIs sometimes need richer filters. The open problem is how to allow that flexibility while ensuring tenant or ownership restrictions remain in force. A bounded next investigation would compare an explicit operator-and-field allowlist with a query builder that keeps mandatory access predicates outside client control. Our current evidence covers one local stack, synthetic data and fifteen request cases. It does not estimate deployed prevalence or certify all endpoints. Our final recommendation follows from the mechanism we observed: keep the application's query structure under application control and test that unauthorised inputs never become proof of identity.

Sources: https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html

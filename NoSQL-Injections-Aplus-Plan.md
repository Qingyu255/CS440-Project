# CS440 NoSQL Injections: a research and presentation plan for the A/A+ band

Execution update, 15 October 2026: the implemented deck, lab and measured results are now in this repository. See README.md and research/Claim-Ledger.md. The original proposal below remains as the design record; section 7 and the rehearsal target reflect the expanded final deck.

Prepared 7 October 2026. This is a proposed investigation and deck blueprint. No demo or experiment has been run as part of preparing this plan. All experimental outcomes below are hypotheses or acceptance criteria until your group records them.

## 1. Recommended direction

Build the presentation around this question:

**How can a well-formed JSON request bypass an application's intended database query, and which defences actually preserve that intent?**

Working title: **NoSQL Injections: When Client Input Changes a Database Query**.

Your central argument should be that an application must control query structure, including operators and field names. A structured format alone does not establish that boundary. Demonstrate the mechanism in MongoDB, evaluate specific controls, and connect the findings to authentication and access control in CS440.

The proposed contribution is an independently reproduced mechanism, a controlled comparison of defences, and a reasoned assessment of the assigned paper's relevance today. This is an achievable student research contribution. Describe it accurately as a reproduction and extension, rather than a newly discovered vulnerability.

Show conviction through the quality of your questions and evidence. Your group should sound like people who care about whether a defence works and can explain why. Strong opinions become credible when you state their assumptions, test them, and narrow them when the evidence demands it.

## 2. What the briefing actually requires

Source: CS440 Group Project Briefing (supplied separately), especially pages 3-6.

The published rubric combines **A and A+** in one band. It does not provide a separate A+ threshold. The recommendations in this plan aim to make the work especially strong within that highest band.

| Component | Course weight | Share of the 20% project | Highest-band expectation, paraphrased | Evidence your deck should contain |
|---|---:|---:|---|---|
| Presentation | 5% | 25% | Exceptionally clear and coherent slides, effective presentation tools, clear delivery | A continuous argument, legible query traces, purposeful reveals, smooth handovers, a rehearsed finish |
| Background | 3% | 15% | Comprehensive background | Essential NoSQL concepts, application architecture, threat model, motivation, course concepts and the paper's context |
| Approach | 10% | 50% | Excellent conceptual understanding, technical detail and demonstration | Exact input-to-query mechanism, a reproducible demo, controls, observed results, defence analysis and limitations |
| Conclusion | 2% | 10% | Strong summary, findings, lessons and open problems | Conclusions tied to evidence, actionable lessons and one specific unresolved question |

Other requirements that affect your plan:

- The presentation lasts **at most 12 minutes**, excluding Q&A. The lecturer will stop an overrun.
- Every member presents and attends the Week 13 presentation and Q&A.
- Q&A contributes to the background, approach or conclusion marks according to the question.
- Every student submits the deck through eLearn, Assignments, Project. The deadline is midnight before your presentation day.
- The briefing explicitly requires background. A technical audience still needs the context for your chosen mechanism.
- A demo is optional in the recommended structure and can differentiate the project. The highest-band approach rubric nevertheless calls for an excellent demonstration. A carefully explained live demo, backed by static evidence, is a strong way to meet that expectation.
- Team information and topic finalisation have Week 4 and Week 5 deadlines. Verify that your group has already completed those steps and secured the unique topic allocation.
- The FAQ requires peer assessment and allows individual grade adjustments. Keep a simple contribution record while working.

## 3. Scope that supports depth in 12 minutes

### Main presentation

Use **one database, one application stack, one principal attack mechanism and one controlled evaluation**:

- MongoDB with a small Node.js/Express application using the native MongoDB driver.
- JSON POST requests, with the request parser and content type stated explicitly.
- Operator injection into an intentionally vulnerable login query.
- Comparisons between the vulnerable implementation, individual controls, and a correctly designed authentication path.
- A brief survey of the assigned article's wider attack surface.
- A brief historical-versus-current assessment.

Choose the native driver so that ODM casting and middleware do not obscure the central mechanism. Pin an exact supported MongoDB patch version and exact application dependency versions when you build the lab. Do not assume that a result from one stack establishes results for every ODM, parser or database.

### Appendix

Put the full experiment matrix, dependency versions, request bodies, complete code, historical attack details, extra background, limitations and references here. Appendices support Q&A and inspection without consuming the main talk.

### Keep outside this project

Avoid implementing attacks across several database engines, building a vulnerability scanner, producing a polished full application, adding speculative AI material, or running a second elaborate live exploit. Those activities consume time that your technical argument and rehearsal need.

The main deck should still communicate the breadth of the topic. Use a compact attack map to locate your deep dive, then explain why you chose it: the mechanism is clear, the assumptions are inspectable, and its defences can be tested directly.

## 4. Research foundation and source discipline

The assigned item is **Aviv Ron, Alexandra Shulman-Peleg and Anton Puzanov, “Analysis and Mitigation of NoSQL Injections,” IEEE Security & Privacy, 14(2), 30-39, 2016, DOI 10.1109/MSP.2016.36**. [IBM Research publication record](https://research.ibm.com/publications/analysis-and-mitigation-of-nosql-injections).

The SMU proxy URL was inaccessible during preparation. I used the authors' accessible [article republication](https://www.infoq.com/articles/nosql-injections-analysis/) for the technical discussion and IBM's record for publication identity. The republication contains a conflicting magazine attribution in its boilerplate. Use the IBM record and your library copy for the final bibliography, and verify original page/figure references against that copy.

Read the paper with a claim table rather than dividing its pages among speakers:

| Claim you want to use | What to record |
|---|---|
| An application promotes user input into query syntax | Exact example, input format, relevant API and required conditions |
| An attack bypasses authentication or accesses data | The application behaviour that makes the database result a security violation |
| A defence mitigates an attack | Which mechanism it addresses and which assumptions it leaves intact |
| An example is relevant today | Original environment, current documentation and any reproduction evidence |

The article discusses tautology-style conditions, union-like query manipulation, JavaScript injection, piggybacked commands and origin violations. In your attack map, mark CSRF/origin violations as an adjacent browser/API trust issue, and mark the SQL-inspired “union” terminology as the article's classification. This avoids suggesting that every listed mechanism has the same root cause or uses SQL UNION syntax. [Authors' article](https://www.infoq.com/articles/nosql-injections-analysis/).

Use current primary documentation to establish two precise points:

- MongoDB's `$ne` is a query operator, and it can also match documents missing the field. It is not an unconditional truth for every possible dataset. [MongoDB `$ne` documentation](https://www.mongodb.com/docs/manual/reference/operator/query/ne/).
- MongoDB deprecated server-side JavaScript functions including `$where`, `$function` and `$accumulator` starting in 8.0. Deprecation does not mean removal. The documentation separately describes disabling server-side scripting. [MongoDB 8.0 documentation](https://www.mongodb.com/docs/v8.0/core/server-side-javascript/).

OWASP explicitly warns that building a query object can still admit operator injection when a user-controlled value is itself an object. Treat that as a source-backed starting point for your experiment, rather than presenting it as your discovery. [OWASP NoSQL Security guidance](https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html).

Maintain a shared evidence ledger. Each slide claim should have an entry containing its source or experiment ID, its assumptions, the intended slide, and the person responsible for checking it. Mark entries as **literature**, **documentation**, **our observation**, or **our interpretation**. Keep planned results distinct from measured results.

## 5. Technical story your group must understand

### Threat model

An unauthenticated remote client can send JSON to the application's login endpoint. The attacker knows a seeded username but does not know its password. The application has a legitimate database service account. The attacker cannot access MongoDB directly, change application code, or modify the seeded records.

The vulnerable application accepts objects where it intends to accept strings, passes those values into a filter, and treats a matched account as successful authentication. These conditions jointly explain the failure.

### The vulnerable query

Illustrative lab code:

```js
const account = await users.findOne({
  username: req.body.username,
  password: req.body.password
});
// The vulnerable lab grants a session if account exists.
```

Normal wrong-password request:

```json
{"username":"alice","password":"wrong-password"}
```

Injected request:

```json
{"username":"alice","password":{"$ne":""}}
```

The resulting filter keeps `username` equal to `alice`, while changing the password condition to “not equal to the empty string.” For a seeded Alice record with a non-empty password, the filter matches without knowing that password.

The trust boundary crosses at the application's filter construction: it accepts a client-supplied object as a database predicate. JSON parsing succeeds. The database applies valid query semantics. The application interprets the match as proof of identity.

Explain why the known username makes this example deterministic. Injecting broad predicates into both username and password may match multiple accounts. `findOne` then does not guarantee that the attacker gets an administrator. Do not claim arbitrary admin access from an unspecified match.

### Important lab simplification

This deliberately vulnerable reproduction uses synthetic plaintext password fields to expose the query mechanism. Label that simplification in the deck. Production authentication should use a suitable password hashing algorithm and verify the supplied password against the stored hash. [OWASP Password Storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

Explain two separate changes:

1. **Mechanism isolation:** add strict server-side string validation to the same toy query. This helps determine whether rejecting operator objects causes the observed change.
2. **Production design:** validate the complete request contract, retrieve an account using an application-owned username filter, and perform password-hash verification before creating a session.

Conceptual hardened path:

```text
Validate allowed fields and string types.
Reject invalid input before querying the database.
Retrieve the account by the validated username.
Verify the supplied password with the password-hashing library.
Create a session only after verification succeeds.
```

Changing the account lookup alone does not complete the fix. Password verification and the session decision are essential. Keep error messages generic and never return password material.

### CS440 connections

Use these connections at the points where they explain the mechanism:

- **Authentication:** a database match has replaced proof that the client knows the correct credential.
- **Authorization/access control:** downstream access follows the incorrectly established identity. A database service account and an application end user are different principals.
- **Confidentiality and integrity:** a false session can expose another user's protected data or enable unauthorised changes, depending on application permissions. Only claim the effects you actually demonstrate.
- **Availability:** expensive queries or scripting can raise a separate risk, but your login experiment does not establish denial of service.
- **Encryption:** TLS protects data in transit. It does not enforce the application's input contract or intended predicate.
- **Least privilege:** a narrower database account can constrain available operations, yet a permitted read can still support a bad authentication decision.

Keep the causal chain visible: attacker-controlled value, changed predicate, matched record, incorrect application decision, security consequence.

## 6. A demo designed as an experiment

### Lab setup

Use a local application and actual MongoDB, with three synthetic accounts and a small protected page. Bind exposed application access to localhost. Keep the database on an internal container network or local interface. Seed unique usernames and non-empty passwords for the toy reproduction.

Provide reset and start instructions, a dependency lockfile, an exact database image tag or digest, and saved request files. Reproduce the lab on a second group member's machine before treating it as ready.

The presenter uses prepared JSON requests through a small local interface or readable HTTP client. The display should show:

- The request shape, including the difference between a string and an object.
- A redacted filter trace that preserves the injected operator's structure.
- The HTTP outcome and whether the app created an authenticated session.
- Access to one synthetic protected page when the vulnerable path wrongly authenticates.

A MongoDB shell query alone demonstrates database semantics. It does not establish a web application's authentication bypass. Your demo must show the application's security decision.

### Research questions and predictions

**RQ1:** Does accepting an operator object in this login filter allow authentication without the correct password?

**RQ2:** Which control blocks this specific mechanism while preserving legitimate login?

**RQ3:** How far can we generalise the result beyond the tested stack?

| Configuration | Prediction for the injected request | Why this comparison matters |
|---|---|---|
| Vulnerable toy baseline | Incorrect authentication | Establishes the mechanism under stated conditions |
| Same toy code with server-side JavaScript disabled | Incorrect authentication | Tests the hypothesis that a normal query operator works independently of JavaScript execution |
| Same toy code with an account allowed to read the users collection but denied writes | Incorrect authentication | Tests the distinction between database permissions and the application's identity decision |
| Same toy code with strict string validation before the query | Rejection before any database query | Isolates request-type enforcement as a causal defence |
| Complete hardened authentication path | Rejection before any database query | Tests the intended final design, including independent password verification |

These are predicted outcomes. Fill the deck's results table only after testing. The roles comparison follows MongoDB's distinction between actions and resources, but the claimed authentication outcome is your experimental hypothesis. [MongoDB role documentation](https://www.mongodb.com/docs/manual/reference/built-in-roles/).

### Functional and negative controls

Run the following against each relevant application configuration:

| Case | Required evidence |
|---|---|
| Correct string credentials | Successful authentication and protected-page access |
| Wrong string password | Authentication failure and no protected-page access |
| Unknown username | Authentication failure |
| Password object containing `$ne` | Record the observed authentication outcome and filter structure |
| Username object containing `$ne`, with a wrong string password | Record whether the remaining password check still prevents authentication |
| Operator-looking text supplied as a JSON string | It remains a literal value in the fixed equality query and does not become an operator |
| Arrays, null, missing fields and numeric values | Hardened path rejects input according to its contract before a database query |
| Extra fields outside the request contract | Hardened path rejects them, or documents an explicit ignore policy that keeps them out of the filter |

The quoted-text control is especially useful: it separates the presence of the characters `$ne` from the presence of an operator object. Use prepared fixtures and record the exact inputs.

For every test, capture configuration ID, dependency versions, request ID, status, matched account if any, session outcome, and whether a database query occurred. Avoid logging actual password values or stored hashes. Repeat the relevant cases after a reset to confirm reproducibility. Repetition supports reliability in your environment, not population-level statistical claims.

### Live sequence: 90 seconds

| Time | Action | Explanation |
|---|---|---|
| 0-15 s | Show the local lab and wrong-password failure | State attacker access and the expected security rule |
| 15-40 s | Submit the injected JSON object to the vulnerable path | Show the changed predicate and incorrect session |
| 40-65 s | Replay the identical request against the hardened path | Show rejection at validation and no database query |
| 65-85 s | Submit valid credentials to the hardened path | Establish that legitimate authentication still works |
| 85-90 s | Return to the evidence slide | State which boundary the fix restored |

Keep the wider controls in the results slide and appendix. Avoid installing dependencies, typing long payloads, editing code or waiting for containers during the talk.

Record a short backup video using the same fixtures and build. Put annotated screenshots in the deck. Rehearse a recovery that switches to saved evidence within about ten seconds. The explanation and conclusions should survive a projector, network or local-process failure.

## 7. Timed main-deck blueprint

Aim for **13 main slides, 11 minutes 30 seconds**, including the demo and handovers. This leaves 30 seconds before the hard cutoff. References and technical appendices follow the conclusion and are available during Q&A.

The timing and subjects below follow the implemented deck. Historical version-specific material remains in the appendices; slide 11 provides the conceptual injection comparison.

| Slide | Subject | Evidence or visual | Time | What it supports |
|---:|---|---|---:|---|
| 1 | NoSQL Injections: When Client Input Changes a Database Query | Topic, research question and a small string-versus-object preview | 0:25 | A focused opening |
| 2 | Document queries support conditions as well as literal values | One account document, equality filter and operator filter, plus a small NoSQL family map | 0:50 | Essential background without a database survey |
| 3 | The application turns an HTTP request into a security decision | Client, parser, application, driver and database diagram with the trust boundary marked | 0:50 | Architecture, threat model and CS440 connection |
| 4 | The 2016 paper maps several routes to unintended database behaviour | Five-row attack map, chosen deep dive, original citation and investigation question | 0:50 | Literature understanding and explicit scope |
| 5 | An operator object changes the password predicate | Request, vulnerable code, resulting filter and match condition, revealed in sequence | 1:00 | Technical depth and causality |
| 6 | Valid JSON can still violate the login contract | Known-user example, literal-text control, attack assumptions and toy-lab caveat | 1:00 | Conceptual precision and limits |
| 7 | We compare controls while holding the request and records constant | Configurations, controls, measured outcomes and version summary | 0:35 | An inspectable research method |
| 8 | The same request tests the vulnerable and hardened paths | Four-step live demo with an evidence frame behind it | 1:30 | Excellent demonstration |
| 9 | Our results show where this injection stops | Observed control matrix, query/session evidence and valid-login result | 1:05 | Original analysis grounded in evidence |
| 10 | The fix enforces input types before database interpretation | Small validation diff and account-lookup/password-verification flow | 0:55 | Defence knowledge and practical lessons |
| 11 | Operator injection and JavaScript injection | Input forms, interpreters, relevant controls and an explicit conceptual-only disclosure | 0:55 | Context-specific defence reasoning |
| 12 | Our findings explain the failed authentication boundary | Two or three findings, each tied to an experiment or source | 0:45 | Strong synthesis rather than topic recap |
| 13 | Flexible search APIs still need enforceable query policies | One specific open problem, lab limitations and a final engineering recommendation | 0:50 | A grounded conclusion and research judgment |

Total: **690 seconds**. Background and framing use 2:55, approach uses 7:00, and conclusions use 1:35. If rehearsal exceeds the budget, shorten exposition and historical breadth before removing controls or the conclusion.

### Slide 5: the centre of the technical argument

The audience should be able to identify exactly what changed. Highlight the client-owned `password` value in one colour and the application-owned field names in another. Show the password changing from a scalar string to an operator object. Then show the exact filter MongoDB receives and the condition it evaluates.

Show a known username and one matching seeded account. Explain that `$ne: ""` matches that account because its stored value is non-empty. Include the qualifier in the slide caption. A complex payload or a screen full of code will make this explanation weaker.

### Slide 6: precision that prevents common misconceptions

Contrast an actual JSON object with operator-looking characters inside a JSON string. State that the application directly passes the parsed object to the driver. Explain the unsafe session decision and the deliberate plaintext simplification. This establishes why the demonstration works and prevents the audience from learning the wrong authentication design.

### Slides 8 and 9: a demo plus durable evidence

The main deck needs enough saved evidence to stand alone. Include the request, filter trace, vulnerable outcome, hardened outcome and valid-login control in readable frames. A QR code or repository link is useful supplementary material, but it cannot carry the graded explanation.

On slide 9, show the controls your group actually ran. Avoid a “100% secure” badge or attack-success percentages from a handful of fixtures. Report the cases and their outcomes.

### Slide 10: explain the strength and limits of each control

Distinguish:

- Validation and application-owned filters, which enforce the allowed query structure for the specified endpoint.
- Password-hash verification, which establishes credential correctness independently of account lookup.
- Restricting database privileges, which limits operations and resources available to the service account.
- Disabling unnecessary scripting, which reduces a separate execution surface.
- Transport encryption and monitoring, which support security but do not establish query intent.

Do not present every control as an interchangeable cure. For a legitimate search API that needs operators, define an allowed query language with field/operator restrictions, fixed access predicates, and resource limits. That use case needs a different contract from a login form.

### Slides 12 and 13: conclusions with warrants

Use a short evidence-to-lesson structure. Candidate conclusions, conditional on your findings:

1. Our reproduction shows that accepting an operator object can change a credential check into a broader predicate. Therefore, this endpoint must enforce scalar credential inputs before query construction.
2. Our comparison shows that a control aimed at scripting or writes does not necessarily prevent an unsafe permitted read from supporting false authentication. Therefore, evaluate controls against the mechanism they are supposed to stop.
3. Our hardened path blocks the tested malformed inputs while retaining valid login. Therefore, a security fix should preserve intended functionality and verify credentials independently.

Then state the scope: one stack, synthetic data, specified parser behaviour and a finite set of tests. The experiments do not measure prevalence in deployed applications or establish immunity to all injection variants.

Suggested open problem: **How can an API allow useful client-selected filters while proving that tenant or ownership restrictions remain in force?** Discuss the tension between expressiveness and enforceable policy. Propose a bounded follow-up comparing an explicit filter allowlist with a query-builder approach. Label it future work.

## 8. Visual design and submission quality

The deck should look like a carefully explained technical investigation. Use diagrams, short code excerpts and measured results as the main visuals.

- Use a consistent visual vocabulary for trusted application structure, client input, changed predicates and rejected input.
- Keep one main claim per slide. Use subtitles to state assumptions that affect the claim.
- Use 16:9 slides, roughly 32-40 pt titles, 24-28 pt body text, and readable code around 22 pt where space permits. Test on the actual presentation display or a similar projector.
- Limit technical excerpts to the lines needed for the argument. Place complete implementation details in the appendix.
- Use builds to reveal the request, filter and security decision in sequence. Give submitted slides complete final states, or supply static step frames so the PDF export preserves the explanation.
- Avoid terminal screenshots with tiny text, decorative hacker imagery, dense paragraphs and unrelated animations.
- Cite factual claims on the relevant slides with readable source identifiers. Put full bibliographic entries and links in the references appendix.
- Give lab evidence clear captions with test IDs and the tested environment. Use group-created diagrams and synthetic screenshots.
- Export and inspect the submitted file. Check that code, colours, citations and demo frames remain legible without animation or embedded video playback.

The brief asks for a slide deck, not a separate report. Make the deck self-contained through concise captions and focused appendices. Speaker notes can support delivery, but essential assumptions and evidence must remain visible in the submitted slides.

Suggested appendices: NoSQL family background, attack taxonomy, threat assumptions, exact environment, complete case/configuration matrix, request-to-filter traces, validation and authentication code, historical/current distinctions, limitations and full references. Use only the slides that answer real review or Q&A needs.

## 9. Sounding like committed security researchers

Write and speak in terms of mechanisms, observations and consequences. Suitable lines include:

> “We wanted to identify the exact point where a credential value became a database condition.”

> “The request parses correctly. Our application has failed to enforce the type of input it intended to accept.”

> “We kept the same records and request, then changed one control so we could explain the outcome.”

> “This result applies to our tested login path. Flexible search endpoints need a different policy, which is the next question we would investigate.”

Use first-person observations only after collecting the evidence. Say “we hypothesised” for predictions and “the authors demonstrate” for literature findings. Be willing to explain why an attempted attack failed. A failed attack can expose an important boundary just as clearly as a successful one.

Motivate the work with a concrete human consequence: an application can create a session for the wrong person even while using a legitimate database connection. Demonstrate that consequence with synthetic accounts. Avoid invented incidents, unsourced prevalence statistics and claims about universal NoSQL insecurity.

The research voice comes from care: understand the code, trace the semantics, verify the fix and respect the limits of the experiment. Deliver the final recommendation with confidence because the evidence supports its stated scope.

## 10. Q&A preparation

Every member should explain the complete mechanism and defend the main conclusion. Prepare short answers, then use appendices for details.

| Likely question | Answer your group should be able to defend |
|---|---|
| Why does JSON parsing not stop the attack? | The object is valid JSON. The endpoint should reject an object where its contract requires a string. |
| Is `$ne: ""` always true? | No. It matches the chosen non-empty seeded value, and `$ne` has documented missing-field behaviour. State the fixture assumptions. |
| Why do you know which account the attack selects? | The demonstrated username remains the exact unique value `alice`. A broader `findOne` query would not establish a particular account. |
| Is this a MongoDB server vulnerability? | Our reproduction demonstrates unsafe application use of a supported query operator. It does not demonstrate a defect in MongoDB's query implementation. |
| Does a native driver prevent injection? | Driver use does not by itself validate user-controlled predicate objects. Explain the actual filter construction. |
| Does password hashing solve it? | Correct hash verification blocks this illustrated password-filter bypass. Other queries still need their own input and authorisation contracts. |
| Why does a database account with read access still matter? | The application performs an allowed read and makes an unsafe authentication decision. Explain the difference between the service account and the end user. |
| Is JavaScript required for this attack? | The selected `$ne` example is a query-operator mechanism. Point to your scripting-disabled comparison once measured. |
| Does deprecation mean `$where` cannot run? | No. Cite the version-specific documentation and distinguish deprecation, disablement and removal. |
| Would every web form produce this object? | No. Parser settings and content type matter. We explicitly use JSON POST and record the parsed shape. |
| Why not remove every dollar sign? | The policy should validate fields and types. A character denylist does not explain or enforce the endpoint's complete contract. |
| Can this prove all NoSQL systems are vulnerable? | No. Our result applies to the tested application pattern. The paper provides broader examples with different conditions. |
| What is original in your project? | Our reproduced lab, controlled comparison, captured evidence and current assessment. The underlying attack comes from prior work. |
| Is CSRF an injection into query syntax? | It concerns a different trust boundary. We identify it as adjacent to the selected mechanism. |
| Can you prove the fixed application is secure? | We can show the tested contract and regression results. Comprehensive security requires reviewing the remaining endpoints and threat model. |

In practice, answer with the conclusion first, explain the mechanism or evidence, and finish with the relevant limit. Each member should rehearse answering one question about another member's section.

## 11. Team responsibilities and preparation schedule

For five members, allocate presentation blocks with continuity:

| Member | Presentation block | Research responsibility |
|---|---|---|
| 1 | Slides 1-3 | Background, architecture and course connections |
| 2 | Slides 4-6 | Paper analysis, attack semantics and assumptions |
| 3 | Slides 7-8 | Lab, controls, reproducibility and demo |
| 4 | Slides 9-11 | Observed results, defence analysis and current documentation |
| 5 | Slides 12-13 | Conclusions, open problem, limitations and deck integration |

For four members, use blocks **1-4, 5-7, 8-10, 11-13**. Distribute integration and Q&A work across everyone. Presentation time need not be equal to the second, but every member should contribute substantively.

Use a shared deck owner to maintain coherence while everyone owns evidence and technical understanding. Pair each person's work with a second member who checks it. Rehearse the handover sentence so every section advances the same investigation.

### Relative schedule

Use the actual presentation date as T. Aim to complete these gates roughly in this sequence:

| Target | Work | Gate before moving on |
|---|---|---|
| T-14 days | Read the assigned article, agree on the question and scope, draft the evidence ledger | Every member explains the intended mechanism and the threat assumptions |
| T-11 days | Build and reproduce the smallest vulnerable lab | Wrong-password control fails and the injected request produces the claimed application outcome |
| T-9 days | Implement isolated controls and the final authentication path | Record outcomes, query occurrence and functional controls without confounding the isolated comparisons |
| T-7 days | Complete the claim-led deck and appendices | Each main claim has evidence, assumptions and a defensible source |
| T-5 days | Record backup media and reproduce on a second machine | Demo reset and backup recovery work reliably |
| T-3 days | Rehearse complete delivery and challenging Q&A | Finish at or below 11:30 with handovers and demo included |
| T-2 days | Review clarity from an audience perspective, inspect exports, freeze dependencies | Main deck remains understandable without a live demo |
| Before submission deadline | Final file check and individual uploads | Every member confirms the required submission and presentation availability |

If less time remains, preserve the lab controls, evidence-led core deck, backup and rehearsal. Compress historical detail and optional appendix breadth first.

## 12. Final readiness check

Treat this as an internal assessment tool, not an additional lecturer requirement:

- [ ] The first minute establishes the question and why it matters.
- [ ] Background covers the concepts needed to follow the attack.
- [ ] The threat model states attacker control and application assumptions.
- [ ] A peer can trace the exact request into the exact query and security decision.
- [ ] The toy reproduction visibly labels its plaintext-password simplification.
- [ ] The experiment separates individual controls from the complete hardened design.
- [ ] The result slide contains measured outcomes rather than predictions.
- [ ] Valid and invalid requests show that the fix preserves legitimate functionality.
- [ ] The deck distinguishes application users from database service accounts.
- [ ] Historical examples have dates and current applicability checks.
- [ ] Conclusions follow from evidence and state the experiment's limits.
- [ ] The open problem identifies a specific unresolved engineering tension.
- [ ] Every member can explain the attack, fix and limits during Q&A.
- [ ] The submitted deck retains the mechanism and results without animation or video.
- [ ] The complete talk fits the target time, and backup recovery has been rehearsed.
- [ ] Every member submits as required and completes the peer-assessment requirement.

The strongest finished project will let the lecturer inspect a complete argument: a precise question, sufficient background, a mechanism the group understands, experiments with controls, a fix supported by evidence, and conclusions that remain accurate under questioning.

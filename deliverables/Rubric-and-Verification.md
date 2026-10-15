# Rubric coverage and verification record

Prepared 8 October 2026. The project briefing combines A/A+ in its highest band; it has no separate A+ checklist. Course weights below come from the briefing. This document records the authored evidence, not a predicted grade.

| Component | Course weight | Evidence in the final pack |
|---|---:|---|
| Presentation | 5% | Continuous input-to-security-decision argument; consistent legible slides; native editable diagram and tables; 13 main slides targeting 11:20; complete notes; controlled 90-second demo and offline fallback |
| Background | 3% | Slides 2-4: document/query concepts, adoption motivation, NoSQL families, application architecture, threat model, paper context and authentication/access-control distinctions |
| Approach | 10% | Slides 5-11: exact request and query semantics, assumptions, object versus literal control, 15 cases across five configurations repeated twice, actual command monitoring, protected-access checks, independently verified controls, isolated validation comparison and separate password verification |
| Conclusion | 2% | Slides 12-13: evidence-linked findings, engineering lessons, scope and a bounded open problem on client-selected filters with mandatory ownership restrictions |
| Q&A | Within relevant components | Appendices 14-24 and 25-question defence pack; environment, code, case tables, independent controls, actual captures, limits and references |

## Completed checks

- Native lab startup executed successfully with two dedicated authenticated MongoDB instances bound to loopback.
- Occupied app-port startup refused before any database connection. Existing services are not reused.
- Experiment passes 150 login configuration/case observations, 150 protected-access checks and 10 additional malformed/origin HTTP checks.
- Independent read-only-role and disabled-scripting checks passed.
- The hardened collection contains no plaintext password property; valid credentials still succeed.
- Deck package integrity and geometry validation passed with zero findings and zero layout warnings. The 24-slide file re-imported successfully. Seven editable native tables are present.
- All 24 authored slide renders and all 24 PDF pages were visually reviewed. Required diagram direction, appendix table fit and browser evidence framing were checked.
- PDF exported through LibreOffice. PowerPoint-specific rendering has not been verified; inspect the file on the presentation machine.
- Offline video checked as H.264, 1920 x 1080, 90.000 seconds. It is a sequence of captured states, not a continuous recording.
- ZIP manifest checked for exclusion of generated credentials, database state, node_modules and caches.

## Claim discipline

The result is a reproduction and controlled extension of prior work in one recorded stack. It does not establish deployed prevalence, a server defect, universal NoSQL behaviour, arbitrary administrator access or complete production security. Two repeated runs support local reproducibility, not a statistical prevalence claim.

The SMU proxy was inaccessible during preparation. Technical discussion used the authors' accessible InfoQ republication, and bibliographic identity follows IBM Research's publication record. Original paper page/figure references remain unverified and are not asserted in the deck.

## Human verification still required

Group-wide understanding and Q&A rehearsal, actual delivery under 12 minutes, participation by every member, second-machine execution, final projection check and individual submission remain the group's actions. Keep contribution records for peer assessment. The timed script is a starting point: speak the reasoning in your own words.

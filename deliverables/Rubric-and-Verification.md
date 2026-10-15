# Rubric coverage and verification record

Reviewed 15 October 2026. The project briefing combines A/A+ in its highest band; it has no separate A+ checklist. Course weights below come from the briefing. This document records the authored evidence, not a predicted grade.

| Component | Course weight | Evidence in the final pack |
|---|---:|---|
| Presentation | 5% | Continuous input-to-security-decision argument; consistent legible slides; native editable diagram and tables; 13 main slides targeting 11:30; complete notes; controlled 90-second demo and offline fallback |
| Background | 3% | Slides 2-4: document/query concepts, adoption motivation, NoSQL families, application architecture, threat model, paper context, a five-row attack landscape and authentication/access-control distinctions |
| Approach | 10% | Slides 5-11: exact request and query semantics, assumptions, object versus literal control, 15 cases across five configurations repeated twice, actual command monitoring, protected-access checks, independently verified controls, isolated validation comparison, separate password verification and a sourced conceptual comparison with JavaScript injection |
| Conclusion | 2% | Slides 12-13: evidence-linked findings, engineering lessons, scope and a bounded open problem on client-selected filters with mandatory ownership restrictions |
| Q&A | Within relevant components | Appendices 14-24 and 28-question defence pack; environment, code, case tables, independent controls, actual captures, limits and references |

## Evidence and preparation

The lab records 150 login configuration/case observations and a protected-endpoint check for each, plus independent configuration probes. Supplementary regressions check session carry-over, content type, logout, request size and startup isolation. Control-probe unit tests specifically prevent unexpected success or unrelated errors from becoming false evidence.

The 24-slide deck contains eight editable tables and embedded notes. The main talk targets 11:30, including a 90-second demonstration. The offline video shows four real captured states and requires live narration. It is a fallback alongside the readable appendix captures.

See `../research/Claim-Ledger.md` for each claim's source, observation and scope. Test and authoring diagnostics remain separate from the deck.

## Claim discipline

The result is a reproduction and controlled extension of prior work in one recorded stack. It does not establish deployed prevalence, a server defect, universal NoSQL behaviour, arbitrary administrator access or complete production security. Two repeated runs support local reproducibility, not a statistical prevalence claim.

The SMU proxy was inaccessible during preparation. Technical discussion used the authors' accessible InfoQ republication, and bibliographic identity follows IBM Research's publication record. Original paper page/figure references remain unverified and are not asserted in the deck.

## Human verification still required

Group-wide understanding and Q&A rehearsal, actual delivery under 12 minutes, participation by every member, second-machine execution, final projection check and individual submission remain the group's actions. Keep contribution records for peer assessment. The timed script is a starting point: speak the reasoning in your own words.

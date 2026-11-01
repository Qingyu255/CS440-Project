# Rubric coverage and verification record

Reviewed 1 November 2026. The project briefing combines A/A+ in its highest band; it has no separate A+ checklist. Course weights below come from the briefing. This document records authored evidence, not a predicted grade.

| Component | Course weight | Evidence in the final pack |
|---|---:|---|
| Presentation | 5% | Alice login story; editable explanatory diagrams and result matrix; 13 main slides with 10:25 content and 10:50–11:00 full-run target; complete notes; click builds; 90-second demo and refreshed fallback; named speaker handover guide |
| Background | 3% | Slides 2–4: plain definitions of document, predicate, $ne, empty string and session; NoSQL families, architecture, threat model, five literature classes and authentication/access-control distinctions |
| Approach | 10% | Slides 5-11: exact request and query semantics, assumptions, object versus literal control, 15 cases across five configurations repeated twice, actual command monitoring, protected-access checks, independently verified controls, isolated validation comparison, separate password verification and a sourced conceptual comparison with JavaScript injection |
| Conclusion | 2% | Slides 12-13: evidence-linked findings, engineering lessons, scope and a bounded open problem on client-selected filters with mandatory ownership restrictions |
| Q&A | Within relevant components | Appendices 14-24 and 28-question defence pack; environment, code, case tables, independent controls, actual captures, limits and references |

## Evidence and preparation

The lab records 150 login configuration/case observations and a protected-endpoint check for each, plus independent configuration probes. Supplementary regressions check session carry-over, content type, logout, request size and startup isolation. Control-probe unit tests specifically prevent unexpected success or unrelated errors from becoming false evidence.

The 24-slide deck contains five editable tables, explanatory diagrams and embedded notes. Standard PowerPoint builds on slides 5 and 10 support staged explanations; the PDF retains all content. The 15-page team handover explains every slide and appendix. Fresh PNG evidence replaces the earlier JPEG crops, and the 90-second video uses those authentic states. The target full run is 10:50–11:00 including handovers.

See `../research/Claim-Ledger.md` for each claim's source, observation and scope. Test and authoring diagnostics remain separate from the deck.

## Claim discipline

The result is a reproduction and controlled extension of prior work in one recorded stack. It does not establish deployed prevalence, a server defect, universal NoSQL behaviour, arbitrary administrator access or complete production security. Two repeated runs support local reproducibility, not a statistical prevalence claim.

The SMU proxy was inaccessible. Taxonomy was checked against the author-uploaded manuscript and the authors' InfoQ republication. Bibliographic identity follows IBM Research. Publisher page/figure numbers are not asserted.

## Human verification still required

Group-wide understanding and Q&A rehearsal, actual delivery under 12 minutes, participation by every member, second-machine execution, final projection check and individual submission remain the group's actions. Keep contribution records for peer assessment. The timed script is a starting point: speak the reasoning in your own words.

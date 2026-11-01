# CS440 NoSQL Injections: complete project pack

Start with `deliverables/CS440-NoSQL-Injections-Final-Deck.pptx` and `deliverables/CS440-Team-Handover.docx`. The deck contains 13 main slides and 11 appendices. Planned content is 10:25, including a 90-second demo. Aim for a measured full rehearsal of 10:50–11:00 including handovers. These times are targets.

## Files

- `deliverables/CS440-NoSQL-Injections-Final-Deck.pptx`: editable diagrams, five native tables, embedded notes and standard click builds on slides 5 and 10.
- `deliverables/CS440-NoSQL-Injections-Final-Deck.pdf`: portable 24-page copy with complete static states.
- `deliverables/CS440-Team-Handover.docx`: core idea, plain explanation, pointing cues, transition and likely question for every slide; glossary and demo checklist.
- `deliverables/Speaker-Script.md`: complete timed main-talk script.
- `deliverables/Q-and-A-Defence-Pack.md`: 28 questions, short answers, technical follow-ups and evidence references.
- `deliverables/Demo-and-Rehearsal-Guide.md`: demo operation, fallbacks, handovers and rehearsal gates.
- `deliverables/Demo-Backup-90s.mp4`: silent 90-second sequence of four actual captured browser states, for live narration. Use appendix 20-21 for larger evidence views.
- `deliverables/Rubric-and-Verification.md`: highest-band coverage and verification record.
- `nosql-lab/README.md`: setup and reproducible test instructions.
- `nosql-lab/evidence/`: measured results and actual browser captures.
- `NoSQL-Injections-Aplus-Plan.md`: original research and deck blueprint. Planned statements in this historical plan are superseded by the measured evidence and final deck.

## Run the lab

With Node >=20 and `mongod` on PATH, open a terminal inside `nosql-lab`:

```sh
npm ci
npm start
```

Wait for LOCAL LAB READY. Open http://127.0.0.1:4400. In a second terminal, run `npm run test:all`. The recorded stack is MongoDB 7.0.0, Node v23.6.1, Express 5.1.0 and driver 6.20.0 on macOS arm64. Other environments need their own recorded test run.

## Remaining group actions

Suggested blocks follow the supplied order: Ercong Kee 1–3, Pheobe Neo 4–6, Kendrick Poon 7–9 including the demo, Liu Qingyu 10–13. Rehearse with the timer, handovers and a deliberate demo failure. Run the lab and check the click builds on the presentation machine. The author manuscript confirms the taxonomy; check the publisher copy if adding publisher page references. Every member must present, attend Q&A and individually submit by the required deadline.

The briefing combines A/A+ in one band. This pack addresses that band; the actual grade also depends on your delivery, understanding and Q&A.

The shareable ZIP excludes generated credentials, database files, package caches and node_modules. Install dependencies locally with npm ci.

# CS440 NoSQL Injections: complete project pack

Start with `deliverables/CS440-NoSQL-Injections-Scope-Expanded.pptx`. It contains 13 main slides and 11 appendices. Main-slide speaker notes and the separate script target 11:30, including a 90-second demo. This duration is a rehearsal target.

## Files

- `deliverables/CS440-NoSQL-Injections-Scope-Expanded.pptx`: editable deck, native diagrams and tables, embedded speaker notes and source URLs.
- `deliverables/CS440-NoSQL-Injections-Scope-Expanded.pdf`: portable 24-page copy; speaker notes stay in the PPTX and script.
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

Assign names and speaker blocks. Rehearse the full talk with the timer, transitions and a deliberate demo failure. Execute the lab on the presentation machine. Check original library pages/figures if adding original page references. Verify lecturer-specific instructions and the presentation date. Every member must present, attend Q&A and individually submit by the required deadline.

The briefing combines A/A+ in one band. This pack addresses that band; the actual grade also depends on your delivery, understanding and Q&A.

The shareable ZIP excludes generated credentials, database files, package caches and node_modules. Install dependencies locally with npm ci.

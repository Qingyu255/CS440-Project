# CS440-Project

[![Verify research lab](https://github.com/Qingyu255/CS440-Project/actions/workflows/verify.yml/badge.svg)](https://github.com/Qingyu255/CS440-Project/actions/workflows/verify.yml)

A controlled investigation of NoSQL query-operator injection for the CS440 group project. Based on Ron, Shulman-Peleg and Puzanov, *Analysis and Mitigation of NoSQL Injections*, IEEE Security & Privacy 14(2), 30-39 (2016), DOI [10.1109/MSP.2016.36](https://doi.org/10.1109/MSP.2016.36).

The local synthetic lab follows an injected JSON request through query construction, false authentication and protected-data access, then compares five configurations. The final presentation contains 13 main slides and 11 appendices, targeting 11:20 including a 90-second demo.

## Presentation and preparation

- [Editable deck](deliverables/CS440-NoSQL-Injections-Reviewed.pptx)
- [Portable PDF](deliverables/CS440-NoSQL-Injections-Reviewed.pdf)
- [Speaker script](deliverables/Speaker-Script.md)
- [Q&A defence pack](deliverables/Q-and-A-Defence-Pack.md)
- [Demo and rehearsal guide](deliverables/Demo-and-Rehearsal-Guide.md)
- [Offline 90-second demo](deliverables/Demo-Backup-90s.mp4)
- [Claim ledger](research/Claim-Ledger.md) and [research defence](research/Research-Defence.md)
- [Editable slide source](presentation/README.md)
- [Start here](START-HERE.md)

## Run the lab

Install Node >=20 and a compatible MongoDB server binary with `mongod` on PATH. See [the lab README](nosql-lab/README.md) for exact recorded versions and scope.

```sh
git clone https://github.com/Qingyu255/CS440-Project.git
cd CS440-Project/nosql-lab
npm ci
npm start
```

After LOCAL LAB READY, open http://127.0.0.1:4400. In another terminal in `nosql-lab`, run `npm run test:all`.

The runner uses two dedicated authenticated MongoDB instances and loopback ports 4400, 54171 and 54172. Ctrl+C stops its own processes. Generated credentials and database files stay in ignored `.state` directories. All included user accounts and notes are synthetic lab fixtures.

## Research boundary

This is a reproduction and controlled extension of prior work in one recorded stack. Results do not establish deployed prevalence, a MongoDB server defect, arbitrary administrator access or complete production security. Vulnerable modes deliberately retain plaintext toy records to expose the mechanism. The hardened path uses separate records containing salted scrypt hashes.

The course rubric combines A/A+ in one band. Strong evidence supports the submission, while the final assessment also depends on the group's understanding, presentation and Q&A.

# Demo and rehearsal guide

The main talk has 13 slides and 10:25 of planned content, including the 90-second demo. Allow about 25 seconds for handovers and navigation, and target a measured full run of 10:50–11:00. Appendices 14–24 support Q&A. Delivery still needs a real group rehearsal.

## Before presenting

1. Start the local lab using its README. Run `npm run test:all` on the presentation machine before class.
2. Open the lab at http://127.0.0.1:4400 and choose the vulnerable baseline.
3. Open slide 8, then keep the browser ready in another window.
4. Open `Demo-Backup-90s.mp4` locally. This silent video shows four real captured states and needs live narration.
5. Keep appendix slides 20 and 21 available as an additional fallback.
6. Clear the lab session. Select Wrong password before the demo starts.

## Ninety-second choreography

| Time | Operator action | Spoken point |
|---|---|---|
| 0-15 s | Baseline; Wrong password; Send JSON request | A wrong credential fails and protected notes remain inaccessible |
| 15-40 s | Operator object; Send JSON request | The password becomes a predicate; Alice matches and the app creates a session |
| 40-65 s | Select hardened; replay the unchanged object | The server rejects the contract before a find command; protected access fails |
| 65-85 s | Valid credentials; Send JSON request | Correct credentials still work after the fix |
| 85-90 s | Return to slide 9 | The results identify the boundary restored by validation |

Pause for the displayed HTTP outcome. The final hash-verification step may take a fraction of a second. Do not narrate an outcome before it appears.

## Recovery

If a process or display fails, switch to the local backup within about ten seconds. Say: “We will use our captured run. The request, predicate and outcome are the same recorded experiment.”

The video is a sequence of four actual browser states captured on 1 November 2026, not a continuous screen recording. Each stage shows the full configuration/request view, then an enlarged response. Optional subtitles identify the stages. The stages last 15, 25, 25 and 25 seconds. If playback fails too, use the fresh PNG captures or appendix slides 20 and 21. Slide 8 also contains enlarged actual decision crops.

## Scope of the contrast

Slide 4 maps the paper's five attack classes. Slide 11 provides a 40-second conceptual comparison of operator injection and unsafe JavaScript construction. The demo stays at 90 seconds. The fixed `$where` probe checks configuration and is not a second injection exploit. Standard click builds on slides 5 and 10 reveal the mechanism and fix in stages. The PDF contains all final states. Check the builds on the actual presentation machine.

## Timing and handovers

| Slides and speaker | Content budget | Handover sentence |
|---|---:|---|
| 1–3 / Ercong Kee | 2:00 | “The assigned paper shows several ways input can cross a boundary like this.” |
| 4–6 / Pheobe Neo | 2:25 | “We kept those assumptions fixed while comparing five configurations.” |
| 7–9 / Kendrick Poon | 3:15 | “The minimal fix explains the result. A complete login also needs proper password verification.” |
| 10–13 / Liu Qingyu | 2:45 | Finish the recommendation and proposed search experiment, then invite questions |

These suggested blocks follow the supplied name order. The content budgets total 10:25. Rehearse all transitions and navigation as part of the full timer. See CS440-Team-Handover.docx for the core idea, explanation and question for each slide.

## Rehearsal gates

- First run: accuracy. Each person explains the mechanism in their own words and answers a question outside their block.
- Second run: full timing, including browser switching, waits and handovers. Aim for 10:50–11:00.
- Third run: deliberate demo failure. Practise switching to the captured run without losing the argument.
- Final run: present from the final exported deck on the actual presentation machine.

If the talk exceeds the budget, trim historical detail and repeated explanations before removing controls or conclusions. Keep the protected-page consequence and the successful valid-login control.

## Submission and remaining group work

The supplied group members appear on the cover. Every member must understand the complete mechanism, present, attend Q&A and submit the deck as the briefing requires. Confirm the midnight-before-presentation deadline in eLearn.

The authored pack and local experiment are complete. CI evidence, when successful, provides an additional runner environment and does not replace your presentation-machine check. Remaining human steps are the second-machine run, group rehearsal, any lecturer-specific adjustments and individual submission. No group delivery or second-machine execution has been claimed as completed.

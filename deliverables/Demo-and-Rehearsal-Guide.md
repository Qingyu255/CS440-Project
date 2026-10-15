# Demo and rehearsal guide

The main talk has 13 slides with a target duration of 11:20. Appendices 14-24 support Q&A. The 90-second demo forms part of that target. Delivery duration still needs a real group rehearsal.

## Before presenting

1. Start the local lab using its README. Run `npm test` on the presentation machine before class.
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

The video is a sequence of four captured browser states, not a continuous screen recording. Its stages last 15, 25, 25 and 25 seconds. The last stage includes the closing sentence. Narrate the evidence. If playback fails too, use the four JPEGs or appendix slides 20 and 21. The main result table preserves all four outcomes.

## Timing and handovers

| Slides | Budget | Handover sentence |
|---|---:|---|
| 1-3 | 2:05 | “That boundary gives us the question we tested.” |
| 4-6 | 3:05 | “We turned this mechanism into a controlled comparison.” |
| 7-8 | 2:05 | “The live result is one case in our wider control matrix.” |
| 9-11 | 2:30 | “Those differences determine what we can conclude.” |
| 12-13 | 1:35 | Finish with the recommendation and invite questions |

The five-member blocks follow these rows. For four members, use 1-4, 5-7, 8-10 and 11-13. Assign names yourselves, then rehearse all transitions as part of the timer.

## Rehearsal gates

- First run: accuracy. Each person explains the mechanism in their own words and answers a question outside their block.
- Second run: full timing, including browser switching, waits and handovers. Aim for 11:20 or less.
- Third run: deliberate demo failure. Practise switching to the captured run without losing the argument.
- Final run: present from the final exported deck on the actual presentation machine.

If the talk exceeds the budget, trim historical detail and repeated explanations before removing controls or conclusions. Keep the protected-page consequence and the successful valid-login control.

## Submission and remaining group work

Add your actual group members to the title slide if desired. Every member must understand the complete mechanism, present, attend Q&A and submit the deck as the briefing requires. Confirm the midnight-before-presentation deadline in eLearn.

The files and local experiments are complete. Remaining human steps are the second-machine run, group rehearsal, any lecturer-specific adjustments and individual submission. No group delivery or second-machine execution has been claimed as completed.

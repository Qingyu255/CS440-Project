# Browser evidence captured on 1 November 2026

These PNGs show actual UI interactions with the existing local synthetic lab at http://127.0.0.1:4400. MongoDB 7.0.0 and Node v23.6.1 were visible in the environment line. They supplement the original experiment at commit c8252d2bb3baeb543a011992e2a79ee2123ecfec and do not change the original 150-observation count.

| Stage | Full-page source | Response crop | Verified outcome |
|---|---|---|---|
| Wrong password / baseline | fresh-01-wrong.png | fresh-01-evidence.png | HTTP 401; unauthenticated; protected notes denied |
| Operator object / baseline | fresh-02-bypass.png | fresh-02-evidence.png | HTTP 200; authenticated as Alice; synthetic notes accessible |
| Identical object / hardened | fresh-03-hardened.png | fresh-03-evidence.png | HTTP 400; rejected before filter construction; no query; protected notes denied |
| Correct credentials / hardened | fresh-04-valid.png | fresh-04-evidence.png | HTTP 200; authenticated as Alice; username-only query; synthetic notes accessible |

The two decision-only crops on main slide 8 are fresh-02-decision.png and fresh-03-decision.png. They show the application decision and protected-note outcome at a readable scale. The complete response crops appear on slides 20–21. The same username and password operator object were used for bypass and rejection. Crops are direct browser screenshots, with no reconstructed or generated evidence text. Surrounding slide labels are annotations.

The video presents full-page and response views in sequence. It is a 90-second sequence of authentic captured states for live narration, rather than a continuous recording. Correct-login captures were saved only after the hash-verification response and protected-note result completed. Ordinary passwords are redacted from database query traces. All displayed accounts and notes are synthetic fixtures.

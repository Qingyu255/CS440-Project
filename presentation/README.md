# Presentation source

The final PPTX keeps text, explanatory diagrams and six tables editable. Two generated editorial illustrations are project assets used only on the cover and closing slide; experimental results and evidence remain native objects or authentic browser captures. Main-talk notes are also in `../deliverables/Speaker-Script.md`. `slide-source.json` contains titles, notes, core ideas, owners and timing for all 24 slides.

`revised-content.mjs` holds narration, section boundaries, transitions and questions. `revised-deck.mjs` defines the editable 1280 × 720 layouts and reads the measured results. `build-deck.mjs` and `finalize-revised.mjs` materialize local image bytes and validate the file. A live-session source snapshot alone is insufficient to package image assets. `add-reveals.py` adds standard click builds on slides 5 and 9 before final validation. Check builds in the actual presentation application.

## Rebuild with Codex's bundled artifact runtime

This optional authoring path needs the bundled `@oai/artifact-tool` presentation runtime. It is not a public npm dependency required to run the security lab. A teammate can edit the PPTX directly without it.

Use Codex's workspace dependency tool to resolve these environment variables:

- `PRESENTATIONS_SKILL_DIR`: active Presentations skill directory.
- `RUNTIME_NODE`: bundled Node executable.
- `RUNTIME_NODE_MODULES`: bundled Node packages.
- `RUNTIME_PYTHON`: bundled Python executable.

Then run:

```sh
node presentation/rebuild.mjs
```

Set `DECK_FILENAME` to a new `.pptx` filename for every revision. The finalizer preserves existing outputs. Private candidate files, renders and validation reports go into ignored `.build`. The finalizer checks package structure and geometry, then imports the exported file again. Inspect the final slides visually before treating a rebuild as ready to present.

PDF export and the offline video are separate deliverables. When changing technical claims, first rerun the experiment, update the claim ledger and check both the PDF and PPTX against the measured results.

## Offline video

After capturing the four actual browser states and their request/outcome regions, `node presentation/build-backup.mjs` rebuilds the silent 90-second video using FFmpeg. It includes optional text subtitles from `Demo-Backup-Captions.srt`. The video uses actual captures and presents two readable views per state.

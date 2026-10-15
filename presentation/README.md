# Presentation source

The delivered PPTX keeps its text, architecture diagram and eight tables editable in PowerPoint. Main-talk notes are also available in `../deliverables/Speaker-Script.md`. `slide-source.json` contains slide titles and complete speaker notes for all 24 slides. The full canvas content is defined in `build-deck.mjs`.

`build-deck.mjs` is the JavaScript source used for the deck. Its result table reads the measured experiment JSON and refuses inconsistent repetitions. The code preserves the 1280 x 720 canvas and the deck's typography and colours.

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

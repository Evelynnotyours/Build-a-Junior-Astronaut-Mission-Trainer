# Scene-player handoff — Member 1

Implemented in `src/engine/scene-player.ts` and `scene-registry.ts`. This is the pure runner; the visible app still needs an authored Sol 1 and UI integration. Test timelines are fixtures, not approved runtime content.

## Integration sequence

1. Launch with the existing engine, then resolve the matching authored scene with the registry. Solar selection uses frozen mission input; Sol 8 uses the repair flag. Missing content throws explicitly.
2. Call `startScene` once after sol-start effects. Its `sol_start` checkpoint retains the initial BRIEFING state: give this to the existing memory-only retry session.
3. Render `sceneView`. Dialogue/narration/After/card wait for Advance; walking waits for the correct spot and arrival (Advance can skip an in-progress walk). Reduced motion completes walking immediately.
4. Pass `stampSceneInput(visiblePlayback, input)` from each view callback to `sendSceneInput`. Preserve a monotonically increasing `visitBase` across retries/restores to reject callbacks from a prior view of the same step. Old consumers can still send step IDs alone, but they cannot distinguish visits to the same ID.
5. Replace the playback with the returned value. Consume that transition's cues and checkpoints once; do not replay old outboxes on React renders. Cue metadata includes event ID, step ID and solar variant. The renderer resolves assets/audio and handles missing optional media.
6. Persist the latest visible game/cursor with `createSaveEnvelope` and the existing storage service. Use `sol_start` before the choice, `choice_result` for RESULT/REAL_CARD, `night` for NIGHT and `ending` for ENDED. Persist walking/task selection too; `resumeScene` uses the existing Continue normalization so walking restarts at destination selection and unfinished tasks restart without a bonus. Never re-launch or regenerate a restored sol.
7. When playback is `complete`, call `beginNextSol` once and start its authored scene. `mission_end` announces the engine outcome; navigate to the report when playback is `ended`, allowing authored success epilogue dialogue after the final night. Failure stops immediately before normal After/card flow.

## Options and inputs

- `miniGames`: enable attached tasks; false/omitted skips without the completion bonus. Both `done` and `skipped` resolve through the existing engine exactly once.
- `classroomMode`: enables authored discussion pauses within the same mission.
- `reduceMotion`: instant destination arrival.
- Risky choices set `playback.caution` without applying costs. UI sends `confirm_choice` or `cancel_choice` with the originating step ID (and stamped visit).
- Wrong destinations return `feedback: wrong_spot`; the UI supplies a friendly hint.

Registry validation rejects missing targets, loops, unreachable steps, wrong fixed-sol IDs, mismatched choice/After routes, attached mini-game mismatches and missing result/card/night progression. It does not verify scientific claims, translations, media paths or content-key existence; those remain content/integration validation work.

## Verified checkpoint

89 project tests pass, including movement, reduced motion, stale callbacks, three choice routes, optional classroom pause, done/skipped/disabled mini-games, immediate-failure confirmation and committed result/night recovery. Actual browser UI, all ten authored timelines and backend integration are still outstanding.

## Sol 1 app integration

The approved Sol 1 timeline and prologue are now in src/engine/scenes/sol01-touchdown.ts and src/content/story.json. src/App.tsx is temporary Member 1 integration markup, not the final presentation. It checks /api/sky, plans cargo, runs the tutorial and saves/restores the cursor. Continue does not refetch sky. It stops after Sol 1 NIGHT without claiming mission success. Camera/audio/effect cues are authored but not rendered yet; the card invitation collects rm_gale but scientific/photo content still needs integration. Retry, low-meter warning presentation and later sols remain to connect. All 93 project tests pass, including actual React tutorial traversal, result Continue and failure of the replacement lookup preserving the old save.

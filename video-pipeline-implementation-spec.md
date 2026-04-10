# Village Vista Land Co — Video Pipeline Implementation Spec

**Project:** LandFlow CRM → hotspringsland.com automated listing video pipeline
**Owner:** Richard Alberti, Elk Creek Group USA LLC
**Target runtime:** Exactly 45 seconds per video
**Stack:** Gemini Nano Banana Pro (image enhancement) → Kling AI (image-to-video) → FFmpeg (stitching) → Supabase (storage)

---

## Table of Contents

1. [Critical Bug Fixes](#1-critical-bug-fixes)
2. [Pipeline Architecture](#2-pipeline-architecture)
3. [Photo Classification & Tagging](#3-photo-classification--tagging)
4. [Parcel Perspective Prompts (NanoBanana)](#4-parcel-perspective-prompts-nanobanana)
5. [Parcel Animation Prompts (Kling)](#5-parcel-animation-prompts-kling)
6. [Misc Photo Enhancement Prompts (NanoBanana)](#6-misc-photo-enhancement-prompts-nanobanana)
7. [Misc Photo Animation Prompts (Kling)](#7-misc-photo-animation-prompts-kling)
8. [Drone Finale Prompt](#8-drone-finale-prompt)
9. [Video Timeline & Clip Ordering](#9-video-timeline--clip-ordering)
10. [Marketing Copy / Voiceover Narration Spec](#10-marketing-copy--voiceover-narration-spec)
11. [Logging & Observability](#11-logging--observability)
12. [Logo Card](#12-logo-card)
13. [File Change Checklist](#13-file-change-checklist)
14. [Verification Steps](#14-verification-steps)

---

## 1. Critical Bug Fixes

These must be fixed before any other work. All three cause hard failures in the current pipeline.

### Fix 1: Kling API parameter name
**Files:** `lib/pipeline/ai-video.ts`, `scripts/generate-video-standalone.mjs`

Change `image:` to `image_url:` in the Kling request body. The current parameter name causes Kling error 1201.

### Fix 2: Kling API duration format
**Files:** `lib/pipeline/ai-video.ts`, `scripts/generate-video-standalone.mjs`

Change `duration: String(duration)` to `duration: duration`. Kling expects a number, not a string.

### Fix 3: Clip stitching voiceover handling
**File:** `lib/pipeline/ai-video.ts` — `stitchClipsWithAudio()`

Check that `voiceoverPath` is truthy before adding it as an FFmpeg input. Handle three cases: voiceover + music, music only, and silent.

---

## 2. Pipeline Architecture

The pipeline produces a single 45-second branded video per listing. High-level flow:

```
Upload photos (tagged at upload time)
  ↓
Classify: parcel photos vs misc photos
  ↓
Generate 4 parcel perspectives from best parcel image (NanoBanana)
  ↓
Enhance misc photos by category (NanoBanana, lighter touch)
  ↓
Submit all clips to Kling with per-clip prompts
  ↓
Poll Kling until all clips complete
  ↓
Generate voiceover from marketing copy (85–95 words)
  ↓
Select background music
  ↓
FFmpeg stitch: parcel clips → misc clips → drone finale → logo card
  ↓
Upload to Supabase, return URL
```

Fire-and-forget pattern: return 202 immediately, process in background, update job status in Supabase.

---

## 3. Photo Classification & Tagging

**Do not auto-classify photos.** Filename heuristics and CV detection are fragile and will eventually feed an amenity photo into the parcel pipeline and produce garbage.

### Required schema changes

Add two explicit fields to the photo upload schema:

- **`photoRole`** — required, enum: `parcel` | `misc`
- **`photoCategory`** — required when `photoRole === 'misc'`, enum:
  - `entrance_sign`
  - `golf_course`
  - `water_recreation`
  - `downtown_street`
  - `amenity_park`
  - `generic_landscape`
  - `generic_lifestyle`

The user tags each photo at upload time. If a photo has no role tag, the upload is rejected with a clear error message.

### Priority for parcel photos

If multiple photos are tagged `parcel`, use the first one (upload order) as the source for all four perspective generations. All four NanoBanana calls use the same source image with different prompts.

### Priority for misc photos

If more than 4 misc photos are uploaded, use the first 4 by upload order. Do not use more than 4 misc clips in the final video — the timeline is locked.

---

## 4. Parcel Perspective Prompts (NanoBanana)

These four prompts are used verbatim. Do not shorten, optimize, or rewrite them — the length and specificity are load-bearing. All four use the same source satellite/parcel image.

### Shot 1 — Pure Aerial (Top-Down Drone View)

```
Transform this satellite image into a photorealistic aerial drone photograph taken at approximately 400 feet altitude, shot straight down (90-degree nadir angle) with a high-end DJI Mavic 3 Pro camera. Preserve the exact parcel boundaries, shape, and proportions from the source image. Enhance the natural terrain with crisp, high-resolution detail: render individual tree canopies with realistic depth, texture, and species-appropriate coloring for the Ouachita Mountains region of Hot Springs, Arkansas — mature hardwoods (oak, hickory), pine stands, and native undergrowth. Lighting should be golden hour, late afternoon sun creating soft long shadows from the tree line, warm amber highlights on the canopy, and deep natural greens in shaded areas. Color grading: rich, saturated but naturalistic, with warm earth tones. Remove any overlays, watermarks, pixelation, or satellite artifacts. Ultra-sharp 8K detail, professional real estate aerial photography, National Geographic quality. Keep the parcel outline subtly visible as a thin, elegant white or gold line (1px) — do not remove it, but make it refined rather than harsh.
```

### Shot 2 — Horizon Reveal (Low-Angle Aerial with Sky)

```
Reimagine this parcel as a cinematic aerial drone photograph taken at approximately 250 feet altitude with the camera tilted to a 35-45 degree angle, revealing both the full property in the foreground and a sweeping horizon in the background. Maintain the exact shape, scale, and location of the parcel from the source image. Background should show the rolling Ouachita Mountains of Hot Springs, Arkansas — layered ridgelines fading into atmospheric haze, distant forested peaks, and a dramatic sky with soft cumulus clouds catching golden hour light. The parcel itself should display lush mature forest, natural clearings, realistic topography with gentle elevation changes, and authentic Arkansas woodland textures. Lighting: warm late-afternoon sun from the west, creating depth through long shadows, rim-lit treetops, and atmospheric perspective. Color palette: warm golds, deep forest greens, soft blue-gray distant mountains, peachy sky gradient. Shot on a Sony A7R V with a 24mm lens, shallow atmospheric depth, cinematic color grading reminiscent of a Terrence Malick film. Keep the parcel boundary as a subtle, elegant thin gold line. Ultra-high resolution, photorealistic, luxury real estate marketing quality.
```

### Shot 3 — Context Shot (Wider Zoomed-Out Perspective)

```
Create a wider cinematic aerial drone photograph of this same parcel, pulled back to approximately 600-800 feet altitude at a 25-degree downward tilt, showing the property in full context within its surrounding landscape. Preserve the exact parcel shape and location. Reveal the neighboring terrain: dense Arkansas hardwood and pine forests rolling across the Ouachita foothills, winding rural roads or natural pathways if appropriate, distant ridgelines, and a vast open sky stretching to the horizon. The subject parcel should feel like a discovered gem nestled within untouched natural beauty, clearly outlined with a refined thin gold boundary line that glows subtly without looking digital. Lighting: early golden hour, sun low and warm from the side, creating dramatic directional light, long tree shadows, and glowing canopy highlights. Add subtle atmospheric haze in the distance for depth. Color grading: warm, cinematic, slightly filmic with lifted shadows and rich midtones — think high-end real estate brochure meets travel magazine cover. Shot with a full-frame mirrorless camera, 16-35mm wide-angle lens, tack-sharp focus throughout. Photorealistic 8K quality, aspirational and inviting, evoking the feeling of endless possibility and private natural sanctuary.
```

### Shot 4 — Dream Realized (Cinematic Cabin Visualization)

```
Generate a breathtaking cinematic aerial drone photograph envisioning what this parcel could become: a beautifully designed modern rustic cabin thoughtfully placed within a natural clearing on the property, shot from approximately 300 feet altitude at a 30-degree tilt. Preserve the exact parcel boundaries and surrounding terrain from the source image. The cabin should be a tasteful, architect-designed small mountain retreat — approximately 1,200-1,600 square feet, featuring warm cedar wood siding, a dark standing-seam metal roof, large floor-to-ceiling windows reflecting the surrounding forest, a wraparound deck, and a stone chimney with a thin wisp of smoke rising. Place it naturally within the existing tree cover, with a subtle gravel driveway winding in from one edge of the parcel, a small cleared yard, and mature trees preserved around it. Warm golden light glows from the cabin windows, suggesting evening occupancy. Surrounding environment: lush Arkansas hardwood forest, natural topography, rolling Ouachita Mountain ridgelines in the background, dramatic golden hour sky with soft pink and amber clouds, distant atmospheric haze. The parcel boundary remains as a very subtle thin gold line, almost ethereal. Lighting: magic hour, warm directional sun, long cinematic shadows, inviting window glow. Color grading: rich, warm, aspirational — like a still from a luxury travel commercial or an Architectural Digest feature. Shot on a cinema-grade drone camera, ultra-sharp 8K, shallow atmospheric depth, photorealistic with slight filmic grain. The overall mood: serene, aspirational, "this could be yours," showcasing the full potential of the land without overwhelming the natural beauty that makes it special.
```

---

## 5. Parcel Animation Prompts (Kling)

Image-to-video, one per enhanced parcel still. Use motion strength low-medium (0.3–0.5).

### Clip 1 — Pure Aerial (5 seconds)

```
Slow, smooth vertical drone ascent from the top-down nadir view. The camera rises straight up at a gentle, steady pace, revealing more of the parcel and surrounding forest as altitude increases. Tree canopies sway almost imperceptibly in a light breeze. Soft golden-hour sunlight shifts subtly across the landscape as thin wisps of cloud shadow drift slowly from left to right. Dappled light flickers gently through the leaves. No camera shake, no rotation — pure cinematic vertical lift. Photorealistic, ultra-smooth motion, 24fps filmic cadence. Duration: 5 seconds. Mood: serene, meditative, inviting discovery.
```

### Clip 2 — Horizon Reveal (5 seconds)

```
Slow cinematic drone push-forward with a gradual tilt-up motion. The camera glides smoothly forward over the parcel while slowly tilting upward, revealing more of the Ouachita Mountain horizon and dramatic golden-hour sky. Distant cumulus clouds drift slowly across the sky from right to left. Tree canopies in the foreground sway gently in a soft breeze. Warm golden sunlight flickers across the treetops as the camera moves. Subtle atmospheric haze shifts slightly in the distant valleys, creating a living sense of depth. Ultra-smooth gimbal motion, no shake, no jitter. Photorealistic, cinematic 24fps, shallow motion blur on clouds only. Duration: 5 seconds. Mood: awe, expansion, the land opening up to reveal its setting.
```

### Clip 3 — Context Orbit (6 seconds)

```
Slow cinematic drone orbit — the camera circles gently around the parcel in a clockwise arc while maintaining the same altitude and tilt angle, keeping the property centered in frame. The rolling Ouachita foothills in the background shift perspective smoothly as the camera moves, revealing new ridgelines and depth with each degree of rotation. Long golden-hour shadows stretch and shift subtly across the forest canopy. Distant atmospheric haze pulses softly with warm light. A few birds drift lazily across the distant sky. Trees sway almost imperceptibly. Ultra-smooth orbital motion, completely stable, no jitter or wobble. Photorealistic cinematic quality, 24fps filmic look. Duration: 6 seconds. Mood: discovery, context, "look at where this sits in the world."
```

### Clip 4 — Dream Realized (6 seconds)

```
Slow cinematic drone pull-back combined with a gentle upward tilt. The camera glides backward and slightly upward, gradually revealing more of the surrounding forest and landscape around the cabin, making the scene feel more expansive and intimate at once. Warm golden light glows steadily from the cabin windows. A thin wisp of smoke rises gently and continuously from the stone chimney, drifting softly to the side in the light breeze. Trees sway subtly around the cabin. Long golden-hour shadows shift imperceptibly across the clearing. Distant mountain haze glows with warm amber light. A few birds drift across the far sky. The cabin's window glow becomes more prominent as the surrounding landscape darkens slightly with the pull-back, emphasizing the inviting warmth. Completely stable gimbal motion, ultra-smooth, no shake. Photorealistic, cinematic 24fps, like a closing shot from a luxury travel commercial. Duration: 6 seconds. Mood: aspirational, warm, "this could be your life here."
```

---

## 6. Misc Photo Enhancement Prompts (NanoBanana)

Misc photos are typically already HDR-processed and oversaturated. The philosophy here is **"restore and refine, don't push further"** — the opposite of the parcel prompts. Every prompt instructs NanoBanana to undo existing artifacts rather than add new ones.

Each category has its own tailored prompt. Dispatch by the `photoCategory` field from the upload schema.

### Category: `entrance_sign`

```
Restore and refine this photograph of a community entrance sign. The source image has likely been over-processed with HDR and saturation filters — your job is to undo that and return it to a natural, photorealistic state. Reduce oversaturation in stone, flowers, and foliage. Remove painterly HDR halos and restore natural photographic texture. Keep the composition, sign, landscaping, and sky exactly as they are. Sky should be a natural blue with realistic cumulus clouds, not overly dramatic. Stone should show authentic color variation and crisp edge detail without the crunchy over-sharpened look. Flowers and shrubs should be vibrant but believable. Lighting: soft late-afternoon sun, warm but natural. Color grading: clean, editorial, travel-magazine quality like Southern Living or Garden & Gun. Ultra-sharp, photorealistic, shot on a Canon R5 with a 35mm lens. CRITICAL: Preserve all text on the sign perfectly, with no warping or alteration of letters.
```

### Category: `golf_course`

```
Restore and refine this golf course photograph. The source image has likely been over-saturated and HDR-processed — return it to a natural, photorealistic state. Soften aggressive greens into believable grass tones with natural variation between fairway, rough, and tree line. Restore authentic water texture to any lakes with realistic reflections of trees and sky — not cartoonish. The sky should be a natural late-afternoon blue with soft realistic clouds. Bunkers should show natural sand texture with soft shadow definition. The tree line should have realistic depth and species variation (Arkansas pines and hardwoods). Lighting: golden hour, warm directional sunlight creating gentle long shadows across the fairway, rim-lighting the trees. Color grading: refined, editorial, like Golf Digest course features — natural but aspirational. Ultra-sharp, photorealistic, shot on a Sony A7R V with a 24-70mm lens. Preserve the composition, flag, and layout exactly.
```

### Category: `water_recreation`

```
Restore and refine this water recreation photograph. The source image has likely been heavily over-processed — return it to a natural, photorealistic state. Water should be a believable blue or turquoise gradient with realistic texture, genuine wave patterns, and authentic light refraction — not overly saturated. Any wakes or spray should show crisp, natural white foam with realistic motion and texture. Surrounding vegetation should have natural green tones with authentic leaf detail, not cartoon green. The sky should be a natural blue with soft realistic cumulus clouds. Any people, watercraft, or equipment should have crisp photographic detail with natural color. Lighting: natural daylight, bright but believable, with authentic highlights on the water. Color grading: clean travel-magazine quality like Condé Nast Traveler — vibrant but believable. Ultra-sharp, photorealistic, shot on a DJI Mavic 3 Pro drone. CRITICAL: Preserve the composition, number and position of people/watercraft, and any wake patterns exactly.
```

### Category: `downtown_street`

```
Restore and refine this downtown street photograph. The source image has likely been over-processed with HDR and saturation — return it to a natural, photorealistic state. Restore authentic brick and stone textures on the buildings without the crunchy over-sharpened look. Trees should have natural green leaf detail with realistic depth, not cartoon green. The sky should be a natural late-afternoon blue with soft realistic clouds. Storefronts, signage, and windows should have crisp, readable detail. Parked cars, fire hydrants, street furniture, and pedestrians should have natural color and photographic detail. Lighting: warm late-afternoon golden hour, with soft directional sunlight raking across the building facades, creating gentle long shadows. Warm interior glow from shop windows where visible. Color grading: refined, editorial, like Travel + Leisure features on charming American downtowns — warm and inviting but believable. Ultra-sharp, photorealistic, shot on a Canon R5 with a 35mm lens. CRITICAL: Preserve the composition and all readable text on signs and storefronts exactly, with no warping or alteration of letters.
```

### Category: `amenity_park`

```
Restore and refine this amenity or recreation park photograph. The source image has likely been heavily over-processed with HDR and saturation — return it to a natural, photorealistic state. Reduce aggressive saturation on structures, umbrellas, and foliage while keeping them vibrant and fun. Any forested backgrounds should have natural depth and tree variation, not cartoon green. Water features should have realistic blue texture with authentic ripples and reflections. Wood, stone, and fabric elements should have natural texture. People in the scene should have natural color and photographic detail. The sky should be a natural summer blue with soft realistic cumulus clouds. Lighting: bright summer midday sun, warm and inviting but natural. Color grading: clean family-travel quality, like a resort brochure — vibrant and fun but believable. Ultra-sharp, photorealistic, shot on a Sony A7R V with a 24mm lens. Preserve the composition, structures, people, and layout exactly.
```

### Category: `generic_landscape`

```
Restore and refine this landscape photograph. The source image may have been over-processed with HDR and saturation — return it to a natural, photorealistic state. Soften any aggressive color saturation into believable natural tones. Restore authentic texture to foliage, terrain, water, and sky without the crunchy over-sharpened look. Preserve the composition exactly. Lighting: warm natural daylight, golden hour if the source suggests it, otherwise time-appropriate to the scene. Color grading: refined, editorial, travel-magazine quality — natural but aspirational. Ultra-sharp, photorealistic, shot on a Sony A7R V with a 24-70mm lens. Preserve all composition elements exactly.
```

### Category: `generic_lifestyle`

```
Restore and refine this lifestyle photograph. The source image may have been over-processed with HDR and saturation — return it to a natural, photorealistic state. Reduce any aggressive saturation while keeping the scene vibrant and inviting. People, objects, and environment should have natural color and photographic detail. Restore authentic texture without the crunchy over-sharpened look. The sky, if visible, should be natural and believable. Lighting: warm natural light appropriate to the scene. Color grading: clean, editorial, travel-magazine quality — warm and inviting but believable. Ultra-sharp, photorealistic, shot on a Canon R5 with a 35mm lens. Preserve the composition, people, and any readable text exactly.
```

---

## 7. Misc Photo Animation Prompts (Kling)

All misc clips are 3 seconds with deliberately subtle motion. Kling will warp these scenes if asked for too much movement — keep motion strength at 0.3 or lower for these.

Dispatch by the same `photoCategory` field.

### Category: `entrance_sign`

```
Very subtle cinematic motion. Slow gentle camera push-in toward the sign at barely perceptible speed. Flowers in the foreground sway almost imperceptibly in a light breeze. Leaves on the trees rustle gently. Thin wisps of cloud drift slowly across the sky from left to right. Soft warm sunlight flickers subtly on the stone. Completely stable, no shake, no warping on the sign or text. The sign itself and all lettering remain perfectly sharp and stationary. Photorealistic, ultra-smooth motion, 24fps filmic cadence. Duration: 3 seconds. Mood: welcoming, inviting, sense of arrival.
```

### Category: `golf_course`

```
Very subtle cinematic motion. Slow gentle camera drift forward across the fairway at barely perceptible speed. Lake water, if visible, ripples softly with tiny reflections shimmering. Tree canopies in the background sway almost imperceptibly in a light breeze. Soft cumulus clouds drift slowly across the sky from right to left. Warm golden-hour light flickers gently across the grass. Any flags on greens flutter softly. Completely stable, no shake, no warping on the bunkers or course features. Photorealistic, ultra-smooth motion, 24fps filmic cadence. Duration: 3 seconds. Mood: serene, aspirational, leisure lifestyle.
```

### Category: `water_recreation`

```
Subtle cinematic motion with gentle parallax. The water surface moves naturally with realistic wave motion and shimmering light reflections. Any wakes or spray continue to foam and spread softly outward. Surrounding vegetation sways almost imperceptibly in a light breeze. Clouds drift slowly across the sky. The camera holds mostly steady with a very slight forward drift. People, watercraft, and equipment remain sharp and stable — no warping of equipment, riders, or faces. Photorealistic, ultra-smooth motion, 24fps filmic cadence. Duration: 3 seconds. Mood: fun, freedom, adventure.
```

### Category: `downtown_street`

```
Very subtle cinematic motion. Slow gentle camera drift forward along the sidewalk at barely perceptible speed. Leaves on the trees rustle gently in a soft breeze. Thin wisps of cloud drift slowly across the sky. Warm interior light glows steadily from any shop windows. Pedestrians remain stationary but the scene feels alive. All signage, text, and storefronts remain perfectly sharp and readable — no warping of letters or building details. Completely stable, photorealistic, ultra-smooth, 24fps filmic cadence. Duration: 3 seconds. Mood: charming, walkable, small-town character.
```

### Category: `amenity_park`

```
Subtle cinematic motion. Any water features ripple naturally with gentle movement. Tree canopies sway almost imperceptibly in a light breeze. Clouds drift slowly across the sky. Fabric elements like shade sails or umbrellas flutter softly. The camera holds mostly steady with a very slight, barely perceptible push-in. People in the scene remain stationary but the environment feels alive. Structures, equipment, and people remain sharp and stable — no warping of structures or faces. Photorealistic, ultra-smooth motion, 24fps filmic cadence. Duration: 3 seconds. Mood: family fun, recreation, community amenity.
```

### Category: `generic_landscape`

```
Very subtle cinematic motion. Gentle camera drift at barely perceptible speed. Natural environmental motion: leaves rustling, grass swaying, water rippling if present, clouds drifting slowly across the sky. Warm light shifts softly across the scene. Completely stable, no shake, no warping. Photorealistic, ultra-smooth motion, 24fps filmic cadence. Duration: 3 seconds. Mood: serene, natural, peaceful.
```

### Category: `generic_lifestyle`

```
Subtle cinematic motion with gentle parallax. Natural environmental motion appropriate to the scene. The camera holds mostly steady with a very slight drift. People and key subjects remain sharp and stable — no warping of faces or readable text. Photorealistic, ultra-smooth motion, 24fps filmic cadence. Duration: 3 seconds. Mood: warm, inviting, lifestyle.
```

---

## 8. Drone Finale Prompt

This replaces the original generic drone finale prompt entirely. The finale uses a **different source image than Clip 3** — if Clip 3 uses the Context Shot image, the finale uses the Horizon Reveal image (or vice versa). Do not reuse the same still twice in one reel.

### Drone Finale (6 seconds)

```
Slow cinematic drone shot executing a wide clockwise orbit around the property while simultaneously pulling back at a gentle, steady rate — revealing the full parcel and its surrounding landscape in one continuous, flowing motion. The camera maintains a consistent 25-degree downward tilt throughout, keeping the property centered in frame as the perspective shifts. As the orbit progresses, new ridgelines of the Ouachita foothills emerge from behind the tree line, layered forested peaks fading into warm atmospheric haze in the distance. Golden-hour sunlight bathes the landscape from the west, casting long directional shadows across the forest canopy that shift and stretch subtly as the camera arcs. Tree canopies sway almost imperceptibly in a soft breeze. A few birds drift lazily across the distant sky. Warm amber light catches the treetops and rim-lights the edges of the parcel, while cooler blue-gray tones settle into the distant valleys. Thin wisps of cloud drift slowly across the sky from right to left. The parcel boundary line remains subtle and elegant throughout. Ultra-smooth gimbal motion, rock-steady stabilization, no shake, no wobble, no jitter — professional cinema-grade aerial cinematography shot on a DJI Inspire 3 with a full-frame sensor. Filmic 24fps cadence with natural motion blur. Color grading: warm, rich, aspirational, reminiscent of a luxury real estate film or a Terrence Malick landscape sequence. Duration: 6 seconds. Mood: discovery, scale, reverence — the feeling of seeing something special from above for the first time.
```

**Fallback if the 6-second take shows warping:** drop the pull-back, keep only the orbit, and retry.

---

## 9. Video Timeline & Clip Ordering

**Total runtime is locked to exactly 45 seconds.** Do not vary based on misc photo count. If fewer than 4 misc photos are available, extend the drone finale to fill the gap rather than shortening the total.

### Clip sequence

| # | Segment | Duration | Running total |
|---|---|---|---|
| 1 | Clip 1 — Pure Aerial | 5s | 5s |
| 2 | Clip 2 — Horizon Reveal | 5s | 10s |
| 3 | Clip 3 — Context Orbit | 6s | 16s |
| 4 | Clip 4 — Dream Realized (cabin) | 6s | 22s |
| 5 | Misc clip 1 | 3s | 25s |
| 6 | Misc clip 2 | 3s | 28s |
| 7 | Misc clip 3 | 3s | 31s |
| 8 | Misc clip 4 | 3s | 34s |
| 9 | Drone Finale | 6s | 40s |
| 10 | Logo card | 5s | 45s |

### Why this order

The story arc is: see the land → see what could be built → see the surrounding lifestyle → final beauty shot → brand. This mirrors how a buyer actually makes the decision (parcel first, lifestyle second, brand recall last).

Do not interleave misc clips between parcel clips. Do not put misc clips before parcel clips. Do not put the logo card anywhere except the final 5 seconds.

### Transitions

Use 0.3–0.5 second crossfades between clips, not hard cuts. The motion continuity in the parcel clips is designed to make crossfades feel invisible.

---

## 10. Marketing Copy / Voiceover Narration Spec

**File:** `lib/pipeline/marketing-copy.ts` — update the `videoNarration` prompt.

### Length

**85–95 words.** Not 100–120. The video is 45 seconds but leave roughly 5 seconds of silent opening and 5 seconds of silent close over the logo card. Actual narration covers about 35 seconds at ~150 words per minute = ~90 words.

### Voice and perspective

Write in **second person**: "you," "your," "yours." Never "we," "our," "us," "I," "my." Never "the buyer," "investors," "one could." Second-person narration is standard for real estate and creates direct emotional pull. The narrator speaks to the viewer, not on behalf of the seller.

### Tone

Warm, aspirational, confident. Not salesy. Not breathless. Not corporate. Think high-end travel commercial, not used-car ad. No exclamation points.

### Four-beat structure

Mapped to the video timeline:

- **Beat 1 — Opening (~15 words, Clips 1–2):** A hook that invites the viewer in. Lead with place or feeling, not statistics. Set the scene before the sell.
- **Beat 2 — The parcel (~25 words, Clips 3–4):** Describe the parcel itself and what it could become. Weave in actual property facts: acreage, topography, access, utilities if present. Specifics earn credibility.
- **Beat 3 — The lifestyle (~30 words, misc clips):** Paint the surrounding area. Reference Hot Springs Village amenities, golf, lakes, downtown Hot Springs, the broader Ouachita region. This is why someone chooses here over another state.
- **Beat 4 — The close (~15 words, finale + logo):** A quiet, confident close. Not a call to action. An invitation. Something that lingers after the music fades.

### Forbidden phrases (explicit blocklist)

The prompt must instruct the model never to use:

- "dream home"
- "your dream"
- "escape the city"
- "paradise"
- "once in a lifetime"
- "don't miss"
- "act fast"
- "incredible"
- "amazing"
- "stunning" (overused)
- "nestled" (cliché)
- "oasis"
- "retreat" as a noun describing the land itself
- Any exclamation point
- Any phrase suggesting urgency or scarcity

### Required inclusions

These must come from the actual listing data passed into the prompt, not invented:

- The parcel's actual size in acres
- Its location (Hot Springs Village or Hot Springs area as appropriate)
- At least one concrete lifestyle reference (golf, lakes, downtown, mountains)

### Output format

Plain text only. No stage directions, no bracketed notes, no word counts, no "Beat 1:" labels, no markdown. Just the narration as it will be read by the voiceover model.

### Pronoun constraint (explicit)

The prompt must include this sentence verbatim as a constraint:

> "Write in second person only. Use 'you,' 'your,' and 'yours.' Never use 'we,' 'our,' 'us,' 'I,' 'my,' 'the buyer,' 'investors,' or 'one.'"

---

## 11. Logging & Observability

Each video takes 15–20 API calls and 3–6 minutes of processing. Per-stage timing is required to diagnose slow runs.

### Required timing logs

**Files:** `app/api/generate-video/route.ts`, `scripts/generate-video-standalone.mjs`

Log duration for each stage:

- Photo classification / tag validation
- Parcel enhancement — per shot (×4)
- Misc enhancement — per photo (×4)
- Kling submission — per clip (×9)
- Kling polling — per clip (×9)
- Voiceover generation
- Music selection
- FFmpeg stitching
- Logo card render
- Supabase upload

Log both individual stage duration and cumulative total. Write to the standard application logger, not `console.log`.

### Timeouts

Add a hard per-stage timeout so one stuck Kling job can't hang the entire pipeline indefinitely. Recommended:

- NanoBanana per call: 90 seconds
- Kling submission: 30 seconds
- Kling polling: 5 minutes total per clip
- FFmpeg stitching: 3 minutes
- Supabase upload: 2 minutes

On timeout, log the failure with stage name and fail the job with a clear error message in Supabase.

---

## 12. Logo Card

- **Duration:** 5 seconds (not 2.5)
- **Asset:** existing `public/logo-hsl.png`
- **FFmpeg:** `-loop 1 -t 5`
- **Placement:** final 5 seconds of the video, after the drone finale
- **Transition in:** 0.3s crossfade from finale
- **Background:** dark green (`#2C4A35`) or the Village Vista brand palette
- **No text overlay** — logo only

---

## 13. File Change Checklist

### `lib/pipeline/ai-video.ts`

- [ ] Fix `image` → `image_url` in Kling request body
- [ ] Fix `duration: String()` → `duration` (number)
- [ ] New export: `generateSingleClip(imageUrl, prompt, duration, cameraMotion)` for per-clip prompts
- [ ] Fix `stitchClipsWithAudio()` to handle missing voiceover (three cases: voiceover+music, music-only, silent)
- [ ] Remove hardcoded 5-clip pattern
- [ ] Add per-stage timing logs
- [ ] Add per-stage timeouts

### `lib/pipeline/image-enhancer.ts`

- [ ] Keep Gemini Nano Banana Pro model
- [ ] New function: `generateParcelPerspective(imageBuffer, shotNumber)` using the 4 exact parcel prompts
- [ ] New function: `enhanceMiscPhoto(imageBuffer, category)` dispatching to the 7 category prompts
- [ ] Remove the old generic misc prompt
- [ ] Add per-stage timing logs

### `lib/pipeline/marketing-copy.ts`

- [ ] Update `videoNarration` prompt per section 10
- [ ] Target 85–95 words
- [ ] Second-person pronoun constraint
- [ ] Four-beat structure
- [ ] Forbidden phrase blocklist
- [ ] Required inclusions (acreage, location, lifestyle reference)

### `app/api/generate-video/route.ts`

- [ ] Rewrite `processVideoGeneration()` for the new pipeline
- [ ] Remove Ken Burns fallback entirely
- [ ] Validate photo role/category tags on input; reject untagged uploads
- [ ] Generate 4 perspectives from the first parcel photo
- [ ] Enhance misc photos by category (max 4)
- [ ] Build ordered clip list per section 9
- [ ] Use Horizon Reveal image for drone finale source (not Context Shot)
- [ ] 5-second logo card
- [ ] Fire-and-forget with 202 response
- [ ] Per-stage timing logs
- [ ] Per-stage timeouts

### `scripts/generate-video-standalone.mjs`

- [ ] Mirror all changes from `route.ts`
- [ ] Same pipeline, same fixes, same prompts, same logging

### Upload schema / data model

- [ ] Add `photoRole` field (required, enum: `parcel` | `misc`)
- [ ] Add `photoCategory` field (required when `photoRole === 'misc'`, 7-value enum)
- [ ] Reject uploads missing either field with a clear error

---

## 14. Verification Steps

Before marking the rebuild complete, verify each item:

1. [ ] `npx tsc --noEmit` — clean compile with no type errors
2. [ ] Run standalone script on a test property with tagged photos
3. [ ] Kling clips submit successfully (no error 1201)
4. [ ] 4 parcel perspective images generated by Gemini, all showing the same parcel shape
5. [ ] 4 misc photos enhanced with category-appropriate prompts
6. [ ] All clips animate smoothly: parcel clips 5–6s, misc clips 3s, finale 6s
7. [ ] Final video runtime is exactly 45 seconds
8. [ ] Clip ordering matches section 9 exactly
9. [ ] Drone finale uses a different source image than Clip 3
10. [ ] Voiceover is 85–95 words, second person only, no forbidden phrases
11. [ ] Voiceover timing leaves silent opening and silent logo close
12. [ ] Background music fades under voiceover, up at close
13. [ ] Logo card holds for 5 full seconds at end
14. [ ] Enhanced misc images look natural, not over-processed
15. [ ] Enhanced parcel images look cinematic and cohesive across all 4 shots
16. [ ] Per-stage timing logs appear in application logs
17. [ ] Per-stage timeouts fire correctly when stubbed to fail
18. [ ] Video downloads successfully from Supabase URL
19. [ ] Manual review: does the video tell the story arc (land → build → lifestyle → brand)?

---

## Appendix: Things Claude Code Will Likely Try to "Optimize" — Watch For These

Based on patterns in automated code generation, Claude Code is likely to drift in these specific ways. Review the implementation plan against this list before approving:

1. **Shortening the parcel prompts.** The four parcel prompts are long for a reason — the specificity is load-bearing. Do not let them be compressed, summarized, or parameterized into templates.

2. **Auto-classifying photos.** Claude Code may suggest using filename patterns, EXIF data, or a small CV model to classify photos instead of requiring explicit tags. Reject this. Explicit tagging is the correct architecture.

3. **Being clever with clip ordering.** Claude Code may suggest dynamic ordering based on photo metadata or "smart" interleaving. Reject this. The order in section 9 is fixed.

4. **Variable runtime.** Claude Code may default back to variable runtime "for flexibility." Reject this. 45 seconds is locked.

5. **Combining enhancement and animation prompts.** Claude Code may suggest a single combined prompt per photo category. Reject this. Enhancement (NanoBanana) and animation (Kling) are separate steps with separate models and separate prompt styles.

6. **Reverting the drone finale prompt.** The original generic prompt is still in the old plan doc. Make sure Claude Code uses the rewritten version in section 8.

7. **Word count drift in narration.** 85–95 words, not 100–120. Not "about 100." Not "roughly a minute's worth." 85–95.

---

**End of spec.**

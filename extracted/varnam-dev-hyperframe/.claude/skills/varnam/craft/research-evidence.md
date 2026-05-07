# Research And Evidence

Craft knowledge for evidence-first nonfiction work — finding, downloading, verifying, and preserving real media and factual support for production.

## Media-First Thinking

Research for video production is not text summarization. It is investigation that comes back with real files — video clips, images, audio, screenshots — not a document of URLs. The output is a folder of production-ready assets alongside factual grounding.

## The Hunt Plan

Before searching, read the topic and think like a producer: "This is a disaster story. I need: crash site impact photos, aerial aftermath, key figure interviews, memorial footage, courtroom moments, the aircraft itself... oh and the radar data could be incredible too."

Create a task for each media direction. This is a living plan — as things are found, add new tasks for threads that weren't anticipated.

**Start with the most powerful image.** Which one would hit the audience hardest? Hunt for that first. Not the Wikipedia summary — the crater, the courtroom moment, the face of the person who lost everything. Then expand outward.

## Thread-Following Principle

Search for something. Find something interesting. Follow that lead. Find something better. Keep going. A government press photo leads to the photographer's archive. A YouTube speech leads to the parliamentary TV channel with 50 more sessions. A Wikipedia citation leads to the original dataset. Pull the thread until it stops giving.

## Where to Look

Web search is the starting point, not the whole strategy. Think about where the specific thing would actually live and go there directly.

- **Government portals** — press photos, videos, data. Go to the source site directly.
- **Internet Archive** — cached versions of everything. Search archive.org directly.
- **Wikimedia Commons** — CC-licensed images of real places and people.
- **Parliamentary TV archives** — Sansad TV, C-SPAN, etc. Full session recordings.
- **Satellite imagery** — Sentinel Hub, Landsat, NASA Worldview, Google Earth screenshots.
- **Museum digital collections, university archives, institutional media libraries** — UN, WHO, World Bank.
- **YouTube channels of official bodies** — government ministries, international organizations, courts.
- **Data portals** — RBI, World Bank Open Data, government statistical offices.
- **Google Workspace surfaces** — Drive folders, Docs briefs/notes, and Sheets trackers provided by collaborators.

Don't wait for Google to surface these. If the kind of source that would have what's needed is known, go there.

## Workspace as Source and Collaboration Surface

Google Workspace is a valid research intake and collaboration surface, not a replacement for research method.

- **Drive** can supply internal source bundles, exported datasets, screenshots, interview folders, and reference media.
- **Docs** can hold briefs, interview notes, collaborator context, and source pointers.
- **Sheets** can hold trackers, timelines, source inventories, and structured leads.

Use Workspace to pull real evidence faster, but keep media-first rules unchanged:

- Download or export usable items into local project folders.
- Convert Docs/Sheets content into local research artifacts when it materially affects the script.
- Treat Workspace links as pointers, not final deliverables.
- Keep provenance (source URL/Doc/Sheet link) in findings while preserving local copies for production.

## Copyright as Search Strategy

Copyright awareness is not a filter applied after finding media. It shapes how to search.

**Use freely:** Government publications, Creative Commons (Wikimedia, Flickr CC, explicitly CC-licensed video), public domain (pre-1928, NASA/ESA/ISRO, expired copyright), institutional media (UN, WHO, World Bank), open data (Sentinel, Landsat, OpenStreetMap).

**Reject:** Fair-use-only clips, short "probably okay" grabs, stock libraries, all-rights-reserved uploads, and screenshots of copyrighted news pages.

**Don't use:** News agency footage (Reuters, AP, Getty), copyrighted documentaries, stock photography, all-rights-reserved YouTube, copyrighted music.

Note the license for every media item. Unknown means not usable until verified.

Read `.claude/skills/varnam/tools/source-priority.md` before a serious hunt. It names the preferred domains, screenshot-safe surfaces, and the blacklist.

## Gemini Verification

Don't trust titles or thumbnails. Before keeping media, verify it with Gemini. Modes: `describe` (what's in it), `transcribe` (spoken words + timing), `qa` (answer a question), `extract_subjects` (people/places/objects), `extract_style` (visual grammar).

## Grabbing Media

When something usable is found, download it right there. Don't catalog a URL for someone else to grab later.

- Editorial articles and text-heavy pages: `WebFetch` with explicit instruction to return content verbatim, not summarized
- Do not default to `curl` + ad hoc HTML parsing for ordinary article reads. Use that only when the fetch tool is unavailable or when raw HTML itself is the thing you need to inspect.
- Images and documents: `curl`
- Video clips: `yt-dlp`, optionally with time ranges
- Audio: `ffmpeg` extraction from approved media
- Screenshots: only for open dashboards, maps, diagrams, infographics, and public-record pages. Not screenshots of text-heavy pages or copyrighted news coverage.

When a hunt turns serious, write a manifest and let scripts handle the mechanics:

- `scripts/research/asset_download.py` for the download pass
- `scripts/visual/verify_assets.py` for the post-download verification pass
- `scripts/visual/screenshot.py` for site-aware screenshot capture

## Working Notes

Long sessions eat context. After each productive thread, dump what was found to working notes — what was grabbed, what was verified, what threads are still open. Quick and messy. These are working notes, not output.

## What Matters

- **Real files in the folder.** Not URLs. Not descriptions of media.
- **Copyright awareness.** Every item has a license status.
- **Copyright-clear only.** "Probably fair use" is not a green light in this pipeline.
- **Primary over secondary.** The actual speech, not the article about it.
- **Local artifacts stay canonical for production.** Workspace is a source/collab surface, not the only store.
- **Real names, real places.** Don't self-censor.
- **Preserve verbatim quotes exactly.** They're the most valuable text output.
- **Surface contradictions, don't resolve them.** That's the writer's call.

## Output contract

Research output lands in two surfaces:

- `research/findings.md` for the structured memo
- `research/media-index.md` for the reusable asset inventory

The findings memo explains what was proved. The media index records what is now available on disk for downstream reuse.

### `research/findings.md`

## Verified facts

- `fact:` statement (exact claim)
- `evidence:` source URL + date + confidence
- `media:` file paths that support this claim

## Disputed claims

- `claim:` statement in question
- `conflict:` where sources disagree
- `recommended_resolution:` narrowest defensible framing
- `need:` what additional evidence is still needed

## Media manifest

| path | type | source_url | license | rights_note | verified |
|---|---|---|---|---|---|
| `images/refs/foo.jpg` | image | https://... | CC-BY-SA 4.0 | publisher credit + attribution | yes |
| `images/refs/bar.mp4` | video | https://... | public domain | N/A | yes |

Keep `research/source.raw.md` as the verbatim raw payload for auditability. The output contract is for downstream teams.

### `research/media-index.md`

This is the reusable asset inventory for the project. It is not the same as a beat manifest.

| asset_id | local_path | media_type | source_type | source_detail | rights_status | verified | current_use | notes |
|---|---|---|---|---|---|---|---|---|
| `asset-archival-01` | `research/media/foo.jpg` | image | archival | Wikimedia URL | CC-BY-SA 4.0 | yes | available | crowd wide shot |

- `current_use` can stay `available` until the editor or visual lane assigns the asset to an exact beat or slot
- unknown-rights items can be recorded only as `blocked`, never as usable coverage
- downstream media lanes should read this before generating new assets

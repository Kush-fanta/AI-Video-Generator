# Source Priority

Ranked source guidance for the researcher. The goal is not "find anything that works." The goal is "find licensable media we can actually ship."

This file is a priority map, not a complete whitelist. Any credible source is acceptable if the rights are clearly open. Unknown rights means reject it.

## Hard rule

Only download assets that are clearly one of:

- `public-domain`
- `cc0`
- `cc-by`
- `cc-by-sa`
- `government`
- `open-data`
- `odbl`

Fair use is not part of this pipeline. Stock, news-wire, and "all rights reserved" sources are out.

## Tier 1 — Government and public institutions

Best first stop for policy, speeches, press photos, reports, and public-record video.

- `*.gov.in`
- `*.nic.in`
- `pib.gov.in`
- `pmo.gov.in`
- `mea.gov.in`
- `india.gov.in`
- `data.gov.in`
- `rbi.org.in`
- `mospi.gov.in`
- `censusindia.gov.in`
- `indiacode.nic.in`
- `eci.gov.in`
- `isro.gov.in`
- `drdo.gov.in`
- `worldbank.org`
- `data.worldbank.org`
- `un.org`
- `who.int`
- `fao.org`
- `ilo.org`
- `undp.org`
- `nasa.gov`
- `earthdata.nasa.gov`
- `usgs.gov`

Use these first for documents, datasets, public dashboards, and official imagery.

## Tier 2 — Open archives and media libraries

Best first stop for historical stills, archival photos, maps, and open collections.

- `commons.wikimedia.org`
- `upload.wikimedia.org`
- `archive.org`
- `loc.gov`
- `digitalcollections.nypl.org`
- `europeana.eu`
- `dp.la`
- `flickr.com/commons`
- `openverse.org`
- `openstreetmap.org`
- `naturalearthdata.com`

Use the asset page, not just the preview. Record the exact license or rights statement.

## Tier 3 — Open data and chart surfaces

Allowed for screenshots when the underlying content is open and readable.

- `ourworldindata.org`
- `data.worldbank.org`
- `data.gov.in`
- `openstreetmap.org`
- `worldview.earthdata.nasa.gov`
- `earthexplorer.usgs.gov`
- `bhuvan.nrsc.gov.in`

Screenshots are for charts, dashboards, maps, and public records. Do not screenshot articles, press coverage, or text-heavy pages when a direct asset or document exists.

## Tier 4 — Video sources that require explicit rights notes

`yt-dlp` is allowed, but only when the rights are written down in the manifest.

- Official government channels
- Institutional channels
- Public-domain archives
- Creative Commons uploads

For any YouTube or platform video URL, include an explicit `license_claim` and `rights_note`. The host alone is not enough.

## Download method rules

Use the simplest method that preserves provenance and quality.

- `curl`: direct image, document, and asset URLs
- `yt-dlp`: videos or audio hosted on supported platforms
- `screenshot`: only open charts, dashboards, maps, or public-record pages
- `ffmpeg`: audio extraction or trimming from already-approved media

## Screenshot-safe domains

Use `screenshot.py` only on sources where the screenshot itself is a clean capture of open content:

- `ourworldindata.org`
- `data.worldbank.org`
- `data.gov.in`
- `openstreetmap.org`
- `worldview.earthdata.nasa.gov`
- `earthexplorer.usgs.gov`
- `*.gov.in`
- `*.nic.in`

Do not screenshot:

- news articles
- social feeds
- generic blog posts
- paywalled pages
- cookie-banner-covered pages
- pages where the underlying media could be downloaded directly

## Blacklist

Never use these as sources for downloadable media.

- `gettyimages.com`
- `shutterstock.com`
- `istockphoto.com`
- `alamy.com`
- `dreamstime.com`
- `123rf.com`
- `depositphotos.com`
- `stock.adobe.com`
- `bigstockphoto.com`
- `vectorstock.com`
- `apimages.com`
- `reutersimages.com`
- `pinterest.com`
- `pin.it`
- `midjourney.com`
- `lexica.art`
- `playground.ai`
- `openart.ai`
- `tiktok.com`

## Decision framework

When the claim needs:

- official evidence: start with Tier 1
- archival stills: start with Tier 2
- charts or dashboards: start with Tier 3
- recent official footage: use Tier 1 first, then Tier 4 with explicit rights notes

If the rights are fuzzy, skip it and keep hunting. The pipeline should bias toward assets we can actually ship.

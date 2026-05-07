#!/usr/bin/env python3
# ---
# varnam_script: visual.screenshot
# owner: visual,mograph
# status: live
# surface: direct-only
# purpose: Quick site and frame capture utility.
# use_when: Capture quick visual evidence before full renders.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""
Web screenshot capture using Playwright with site-aware profiles.
Auto-detects platform from URL and applies optimized capture strategies.
Supports 15+ site types: Twitter, Instagram, YouTube, Reddit, Wikipedia,
LinkedIn, Facebook, Google Trends, news, govt portals, data dashboards,
Substack/Medium, PDFs, and generic pages.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import urlparse

try:
    from playwright.async_api import async_playwright
except ImportError:
    async_playwright = None


def require_playwright() -> None:
    if async_playwright is None:
        raise RuntimeError("Missing playwright. Install it with `pip install playwright` and `python3 -m playwright install chromium`.")


# ---------------------------------------------------------------------------
# Site Profiles
# ---------------------------------------------------------------------------

SITE_PROFILES = {
    "tweet": {
        "url_patterns": ["twitter.com", "x.com"],
        "transform_url": lambda url: _transform_twitter(url),
        "wait_for": "img",
        "delay": 3000,
        "viewport": {"width": 600, "height": 800},
        "selector": ".tweet-card, .media-container, article, .main-content, img.tweet-media",
        "fallback_strategy": "syndication_embed",
        "description": "Twitter/X via fxtwitter proxy",
    },
    "instagram": {
        "url_patterns": ["instagram.com"],
        "transform_url": lambda url: url.replace("instagram.com", "ddinstagram.com"),
        "wait_for": "img",
        "delay": 3000,
        "viewport": {"width": 600, "height": 800},
        "selector": "img, .main-content",
        "fallback_strategy": "metadata_card",
        "description": "Instagram via ddinstagram proxy",
    },
    "youtube": {
        "url_patterns": ["youtube.com", "youtu.be"],
        "selector": "#primary-inner",
        "fallback_selector": "#player",
        "delay": 3000,
        "description": "YouTube thumbnail + title area",
    },
    "reddit": {
        "url_patterns": ["reddit.com"],
        "transform_url": lambda url: _transform_reddit(url),
        "delay": 2000,
        "selector": ".Post, .thing, .link",
        "description": "Reddit via old.reddit (no JS bloat)",
    },
    "headline": {
        "url_patterns": [],  # Manually selected type
        "delay": 2000,
        "full_page": False,
        "dismiss_popups": True,
        "description": "News headline - above-fold capture",
    },
    "headline-cached": {
        "url_patterns": [],
        "transform_url": lambda url: _transform_cached(url),
        "delay": 3000,
        "full_page": False,
        "dismiss_popups": True,
        "fallback_strategy": "archive_org",
        "description": "Paywalled news via cache/archive",
    },
    "govt": {
        "url_patterns": ["pib.gov.in", "pmo.gov.in", "india.gov.in",
                         "parliament.gov.in", "rajyasabha.nic.in",
                         "loksabha.nic.in", "mea.gov.in", "finmin.nic.in",
                         ".gov.in", ".nic.in"],
        "delay": 3000,
        "full_page": False,
        "description": "Government portals (no anti-bot, longer wait)",
    },
    "wiki": {
        "url_patterns": ["wikipedia.org"],
        "selector": "table.infobox",
        "fallback_selector": "#mw-content-text > .mw-parser-output > p:first-of-type",
        "delay": 1000,
        "description": "Wikipedia infobox or lead section",
    },
    "data": {
        "url_patterns": ["rbi.org.in", "mospi.gov.in", "worldbank.org",
                         "data.gov.in", "tradingeconomics.com",
                         "statista.com", "ourworldindata.org"],
        "delay": 5000,
        "full_page": False,
        "description": "Data dashboards (long wait for JS charts)",
    },
    "linkedin": {
        "url_patterns": ["linkedin.com"],
        "fallback_strategy": "metadata_card",
        "delay": 2000,
        "description": "LinkedIn (hostile to scraping, falls back to metadata card)",
    },
    "facebook": {
        "url_patterns": ["facebook.com", "fb.com"],
        "transform_url": lambda url: _transform_facebook(url),
        "delay": 3000,
        "fallback_strategy": "metadata_card",
        "description": "Facebook via mbasic proxy",
    },
    "trends": {
        "url_patterns": ["trends.google.com"],
        "delay": 5000,
        "full_page": False,
        "description": "Google Trends (wait for chart render)",
    },
    "article": {
        "url_patterns": ["substack.com", "medium.com"],
        "delay": 2000,
        "selector": "article, .post, .main-content",
        "full_page": False,
        "description": "Substack/Medium article capture",
    },
    "pdf": {
        "url_patterns": [],  # Detected by file extension or explicit type
        "description": "PDF page to image conversion",
    },
    "page": {
        "url_patterns": [],  # Generic fallback
        "delay": 2000,
        "full_page": False,
        "dismiss_popups": True,
        "description": "Generic page with improved popup dismissal",
    },
}


# ---------------------------------------------------------------------------
# URL Transformers
# ---------------------------------------------------------------------------

def _transform_twitter(url: str) -> str:
    """Transform Twitter/X URL to fxtwitter for embed rendering."""
    url = url.replace("twitter.com", "fxtwitter.com").replace("x.com", "fxtwitter.com")
    # Remove query params that might break the embed
    if "?" in url:
        url = url.split("?")[0]
    return url


def _transform_reddit(url: str) -> str:
    """Transform Reddit URL to old.reddit for lighter page."""
    return url.replace("www.reddit.com", "old.reddit.com").replace("reddit.com", "old.reddit.com")


def _transform_facebook(url: str) -> str:
    """Transform Facebook URL to mbasic for public posts."""
    return url.replace("www.facebook.com", "mbasic.facebook.com").replace("m.facebook.com", "mbasic.facebook.com")


def _transform_cached(url: str) -> str:
    """Transform URL to Google Cache version."""
    return f"https://webcache.googleusercontent.com/search?q=cache:{url}"


# ---------------------------------------------------------------------------
# Auto-detection
# ---------------------------------------------------------------------------

def detect_site_type(url: str) -> str:
    """Detect site profile from URL patterns. Returns profile key."""
    parsed = urlparse(url)
    host = parsed.hostname or ""

    # PDF detection by extension
    if url.lower().endswith(".pdf") or parsed.path.lower().endswith(".pdf"):
        return "pdf"

    # Check each profile's URL patterns
    for profile_key, profile in SITE_PROFILES.items():
        for pattern in profile.get("url_patterns", []):
            if pattern in host or pattern in url:
                return profile_key

    return "page"  # Generic fallback


# ---------------------------------------------------------------------------
# Cookie / Popup Dismissal
# ---------------------------------------------------------------------------

POPUP_SELECTORS = [
    'button:has-text("Accept")',
    'button:has-text("Accept all")',
    'button:has-text("Accept All")',
    'button:has-text("Agree")',
    'button:has-text("Got it")',
    'button:has-text("OK")',
    'button:has-text("Close")',
    'button:has-text("Continue")',
    'button:has-text("I agree")',
    'button:has-text("No thanks")',
    'button:has-text("Dismiss")',
    'button:has-text("Not now")',
    '[id*="cookie"] button',
    '[class*="consent"] button',
    '[class*="cookie"] button',
    '[id*="consent"] button',
    '[class*="banner"] button:has-text("Accept")',
    '[class*="modal"] button:has-text("Close")',
    '[class*="popup"] button:has-text("Close")',
    '[aria-label="Close"]',
    '[aria-label="Dismiss"]',
    '.close-button',
    '#close-button',
]


async def dismiss_popups(page):
    """Aggressively dismiss cookie banners, consent dialogs, and popups."""
    for sel in POPUP_SELECTORS:
        try:
            btn = await page.query_selector(sel)
            if btn and await btn.is_visible():
                await btn.click()
                await page.wait_for_timeout(300)
                return True
        except Exception:
            continue

    # Try removing common overlay elements via JS
    try:
        await page.evaluate("""
            const selectors = [
                '[class*="cookie"]', '[class*="consent"]', '[class*="gdpr"]',
                '[id*="cookie"]', '[id*="consent"]', '[id*="gdpr"]',
                '[class*="overlay"]', '[class*="modal-backdrop"]'
            ];
            for (const sel of selectors) {
                document.querySelectorAll(sel).forEach(el => {
                    if (el.offsetHeight > 0) el.remove();
                });
            }
            // Reset body overflow in case it was locked
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
        """)
    except Exception:
        pass

    return False


# ---------------------------------------------------------------------------
# Metadata Card Generation
# ---------------------------------------------------------------------------

async def fetch_og_metadata(page, url: str) -> dict:
    """Fetch Open Graph metadata from a URL."""
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=15000)
        metadata = await page.evaluate("""
            () => {
                const getMeta = (prop) => {
                    const el = document.querySelector(
                        `meta[property="${prop}"], meta[name="${prop}"]`
                    );
                    return el ? el.getAttribute('content') : '';
                };
                return {
                    title: getMeta('og:title') || document.title || '',
                    description: getMeta('og:description') || getMeta('description') || '',
                    image: getMeta('og:image') || '',
                    site_name: getMeta('og:site_name') || '',
                    url: getMeta('og:url') || window.location.href,
                };
            }
        """)
        return metadata
    except Exception as e:
        print(f"Metadata fetch failed: {e}")
        return {"title": url, "description": "", "image": "", "site_name": "", "url": url}


async def generate_metadata_card(page, url: str, output_path: str, width: int = 800, height: int = 600):
    """Generate a styled card from og: metadata when direct capture fails."""
    metadata = await fetch_og_metadata(page, url)

    title = metadata.get("title", "").replace('"', '&quot;').replace("'", "&#39;")
    desc = metadata.get("description", "").replace('"', '&quot;').replace("'", "&#39;")
    site = metadata.get("site_name", "").replace('"', '&quot;').replace("'", "&#39;")
    img = metadata.get("image", "")

    # Truncate description
    if len(desc) > 200:
        desc = desc[:197] + "..."

    card_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ background: #1a1a2e; display: flex; align-items: center; justify-content: center;
       height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
.card {{ background: #16213e; border-radius: 16px; overflow: hidden; width: 90%;
         max-width: 720px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid #0f3460; }}
.card-image {{ width: 100%; height: 280px; object-fit: cover; display: {('block' if img else 'none')}; }}
.card-body {{ padding: 32px; }}
.card-site {{ color: #e94560; font-size: 14px; font-weight: 600; text-transform: uppercase;
              letter-spacing: 1px; margin-bottom: 12px; }}
.card-title {{ color: #eee; font-size: 28px; font-weight: 700; line-height: 1.3; margin-bottom: 16px; }}
.card-desc {{ color: #a0a0b0; font-size: 16px; line-height: 1.6; }}
</style></head><body>
<div class="card">
  <img class="card-image" src="{img}" onerror="this.style.display='none'" />
  <div class="card-body">
    <div class="card-site">{site}</div>
    <div class="card-title">{title}</div>
    <div class="card-desc">{desc}</div>
  </div>
</div>
</body></html>"""

    # Render the card HTML to screenshot
    card_page = await page.context.new_page()
    try:
        await card_page.set_content(card_html, wait_until="networkidle")
        await card_page.set_viewport_size({"width": width, "height": height})
        await card_page.wait_for_timeout(500)
        await card_page.screenshot(path=str(output_path))
        print(f"Metadata card generated: {output_path}")
        return str(output_path)
    finally:
        await card_page.close()


# ---------------------------------------------------------------------------
# PDF Capture
# ---------------------------------------------------------------------------

def capture_pdf_page(pdf_path: str, output_path: str, page_num: int = 1) -> str:
    """Convert a specific PDF page to an image using mutool or pdf2image."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Try mutool first (usually available on macOS)
    mutool = subprocess.run(["which", "mutool"], capture_output=True, text=True)
    if mutool.returncode == 0:
        try:
            cmd = [
                "mutool", "draw", "-o", str(output_path),
                "-r", "200",  # 200 DPI for crisp output
                pdf_path,
                str(page_num)
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            print(f"PDF page {page_num} captured: {output_path}")
            return str(output_path)
        except subprocess.CalledProcessError as e:
            print(f"mutool failed: {e}")

    # Try pdf2image (Python library, requires poppler)
    try:
        from pdf2image import convert_from_path
        images = convert_from_path(pdf_path, first_page=page_num, last_page=page_num, dpi=200)
        if images:
            images[0].save(str(output_path))
            print(f"PDF page {page_num} captured: {output_path}")
            return str(output_path)
    except ImportError:
        print("pdf2image not installed. Trying poppler directly...")
    except Exception as e:
        print(f"pdf2image failed: {e}")

    # Try pdftoppm directly (poppler)
    try:
        stem = str(output_path.with_suffix(""))
        cmd = [
            "pdftoppm", "-png", "-r", "200",
            "-f", str(page_num), "-l", str(page_num),
            pdf_path, stem
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        # pdftoppm appends page number to filename
        candidate = Path(f"{stem}-{page_num}.png")
        if not candidate.exists():
            # Sometimes zero-padded
            for p in output_path.parent.glob(f"{output_path.stem}*.png"):
                candidate = p
                break
        if candidate.exists():
            if candidate != output_path:
                candidate.rename(output_path)
            print(f"PDF page {page_num} captured: {output_path}")
            return str(output_path)
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"pdftoppm failed: {e}")

    print(f"ERROR: Could not convert PDF page. Install mutool, poppler, or pdf2image.")
    return None


# ---------------------------------------------------------------------------
# Syndication Embed Fallback (Twitter)
# ---------------------------------------------------------------------------

async def capture_syndication_embed(page, original_url: str, output_path: str, width: int, height: int):
    """Fallback: use Twitter syndication API to render tweet embed."""
    # Extract tweet ID
    match = re.search(r'/status/(\d+)', original_url)
    if not match:
        return None
    tweet_id = match.group(1)

    embed_url = f"https://platform.twitter.com/embed/Tweet.html?id={tweet_id}"
    try:
        embed_page = await page.context.new_page()
        await embed_page.set_viewport_size({"width": width, "height": height})
        await embed_page.goto(embed_url, wait_until="networkidle", timeout=15000)
        await embed_page.wait_for_timeout(2000)
        await embed_page.screenshot(path=str(output_path))
        await embed_page.close()
        print(f"Syndication embed captured: {output_path}")
        return str(output_path)
    except Exception as e:
        print(f"Syndication embed failed: {e}")
        try:
            await embed_page.close()
        except Exception:
            pass
        return None


# ---------------------------------------------------------------------------
# Archive.org Fallback
# ---------------------------------------------------------------------------

async def capture_via_archive(page, original_url: str, output_path: str, width: int, height: int, delay: int):
    """Fallback: try Wayback Machine for cached version of paywalled page."""
    archive_url = f"https://web.archive.org/web/2024/{original_url}"
    try:
        await page.goto(archive_url, wait_until="domcontentloaded", timeout=20000)
        await page.wait_for_timeout(delay)
        await dismiss_popups(page)
        await page.screenshot(path=str(output_path))
        print(f"Archive.org capture: {output_path}")
        return str(output_path)
    except Exception as e:
        print(f"Archive.org fallback failed: {e}")
        return None


# ---------------------------------------------------------------------------
# Core Capture
# ---------------------------------------------------------------------------

async def capture_screenshot(
    url: str,
    output_path: str,
    site_type: str = "auto",
    width: int = 1920,
    height: int = 1080,
    full_page: bool = False,
    selector: str = None,
    wait_for: str = None,
    delay: int = None,
    page_num: int = 1,
):
    """
    Capture screenshot with site-aware strategies.

    Args:
        url: URL to capture (or file path for PDFs)
        output_path: Output image path
        site_type: Site profile key, or 'auto' to detect from URL
        width: Viewport width (match video aspect ratio)
        height: Viewport height
        full_page: Capture full scrollable page
        selector: CSS selector override
        wait_for: Wait-for-selector override
        delay: Wait time in ms override
        page_num: PDF page number (for pdf type)
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Auto-detect site type
    if site_type == "auto":
        site_type = detect_site_type(url)

    profile = SITE_PROFILES.get(site_type, SITE_PROFILES["page"])
    original_url = url
    print(f"Capture type: {site_type} ({profile.get('description', '')})")

    # --- PDF handling (no browser needed) ---
    if site_type == "pdf":
        result = capture_pdf_page(url, str(output_path), page_num)
        return result

    require_playwright()

    # --- Apply profile settings (CLI args override profile) ---
    capture_url = url
    if "transform_url" in profile:
        capture_url = profile["transform_url"](url)
        if capture_url != url:
            print(f"Proxy URL: {capture_url}")

    vp_width = profile.get("viewport", {}).get("width", width)
    vp_height = profile.get("viewport", {}).get("height", height)
    # CLI width/height override profile viewport unless profile has a specific viewport
    if "viewport" not in profile:
        vp_width = width
        vp_height = height

    capture_delay = delay if delay is not None else profile.get("delay", 2000)
    capture_selector = selector or profile.get("selector")
    fallback_selector = profile.get("fallback_selector")
    capture_wait_for = wait_for or profile.get("wait_for")
    capture_full_page = full_page or profile.get("full_page", False)
    should_dismiss = profile.get("dismiss_popups", True)
    fallback_strategy = profile.get("fallback_strategy")

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width": vp_width, "height": vp_height},
            device_scale_factor=2,  # Retina quality
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/122.0.0.0 Safari/537.36",
        )

        page = await context.new_page()

        try:
            # --- Navigate ---
            nav_success = False
            try:
                await page.goto(capture_url, wait_until="networkidle", timeout=30000)
                nav_success = True
            except Exception:
                print("networkidle timeout, retrying with domcontentloaded...")
                try:
                    await page.goto(capture_url, wait_until="domcontentloaded", timeout=30000)
                    nav_success = True
                except Exception as e:
                    print(f"Navigation failed: {e}")

            if not nav_success:
                # Try fallback strategies before giving up
                if fallback_strategy == "metadata_card":
                    result = await generate_metadata_card(page, original_url, str(output_path), vp_width, vp_height)
                    await browser.close()
                    return result
                elif fallback_strategy == "syndication_embed":
                    result = await capture_syndication_embed(page, original_url, str(output_path), vp_width, vp_height)
                    await browser.close()
                    return result
                elif fallback_strategy == "archive_org":
                    result = await capture_via_archive(page, original_url, str(output_path), vp_width, vp_height, capture_delay)
                    await browser.close()
                    return result
                else:
                    print("All navigation attempts failed.")
                    await browser.close()
                    return None

            # --- Wait for content ---
            if capture_wait_for:
                try:
                    await page.wait_for_selector(capture_wait_for, timeout=10000)
                except Exception:
                    print(f"Selector wait timeout: {capture_wait_for}, proceeding after delay")
                    await page.wait_for_timeout(capture_delay)
            else:
                await page.wait_for_timeout(capture_delay)

            # --- Dismiss popups ---
            if should_dismiss:
                await dismiss_popups(page)
                await page.wait_for_timeout(300)

            # --- Capture ---
            captured = False

            if capture_selector:
                # Try primary selector
                element = await page.query_selector(capture_selector)
                if element and await element.is_visible():
                    await element.screenshot(path=str(output_path))
                    captured = True
                elif fallback_selector:
                    # Try fallback selector
                    element = await page.query_selector(fallback_selector)
                    if element and await element.is_visible():
                        await element.screenshot(path=str(output_path))
                        captured = True

            if not captured:
                # Full viewport / page capture
                await page.screenshot(path=str(output_path), full_page=capture_full_page)
                captured = True

            if captured and output_path.exists() and output_path.stat().st_size > 0:
                print(f"Screenshot saved: {output_path}")
                await browser.close()
                return str(output_path)

            # --- Fallback strategies if primary capture looks wrong ---
            if fallback_strategy == "syndication_embed":
                result = await capture_syndication_embed(page, original_url, str(output_path), vp_width, vp_height)
                if result:
                    await browser.close()
                    return result

            if fallback_strategy == "metadata_card":
                result = await generate_metadata_card(page, original_url, str(output_path), vp_width, vp_height)
                await browser.close()
                return result

            if fallback_strategy == "archive_org":
                result = await capture_via_archive(page, original_url, str(output_path), vp_width, vp_height, capture_delay)
                await browser.close()
                return result

            await browser.close()
            return str(output_path) if output_path.exists() else None

        except Exception as e:
            print(f"Screenshot failed: {e}")

            # Last-resort fallbacks
            try:
                if fallback_strategy == "metadata_card":
                    result = await generate_metadata_card(page, original_url, str(output_path), vp_width, vp_height)
                    await browser.close()
                    return result
                if fallback_strategy == "syndication_embed":
                    result = await capture_syndication_embed(page, original_url, str(output_path), vp_width, vp_height)
                    if result:
                        await browser.close()
                        return result
            except Exception:
                pass

            await browser.close()
            return None


# ---------------------------------------------------------------------------
# Sync wrappers (backward compatible)
# ---------------------------------------------------------------------------

def screenshot(url: str, output_path: str, **kwargs):
    """Synchronous wrapper for screenshot capture."""
    return asyncio.run(capture_screenshot(url, output_path, **kwargs))


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

VALID_TYPES = ["auto"] + list(SITE_PROFILES.keys())


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Capture web screenshots with site-aware profiles",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Site types (auto-detected from URL, or set explicitly with --type):
  auto             Auto-detect from URL (default)
  tweet            Twitter/X via fxtwitter proxy
  instagram        Instagram via ddinstagram proxy
  youtube          YouTube thumbnail + title
  reddit           Reddit via old.reddit
  headline         News headline (above-fold)
  headline-cached  Paywalled news via cache/archive
  govt             Government portals (longer wait)
  wiki             Wikipedia infobox/lead
  data             Data dashboards (5s+ wait for JS)
  linkedin         LinkedIn (metadata card fallback)
  facebook         Facebook via mbasic
  trends           Google Trends (chart wait)
  article          Substack/Medium articles
  pdf              PDF page to image
  page             Generic fallback

Examples:
  %(prog)s --url "https://x.com/user/status/123" --output tweet.png
  %(prog)s --url "https://en.wikipedia.org/wiki/India" --output wiki.png
  %(prog)s --url "https://bbc.com/news/article" --type headline --output news.png
  %(prog)s --url "/path/to/file.pdf" --type pdf --page 3 --output page3.png
""",
    )
    parser.add_argument("--url", required=True, help="URL to capture (or file path for PDFs)")
    parser.add_argument("--output", required=True, help="Output image path")
    parser.add_argument("--type", choices=VALID_TYPES, default="auto",
                        help="Site type (default: auto-detect from URL)")
    parser.add_argument("--width", type=int, default=1920,
                        help="Viewport width - match video aspect ratio (default: 1920)")
    parser.add_argument("--height", type=int, default=1080,
                        help="Viewport height - match video aspect ratio (default: 1080)")
    parser.add_argument("--selector", help="CSS selector to capture specific element (overrides profile)")
    parser.add_argument("--full-page", action="store_true", help="Capture full scrollable page")
    parser.add_argument("--delay", type=int, help="Wait time in ms after page load (overrides profile)")
    parser.add_argument("--page", type=int, default=1, help="PDF page number (for --type pdf)")

    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    result = asyncio.run(capture_screenshot(
        url=args.url,
        output_path=args.output,
        site_type=args.type,
        width=args.width,
        height=args.height,
        full_page=args.full_page,
        selector=args.selector,
        delay=args.delay,
        page_num=args.page,
    ))

    if not result:
        print("Screenshot capture failed.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

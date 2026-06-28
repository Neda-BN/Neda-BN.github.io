#!/usr/bin/env python3
"""Sync anna-nav, fonts, and display headings across HTML pages."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FONT_LINKS = """<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<link href="https://fonts.cdnfonts.com/css/lithium-typeface-lt" rel="stylesheet">
<link rel="stylesheet" href="css/site-shared.css">"""

OLD_NAV_RE = re.compile(r"<nav>.*?</nav>\s*", re.DOTALL)

NAV_CSS_RE = re.compile(
    r"\n\s*nav\s*\{.*?\n\s*\.n-btn--cv-soon\s*\{[^}]*\}\s*",
    re.DOTALL,
)

BODY_BEFORE_RE = re.compile(
    r"\n\s*body::before\s*\{.*?\}\s*",
    re.DOTALL,
)

FOOTER_BLOCK_RE = re.compile(
    r"/\* ── FOOTER STRIP.*?\*/\s*\.footer-strip \{.*?"
    r"\.footer-social__beh svg \{ width: 18px; height: 18px; \}\s*",
    re.DOTALL,
)

FOOTER_BLOCK_RE2 = re.compile(
    r"/\* ── FOOTER ── \*/\s*footer \{.*?"
    r"\.footer-social__beh svg \{ width: 18px; height: 18px; \}\s*",
    re.DOTALL,
)

STALE_NAV_MEDIA_RE = re.compile(
    r"\n\s*nav \{ padding:[^}]+\}\s*",
    re.DOTALL,
)


def nav_html(current: str) -> str:
    def cur(key: str) -> str:
        return ' aria-current="page"' if current == key else ""

    return f"""<header class="anna-nav anna-nav--intro-visible anna-nav--light" id="site-nav" aria-label="Primary">
  <div class="anna-nav__pill">
    <a href="index.html#hero"{cur('home')}>Home</a>
    <a href="index.html#projects"{cur('works')}>Works</a>
    <a href="about.html"{cur('about')}>About</a>
  </div>
  <div class="anna-nav__pill">
    <a href="index.html#contact"{cur('contact')}>Contact</a>
  </div>
</header>

"""


def detect_current(path: Path) -> str:
    name = path.name
    if name == "about.html":
        return "about"
    if name in {"index.html"}:
        return "home"
    return "works"


def patch_root_vars(text: str) -> str:
    text = re.sub(
        r"--serif:\s*'Sora'[^;]*;",
        "--display: 'Sora', sans-serif; --serif: var(--display);",
        text,
    )
    text = re.sub(
        r"--bg:\s*#[Ff]7[Ff]5[Ff]0|--bg:\s*#f9f7f4",
        "--bg: #ffffff",
        text,
    )
    return text


def patch_body(text: str) -> str:
    if "has-anna-nav" not in text:
        text = re.sub(
            r'<body([^>]*)class="([^"]*)"',
            lambda m: f'<body{m.group(1)}class="{m.group(2)} has-anna-nav"',
            text,
            count=1,
        )
        if 'has-anna-nav' not in text.split('<body', 1)[-1].split('>', 1)[0]:
            text = re.sub(r"<body>", '<body class="has-anna-nav">', text, count=1)
    text = re.sub(r'\bhas-anna-nav(?:\s+has-anna-nav\b)+', 'has-anna-nav', text)
    text = re.sub(
        r"body \{([^}]*?)background:\s*var\(--bg\)",
        r"body {\1background: #ffffff",
        text,
        count=1,
    )
    return text


LEGACY_FOOTER_INLINE_RE = re.compile(
    r"\nfooter \{ padding: 28px[^}]+\}\s*"
    r"(?:footer p \{[^}]+\}\s*)?"
    r"(?:\.footer-social(?:[^\n\{]|\{[^}]*\})*)*",
    re.DOTALL,
)

LEGACY_NAV_RESPONSIVE_RE = re.compile(
    r"@media \(max-width: 480px\) \{[^}]*\.n-logo[^}]+\}[^}]*\}[^}]*\}[^}]*\}\s*",
    re.DOTALL,
)

STALE_N_LINKS_RE = re.compile(
    r"\.n-links[^\n\{]*\{[^}]*\}\s*|\.n-logo[^\n\{]*\{[^}]*\}\s*|\.n-btn[^\n\{]*\{[^}]*\}\s*",
    re.DOTALL,
)


def patch_fonts(text: str) -> str:
    text = re.sub(
        r"font-family:\s*'Sora',\s*sans-serif",
        "font-family: var(--display)",
        text,
    )
    return text


def ensure_shared_assets(text: str) -> str:
    if "css/site-shared.css" in text:
        return text
    if "<link rel=\"icon\"" in text:
        return text.replace(
            '<link rel="icon" href="favicon.svg" type="image/svg+xml" sizes="any">',
            '<link rel="icon" href="favicon.svg" type="image/svg+xml" sizes="any">\n' + FONT_LINKS,
            1,
        )
    return text.replace("<head>", "<head>\n" + FONT_LINKS, 1)


def process_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    text = original

    if path.name == "index.html":
        return False

    current = detect_current(path)
    text = ensure_shared_assets(text)
    if OLD_NAV_RE.search(text):
        text = OLD_NAV_RE.sub(nav_html(current), text, count=1)
    text = NAV_CSS_RE.sub("\n", text, count=1)
    text = BODY_BEFORE_RE.sub("\n", text, count=1)
    text = FOOTER_BLOCK_RE.sub("\n", text, count=1)
    text = FOOTER_BLOCK_RE2.sub("\n", text, count=1)
    text = STALE_NAV_MEDIA_RE.sub("\n", text)
    text = LEGACY_FOOTER_INLINE_RE.sub("\n", text, count=1)
    text = LEGACY_NAV_RESPONSIVE_RE.sub("", text)
    text = re.sub(r"  \.n-links[^\n]+transition[^\n]+\n", "", text)
    text = patch_root_vars(text)
    text = patch_body(text)
    text = patch_fonts(text)
    text = re.sub(
        r"\.case-study__tag \{[^}]*font-family:\s*var\(--display\)",
        ".case-study__tag {\n  font-family: 'Inter', sans-serif",
        text,
    )

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for path in sorted(ROOT.glob("*.html")):
        if process_file(path):
            changed.append(path.name)
    print(f"Updated {len(changed)} files:")
    for name in changed:
        print(f"  - {name}")


if __name__ == "__main__":
    main()

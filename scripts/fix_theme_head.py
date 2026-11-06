#!/usr/bin/env python3
"""Move theme.css + palette-preview.js to end of <head>, add ?v=ember1 to local stylesheets + scripts."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VQ = "ember1"

THEME_LINK_RE = re.compile(
    r"<link\s[^>]*href=[\"'][^\"']*theme\.css[^\"']*[\"'][^>]*>\s*",
    re.IGNORECASE,
)
PALETTE_SCRIPT_RE = re.compile(
    r"<script\s[^>]*src=[\"'][^\"']*palette-preview\.js[^\"']*[\"'][^>]*>\s*</script>\s*",
    re.IGNORECASE,
)

EXTERNAL_PREFIXES = ("http://", "https://", "//", "mailto:", "tel:", "data:")


def is_local_url(url: str) -> bool:
    u = (url or "").strip()
    if not u:
        return False
    return not any(u.startswith(p) for p in EXTERNAL_PREFIXES)


def with_version(url: str) -> str:
    if not is_local_url(url):
        return url
    path_only = url.split("#", 1)[0].split("?", 1)[0]
    return f"{path_only}?v={VQ}"


def bump_local_link_href(content: str) -> str:
    def repl(match: re.Match) -> str:
        full = match.group(0)
        if not re.search(r"rel\s*=\s*[\"']stylesheet[\"']", full, re.IGNORECASE):
            return full
        m = re.search(r"href=([\"'])([^\"']+)\1", full, re.IGNORECASE)
        if not m:
            return full
        q, href = m.group(1), m.group(2)
        if not is_local_url(href):
            return full
        new_href = with_version(href)
        return full.replace(f"href={q}{href}{q}", f"href={q}{new_href}{q}", 1)

    return re.sub(r"<link\s[^>]*>", repl, content, flags=re.IGNORECASE)


def bump_local_script_src(content: str) -> str:
    def repl(match: re.Match) -> str:
        full = match.group(0)
        m = re.search(r"src=([\"'])([^\"']+)\1", full, re.IGNORECASE)
        if not m:
            return full
        q, src = m.group(1), m.group(2)
        if not is_local_url(src):
            return full
        new_src = with_version(src)
        return full.replace(f"src={q}{src}{q}", f"src={q}{new_src}{q}", 1)

    return re.sub(r"<script\s[^>]*>", repl, content, flags=re.IGNORECASE)


def strip_theme_tags(html: str) -> str:
    html = THEME_LINK_RE.sub("", html)
    html = PALETTE_SCRIPT_RE.sub("", html)
    return html


def inject_theme_block(html: str, path: Path) -> str:
    use_root = path.name == "404.html"
    css_href = "/css/theme.css" if use_root else "css/theme.css"
    js_src = "/js/palette-preview.js" if use_root else "js/palette-preview.js"
    block = (
        f'  <link rel="stylesheet" href="{css_href}?v={VQ}">\n'
        f'  <script src="{js_src}?v={VQ}"></script>\n'
    )
    idx = html.lower().rfind("</head>")
    if idx == -1:
        print(f"WARN: no </head> in {path}", file=sys.stderr)
        return html
    return html[:idx] + block + html[idx:]


def process_file(path: Path) -> bool:
    raw = path.read_text(encoding="utf-8")
    cleaned = strip_theme_tags(raw)
    versioned = bump_local_script_src(bump_local_link_href(cleaned))
    final = inject_theme_block(versioned, path)
    if final != raw:
        path.write_text(final, encoding="utf-8")
        print(path.relative_to(ROOT))
        return True
    return False


def main() -> None:
    n = 0
    for p in sorted(ROOT.glob("*.html")):
        if process_file(p):
            n += 1
    print(f"Updated {n} file(s).", file=sys.stderr)


if __name__ == "__main__":
    main()

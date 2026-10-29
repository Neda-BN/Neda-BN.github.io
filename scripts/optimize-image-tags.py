#!/usr/bin/env python3
"""Set loading/fetchpriority/decoding and width/height on <img> in portfolio HTML."""
from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FILES = [
    "index.html",
    "about.html",
    "simplebooking.html",
    "healthcare.html",
    "pos-app.html",
    "mobile-app.html",
    "backoffice.html",
] + [f"ui-design-{i:02d}.html" for i in range(1, 13)]

IMG_TAG = re.compile(r"<img\b[^>]*>", re.IGNORECASE | re.DOTALL)

_size_cache: dict[str, tuple[int, int] | None] = {}


def get_attr(tag: str, name: str) -> str | None:
    m = re.search(rf'\b{re.escape(name)}\s*=\s*(["\'])(.*?)\1', tag, re.IGNORECASE | re.DOTALL)
    return m.group(2) if m else None


def set_attr(tag: str, name: str, value: str) -> str:
    pat = rf'\b{re.escape(name)}\s*=\s*(["\']).*?\1'
    if re.search(pat, tag, re.IGNORECASE | re.DOTALL):
        return re.sub(pat, f'{name}="{value}"', tag, count=1, flags=re.IGNORECASE | re.DOTALL)
    return tag[:-1].rstrip() + f' {name}="{value}">'


def remove_attr(tag: str, name: str) -> str:
    return re.sub(rf'\s*\b{re.escape(name)}\s*=\s*(["\']).*?\1', "", tag, count=1, flags=re.IGNORECASE | re.DOTALL)


def image_size(rel: str) -> tuple[int, int] | None:
    key = rel.split("?")[0]
    if key in _size_cache:
        return _size_cache[key]
    path = ROOT / key
    if not path.is_file():
        _size_cache[key] = None
        return None
    try:
        out = subprocess.run(
            ["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(path)],
            capture_output=True,
            text=True,
            check=True,
        )
        w = h = None
        for line in out.stdout.splitlines():
            if "pixelWidth:" in line:
                w = int(line.rsplit(None, 1)[-1])
            if "pixelHeight:" in line:
                h = int(line.rsplit(None, 1)[-1])
        if w and h:
            _size_cache[key] = (w, h)
            return w, h
    except (subprocess.CalledProcessError, ValueError, OSError):
        pass
    _size_cache[key] = None
    return None


def is_hero(attrs: dict[str, str | None], filename: str, hero_used: bool, tag: str) -> bool:
    if hero_used:
        return False
    cls = attrs.get("class") or ""
    src = attrs.get("src") or ""
    if "hero-v6__photo" in cls or "hero-v6__photo" in tag:
        return True
    if "case-hero-img" in cls or "case-hero-img" in tag:
        return True
    if "hero-scroll-img" in cls or "hero-scroll-img" in tag:
        return True
    if filename == "simplebooking.html" and "sb-hero.png" in src:
        return True
    if filename == "index.html" and "Neda-Bagheri" in src:
        return True
    if filename == "about.html" and "Neda-Bagheri" in src:
        return True
    if filename == "healthcare.html" and "healthcare-survey-platform-overview" in src:
        return True
    if filename == "mobile-app.html" and "mobile-customer-shopping-app.png" in src:
        return True
    if filename == "backoffice.html" and "backoffice-dashboard-hero" in src:
        return True
    if filename.startswith("ui-design-"):
        return True
    return False


def attrs_from_tag(tag: str) -> dict[str, str | None]:
    names = ["class", "id", "src", "srcset", "sizes", "alt", "width", "height", "loading", "decoding", "fetchpriority"]
    out: dict[str, str | None] = {}
    for n in names:
        out[n] = get_attr(tag, n)
    return out


def process_tag(tag: str, filename: str, hero_used: bool) -> tuple[str, bool]:
    attrs = attrs_from_tag(tag)
    hero = is_hero(attrs, filename, hero_used, tag)
    new = tag
    if hero:
        new = remove_attr(new, "loading")
        new = set_attr(new, "fetchpriority", "high")
        hero_used = True
    else:
        new = set_attr(new, "loading", "lazy")
        new = remove_attr(new, "fetchpriority")

    new = set_attr(new, "decoding", "async")

    src = get_attr(new, "src")
    if src:
        if not get_attr(new, "width") or not get_attr(new, "height"):
            wh = image_size(src)
            if wh:
                if not get_attr(new, "width"):
                    new = set_attr(new, "width", str(wh[0]))
                if not get_attr(new, "height"):
                    new = set_attr(new, "height", str(wh[1]))

    return new, hero_used


def process_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    hero_used = False
    changed = False

    def repl(match: re.Match[str]) -> str:
        nonlocal hero_used, changed
        old = match.group(0)
        new, hero_used = process_tag(old, path.name, hero_used)
        if new != old:
            changed = True
        return new

    new_text = IMG_TAG.sub(repl, text)
    if changed:
        path.write_text(new_text, encoding="utf-8")
    return changed


def main() -> None:
    for name in FILES:
        p = ROOT / name
        if not p.is_file():
            raise SystemExit(f"missing {name}")
        process_file(p)
    print("optimized", len(FILES), "html files")


if __name__ == "__main__":
    main()

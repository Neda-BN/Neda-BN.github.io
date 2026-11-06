#!/usr/bin/env python3
"""Remove palette token redefinitions from inline :root { ... } blocks in HTML."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

BANNED_NAMES = frozenset(
    {
        "accent",
        "accent-light",
        "blue",
        "yellow",
        "yellow-soft",
        "yellow-line",
        "bg",
        "ink",
        "body",
        "meta",
    }
)

ROOT_BLOCK = re.compile(r":root\s*\{([^}]*)\}", re.DOTALL)


def is_banned_decl(decl: str) -> bool:
    decl = decl.strip()
    if not decl:
        return False
    m = re.match(r"^--([a-zA-Z0-9-]+)\s*:", decl)
    if not m:
        return False
    return m.group(1).lower() in BANNED_NAMES


def clean_root_inner(inner: str) -> str:
    """Split on semicolons, drop banned custom properties, rejoin."""
    parts = inner.split(";")
    kept: list[str] = []
    for p in parts:
        chunk = p.strip()
        if not chunk:
            continue
        decl = chunk if chunk.endswith(";") else chunk
        if is_banned_decl(decl):
            continue
        kept.append(chunk)
    out = "; ".join(k for k in kept if k)
    if out and not out.endswith(";"):
        out += ";"
    return out.strip()


def process_html(content: str) -> str:
    def repl(m: re.Match) -> str:
        new_inner = clean_root_inner(m.group(1))
        if not new_inner:
            return ""
        return ":root {\n" + new_inner + "\n}"

    return ROOT_BLOCK.sub(repl, content)


def main() -> None:
    n = 0
    for path in sorted(ROOT.glob("*.html")):
        raw = path.read_text(encoding="utf-8")
        new = process_html(raw)
        if new != raw:
            path.write_text(new, encoding="utf-8")
            print(path.relative_to(ROOT))
            n += 1
    print(f"Updated {n} file(s).", file=sys.stderr)


if __name__ == "__main__":
    main()

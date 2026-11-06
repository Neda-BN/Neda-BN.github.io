#!/usr/bin/env python3
"""
Direct Ember palette replacements across .css, .html, .js (excludes node_modules).
Preserves html[data-palette='original'] { ... } in css/theme.css unchanged.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {"node_modules", ".git"}
EXT = {".css", ".html", ".js"}

# Step 4: other brand-adjacent blue tints → coral ladder (same alpha)
EXTRA_BLUE_RGBA = [
    (r"rgba\(\s*168\s*,\s*192\s*,\s*232\s*,", "rgba(255, 158, 128,"),
    (r"rgba\(\s*196\s*,\s*168\s*,\s*232\s*,", "rgba(255, 186, 163,"),
]


def extract_original_block(content: str) -> tuple[str, str | None]:
    """Return (content_with_ORIGINAL_PLACEHOLDER, original_block_or_None)."""
    m = re.search(r"html\[data-palette=['\"]original['\"]\]\s*\{", content)
    if not m:
        return content, None
    start = m.start()
    brace_open = content.find("{", m.start())
    if brace_open == -1:
        return content, None
    i = brace_open + 1
    depth = 1
    while i < len(content) and depth:
        if content[i] == "{":
            depth += 1
        elif content[i] == "}":
            depth -= 1
        i += 1
    block = content[start:i]
    rest = content[:start] + "___ORIGINAL_PALETTE_BLOCK___" + content[i:]
    return rest, block


def merge_counts(a: dict[str, int], b: dict[str, int]) -> None:
    for k, v in b.items():
        a[k] = a.get(k, 0) + v


def apply_steps(text: str) -> tuple[str, dict[str, int]]:
    c: dict[str, int] = {}
    t = text

    # Step 1 — blue → coral
    t, n = re.subn(
        r"#8[Aa]4[Dd]6([0-9A-Fa-f]{2})?\b",
        lambda m: "#FF8A65" + (m.group(1) or ""),
        t,
    )
    c["step1"] = c.get("step1", 0) + n

    t, n = re.subn(
        r"rgba\(\s*138\s*,\s*164\s*,\s*214\s*,",
        "rgba(255, 138, 101,",
        t,
    )
    c["step1"] = c.get("step1", 0) + n

    t, n = re.subn(
        r"rgb\(\s*138\s*,\s*164\s*,\s*214\s*\)",
        "rgb(255, 138, 101)",
        t,
    )
    c["step1"] = c.get("step1", 0) + n

    # Step 2 — yellow → sand
    t, n = re.subn(
        r"#[Ee]8[Bb]86[Dd]([0-9A-Fa-f]{2})?\b",
        lambda m: "#F3D9A4" + (m.group(1) or ""),
        t,
    )
    c["step2"] = n

    t, n = re.subn(
        r"rgba\(\s*232\s*,\s*184\s*,\s*109\s*,",
        "rgba(243, 217, 164,",
        t,
    )
    c["step2"] = c.get("step2", 0) + n

    t, n = re.subn(
        r"rgb\(\s*232\s*,\s*184\s*,\s*109\s*\)",
        "rgb(243, 217, 164)",
        t,
    )
    c["step2"] = c.get("step2", 0) + n

    # Step 3 — background
    t, n = re.subn(r"#0[Bb]0[Cc]10\b", "#121011", t)
    c["step3"] = n

    t, n = re.subn(
        r"rgba\(\s*11\s*,\s*12\s*,\s*16\s*,",
        "rgba(18, 16, 17,",
        t,
    )
    c["step3"] = c.get("step3", 0) + n

    t, n = re.subn(
        r"rgb\(\s*11\s*,\s*12\s*,\s*16\s*\)",
        "rgb(18, 16, 17)",
        t,
    )
    c["step3"] = c.get("step3", 0) + n

    # Step 4 — other brand-adjacent blues
    s4 = 0
    for pat, repl in EXTRA_BLUE_RGBA:
        t, n = re.subn(pat, repl, t)
        s4 += n
    c["step4"] = s4

    return t, c


def process_file(path: Path) -> dict[str, int] | None:
    raw = path.read_text(encoding="utf-8")

    if path.name == "theme.css" and "css" in path.parts:
        rest, orig = extract_original_block(raw)
        if orig:
            before, _, after = rest.partition("___ORIGINAL_PALETTE_BLOCK___")
            nb, cb = apply_steps(before)
            na, ca = apply_steps(after)
            new_content = nb + orig + na
            counts: dict[str, int] = {}
            merge_counts(counts, cb)
            merge_counts(counts, ca)
        else:
            new_content, counts = apply_steps(raw)
    else:
        new_content, counts = apply_steps(raw)

    if new_content != raw:
        path.write_text(new_content, encoding="utf-8")
    return counts if sum(counts.values()) else None


def main() -> None:
    per_file: list[tuple[str, dict[str, int]]] = []
    totals = {"step1": 0, "step2": 0, "step3": 0, "step4": 0}

    for p in sorted(ROOT.rglob("*")):
        if not p.is_file():
            continue
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        if p.suffix.lower() not in EXT:
            continue
        if p.name == "ember_direct_replace.py":
            continue
        c = process_file(p)
        if c:
            per_file.append((str(p.relative_to(ROOT)), c))
            for k in totals:
                totals[k] += c.get(k, 0)

    print("=== Replacements per file (steps 1–4) ===\n")
    for rel, c in per_file:
        print(f"{rel}:")
        for sk in ("step1", "step2", "step3", "step4"):
            v = c.get(sk, 0)
            if v:
                print(f"  {sk}: {v}")
        print()

    print("=== Totals (all files) ===")
    for k, v in totals.items():
        print(f"  {k}: {v}")

    print(f"\nFiles modified: {len(per_file)}", file=sys.stderr)


if __name__ == "__main__":
    main()

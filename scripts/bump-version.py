#!/usr/bin/env python3
"""Update static asset versions; no dependencies or build output required."""

import argparse
import re
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
TOKEN = re.compile(
    r"//[^\n]*|/\*[\s\S]*?\*/|"
    r"'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"|"
    r"`(?:\\.|[^`\\])*`|[A-Za-z_$][\w$]*|[^\s]"
)


def version_url(value, version):
    parts = urlsplit(value)
    if not value.startswith(("./", "../")) and parts.path not in (
        "css/styles.css", "js/app.js"
    ):
        return value
    if parts.scheme or parts.netloc or not parts.path.endswith((".js", ".css")):
        return value
    query = [(key, item) for key, item in parse_qsl(parts.query, keep_blank_values=True) if key != "v"]
    query.append(("v", version))
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def update_modules(source, version):
    tokens = [match for match in TOKEN.finditer(source) if not match[0].startswith(("//", "/*"))]
    replacements = {}
    for index, token in enumerate(tokens):
        if token[0] not in ("import", "export") or (index and tokens[index - 1][0] == "."):
            continue
        cursor = index + 1
        if cursor >= len(tokens):
            continue
        if token[0] == "import" and tokens[cursor][0] == "(":
            cursor += 1
        elif tokens[cursor][0][0] not in "\"'":
            while cursor < len(tokens) and tokens[cursor][0] not in ("from", ";"):
                cursor += 1
            if cursor == len(tokens) or tokens[cursor][0] != "from":
                continue
            cursor += 1
        if cursor >= len(tokens):
            continue
        specifier = tokens[cursor]
        if specifier[0][0] not in "\"'":
            continue
        value = specifier[0][1:-1]
        updated = version_url(value, version)
        if updated != value:
            replacements[specifier.start() + 1] = (specifier.end() - 1, updated)
    for start, (end, value) in sorted(replacements.items(), reverse=True):
        source = source[:start] + value + source[end:]
    return source


def main():
    parser = argparse.ArgumentParser(description="Đồng bộ cache version của HTML và ES Modules nội bộ.")
    parser.add_argument("version", nargs="?", help="Ví dụ 20261116-2; bỏ trống để tăng hậu tố số hiện tại.")
    args = parser.parse_args()
    html_path = ROOT / "index.html"
    html = html_path.read_text(encoding="utf-8")
    current = re.search(r'css/styles\.css\?[^"\']*\bv=([A-Za-z0-9._-]+)', html)
    version = args.version
    if version is None:
        previous = current[1] if current else "20261116-0"
        suffix = re.fullmatch(r"(.+)-(\d+)", previous)
        version = f"{suffix[1]}-{int(suffix[2]) + 1}" if suffix else previous + "-1"
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,79}", version):
        parser.error("Version chỉ được chứa chữ, số, dấu chấm, gạch dưới, gạch ngang (tối đa 80 ký tự).")

    def html_asset(match):
        return match[1] + version_url(match[2], version) + match[3]

    updated_html = re.sub(
        r'((?:href|src)=["\'])((?:css/styles\.css|js/app\.js)(?:\?[^"\'#]*)?(?:#[^"\']*)?)(["\'])',
        html_asset, html
    )
    updates = {html_path: updated_html}
    for path in sorted((ROOT / "js").rglob("*.js")):
        updates[path] = update_modules(path.read_text(encoding="utf-8"), version)
    changed = [path for path, content in updates.items() if path.read_text(encoding="utf-8") != content]
    for path in changed:
        path.write_text(updates[path], encoding="utf-8")
    print(f"Cache version: {version} · Cập nhật {len(changed)} file.")


if __name__ == "__main__":
    main()

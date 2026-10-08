# Documentation maintenance

**English** | [Português (Brasil)](../documentacao.md)

Project documentation uses [Zensical](https://zensical.org/docs/) and lives in [Portuguese](../index.md) and [English](index.md), with navigation configured in `zensical.toml`. Python 3.10 or later with `venv` and `pip` is required.

From the repository root, in Bash/Linux/macOS:

```bash
python3 -m venv .venv-docs
source .venv-docs/bin/activate
python -m pip install -r requirements-docs.txt
zensical serve
```

Open `http://127.0.0.1:8001`. On Windows, activate the environment with `.venv-docs\Scripts\activate` in Command Prompt. To generate the static site:

```bash
zensical build --strict
```

Output is written to `site/`. Edit Markdown pages in `docs/` and update navigation when adding pages. The build, cache and local Python environment are ignored by Git.

## References

- [Zensical installation](https://zensical.org/docs/get-started/)
- [Zensical configuration](https://zensical.org/docs/setup/basics/)

The dependency is pinned in `requirements-docs.txt`. After upgrading, run `zensical build --strict`. Keep both READMEs and the Portuguese and English guides synchronized when changing application instructions.

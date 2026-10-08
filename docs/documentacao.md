# Manutenção da documentação

**Português (Brasil)** | [English](en/documentation.md)

A documentação do projeto usa [Zensical](https://zensical.org/docs/) e fica em [páginas Markdown](index.md), com navegação definida em `zensical.toml`. Requer Python 3.10 ou superior com `venv` e `pip`.

Na raiz do repositório, em Bash/Linux/macOS:

```bash
python3 -m venv .venv-docs
source .venv-docs/bin/activate
python -m pip install -r requirements-docs.txt
zensical serve
```

Abra `http://127.0.0.1:8001`. No Windows, ative o ambiente com `.venv-docs\Scripts\activate` no Prompt de Comando. Para gerar o site estático:

```bash
zensical build --strict
```

O resultado fica em `site/`. Edite as páginas Markdown em `docs/` e atualize a navegação ao adicionar páginas. O build, o cache e o ambiente Python local são ignorados pelo Git.

## Referências

- [Instalação do Zensical](https://zensical.org/docs/get-started/)
- [Configuração do Zensical](https://zensical.org/docs/setup/basics/)

A dependência é fixada em `requirements-docs.txt`. Ao atualizar sua versão, execute novamente `zensical build --strict`. Mantenha os dois READMEs e os guias em português e inglês sincronizados ao alterar as instruções do aplicativo.

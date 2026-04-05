# Chrome DevTools MCP

Configuração local do projeto `one-more-orbit` para usar o servidor oficial **Chrome DevTools MCP**.

## Arquivos adicionados

- `.mcp.json` — configuração genérica do servidor MCP para ferramentas/IDE que reconhecem esse arquivo.

## Configuração atual

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--headless",
        "--isolated"
      ]
    }
  }
}
```

## Requisitos

- Node.js 20.19+
- Google Chrome instalado no host
- npm disponível no PATH

## Como usar

### Codex CLI
No Codex, adicione/importe a configuração MCP do projeto, ou registre manualmente:

```bash
codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest --headless --isolated
```

### Claude Code
```bash
claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest --headless --isolated
```

### Cursor / VS Code / outros clientes MCP
Use o conteúdo de `.mcp.json` como base da configuração local do servidor.

## Observações

- `--headless`: roda sem abrir janela visível do navegador.
- `--isolated`: usa perfil isolado/temporário, reduzindo risco de misturar sessão pessoal com sessão automatizada.
- Se você quiser reutilizar uma sessão já logada do Chrome, o caminho mais apropriado é testar `--autoConnect` (exige configuração adicional de remote debugging no Chrome).
- O servidor pode expor conteúdo do browser ao cliente MCP. Só use com agentes em que você confia.
- O projeto oficial também documenta opt-out de telemetria/estatísticas com `--no-usage-statistics`.

## Referências

- https://github.com/ChromeDevTools/chrome-devtools-mcp/
- https://developer.chrome.com/blog/chrome-devtools-mcp
- https://developer.chrome.com/blog/chrome-devtools-mcp-debug-your-browser-session

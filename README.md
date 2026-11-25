# Crônica — Gerenciador de Campanhas de D&D
Projeto Integrador de Engenharia de Software (IFRS). Trabalho individual.

## Como usar
Abra `index.html` no navegador (Chrome ou Firefox). Na tela inicial, use "Carregar dados de exemplo" para demonstrar.

## Estrutura
- `src/ui.js` — interface: núcleo (estado, navegação, painel)
- `src/cadastros.js` — interface: cadastros de NPCs, locais e missões
- `src/sessao.js` — interface: fluxo de registrar uma sessão
- `src/diario.js` — interface: diário da campanha
- `src/main.js` — inicialização
- `src/regras.js` — regras de negócio (sem DOM)
- `src/armazenamento.js` — persistência no localStorage
- `tests/` — testes automatizados

## Testes
```
npm install jsdom --no-save
npm test
```
Requer Node.js 22 ou superior.

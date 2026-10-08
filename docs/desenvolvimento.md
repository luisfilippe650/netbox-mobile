# Desenvolvimento e contribuição

**Português (Brasil)** | [English](en/development.md)

## Tecnologias

| Tecnologia | Utilização |
| --- | --- |
| React 19 | Interface e componentes |
| TypeScript 6 | Tipagem do frontend e da integração |
| Vite 8 | Servidor de desenvolvimento e build |
| Capacitor 8 | Integração do frontend com o Android |
| NetBox REST API | Dados, autenticação e permissões |
| Zod 4 | Validação de entradas e respostas da API |
| jsQR e qrcode | Leitura e geração de QR Codes |
| CSS | Estilos e layout responsivo |
| Vitest e jsdom | Testes automatizados |
| Oxlint | Análise estática do código |
| Gradle e Android SDK | Compilação do aplicativo Android |

Conheça [quem desenvolveu o projeto e por que ele foi criado](sobre.md).

## Como contribuir

Contribuições, relatos de problemas, melhorias na documentação e traduções são bem-vindos.

1. Abra uma [issue](https://github.com/luisfilippe650/netbox-mobile/issues) descrevendo o problema ou a melhoria proposta. Para bugs, inclua os passos de reprodução e as versões relevantes do navegador, Android e NetBox.
2. Faça um fork do [repositório](https://github.com/luisfilippe650/netbox-mobile) e crie uma branch para sua alteração.
3. Faça alterações focadas, atualize as duas versões do README quando necessário e execute `npm run lint` e `npm test` dentro de `app/`.
4. Envie um [pull request](https://github.com/luisfilippe650/netbox-mobile/pulls) explicando a alteração e como ela foi verificada.

Não inclua credenciais, tokens ou dados privados de infraestrutura em issues, capturas de tela ou commits.

## Licença

Ainda não foi adicionado um arquivo de licença a este repositório. A licença do Datacenter Manager permanece a definir e é independente das licenças do NetBox e das demais dependências.

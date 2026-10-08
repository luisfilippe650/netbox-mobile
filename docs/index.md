# Datacenter Manager

**Português (Brasil)** | [English](en/index.md)

Datacenter Manager é um projeto open source independente voltado à comunidade, para consultar e gerenciar infraestrutura de datacenter pelo navegador ou pelo Android. Integra-se à API REST do **[NetBox](https://netboxlabs.com/products/netbox/)** para trabalhar com equipamentos, racks, sites, locais, regiões e conexões físicas.

Os dados são consultados e atualizados diretamente na sua instância do NetBox, respeitando as permissões do usuário autenticado. **O inglês é o idioma padrão da interface**; o português do Brasil também está disponível em **Home → menu → Languages**, com a escolha salva no dispositivo. Em português, a opção aparece como **Linguagens**.

Este projeto é um cliente móvel independente do NetBox. Não é um produto oficial do projeto NetBox nem da NetBox Labs. Para configurações avançadas e operações fora do escopo do aplicativo, utilize a interface web do NetBox.

## Status

**Em desenvolvimento.** O projeto possui interface web em React e projeto Android integrado com Capacitor, além de testes automatizados com Vitest. As funcionalidades disponíveis estão descritas abaixo; o pacote frontend se chama `datacenter-manager` e sua versão atual é `0.0.0`.

## Funcionalidades

- **Autenticação e permissões:** login com usuário e senha do NetBox, controle de acesso por ação e identificação de sessões somente para leitura.
- **Equipamentos:** listagem paginada, busca por nome ou patrimônio, cadastro, consulta de detalhes, edição e exclusão conforme as permissões.
- **Catálogos de equipamentos:** consulta, cadastro e exclusão de fabricantes, tipos e funções.
- **QR Code:** leitura pela câmera para localizar equipamentos e geração de códigos para salvar como imagem.
- **Campos personalizados:** exibição e edição conforme as definições e validações cadastradas no NetBox.
- **Racks:** listagem, cadastro e exclusão, gestão de grupos e funções, além de visualização da ocupação e dos equipamentos no desenho do rack.
- **Organização:** consulta, cadastro e exclusão de sites, locais e regiões.
- **Conexões físicas:** consulta de cabos, detalhes das terminações e diagrama de conexão, além do cadastro de conexões conforme as permissões.
- **Uso no navegador e no Android:** frontend web e empacotamento como APK com Capacitor.
- **Inglês e português:** troca de idioma pelo menu da home, sem recarregar o aplicativo.


## Guias

- [Sobre o projeto: autor e motivação](sobre.md)
- [Instalação e execução](instalacao.md)
- [Configuração do NetBox](configuracao.md)
- [Desenvolvimento e contribuição](desenvolvimento.md)
- [Manutenção da documentação](documentacao.md)


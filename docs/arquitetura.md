# Arquitetura e backlog

O aplicativo é local, com perfil operacional único para a secretaria. Não há portal do aluno, contas/permissões separadas ou integração com DETRAN. Metas de aulas são definidas por matrícula e devem refletir as orientações aplicáveis à unidade e ao aluno.

- `src/main`: processo principal Electron; validação, regras de negócio, repositório e integrações.
- `src/preload`: expõe somente uma operação de IPC. O main aceita exclusivamente comandos registrados pelo aplicativo e chamados pela janela principal.
- `src/renderer`: DOM em TypeScript, Bootstrap local e páginas separadas. Dados exibidos são inseridos como texto.
- `src/shared`: tipos e rótulos compartilhados entre processos.
- `database`: schema relacional MySQL 8.4. O armazenamento demo existe para avaliação e testes. A aplicação lê conjuntos de dados da unidade; para volume maior, evolua para filtros SQL e paginação.
- Convenção de registro: `src/main/features/*.ts` exporta por padrão um `Feature`; `src/renderer/features/*.ts` exporta por padrão um `Page`. O Vite descobre esses arquivos durante o build.
- A unidade usa um único fuso IANA. Agendamentos são persistidos como ISO UTC, enquanto datas de calendário da manutenção não são convertidas.
- Uma transação MySQL serializa escritas do app para evitar marcações concorrentes; fora do app, alterações diretas não passam pelas regras operacionais.

## Ordem de entrega

1. Fundação: Electron, contrato, persistência e equipe de agentes.
2. Operação: alunos, instrutores, frota e manutenção.
3. Agenda: aulas, presenças, progresso e exames.
4. Complementos: previsão do tempo, lembretes, SMS e validação.

Para trabalho futuro, o agente `arquiteto` apresenta uma etapa por vez com objetivo, critérios de aceitação e validação. A implementação só começa depois da sua aprovação explícita.

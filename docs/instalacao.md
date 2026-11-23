# Instalação

Requisitos: Node.js 22.12+ (ou 24 LTS), npm e ambiente gráfico compatível com Electron.

```sh
npm ci
npm run dev
```

Sem `.env`, o modo demonstração guarda dados fictícios entre execuções em `dados-demo.json`, na pasta de dados do Electron (no Windows, em `%APPDATA%`, na pasta do aplicativo). Não use dados reais no modo demonstração. `AUTOESCOLA_DATA_DIR` permite apontá-lo para uma pasta separada; não compartilhe o mesmo arquivo entre instâncias.

## MySQL 8.4

1. Copie `.env.example` para `.env`. Defina `DB_MODE=mysql`, `DB_PASSWORD` e `MYSQL_ROOT_PASSWORD` com senhas fortes e diferentes.
2. Com Docker, rode `docker compose up -d`. O volume persiste os dados; o schema inicial é aplicado só na criação do volume. Aguarde o MySQL ficar pronto antes de abrir as telas.
3. Sem Docker, crie a base e o usuário no MySQL local, importe `database/schema.sql` na base configurada e conceda ao aplicativo apenas `SELECT`, `INSERT`, `UPDATE` e `DELETE` nessa base. O usuário inicial criado pela imagem Docker é conveniente para desenvolvimento; reduza as permissões para uso real.
4. Na raiz do projeto, inicie com `npm run dev` ou `npm run build` seguido de `npm start`. Dados do modo demonstração não são migrados automaticamente.

Em uma instalação real, limite o acesso à estação e à base, não publique a porta do banco, proteja o `.env` e teste backups e restauração. Rode o aplicativo na raiz do projeto ou indique um arquivo de configuração por `AUTOESCOLA_ENV_FILE`. Alterações de configuração exigem reabrir o aplicativo Electron.

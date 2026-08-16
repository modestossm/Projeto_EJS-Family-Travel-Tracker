# Family Travel Tracker

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-B4B4B4?style=for-the-badge&logo=ejs&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

Aplicação web para rastrear quais países cada membro da família já visitou. Construída com **Node.js**, **Express**, **EJS** e **PostgreSQL**.

## Funcionalidades

- Criar e alternar entre perfis de membros da família
- Adicionar países à lista de visitados de cada membro
- Mapa-múndi visual com os países visitados destacados
- Remover membros da família e seus registros

## Stack

- **Backend:** Node.js, Express
- **Frontend:** Templates EJS, CSS
- **Banco de dados:** PostgreSQL
- **Dependências:** `pg`, `body-parser`, `ejs`

## Configuração

1.  Clone o repositório e instale as dependências:

    ```bash
    npm install
    ```

2.  Configure as variáveis de ambiente com as credenciais do PostgreSQL:

    ```env
    DB_USER=seu_usuario
    DB_HOST=localhost
    DB_DATABASE=family_travel_tracker
    DB_PASSWORD=sua_senha
    DB_PORT=5432
    ```

3.  Crie as tabelas necessárias no banco de dados:

    ```sql
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(15) NOT NULL UNIQUE,
      color VARCHAR(15) NOT NULL
    );

    CREATE TABLE countries (
      id SERIAL PRIMARY KEY,
      country_code VARCHAR(2) NOT NULL,
      country_name VARCHAR(100) NOT NULL
    );

    CREATE TABLE visited_countries (
      id SERIAL PRIMARY KEY,
      country_code VARCHAR(2) NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );
    ```

4.  Popule a tabela `countries` com os códigos e nomes dos países (ex.: a partir de um dataset público).

5.  Inicie o servidor:

    ```bash
    npm start
    ```

## Deploy

O deploy foi feito a partir do GitHub para uma **VPS**, onde rodam tanto o backend quanto o banco de dados PostgreSQL.

🔗 Acesse o site aqui *(link em breve)*

## Licença

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Este projeto está licenciado sob a [Licença MIT](LICENSE).

import pg from "pg";

const { Client } = pg;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function criarBanco() {
    try {
        await client.connect();

        console.log("Conectado ao PostgreSQL!");

        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(150) UNIQUE,
        phone VARCHAR(30),
        birth_date DATE,
        role VARCHAR(30) NOT NULL DEFAULT 'acompanhante',
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log("Tabela users criada com sucesso!");
    } catch (error) {
        console.error("Erro:", error);
    } finally {
        await client.end();
    }
}

criarBanco();
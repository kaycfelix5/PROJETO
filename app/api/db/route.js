import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/app/lib/server-db";
import pool from "@/app/lib/db";

export async function GET() {
  const db = getDb();
  let users = db.users ? db.users.map(({ password: _, ...u }) => u) : [];
  let logs = db.logs || [];

  try {
    const pgUsers = await pool.query(`
      SELECT
        id,
        name,
        email,
        phone,
        birth_date AS "birthDate",
        role,
        created_at AS "createdAt"
      FROM users
      ORDER BY id ASC
    `);
    if (pgUsers.rows && pgUsers.rows.length > 0) {
      users = pgUsers.rows;
    }
  } catch (err) {
    console.warn("Aviso ao buscar usuários do PostgreSQL no /api/db:", err.message);
  }

  try {
    const pgLogs = await pool.query(`
      SELECT
        id,
        time,
        type,
        user_name AS "user",
        action,
        level,
        criado_em AS "criadoEm"
      FROM logs
      ORDER BY id DESC
      LIMIT 50
    `);
    if (pgLogs.rows && pgLogs.rows.length > 0) {
      logs = pgLogs.rows;
    }
  } catch (err) {
    console.warn("Aviso ao buscar logs do PostgreSQL no /api/db:", err.message);
  }

  return NextResponse.json({
    users,
    portadores: db.portadores || [],
    disponiveis: db.disponiveis || [],
    logs,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = getDb();

    if (Array.isArray(body.portadores)) {
      db.portadores = body.portadores;
    }
    if (Array.isArray(body.disponiveis)) {
      db.disponiveis = body.disponiveis;
    }
    if (body.newLog) {
      const logEntry = {
        id: Date.now(),
        time: new Date().toLocaleTimeString("pt-BR"),
        ...body.newLog,
      };
      db.logs.unshift(logEntry);
      if (db.logs.length > 50) db.logs = db.logs.slice(0, 50);

      try {
        await pool.query(
          `
          INSERT INTO logs (time, type, user_name, action, level)
          VALUES ($1, $2, $3, $4, $5)
          `,
          [
            logEntry.time,
            logEntry.type || "INFO",
            logEntry.user || "Sistema",
            logEntry.action || "",
            logEntry.level || "info",
          ]
        );
      } catch (logErr) {
        console.warn("Não foi possível persistir log no PostgreSQL:", logErr.message);
      }
    }

    saveDb(db);
    return NextResponse.json({ success: true, count: db.portadores.length });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao atualizar dados: " + err.message },
      { status: 500 }
    );
  }
}

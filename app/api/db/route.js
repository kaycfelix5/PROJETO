import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/app/lib/server-db";

export async function GET() {
  const db = getDb();
  // Return users without exposing passwords in plain API GET
  const sanitizedUsers = db.users.map(({ password, ...u }) => u);
  return NextResponse.json({
    users: sanitizedUsers,
    portadores: db.portadores,
    disponiveis: db.disponiveis,
    logs: db.logs
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
      db.logs.unshift({
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        ...body.newLog
      });
      if (db.logs.length > 50) db.logs = db.logs.slice(0, 50);
    }

    saveDb(db);
    return NextResponse.json({ success: true, count: db.portadores.length });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao atualizar dados: " + err.message }, { status: 500 });
  }
}

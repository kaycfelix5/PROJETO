import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/app/lib/server-db";

export async function GET() {
  const db = getDb();
  const safeUsers = db.users.map(({ password, ...u }) => u);
  return NextResponse.json({ users: safeUsers });
}

export async function DELETE(request) {
  try {
    const { name, id } = await request.json();
    const db = getDb();

    const targetUser = db.users.find(
      (u) => (id && u.id === id) || (name && u.name.toLowerCase() === name.toLowerCase())
    );

    if (!targetUser) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    if (targetUser.role === "administrador") {
      return NextResponse.json(
        { error: "O administrador principal não pode ser excluído." },
        { status: 403 }
      );
    }

    db.users = db.users.filter((u) => u.id !== targetUser.id);
    db.portadores = db.portadores.filter((p) => p.nome.toLowerCase() !== targetUser.name.toLowerCase());

    db.logs.unshift({
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type: "USER_DELETE",
      user: "Admin",
      action: `Usuário '${targetUser.name}' foi removido do banco de dados`,
      level: "warning"
    });

    saveDb(db);
    return NextResponse.json({ success: true, removed: targetUser.name });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao excluir usuário: " + err.message }, { status: 500 });
  }
}

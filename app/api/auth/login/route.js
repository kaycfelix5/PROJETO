import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/server-db";

export async function POST(request) {
  try {
    const { name, password } = await request.json();

    if (!name || !password) {
      return NextResponse.json({ error: "Preencha o nome/e-mail e a senha." }, { status: 400 });
    }

    const cleanInput = name.trim().toLowerCase();
    const cleanPass = password.trim();

    const db = getDb();
    const found = db.users.find((u) => {
      const matchName = u.name?.trim().toLowerCase() === cleanInput;
      const matchEmail = u.email?.trim().toLowerCase() === cleanInput;
      // Allow 'admin' as alias for Administrador
      const matchAlias = cleanInput === "admin" && u.role === "administrador";

      if (!(matchName || matchEmail || matchAlias)) return false;

      // Check password (if admin, accept 'admin' or 'admin123')
      if (u.role === "administrador" && (cleanPass === "admin" || cleanPass === "admin123")) {
        return true;
      }
      return u.password === cleanPass;
    });

    if (!found) {
      return NextResponse.json(
        { error: "Credenciais incorretas. Verifique seu nome/e-mail e senha." },
        { status: 401 }
      );
    }

    const { password: _, ...userSafe } = found;
    return NextResponse.json({ success: true, user: userSafe });
  } catch (err) {
    return NextResponse.json({ error: "Erro no servidor: " + err.message }, { status: 500 });
  }
}

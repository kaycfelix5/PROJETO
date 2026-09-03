import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/app/lib/server-db";

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, role, phone, birthDate, password } = data;

    if (!name?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Nome e senha são obrigatórios." }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanEmail = email?.trim().toLowerCase() || "";

    const db = getDb();

    // Check duplicate
    const exists = db.users.some(
      (u) =>
        u.name.toLowerCase() === cleanName.toLowerCase() ||
        (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (exists) {
      return NextResponse.json(
        { error: "Já existe um usuário com esse nome ou e-mail cadastrado." },
        { status: 409 }
      );
    }

    const newUser = {
      id: Date.now(),
      name: cleanName,
      email: cleanEmail,
      phone: phone?.trim() || "",
      birthDate: birthDate || "",
      role: role || "acompanhante",
      password: password.trim()
    };

    db.users.push(newUser);

    // If registered as portador, add to portadores list
    if (newUser.role === "portador") {
      const birthYear = newUser.birthDate ? new Date(newUser.birthDate).getFullYear() : null;
      const idadeStr = birthYear ? `${new Date().getFullYear() - birthYear} anos` : "N/I";
      db.portadores.push({
        id: newUser.id,
        nome: newUser.name,
        idade: idadeStr,
        condicao: "Acompanhamento Ativo",
        humor: "Calmo",
        humorEmoji: "😌",
        local: "Não informado",
        distanciaMetros: 0,
        pinX: 50,
        pinY: 50,
        geofenceMax: 150,
        bateria: 100,
        rotinas: [],
        metas: [],
        mensagens: []
      });
    }

    // Add audit log
    db.logs.unshift({
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type: "CADASTRO",
      user: newUser.name,
      action: `Novo usuário registrado como ${newUser.role}`,
      level: "success"
    });

    saveDb(db);

    const { password: _, ...userSafe } = newUser;
    return NextResponse.json({ success: true, user: userSafe });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao registrar: " + err.message }, { status: 500 });
  }
}

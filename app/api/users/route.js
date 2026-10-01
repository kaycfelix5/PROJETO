import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        birth_date,
        role,
        created_at
      FROM users
      ORDER BY id ASC
      `
    );

    const users = result.rows.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthDate: user.birth_date,
      role: user.role,
      createdAt: user.created_at,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);

    return NextResponse.json(
      { error: "Erro ao buscar usuários." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id, name } = await request.json();

    if (!id && !name) {
      return NextResponse.json(
        { error: "ID ou nome do usuário é obrigatório." },
        { status: 400 }
      );
    }

    let user = null;

    try {
      const userResult = await pool.query(
        `
        SELECT id, name, role
        FROM users
        WHERE id::text = $1 OR ($2 <> '' AND LOWER(name) = LOWER($2))
        LIMIT 1
        `,
        [id ? String(id) : "", name ? String(name).trim() : ""]
      );

      if (userResult.rows.length > 0) {
        user = userResult.rows[0];

        if (user.role === "administrador") {
          return NextResponse.json(
            {
              error:
                "O administrador principal não pode ser excluído.",
            },
            { status: 403 }
          );
        }

        await pool.query(
          "DELETE FROM users WHERE id = $1",
          [user.id]
        );
      }
    } catch (pgErr) {
      console.warn("Aviso ao excluir usuário no PostgreSQL:", pgErr.message);
    }

    // Also synchronize deletion with server-db (db.json)
    try {
      const { getDb, saveDb } = await import("@/app/lib/server-db");
      const db = getDb();
      if (Array.isArray(db.users)) {
        db.users = db.users.filter(
          (u) =>
            u.role !== "administrador" &&
            String(u.id) !== String(id) &&
            (!name || u.name?.toLowerCase() !== name.toLowerCase())
        );
        saveDb(db);
      }
    } catch (dbErr) {
      console.warn("Aviso ao remover de db.json:", dbErr.message);
    }

    return NextResponse.json({
      success: true,
      removed: user ? user.name : name || String(id),
    });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);

    return NextResponse.json(
      { error: "Erro ao excluir usuário." },
      { status: 500 }
    );
  }
}
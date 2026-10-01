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
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório." },
        { status: 400 }
      );
    }

    const userResult = await pool.query(
      `
      SELECT id, name, role
      FROM users
      WHERE id = $1
      `,
      [id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

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
      [id]
    );

    return NextResponse.json({
      success: true,
      removed: user.name,
    });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);

    return NextResponse.json(
      { error: "Erro ao excluir usuário." },
      { status: 500 }
    );
  }
}
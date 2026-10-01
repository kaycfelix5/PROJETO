import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/app/lib/db";

export async function POST(request) {
  try {
    const data = await request.json();

    const {
      name,
      email,
      role,
      phone,
      birthDate,
      password,
    } = data;

    if (!name?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "Nome e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email?.trim().toLowerCase() || "";
    const cleanPhone = phone?.trim() || "";
    const cleanRole = role || "acompanhante";

    const existing = await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(name) = $1
         OR ($2 <> '' AND LOWER(email) = $2)
      LIMIT 1
      `,
      [
        cleanName.toLowerCase(),
        cleanEmail,
      ]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            "Já existe um usuário com esse nome ou e-mail cadastrado.",
        },
        { status: 409 }
      );
    }

    const senhaHash = await bcrypt.hash(
      password.trim(),
      10
    );

    const result = await pool.query(
      `
      INSERT INTO users
        (name, email, phone, birth_date, role, password)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        name,
        email,
        phone,
        birth_date,
        role,
        created_at
      `,
      [
        cleanName,
        cleanEmail || null,
        cleanPhone || null,
        birthDate || null,
        cleanRole,
        senhaHash,
      ]
    );

    const user = result.rows[0];

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          birthDate: user.birth_date,
          role: user.role,
          createdAt: user.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro no cadastro:", error);

    return NextResponse.json(
      {
        error: "Erro ao cadastrar usuário.",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

/* ================================================================ */
/* GET — LISTAR EMERGÊNCIAS                                        */
/* ================================================================ */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const portadorId = searchParams.get("portadorId");

    let result;

    if (portadorId) {
      result = await pool.query(
        `
        SELECT
          e.id,
          e.portador_id AS "portadorId",
          e.acionada_por AS "acionadaPor",
          e.latitude,
          e.longitude,
          e.status,
          e.criada_em AS "criadaEm",
          p.nome AS "portadorNome"
        FROM emergencias e
        INNER JOIN portadores p
          ON p.id = e.portador_id
        WHERE e.portador_id = $1
        ORDER BY e.criada_em DESC
        `,
        [portadorId]
      );
    } else {
      result = await pool.query(`
        SELECT
          e.id,
          e.portador_id AS "portadorId",
          e.acionada_por AS "acionadaPor",
          e.latitude,
          e.longitude,
          e.status,
          e.criada_em AS "criadaEm",
          p.nome AS "portadorNome"
        FROM emergencias e
        INNER JOIN portadores p
          ON p.id = e.portador_id
        ORDER BY e.criada_em DESC
      `);
    }

    return NextResponse.json({
      success: true,
      emergencias: result.rows,
    });
  } catch (error) {
    console.error("ERRO AO BUSCAR EMERGÊNCIAS:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível carregar as emergências.",
      },
      { status: 500 }
    );
  }
}

/* ================================================================ */
/* POST — REGISTRAR EMERGÊNCIA                                     */
/* ================================================================ */

export async function POST(request) {
  try {
    const body = await request.json();

    const portadorId = body.portadorId;
    const acionadaPor = body.acionadaPor || null;
    const latitude =
      body.latitude !== undefined &&
      body.latitude !== null &&
      body.latitude !== ""
        ? Number(body.latitude)
        : null;

    const longitude =
      body.longitude !== undefined &&
      body.longitude !== null &&
      body.longitude !== ""
        ? Number(body.longitude)
        : null;

    const status = String(body.status || "aberta").trim();

    if (!portadorId) {
      return NextResponse.json(
        {
          success: false,
          error: "O portador é obrigatório.",
        },
        { status: 400 }
      );
    }

    if (
      latitude !== null &&
      !Number.isFinite(latitude)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Latitude inválida.",
        },
        { status: 400 }
      );
    }

    if (
      longitude !== null &&
      !Number.isFinite(longitude)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Longitude inválida.",
        },
        { status: 400 }
      );
    }

    const portadorExiste = await pool.query(
      `
      SELECT id, nome
      FROM portadores
      WHERE id = $1
      LIMIT 1
      `,
      [portadorId]
    );

    if (portadorExiste.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Portador não encontrado.",
        },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `
      INSERT INTO emergencias (
        portador_id,
        acionada_por,
        latitude,
        longitude,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        portador_id AS "portadorId",
        acionada_por AS "acionadaPor",
        latitude,
        longitude,
        status,
        criada_em AS "criadaEm"
      `,
      [
        portadorId,
        acionadaPor,
        latitude,
        longitude,
        status,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        emergencia: {
          ...result.rows[0],
          portadorNome:
            portadorExiste.rows[0].nome,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ERRO AO REGISTRAR EMERGÊNCIA:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível registrar a emergência.",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

/* ================================================================ */
/* GET — ÚLTIMAS LOCALIZAÇÕES                                      */
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
          l.id,
          l.portador_id AS "portadorId",
          l.latitude,
          l.longitude,
          l.bateria,
          l.registrada_em AS "registradaEm"
        FROM localizacoes l
        WHERE l.portador_id = $1
        ORDER BY l.registrada_em DESC
        LIMIT 1
        `,
        [portadorId]
      );
    } else {
      result = await pool.query(`
        SELECT
          l.id,
          l.portador_id AS "portadorId",
          l.latitude,
          l.longitude,
          l.bateria,
          l.registrada_em AS "registradaEm"
        FROM localizacoes l
        ORDER BY l.registrada_em DESC
      `);
    }

    return NextResponse.json({
      success: true,
      localizacoes: result.rows,
    });
  } catch (error) {
    console.error("ERRO AO BUSCAR LOCALIZAÇÕES:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível buscar as localizações.",
      },
      { status: 500 }
    );
  }
}

/* ================================================================ */
/* POST — REGISTRAR LOCALIZAÇÃO                                    */
/* ================================================================ */

export async function POST(request) {
  try {
    const body = await request.json();

    const portadorId = body.portadorId;
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    const bateria =
      body.bateria !== undefined &&
      body.bateria !== null &&
      body.bateria !== ""
        ? Number(body.bateria)
        : null;

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
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
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
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Longitude inválida.",
        },
        { status: 400 }
      );
    }

    if (
      bateria !== null &&
      (!Number.isFinite(bateria) ||
        bateria < 0 ||
        bateria > 100)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Bateria inválida.",
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
      INSERT INTO localizacoes (
        portador_id,
        latitude,
        longitude,
        bateria
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        portador_id AS "portadorId",
        latitude,
        longitude,
        bateria,
        registrada_em AS "registradaEm"
      `,
      [
        portadorId,
        latitude,
        longitude,
        bateria,
      ]
    );

    /*
     * Também atualiza a bateria do portador,
     * quando ela foi enviada.
     */
    if (bateria !== null) {
      await pool.query(
        `
        UPDATE portadores
        SET bateria = $1
        WHERE id = $2
        `,
        [bateria, portadorId]
      );
    }

    return NextResponse.json(
      {
        success: true,
        localizacao: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ERRO AO REGISTRAR LOCALIZAÇÃO:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível registrar a localização.",
      },
      { status: 500 }
    );
  }
}
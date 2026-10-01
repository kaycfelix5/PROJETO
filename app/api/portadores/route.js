import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET() {
    try {
        const portadoresResult = await pool.query(`
      SELECT
        id,
        user_id,
        nome,
        idade,
        condicao,
        humor,
        humor_emoji,
        local,
        distancia_metros,
        pin_x,
        pin_y,
        geofence_max,
        bateria,
        criado_em
      FROM portadores
      ORDER BY id ASC
    `);

        const portadores = [];

        for (const portador of portadoresResult.rows) {
            const rotinasResult = await pool.query(
                `
        SELECT
          id,
          hora,
          titulo,
          concluida
        FROM rotinas
        WHERE portador_id = $1
        ORDER BY hora ASC, id ASC
        `,
                [portador.id]
            );

            const metasResult = await pool.query(
                `
        SELECT
          id,
          titulo,
          progresso
        FROM metas
        WHERE portador_id = $1
        ORDER BY id ASC
        `,
                [portador.id]
            );

            const mensagensResult = await pool.query(
                `
        SELECT
          id,
          texto,
          hora,
          criado_em
        FROM mensagens
        WHERE portador_id = $1
        ORDER BY criado_em ASC, id ASC
        `,
                [portador.id]
            );

            portadores.push({
                id: String(portador.id),
                userId: String(portador.user_id),
                nome: portador.nome,
                idade: portador.idade,
                condicao: portador.condicao,
                humor: portador.humor,
                humorEmoji: portador.humor_emoji,
                local: portador.local,
                distanciaMetros: Number(portador.distancia_metros) || 0,
                pinX: Number(portador.pin_x) || 50,
                pinY: Number(portador.pin_y) || 50,
                geofenceMax: Number(portador.geofence_max) || 150,
                bateria: Number(portador.bateria) || 100,

                rotinas: rotinasResult.rows.map((rotina) => ({
                    id: String(rotina.id),
                    hora: rotina.hora,
                    titulo: rotina.titulo,
                    concluida: rotina.concluida,
                })),

                metas: metasResult.rows.map((meta) => ({
                    id: String(meta.id),
                    titulo: meta.titulo,
                    progresso: Number(meta.progresso) || 0,
                })),

                mensagens: mensagensResult.rows.map((mensagem) => ({
                    id: String(mensagem.id),
                    texto: mensagem.texto,
                    hora: mensagem.hora,
                    criadoEm: mensagem.criado_em,
                })),
            });
        }

        return NextResponse.json({
            success: true,
            portadores,
        });
    } catch (error) {
        console.error("Erro ao buscar portadores:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Erro ao buscar portadores.",
            },
            { status: 500 }
        );
    }
}
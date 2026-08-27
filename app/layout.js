import "./globals.css";

export const metadata = {
  title: "Autismo & Realidade | Monitoramento, Inclusão e Cuidado",
  description: "Plataforma acessível de apoio e acompanhamento de pessoas no espectro autista (TEA) e neurodivergências, inspirada na difusão de conhecimento do Instituto Autismo e Realidade.",
  keywords: ["autismo", "TEA", "autismo e realidade", "monitoramento", "rotina visual", "inclusão", "acompanhante", "portador", "cerca virtual"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}

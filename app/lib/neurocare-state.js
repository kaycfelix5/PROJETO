// Centralized State Engine & Web Audio Utilities for Autismo & Realidade Care

// Default seed data
const DEFAULT_USERS_DB = [
  {
    name: "Patrícia Mendes",
    birthDate: "1988-04-12",
    role: "acompanhante",
    email: "patricia.mendes@email.com",
    phone: "(11) 98765-4321",
    password: "123",
  },
  {
    name: "Lucas Silveira",
    birthDate: "2015-05-10",
    role: "portador",
    email: "lucas.silveira@email.com",
    phone: "(11) 97777-1111",
    password: "123",
    caregiverName: "Patrícia Mendes",
    caregiverPhone: "(11) 98765-4321",
  },
  {
    name: "Sofia Mendes",
    birthDate: "2012-08-20",
    role: "portador",
    email: "sofia.mendes@email.com",
    phone: "(11) 96666-2222",
    password: "123",
    caregiverName: "Patrícia Mendes",
    caregiverPhone: "(11) 98765-4321",
  },
  {
    name: "Administrador Geral",
    birthDate: "1980-01-01",
    role: "administrador",
    email: "admin@autismoerealidade.org.br",
    phone: "(11) 99999-0000",
    password: "admin",
  },
];

const DEFAULT_PORTADORES = [
  {
    id: 101,
    nome: "Lucas Silveira",
    idade: "9 anos",
    condicao: "TEA Nível 1 • TDAH",
    status: "Estável / Regulação Ótima",
    bateria: 88,
    humor: "Calmo e Focado",
    humorEmoji: "😌",
    local: "Escola Municipal / Sala AEE",
    distanciaMetros: 120,
    pinX: 60,
    pinY: 38,
    geofenceMax: 150,
    rotinas: [
      { id: 1, hora: "08:00", titulo: "🥪 Café da manhã com apoio visual", concluida: true },
      { id: 2, hora: "10:00", titulo: "📚 Aula / Atividade pedagógica no AEE", concluida: true },
      { id: 3, hora: "14:00", titulo: "🗣️ Sessão de Fonoaudiologia", concluida: false },
      { id: 4, hora: "16:30", titulo: "🎧 Pausa Sensorial com fones e lanche", concluida: false },
      { id: 5, hora: "19:00", titulo: "🌙 Desaceleração e Higiene do Sono", concluida: false },
    ],
    metas: [
      { id: 1, titulo: "💧 Ingestão de Água (Meta: 1.5L)", progresso: 75 },
      { id: 2, titulo: "🧘 Momentos de Autorregulação Concluídos", progresso: 100 },
      { id: 3, titulo: "📚 Tarefas Escolares sem Crise de Frustração", progresso: 60 },
    ],
    historicoLogs: [
      { id: 1, hora: "Hoje às 08:30", tipo: "Rotina Matinal", detalhes: "Acordou bem-disposto e tomou café sem resistência sensorial.", status: "Excelente" },
      { id: 2, hora: "Ontem às 15:40", tipo: "Pausa Sensorial", detalhes: "Solicitou fones abafadores após ruído na sala. Autorregulação em 10 min.", status: "Sucesso" },
    ],
    mensagensRecentes: [],
  },
  {
    id: 102,
    nome: "Sofia Mendes",
    idade: "12 anos",
    condicao: "TEA Nível 2 • Sensibilidade Sonora",
    status: "Em Pausa Sensorial",
    bateria: 94,
    humor: "Usando Fones Abafadores",
    humorEmoji: "🎧",
    local: "Casa / Quarto de Conforto",
    distanciaMetros: 45,
    pinX: 45,
    pinY: 55,
    geofenceMax: 100,
    rotinas: [
      { id: 1, hora: "09:00", titulo: "🎨 Pintura e estimulação motora fina", concluida: true },
      { id: 2, hora: "11:30", titulo: "🥗 Almoço balanceado", concluida: true },
      { id: 3, hora: "15:00", titulo: "🧩 Quebra-cabeças e raciocínio lógico", concluida: false },
    ],
    metas: [
      { id: 1, titulo: "🎧 Uso de Abafador em Ambientes Externos", progresso: 90 },
      { id: 2, titulo: "🥦 Aceitação de 2 Novas Texturas Alimentares", progresso: 50 },
    ],
    historicoLogs: [
      { id: 1, hora: "Hoje às 09:15", tipo: "Terapia Ocupacional", detalhes: "Concluiu pintura em aquarela com foco elevado.", status: "Ótimo" },
    ],
    mensagensRecentes: [],
  },
];

const DEFAULT_DISPONIVEIS = [
  {
    id: 103,
    nome: "Gabriel Ramos",
    idade: "7 anos",
    condicao: "TEA Nível 1 • Hiperfoco em Robótica",
    cidade: "São Paulo, SP",
  },
  {
    id: 104,
    nome: "Beatriz Lima",
    idade: "15 anos",
    condicao: "Neurodivergente • TDAH e Dislexia",
    cidade: "Campinas, SP",
  },
];

// Helper to broadcast state changes across components
export const broadcastSync = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("neurocare_state_updated"));
  }
};

// Storage Getters and Setters
export const getStoredUsers = () => {
  if (typeof window === "undefined") return DEFAULT_USERS_DB;
  const saved = localStorage.getItem("hearttech_users_db");
  if (!saved) {
    localStorage.setItem("hearttech_users_db", JSON.stringify(DEFAULT_USERS_DB));
    return DEFAULT_USERS_DB;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_USERS_DB;
  }
};

export const getStoredPortadores = () => {
  if (typeof window === "undefined") return DEFAULT_PORTADORES;
  const saved = localStorage.getItem("hearttech_portadores_db");
  if (!saved) {
    localStorage.setItem("hearttech_portadores_db", JSON.stringify(DEFAULT_PORTADORES));
    return DEFAULT_PORTADORES;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_PORTADORES;
  }
};

export const saveStoredPortadores = (portadores) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("hearttech_portadores_db", JSON.stringify(portadores));
    broadcastSync();
  }
};

export const getStoredDisponiveis = () => {
  if (typeof window === "undefined") return DEFAULT_DISPONIVEIS;
  const saved = localStorage.getItem("hearttech_disponiveis_db");
  if (!saved) {
    localStorage.setItem("hearttech_disponiveis_db", JSON.stringify(DEFAULT_DISPONIVEIS));
    return DEFAULT_DISPONIVEIS;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_DISPONIVEIS;
  }
};

export const saveStoredDisponiveis = (disponiveis) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("hearttech_disponiveis_db", JSON.stringify(disponiveis));
    broadcastSync();
  }
};

// Real Web Audio API Synthesizer (Sensory Friendly Chimes & Alerts)
export const playSoundEffect = (type = "chime") => {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "chime") {
      // Gentle soothing bell (440Hz -> 880Hz harmonic)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3); // E5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } else if (type === "success") {
      // Happy chord progression
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.5);
      });
    } else if (type === "alert") {
      // Gentle warning chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(330, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === "emergency") {
      // Soft pulsing alert
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.25);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.75);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.75);
    }
  } catch (err) {
    console.warn("Web Audio not supported or blocked by user interaction:", err);
  }
};

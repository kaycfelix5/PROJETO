"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../dashboard/dashboard.module.css";

/* ================================================================ */
/* HELPERS DE PERSISTÊNCIA (localStorage)                           */
/* ================================================================ */
const LS = {
  get: (k, fallback) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const PORTADORES_SEED = [
  {
    id: 101, nome: "Lucas Silveira", idade: "9 anos",
    condicao: "TEA Nível 1 • TDAH",
    humor: "Calmo", humorEmoji: "😌",
    local: "Escola Municipal / Sala AEE",
    distanciaMetros: 120, pinX: 60, pinY: 38,
    geofenceMax: 150, bateria: 88,
    rotinas: [
      { id: 1, hora: "08:00", titulo: "🥪 Café da manhã com apoio visual", concluida: true },
      { id: 2, hora: "10:00", titulo: "📚 Atividade pedagógica no AEE",    concluida: true },
      { id: 3, hora: "14:00", titulo: "🗣️ Sessão de Fonoaudiologia",        concluida: false },
      { id: 4, hora: "16:30", titulo: "🎧 Pausa Sensorial com fones",       concluida: false },
      { id: 5, hora: "19:00", titulo: "🌙 Higiene do Sono",                 concluida: false },
    ],
    metas: [
      { id: 1, titulo: "💧 Ingestão de Água (1.5L)", progresso: 75 },
      { id: 2, titulo: "🧘 Momentos de Autorregulação", progresso: 100 },
      { id: 3, titulo: "📚 Tarefas sem Crise de Frustração", progresso: 60 },
    ],
    mensagens: [],
  },
  {
    id: 102, nome: "Sofia Mendes", idade: "12 anos",
    condicao: "TEA Nível 2 • Sensibilidade Sonora",
    humor: "Pausa Sensorial", humorEmoji: "🎧",
    local: "Casa / Quarto de Conforto",
    distanciaMetros: 45, pinX: 45, pinY: 55,
    geofenceMax: 100, bateria: 94,
    rotinas: [
      { id: 1, hora: "09:00", titulo: "🎨 Pintura e Estimulação Motora", concluida: true },
      { id: 2, hora: "11:30", titulo: "🥗 Almoço Balanceado",            concluida: true },
      { id: 3, hora: "15:00", titulo: "🧩 Quebra-cabeças / Raciocínio",  concluida: false },
    ],
    metas: [
      { id: 1, titulo: "🎧 Abafador em Ambientes Externos", progresso: 90 },
      { id: 2, titulo: "🥦 2 Novas Texturas Alimentares",   progresso: 50 },
    ],
    mensagens: [],
  },
];

const DISPONIVEIS_SEED = [
  { id: 103, nome: "Gabriel Ramos",  idade: "7 anos",  condicao: "TEA Nível 1 • Hiperfoco em Robótica", cidade: "São Paulo, SP" },
  { id: 104, nome: "Beatriz Lima",   idade: "15 anos", condicao: "TDAH e Dislexia",                      cidade: "Campinas, SP"  },
];

/* ================================================================ */
/* COMPONENTE TOAST                                                 */
/* ================================================================ */
function Toast({ toasts, dismiss }) {
  return (
    <div className={styles.toastContainer}>
      {toasts.map((t) => (
        <div key={t.id} className={styles.toastItem} style={{ borderLeftColor: t.color || "var(--ar-blue)" }}>
          <span className={styles.toastIcon}>{t.icon}</span>
          <div className={styles.toastBody}>
            <div className={styles.toastTitle}>{t.title}</div>
            {t.desc && <div className={styles.toastDesc}>{t.desc}</div>}
          </div>
          <button className={styles.toastClose} onClick={() => dismiss(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

/* ================================================================ */
/* COMPONENTE ANIMAÇÃO DE RESPIRAÇÃO                                */
/* ================================================================ */
function BreathingExercise({ onClose }) {
  const [phase, setPhase] = useState("inhale"); // inhale | hold | exhale
  const [sec, setSec]     = useState(4);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (cycles >= 4) return; // 4 ciclos
    const tick = setInterval(() => {
      setSec((s) => {
        if (s <= 1) {
          setPhase((p) => {
            if (p === "inhale") { setSec(4); return "hold"; }
            if (p === "hold")   { setSec(6); return "exhale"; }
            setCycles((c) => c + 1);
            setSec(4); return "inhale";
          });
          return s;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [cycles]);

  const labels = { inhale: "Inspire... 🌬️", hold: "Segure...", exhale: "Solte o ar... 💨" };
  const colors = { inhale: "#2bb673", hold: "#f39200", exhale: "#0066c0" };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard} style={{ textAlign: "center", maxWidth: 460 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#004c97", marginBottom: 6 }}>
          🌿 Pausa Sensorial
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: 20 }}>
          Respire no ritmo do círculo. {cycles >= 4 ? "Exercício concluído! 🎉" : `Ciclo ${cycles + 1} de 4`}
        </p>

        <div className={styles.breathingVisualContainer}>
          <div
            className={`${styles.breathingCircle} ${styles[phase]}`}
            style={{ background: `radial-gradient(circle, ${colors[phase]}aa, ${colors[phase]})` }}
          >
            <span className={styles.breathingTimerSec}>{sec}</span>
            <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>seg</span>
          </div>
          <div className={styles.breathingInstruction}>{labels[phase]}</div>
        </div>

        {cycles >= 4 && (
          <p style={{ color: "#16a34a", fontWeight: 700, marginBottom: 14 }}>
            Você completou todos os ciclos! Ótimo trabalho. 🌟
          </p>
        )}

        <button onClick={onClose} className="btn-primary" style={{ width: "100%", marginTop: 12 }}>
          {cycles >= 4 ? "✓ Pronto, me sinto melhor" : "Fechar (continuar depois)"}
        </button>
      </div>
    </div>
  );
}

/* ================================================================ */
/* COMPONENTE PAINEL DO ADMINISTRADOR                               */
/* ================================================================ */
function AdminPanel({ addToast, portadoresGlobais = [], savePortadores }) {
  const [adminTab, setAdminTab] = useState("overview");
  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    role: "acompanhante",
    phone: "",
    password: "",
    birthDate: ""
  });

  const [showAddPortadorModal, setShowAddPortadorModal] = useState(false);
  const [newPortadorData, setNewPortadorData] = useState({
    nome: "",
    idade: "",
    condicao: "",
    local: "Casa",
    geofenceMax: 150
  });

  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastType, setBroadcastType] = useState("info");

  const [logs, setLogs] = useState([
    { id: 1, time: "14:02:15", type: "AUTH", user: "Admin", action: "Sessão administrativa iniciada com sucesso", level: "info" },
    { id: 2, time: "13:45:10", type: "GPS", user: "Lucas Silveira", action: "Atualização de telemetria GPS - Raio 120m (Seguro)", level: "success" },
    { id: 3, time: "12:30:22", type: "ROTINA", user: "Sofia Mendes", action: "Meta diária 'Uso de Abafador' atualizada para 90%", level: "info" },
    { id: 4, time: "11:15:04", type: "SYNC", user: "Patrícia Mendes", action: "Sincronização de rotinas com dispositivo IoT", level: "info" },
    { id: 5, time: "09:00:18", type: "SISTEMA", user: "Sistema", action: "Backup diário das bases de dados concluído (0 falhas)", level: "success" },
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nc_users");
      if (raw) {
        setUsersList(JSON.parse(raw));
      } else {
        const seed = [
          { name: "Patrícia Mendes", birthDate: "1988-04-12", role: "acompanhante", email: "patricia@email.com", phone: "(11) 98765-4321", password: "123" },
          { name: "Lucas Silveira",  birthDate: "2015-05-10", role: "portador",     email: "lucas@email.com",   phone: "(11) 97777-1111", password: "123" },
          { name: "Sofia Mendes",    birthDate: "2012-08-20", role: "portador",     email: "sofia@email.com",   phone: "(11) 96666-2222", password: "123" },
          { name: "Admin",           birthDate: "1980-01-01", role: "administrador",email: "admin@email.com",   phone: "(11) 00000-0000", password: "admin" },
        ];
        setUsersList(seed);
        localStorage.setItem("nc_users", JSON.stringify(seed));
      }
    } catch {
      // fallback
    }
  }, []);

  const saveUsers = (updated) => {
    setUsersList(updated);
    try {
      localStorage.setItem("nc_users", JSON.stringify(updated));
    } catch {}
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserData.name.trim() || !newUserData.password.trim()) {
      addToast("⚠️", "Campos obrigatórios", "Preencha nome e senha.", "#f59e0b");
      return;
    }
    const updated = [...usersList, { ...newUserData, id: Date.now() }];
    saveUsers(updated);
    setNewUserData({ name: "", email: "", role: "acompanhante", phone: "", password: "", birthDate: "" });
    setShowAddUserModal(false);
    addToast("✅", "Usuário cadastrado!", `${newUserData.name} adicionado com sucesso.`, "#16a34a");
    setLogs((prev) => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), type: "USER_CREATE", user: "Admin", action: `Usuário '${newUserData.name}' cadastrado (${newUserData.role})`, level: "success" },
      ...prev
    ]);
  };

  const handleDeleteUser = (userToDelete) => {
    if (userToDelete.name.toLowerCase() === "admin") {
      addToast("❌", "Ação não permitida", "Não é possível excluir o Administrador principal.", "#ef4444");
      return;
    }
    const updated = usersList.filter((u) => u.name !== userToDelete.name);
    saveUsers(updated);
    addToast("🗑️", "Usuário removido", `${userToDelete.name} foi removido do sistema.`, "#e11d48");
    setLogs((prev) => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), type: "USER_DELETE", user: "Admin", action: `Usuário '${userToDelete.name}' excluído`, level: "warning" },
      ...prev
    ]);
  };

  const handleCreatePortador = (e) => {
    e.preventDefault();
    if (!newPortadorData.nome.trim()) {
      addToast("⚠️", "Nome obrigatório", "Preencha o nome do assistido.", "#f59e0b");
      return;
    }
    const novo = {
      id: Date.now(),
      nome: newPortadorData.nome,
      idade: newPortadorData.idade || "N/I",
      condicao: newPortadorData.condicao || "TEA",
      humor: "Calmo",
      humorEmoji: "😌",
      local: newPortadorData.local || "Casa",
      distanciaMetros: 50,
      pinX: 50,
      pinY: 50,
      geofenceMax: Number(newPortadorData.geofenceMax) || 150,
      bateria: 100,
      rotinas: [],
      metas: [],
      mensagens: []
    };
    const updated = [...(portadoresGlobais || []), novo];
    savePortadores(updated);
    setNewPortadorData({ nome: "", idade: "", condicao: "", local: "Casa", geofenceMax: 150 });
    setShowAddPortadorModal(false);
    addToast("✨", "Portador registrado!", `${novo.nome} adicionado ao ecossistema.`, "#16a34a");
    setLogs((prev) => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), type: "PORTADOR_ADD", user: "Admin", action: `Portador '${novo.nome}' registrado no ecossistema`, level: "success" },
      ...prev
    ]);
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    addToast("📢", "Comunicado Transmitido!", broadcastMsg, broadcastType === "alert" ? "#ef4444" : "#0066c0");
    setLogs((prev) => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), type: "BROADCAST", user: "Admin", action: `Alerta global emitido: "${broadcastMsg}"`, level: "warning" },
      ...prev
    ]);
    setBroadcastMsg("");
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const countAcomp = usersList.filter((u) => u.role === "acompanhante").length;
  const countPortadores = usersList.filter((u) => u.role === "portador").length;
  const countAdmins = usersList.filter((u) => u.role === "administrador").length;

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* HEADER DO PAINEL */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#004c97", marginBottom: 4 }}>
            🛡️ Painel de Controle Administrativo
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Supervisão geral, governança de usuários, telemetria GPS e gestão de portadores.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => setShowAddUserModal(true)}
            className="btn-primary"
            style={{ padding: "10px 18px", fontSize: "0.88rem" }}
          >
            ➕ Novo Usuário
          </button>
          <button
            type="button"
            onClick={() => setShowAddPortadorModal(true)}
            className="btn-secondary"
            style={{ padding: "10px 18px", fontSize: "0.88rem" }}
          >
            🧩 Novo Portador
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className={styles.adminStatsGrid}>
        <div className={styles.adminStatCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ fontSize: "1.8rem" }}>👥</span>
            <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 8px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 800 }}>Total</span>
          </div>
          <div className={styles.adminStatVal}>{usersList.length}</div>
          <div className={styles.adminStatLbl}>Usuários Cadastrados</div>
          <div style={{ marginTop: 8, fontSize: "0.78rem", color: "#64748b" }}>
            {countAcomp} Acompanhantes • {countPortadores} Portadores • {countAdmins} Admin
          </div>
        </div>

        <div className={styles.adminStatCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ fontSize: "1.8rem" }}>💙</span>
            <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 8px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 800 }}>Ativos</span>
          </div>
          <div className={styles.adminStatVal} style={{ color: "#16a34a" }}>{portadoresGlobais.length}</div>
          <div className={styles.adminStatLbl}>Portadores em Acompanhamento</div>
          <div style={{ marginTop: 8, fontSize: "0.78rem", color: "#64748b" }}>
            100% com dados e rotinas mapeadas
          </div>
        </div>

        <div className={styles.adminStatCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ fontSize: "1.8rem" }}>🛰️</span>
            <span style={{ background: "#fef3c7", color: "#b45309", padding: "4px 8px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 800 }}>Operacional</span>
          </div>
          <div className={styles.adminStatVal} style={{ color: "#f39200" }}>99.9%</div>
          <div className={styles.adminStatLbl}>Uptime Telemetria & GPS</div>
          <div style={{ marginTop: 8, fontSize: "0.78rem", color: "#64748b" }}>
            Serviço de geolocalização e alertas online
          </div>
        </div>
      </div>

      {/* SUB-ABAS DO PAINEL */}
      <div style={{ display: "flex", gap: 10, borderBottom: "2px solid #e2e8f0", paddingBottom: 12, marginBottom: 24, overflowX: "auto" }}>
        {[
          { id: "overview", label: "📊 Visão Geral", count: null },
          { id: "users", label: "👥 Gestão de Usuários", count: usersList.length },
          { id: "portadores", label: "🧩 Assistidos / Portadores", count: portadoresGlobais.length },
          { id: "logs", label: "📋 Logs de Auditoria", count: logs.length },
          { id: "broadcast", label: "📢 Transmissão de Alertas", count: null },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setAdminTab(t.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 9999,
              border: "none",
              background: adminTab === t.id ? "#0066c0" : "#f1f5f9",
              color: adminTab === t.id ? "#ffffff" : "#475569",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap"
            }}
          >
            <span>{t.label}</span>
            {t.count !== null && (
              <span style={{
                background: adminTab === t.id ? "rgba(255,255,255,0.25)" : "#cbd5e1",
                padding: "2px 7px",
                borderRadius: 9999,
                fontSize: "0.72rem"
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* VIEW: OVERVIEW */}
      {adminTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          <div style={{ background: "white", padding: 24, borderRadius: 16, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#004c97", marginBottom: 14 }}>
              📡 Status da Infraestrutura
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>Banco de Dados Local (IndexedDB/LS)</span>
                <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.82rem" }}>● Ativo</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>Serviço de Geofencing & Cercas Virtuais</span>
                <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.82rem" }}>● Ativo</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>Módulo de Áudio Sensorial (Web Audio API)</span>
                <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.82rem" }}>● Ativo</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>Linha Direta de Emergência (190 / 192 / 193)</span>
                <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.82rem" }}>● Pronto</span>
              </div>
            </div>
          </div>

          <div style={{ background: "white", padding: 24, borderRadius: 16, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#004c97", marginBottom: 14 }}>
              ⚡ Ações Rápidas de Manutenção
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  addToast("🔄", "Sincronização executada", "Todos os nós de dados foram sincronizados.", "#16a34a");
                }}
                className="btn-secondary"
                style={{ justifyContent: "flex-start", padding: "12px 16px" }}
              >
                🔄 Forçar Sincronização Geral de Dados
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Deseja restaurar as bases padrão do sistema?")) {
                    localStorage.removeItem("nc_users");
                    localStorage.removeItem("nc_portadores");
                    localStorage.removeItem("nc_disponiveis");
                    addToast("🧹", "Dados Restaurados", "Recarregando página com as sementes padrão...", "#0066c0");
                    setTimeout(() => window.location.reload(), 1000);
                  }
                }}
                className="btn-secondary"
                style={{ justifyContent: "flex-start", padding: "12px 16px", color: "#dc2626", borderColor: "#fecdd3" }}
              >
                🧹 Restaurar Configurações Originais (Reset)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: USUÁRIOS */}
      {adminTab === "users" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", justifyContent: "space-between" }}>
            <input
              type="text"
              placeholder="🔍 Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: "1 1 260px",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1.5px solid #cbd5e1",
                fontSize: "0.9rem"
              }}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "1.5px solid #cbd5e1",
                fontSize: "0.9rem",
                fontWeight: 600,
                background: "white"
              }}
            >
              <option value="all">Todos os Papéis ({usersList.length})</option>
              <option value="acompanhante">Acompanhantes ({countAcomp})</option>
              <option value="portador">Portadores ({countPortadores})</option>
              <option value="administrador">Administradores ({countAdmins})</option>
            </select>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Papel</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th style={{ textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u, i) => (
                    <tr key={i}>
                      <td>
                        <strong>{u.name}</strong>
                        {u.birthDate && <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Nasc: {u.birthDate}</div>}
                      </td>
                      <td>
                        <span className={
                          u.role === "administrador"
                            ? styles.badgeAdmin
                            : u.role === "acompanhante"
                            ? styles.badgeAcompanhante
                            : styles.badgePortador
                        } style={{ textTransform: "capitalize", fontSize: "0.78rem" }}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.email || "—"}</td>
                      <td>{u.phone || "—"}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "1.1rem",
                            padding: "4px 8px"
                          }}
                          title="Remover Usuário"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
                      Nenhum usuário encontrado com os filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: PORTADORES */}
      {adminTab === "portadores" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
          {portadoresGlobais.map((p) => (
            <div key={p.id} style={{ background: "white", padding: 20, borderRadius: 16, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.8rem" }}>{p.humorEmoji || "🙂"}</span>
                  <div>
                    <strong style={{ fontSize: "1.05rem", color: "#004c97" }}>{p.nome}</strong>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{p.idade} • {p.condicao}</div>
                  </div>
                </div>
                <span style={{ background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: 9999, fontSize: "0.72rem", fontWeight: 700 }}>
                  🔋 {p.bateria}%
                </span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "#475569", background: "#f8fafc", padding: "10px 12px", borderRadius: 8 }}>
                <div>📍 <strong>Local Atual:</strong> {p.local || "Não informado"}</div>
                <div>🛡️ <strong>Cerca Geofence:</strong> até {p.geofenceMax || 150}m</div>
                <div>📋 <strong>Rotinas Ativas:</strong> {p.rotinas?.length || 0} cadastradas</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: LOGS DE AUDITORIA */}
      {adminTab === "logs" && (
        <div style={{ background: "white", padding: 24, borderRadius: 16, border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#004c97", marginBottom: 16 }}>
            📋 Registros de Auditoria e Telemetria em Tempo Real
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {logs.map((l) => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: `4px solid ${l.level === "success" ? "#16a34a" : l.level === "warning" ? "#f59e0b" : "#0066c0"}` }}>
                <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#64748b", minWidth: 65 }}>{l.time}</span>
                <span style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: 4, fontSize: "0.72rem", fontWeight: 800 }}>{l.type}</span>
                <span style={{ fontSize: "0.85rem", color: "#1e293b", flex: 1 }}>{l.action}</span>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{l.user}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: BROADCAST */}
      {adminTab === "broadcast" && (
        <div style={{ background: "white", padding: 28, borderRadius: 16, border: "1px solid #e2e8f0", maxWidth: 640 }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#004c97", marginBottom: 6 }}>
            📢 Transmissão de Comunicado Global
          </h3>
          <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: 20 }}>
            Envie uma notificação instantânea para a tela de todos os acompanhantes e portadores ativos na plataforma.
          </p>
          <form onSubmit={handleSendBroadcast} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                Tipo de Alerta
              </label>
              <select
                value={broadcastType}
                onChange={(e) => setBroadcastType(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #cbd5e1", fontSize: "0.9rem" }}
              >
                <option value="info">ℹ️ Informativo / Comunicado Padrão</option>
                <option value="alert">⚠️ Alerta Geral / Manutenção</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                Mensagem
              </label>
              <textarea
                rows={4}
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Digite a mensagem a ser transmitida..."
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid #cbd5e1", fontSize: "0.9rem", resize: "vertical" }}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: "12px", fontSize: "0.95rem" }}>
              🚀 Transmitir para Todos os Usuários
            </button>
          </form>
        </div>
      )}

      {/* MODAL: NOVO USUÁRIO */}
      {showAddUserModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddUserModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className={styles.modalHeader}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#004c97" }}>➕ Cadastrar Novo Usuário</h3>
              <button className={styles.closeModalBtn} onClick={() => setShowAddUserModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Papel no Sistema</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: "0.9rem" }}
                >
                  <option value="acompanhante">Acompanhante / Cuidador</option>
                  <option value="portador">Portador / Assistido</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>E-mail</label>
                  <input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Telefone</label>
                  <input
                    type="text"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Senha de Acesso *</label>
                <input
                  type="password"
                  required
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowAddUserModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO PORTADOR */}
      {showAddPortadorModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddPortadorModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className={styles.modalHeader}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#004c97" }}>🧩 Registrar Portador no Sistema</h3>
              <button className={styles.closeModalBtn} onClick={() => setShowAddPortadorModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreatePortador} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Nome do Assistido *</label>
                <input
                  type="text"
                  required
                  value={newPortadorData.nome}
                  onChange={(e) => setNewPortadorData({ ...newPortadorData, nome: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Idade</label>
                  <input
                    type="text"
                    placeholder="Ex: 8 anos"
                    value={newPortadorData.idade}
                    onChange={(e) => setNewPortadorData({ ...newPortadorData, idade: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Cerca Geofence (m)</label>
                  <input
                    type="number"
                    value={newPortadorData.geofenceMax}
                    onChange={(e) => setNewPortadorData({ ...newPortadorData, geofenceMax: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Condição / Necessidade Específica</label>
                <input
                  type="text"
                  placeholder="Ex: TEA Nível 1 • Hipersensibilidade Auditiva"
                  value={newPortadorData.condicao}
                  onChange={(e) => setNewPortadorData({ ...newPortadorData, condicao: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowAddPortadorModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Registrar Portador</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/* PÁGINA PRINCIPAL                                                 */
/* ================================================================ */
export default function LandingPage() {
  const router  = useRouter();
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [toasts, setToasts]     = useState([]);

  /* ----- ACOMPANHANTE ----- */
  const [acompTab, setAcompTab] = useState("portadores");
  const [portadores, setPortadores]         = useState([]);
  const [disponiveis, setDisponiveis]       = useState([]);
  const [selectedPortadorId, setSelectedPortadorId] = useState(null);
  const [showAttachModal, setShowAttachModal]         = useState(false);
  const [showUnbindModal, setShowUnbindModal]         = useState(false);
  const [portadorParaDesvincular, setPortadorParaDesvincular] = useState(null);
  const [novaHora, setNovaHora] = useState("12:00");
  const [novaTarefa, setNovaTarefa] = useState("");
  const [distMax, setDistMax]   = useState(150);
  const [simDist, setSimDist]   = useState(120);
  const [emergencyAuth, setEmergencyAuth] = useState(null);
  const [emergencyModal, setEmergencyModal] = useState(false);

  /* ----- PORTADOR ----- */
  const [portadorTab, setPortadorTab] = useState("rotinas");
  const [minhaRotina, setMinhaRotina]   = useState([]);
  const [minhasMetas, setMinhasMetas]   = useState([]);
  const [meuHumor, setMeuHumor]         = useState(null);
  const [humoresFeedback, setHumoresFeedback] = useState("");
  const [pauseModal, setPauseModal]     = useState(false);
  const [callCareModal, setCallCareModal] = useState(false);
  const [mensagemEnviada, setMensagemEnviada] = useState(null);

  /* ================================================================ */
  /* TOAST HELPER                                                     */
  /* ================================================================ */
  const addToast = useCallback((icon, title, desc = "", color = "var(--ar-blue)") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, icon, title, desc, color }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  /* ================================================================ */
  /* INIT: autenticação + carregar dados                              */
  /* ================================================================ */
  useEffect(() => {
    const auth = localStorage.getItem("nc_auth");
    const raw  = localStorage.getItem("nc_user");
    if (auth !== "true" || !raw) { router.replace("/auth"); return; }

    try {
      const u = JSON.parse(raw);
      setUser(u);

      // Carrega portadores persistidos
      const savedP = LS.get("nc_portadores", PORTADORES_SEED);
      setPortadores(savedP);
      if (savedP.length > 0) setSelectedPortadorId(savedP[0].id);

      const savedD = LS.get("nc_disponiveis", DISPONIVEIS_SEED);
      setDisponiveis(savedD);

      // Se é portador, carrega dados dela
      if (u.role === "portador") {
        const myP = savedP.find((p) => p.nome === u.name) || savedP[0];
        if (myP) {
          setMinhaRotina(myP.rotinas || []);
          setMinhasMetas(myP.metas || []);
          setDistMax(myP.geofenceMax || 150);
          setSimDist(myP.distanciaMetros || 80);
        }
      }
    } catch { router.replace("/auth"); }
    setLoading(false);
  }, [router]);

  const selectedPortador = portadores.find((p) => p.id === selectedPortadorId) || portadores[0] || null;

  /* ================================================================ */
  /* PERSISTÊNCIA - salva portadores ao mudar                         */
  /* ================================================================ */
  const savePortadores = (newList) => {
    setPortadores(newList);
    LS.set("nc_portadores", newList);
  };
  const saveDisponiveis = (newList) => {
    setDisponiveis(newList);
    LS.set("nc_disponiveis", newList);
  };

  /* ================================================================ */
  /* LOGOUT                                                           */
  /* ================================================================ */
  const handleLogout = () => {
    localStorage.removeItem("nc_auth");
    localStorage.removeItem("nc_user");
    router.push("/");
  };

  /* ================================================================ */
  /* ACOMPANHANTE — VINCULAR / DESVINCULAR                           */
  /* ================================================================ */
  const handleVincular = (cand) => {
    const novo = {
      id: cand.id, nome: cand.nome, idade: cand.idade, condicao: cand.condicao,
      humor: "Aguardando", humorEmoji: "🙂",
      local: "A definir", distanciaMetros: 80, pinX: 52, pinY: 48,
      geofenceMax: 150, bateria: 90,
      rotinas: [], metas: [], mensagens: [],
    };
    const newPortadores = [...portadores, novo];
    savePortadores(newPortadores);
    saveDisponiveis(disponiveis.filter((d) => d.id !== cand.id));
    setSelectedPortadorId(cand.id);
    setShowAttachModal(false);
    addToast("✅", "Portador vinculado!", `${cand.nome} foi adicionado à sua lista.`, "#16a34a");
  };

  const handleConfirmarDesvinculo = () => {
    if (!portadorParaDesvincular) return;
    const restantes = portadores.filter((p) => p.id !== portadorParaDesvincular.id);
    savePortadores(restantes);
    saveDisponiveis([...disponiveis, {
      id: portadorParaDesvincular.id, nome: portadorParaDesvincular.nome,
      idade: portadorParaDesvincular.idade, condicao: portadorParaDesvincular.condicao, cidade: "Em aberto",
    }]);
    if (selectedPortadorId === portadorParaDesvincular.id) {
      setSelectedPortadorId(restantes[0]?.id || null);
    }
    setShowUnbindModal(false);
    addToast("🚫", "Portador desvinculado", `${portadorParaDesvincular.nome} foi removido da sua lista.`, "#e11d48");
    setPortadorParaDesvincular(null);
  };

  /* ================================================================ */
  /* ACOMPANHANTE — ROTINAS                                          */
  /* ================================================================ */
  const handleAddRotina = (e) => {
    e.preventDefault();
    if (!novaTarefa.trim() || !selectedPortador) return;
    const nova = { id: Date.now(), hora: novaHora, titulo: novaTarefa, concluida: false };
    const updated = portadores.map((p) =>
      p.id === selectedPortador.id ? { ...p, rotinas: [...(p.rotinas || []), nova] } : p
    );
    savePortadores(updated);
    setNovaTarefa("");
    addToast("📅", "Tarefa adicionada!", `"${novaTarefa}" foi adicionada à rotina de ${selectedPortador.nome}.`);
  };

  const handleRemoveRotina = (rotinaId) => {
    const updated = portadores.map((p) =>
      p.id === selectedPortador.id
        ? { ...p, rotinas: (p.rotinas || []).filter((r) => r.id !== rotinaId) }
        : p
    );
    savePortadores(updated);
  };

  /* ================================================================ */
  /* ACOMPANHANTE — METAS                                            */
  /* ================================================================ */
  const handleGoalChange = (metaId, delta) => {
    const updated = portadores.map((p) =>
      p.id === selectedPortador.id
        ? {
            ...p,
            metas: (p.metas || []).map((m) =>
              m.id === metaId ? { ...m, progresso: Math.max(0, Math.min(100, m.progresso + delta)) } : m
            ),
          }
        : p
    );
    savePortadores(updated);
  };

  const handleAddMeta = () => {
    const titulo = window.prompt("Nome da nova meta:");
    if (!titulo?.trim() || !selectedPortador) return;
    const updated = portadores.map((p) =>
      p.id === selectedPortador.id
        ? { ...p, metas: [...(p.metas || []), { id: Date.now(), titulo: titulo.trim(), progresso: 0 }] }
        : p
    );
    savePortadores(updated);
    addToast("🎯", "Meta criada!", `"${titulo}" adicionada para ${selectedPortador.nome}.`);
  };

  /* ================================================================ */
  /* ACOMPANHANTE — EMERGÊNCIA                                       */
  /* ================================================================ */
  const handleEmergency = (nome, fone) => {
    setEmergencyAuth({ nome, fone });
    setEmergencyModal(true);
  };
  const handleConfirmEmergency = () => {
    addToast("🚨", `Chamado enviado para ${emergencyAuth?.nome}!`,
      `GPS: -23.5505, -46.6333 • Portador: ${selectedPortador?.nome || "—"}`, "#dc2626");
    setEmergencyModal(false);
  };

  /* ================================================================ */
  /* PORTADOR — ROTINAS                                               */
  /* ================================================================ */
  const handleToggleRotina = (id) => {
    const updated = minhaRotina.map((r) =>
      r.id === id ? { ...r, concluida: !r.concluida } : r
    );
    setMinhaRotina(updated);
    // Persiste no portador correspondente
    const updatedP = portadores.map((p) =>
      p.nome === user?.name ? { ...p, rotinas: updated } : p
    );
    savePortadores(updatedP);
    const task = updated.find((r) => r.id === id);
    if (task?.concluida) addToast("✅", "Tarefa concluída!", task.titulo, "#16a34a");
  };

  /* ================================================================ */
  /* PORTADOR — HUMOR                                                 */
  /* ================================================================ */
  const humores = [
    { key: "bem",      emoji: "😄", label: "Muito Bem",       feedback: "Que ótimo! Aproveite o seu dia com tranquilidade. 🌟" },
    { key: "calmo",    emoji: "😌", label: "Tranquilo",        feedback: "Estar calmo ajuda a se concentrar nas atividades. 💙" },
    { key: "inquieto", emoji: "😟", label: "Inquieto / Ansioso", feedback: "Tudo bem se sentir assim. Respire fundo e tome uma água. 🌬️" },
    { key: "cansado",  emoji: "😴", label: "Cansado",          feedback: "Seu corpo pede descanso. Que tal uma pausa sensorial agora? 🎧" },
  ];

  const handleHumor = (h) => {
    setMeuHumor(h.key);
    setHumoresFeedback(h.feedback);
    // Atualiza humor no banco de portadores
    const updatedP = portadores.map((p) =>
      p.nome === user?.name ? { ...p, humor: h.label, humorEmoji: h.emoji } : p
    );
    savePortadores(updatedP);
    addToast(h.emoji, `Humor registrado: ${h.label}`, h.feedback);
  };

  /* ================================================================ */
  /* PORTADOR — MENSAGENS RÁPIDAS                                    */
  /* ================================================================ */
  const handleMensagemRapida = (msg) => {
    setMensagemEnviada(msg);
    const updatedP = portadores.map((p) =>
      p.nome === user?.name
        ? { ...p, mensagens: [...(p.mensagens || []), { id: Date.now(), texto: msg, hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }] }
        : p
    );
    savePortadores(updatedP);
    addToast("📢", "Mensagem enviada ao acompanhante!", `"${msg}"`, "#f39200");
    setTimeout(() => setMensagemEnviada(null), 4000);
  };

  /* ================================================================ */
  /* RENDERS                                                          */
  /* ================================================================ */
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafd" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🧩</div>
          <p style={{ color: "#64748b", fontWeight: 600 }}>Carregando sua área personalizada...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const meuPortadorData = portadores.find((p) => p.nome === user.name) || portadores[0];

  return (
    <div className={styles.dashboardWrapper}>
      <Toast toasts={toasts} dismiss={dismissToast} />

      {/* ============================ NAVBAR ============================ */}
      <nav className={styles.dashNavbar}>
        <div className={styles.dashNavContainer}>
          <Link href="/" className={styles.dashBrand}>
            <span>❤️</span>
            <span>Heart Tech</span>
          </Link>

          <div className={styles.dashUserArea}>
            <span className={`${styles.userRoleBadge} ${
              user.role === "portador" ? styles.badgePortador :
              user.role === "acompanhante" ? styles.badgeAcompanhante : styles.badgeAdmin
            }`}>
              {user.role === "portador" ? "💙" : user.role === "acompanhante" ? "📋" : "⚙️"} {user.name}
            </span>
            <button onClick={handleLogout} className={styles.logoutBtn}>Sair</button>
          </div>
        </div>
      </nav>

      <main className={styles.dashMain}>

        {/* ================================================================ */}
        {/* VIEW: PORTADOR                                                   */}
        {/* ================================================================ */}
        {user.role === "portador" && (
          <div>
            <div className={styles.welcomeHeader}>
              <h1 className={styles.welcomeTitle}>Olá, {user.name}! 🌟</h1>
              <p className={styles.welcomeSubtitle}>Seu espaço seguro. Veja sua rotina, converse com seu acompanhante ou peça uma pausa quando precisar.</p>
            </div>

            {/* ABAS DO PORTADOR */}
            <nav className={styles.portadorTabsNav}>
              {[
                { key: "rotinas",      label: "🌟 Minha Rotina & Metas" },
                { key: "acompanhante", label: "👥 Meu Acompanhante" },
                { key: "localizacao",  label: "📍 Onde Estou" },
                { key: "emergencia",   label: "🛑 Ajuda & Pausa" },
              ].map((t) => (
                <button key={t.key} type="button"
                  className={`${styles.portadorTabBtn} ${portadorTab === t.key ? styles.portadorTabActive : ""}`}
                  onClick={() => setPortadorTab(t.key)}
                >{t.label}</button>
              ))}
            </nav>

            {/* ---- ABA 1: ROTINA & METAS ---- */}
            {portadorTab === "rotinas" && (
              <div>
                {/* Como me sinto */}
                <section className={styles.cardPortador}>
                  <h2 className={styles.cardTitleBig}>😊 Como você está se sentindo agora?</h2>
                  <div className={styles.feelingsGrid}>
                    {humores.map((h) => (
                      <button key={h.key} type="button"
                        className={`${styles.feelingBtn} ${meuHumor === h.key ? styles.feelingActive : ""}`}
                        onClick={() => handleHumor(h)}
                      >
                        <span className={styles.feelingEmoji}>{h.emoji}</span>
                        <span className={styles.feelingLabel}>{h.label}</span>
                      </button>
                    ))}
                  </div>
                  {humoresFeedback && (
                    <div style={{ marginTop: 16, padding: "12px 16px", background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 10, color: "#0066c0", fontWeight: 700 }}>
                      💬 {humoresFeedback}
                    </div>
                  )}
                </section>

                <div className={styles.routineGoalsContainer}>
                  {/* Rotina */}
                  <section className={styles.cardBox}>
                    <div className={styles.cardBoxTitle}>📅 Minha Rotina de Hoje</div>
                    <div className={styles.cardBoxSubtitle}>Clique para marcar o que você já terminou:</div>
                    <div className={styles.routineChecklist}>
                      {(minhaRotina.length > 0 ? minhaRotina : (meuPortadorData?.rotinas || [])).map((task) => (
                        <div key={task.id}
                          className={`${styles.routineCheckItem} ${task.concluida ? styles.checked : ""}`}
                          onClick={() => handleToggleRotina(task.id)}
                        >
                          <div className={styles.checkboxVisual}>{task.concluida && "✓"}</div>
                          <span className={styles.routineText}>
                            <strong>{task.hora}</strong> — {task.titulo}
                          </span>
                        </div>
                      ))}
                      {(minhaRotina.length === 0 && !meuPortadorData?.rotinas?.length) && (
                        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Nenhuma tarefa cadastrada ainda. Peça ao seu acompanhante para criar sua rotina!</p>
                      )}
                    </div>
                  </section>

                  {/* Metas */}
                  <section className={styles.cardBox}>
                    <div className={styles.cardBoxTitle}>🎯 Minhas Metas</div>
                    <div className={styles.cardBoxSubtitle}>Progresso das metas do seu acompanhante:</div>
                    <div className={styles.goalsList}>
                      {(minhasMetas.length > 0 ? minhasMetas : (meuPortadorData?.metas || [])).map((meta) => (
                        <div key={meta.id} className={styles.goalCard}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span className={styles.goalTitle}>{meta.titulo}</span>
                            <span className={styles.goalProgressVal}>{meta.progresso}%</span>
                          </div>
                          <div className={styles.goalProgressBar}>
                            <div className={styles.goalProgressFill}
                              style={{ width: `${meta.progresso}%`, background: meta.progresso === 100 ? "#16a34a" : "#0066c0" }}
                            />
                          </div>
                          <div style={{ fontSize: "0.78rem", color: meta.progresso === 100 ? "#16a34a" : "#64748b", fontWeight: 700 }}>
                            {meta.progresso === 100 ? "🎉 Parabéns! Meta 100% concluída!" : "Continue, você está indo bem!"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* ---- ABA 2: MEU ACOMPANHANTE ---- */}
            {portadorTab === "acompanhante" && (() => {
              const care = portadores.find((p) => p.nome !== user.name) ||
                           { nome: "Acompanhante", distanciaMetros: 120, mensagens: [] };
              return (
                <div style={{ maxWidth: 760, margin: "0 auto" }}>
                  <div className={styles.cardPortador}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef7e6", color: "#f39200", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>
                        👤
                      </div>
                      <div>
                        <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 800, color: "#0066c0" }}>Acompanhante Vinculado</span>
                        <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#004c97" }}>
                          {portadores.find((p) => p.nome !== user.name)?.nome || "Não vinculado"}
                        </h2>
                        <p style={{ fontSize: "0.82rem", color: "#64748b" }}>🟢 Online • a ~{simDist}m de você</p>
                      </div>
                    </div>

                    {/* Mensagens recebidas */}
                    {(meuPortadorData?.mensagens?.length > 0) && (
                      <div style={{ marginBottom: 20 }}>
                        <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "#004c97", marginBottom: 8 }}>💬 Mensagens enviadas:</p>
                        {meuPortadorData.mensagens.slice(-3).map((m) => (
                          <div key={m.id} style={{ background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 12px", marginBottom: 6, fontSize: "0.85rem", color: "#0066c0" }}>
                            [{m.hora}] {m.texto}
                          </div>
                        ))}
                      </div>
                    )}

                    <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#004c97", marginBottom: 10 }}>Envie um recado com 1 toque:</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                      {[
                        { msg: "Estou bem e tranquilo! 💙",        bg: "#f0f7ff", color: "#0066c0", border: "#bfdbfe" },
                        { msg: "Terminei minha atividade! ✅",       bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
                        { msg: "Estou em pausa sensorial 🎧",        bg: "#fef7e6", color: "#b45309", border: "#fde68a" },
                        { msg: "Pode vir até aqui? 🚨",              bg: "#fff1f2", color: "#e11d48", border: "#fecdd3" },
                      ].map(({ msg, bg, color, border }) => (
                        <button key={msg} type="button"
                          onClick={() => handleMensagemRapida(msg)}
                          style={{ padding: "12px 10px", background: bg, color, border: `1.5px solid ${border}`, borderRadius: 10, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                        >{msg}</button>
                      ))}
                    </div>
                    {mensagemEnviada && (
                      <div style={{ padding: "10px 14px", background: "#ecfdf5", border: "1px solid #86efac", borderRadius: 8, color: "#166534", fontWeight: 700, fontSize: "0.875rem" }}>
                        ✓ Enviado: &ldquo;{mensagemEnviada}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ---- ABA 3: ONDE ESTOU ---- */}
            {portadorTab === "localizacao" && (
              <div className={styles.locationSection}>
                <div className={styles.mapVisualCard}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#004c97", marginBottom: 14 }}>
                    🗺️ Mapa de Posição & Zona de Segurança
                  </h3>
                  <div className={styles.mapContainer}>
                    <div className={styles.mapGridPattern} />
                    <div className={styles.geofenceCircle} style={{ width: Math.min(340, distMax * 1.2), height: Math.min(340, distMax * 1.2) }} />
                    <div className={styles.pinAcompanhante} title="Acompanhante">🏠</div>
                    <div className={styles.pinPortador}
                      style={{ transform: `translate(${Math.min(130, simDist * 0.75)}px, -${Math.min(100, simDist * 0.55)}px)` }}
                      title="Você"
                    >💙</div>
                    <div className={styles.pulseWave}
                      style={{ transform: `translate(${Math.min(130, simDist * 0.75)}px, -${Math.min(100, simDist * 0.55)}px)` }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-around", marginTop: 12, fontSize: "0.78rem", color: "#64748b" }}>
                    <span>🏠 Acompanhante</span><span>💙 Você</span><span>⭕ Limite Seguro</span>
                  </div>
                </div>

                <div className={styles.mapControlsPanel}>
                  <div className={styles.geofenceCard}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#004c97", marginBottom: 12 }}>Status</h3>
                    <div className={`${styles.distanceStatusBox} ${simDist > distMax ? styles.statusAlert : styles.statusSafe}`}>
                      <div>
                        <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Sua distância</span>
                        <div className={styles.distanceNumber}>{simDist}m</div>
                      </div>
                      <span style={{ fontSize: "1.8rem" }}>{simDist > distMax ? "⚠️" : "🛡️"}</span>
                    </div>
                    {simDist > distMax ? (
                      <p style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, color: "#991b1b", fontSize: "0.82rem", fontWeight: 700 }}>
                        ⚠️ Você está além do limite de {distMax}m! Fale com seu acompanhante.
                      </p>
                    ) : (
                      <p style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, color: "#166534", fontSize: "0.82rem", fontWeight: 700 }}>
                        ✓ Você está dentro da zona segura!
                      </p>
                    )}
                  </div>
                  <div className={styles.cardBox} style={{ textAlign: "center" }}>
                    <p style={{ fontWeight: 700, color: "#004c97", marginBottom: 10 }}>📍 Solicitar reencontro</p>
                    <button className="btn-primary" style={{ width: "100%" }}
                      onClick={() => handleMensagemRapida("Estou esperando você me encontrar aqui! 📍")}>
                      Me Encontre Aqui
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ---- ABA 4: AJUDA & PAUSA ---- */}
            {portadorTab === "emergencia" && (
              <div style={{ maxWidth: 760, margin: "0 auto" }}>
                <section style={{ background: "linear-gradient(135deg,#fff1f2,#fee2e2)", border: "2px solid #fecdd3", borderRadius: 20, padding: "32px 24px", textAlign: "center", marginBottom: 24 }}>
                  <span style={{ fontSize: "3rem" }}>🌿</span>
                  <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#991b1b", margin: "8px 0" }}>Pausa Sensorial</h2>
                  <p style={{ color: "#7f1d1d", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 20px" }}>
                    Se o ambiente estiver pesado ou você estiver se sentindo sobrecarregado, clique abaixo para respirar com calma.
                  </p>
                  <button type="button" onClick={() => setPauseModal(true)}
                    style={{ background: "#e11d48", color: "white", padding: "16px 28px", borderRadius: 9999, border: "none", fontWeight: 800, fontSize: "1.1rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10 }}>
                    🎧 Iniciar Pausa Sensorial Agora
                  </button>
                </section>

                <div className={styles.cardPortador} style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "2rem" }}>📢</span>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#004c97", margin: "8px 0" }}>Chamar meu Acompanhante</h3>
                  <p style={{ fontSize: "0.88rem", color: "#64748b", marginBottom: 16 }}>
                    Isso envia um alerta sonoro e sua localização para o celular do seu acompanhante.
                  </p>
                  <button type="button" onClick={() => setCallCareModal(true)}
                    style={{ background: "#0066c0", color: "white", padding: "14px 24px", borderRadius: 9999, border: "none", fontWeight: 800, fontSize: "1rem", cursor: "pointer", width: "100%" }}>
                    🚨 Chamar Acompanhante Imediatamente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* VIEW: ACOMPANHANTE                                               */}
        {/* ================================================================ */}
        {user.role === "acompanhante" && (
          <div>
            <div className={styles.welcomeHeader}>
              <h1 className={styles.welcomeTitle}>Central do Acompanhante</h1>
              <p className={styles.welcomeSubtitle}>
                Monitore portadores, gerencie rotinas e metas, veja a localização em tempo real e acione suporte de emergência.
              </p>
            </div>

            {/* ABAS */}
            <nav className={styles.acompTabsNav}>
              {[
                { key: "portadores",  label: `👥 Meus Portadores (${portadores.length})` },
                { key: "rotinas",     label: "📅 Rotinas & Metas" },
                { key: "localizacao", label: "📍 Localização & Cerca Virtual" },
                { key: "mensagens",   label: "💬 Mensagens" },
                { key: "emergencia",  label: "🚨 Emergência" },
              ].map((t) => (
                <button key={t.key} type="button"
                  className={`${styles.acompTabBtn} ${acompTab === t.key ? styles.acompTabActive : ""}`}
                  onClick={() => setAcompTab(t.key)}
                >{t.label}</button>
              ))}
            </nav>

            {/* ---- ABA 1: MEUS PORTADORES ---- */}
            {acompTab === "portadores" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#004c97" }}>Portadores Sob Seu Cuidado</h3>
                    <p style={{ fontSize: "0.82rem", color: "#64748b" }}>Clique em um card para selecioná-lo como ativo. Use os botões para vincular ou desvincular.</p>
                  </div>
                  <button type="button" onClick={() => setShowAttachModal(true)} className="btn-primary" style={{ padding: "9px 16px", fontSize: "0.875rem" }}>
                    ➕ Vincular Novo
                  </button>
                </div>

                {portadores.length > 0 ? (
                  <div className={styles.portadoresGrid}>
                    {portadores.map((p) => (
                      <div key={p.id}
                        className={`${styles.portadorCard} ${selectedPortadorId === p.id ? styles.selectedPortador : ""}`}
                        onClick={() => setSelectedPortadorId(p.id)}
                      >
                        <div>
                          <div className={styles.portadorCardTop}>
                            <div className={styles.portadorInfo}>
                              <div className={styles.portadorAvatar}>{p.nome.charAt(0)}</div>
                              <div>
                                <div className={styles.portadorName}>{p.nome}</div>
                                <div className={styles.portadorMeta}>{p.idade} • {p.condicao}</div>
                              </div>
                            </div>
                            <span className={`${styles.portadorStatusPill} ${p.humor?.includes("Pausa") ? styles.statusYellow : styles.statusGreen}`}>
                              {p.humorEmoji} {p.humor}
                            </span>
                          </div>
                          <div className={styles.portadorDetailsGrid}>
                            <div className={styles.portadorDetailItem}>
                              <strong>Local</strong><span>{p.local}</span>
                            </div>
                            <div className={styles.portadorDetailItem}>
                              <strong>Distância</strong><span>{p.distanciaMetros}m • 🔋 {p.bateria}%</span>
                            </div>
                          </div>
                          {/* Mensagens do portador */}
                          {(p.mensagens?.length > 0) && (
                            <div style={{ marginTop: 10, padding: "8px 12px", background: "#f0f7ff", borderRadius: 8, fontSize: "0.8rem", color: "#0066c0", border: "1px solid #bfdbfe" }}>
                              📢 <strong>Última mensagem:</strong> {p.mensagens[p.mensagens.length - 1].texto}
                            </div>
                          )}
                        </div>
                        <div className={styles.portadorCardFooter}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: selectedPortadorId === p.id ? "#0066c0" : "#64748b" }}>
                            {selectedPortadorId === p.id ? "✓ Portador Ativo" : "Clique para gerenciar"}
                          </span>
                          <button type="button" className={styles.btnUnbindPortador}
                            onClick={(e) => { e.stopPropagation(); setPortadorParaDesvincular(p); setShowUnbindModal(true); }}>
                            🚫 Desvincular
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className={styles.btnAttachNew} onClick={() => setShowAttachModal(true)}>
                      <span style={{ fontSize: "1.8rem" }}>➕</span>
                      <span>Vincular Portador Disponível</span>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 400 }}>Encontre usuários aguardando acompanhamento</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "white", padding: "40px 20px", borderRadius: 16, border: "1.5px dashed #cbd5e1", textAlign: "center" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>👥</div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>Nenhum portador vinculado</h3>
                    <p style={{ color: "#64748b", fontSize: "0.9rem", maxWidth: 400, margin: "0 auto 18px" }}>
                      Clique abaixo para vincular-se a um portador disponível na plataforma.
                    </p>
                    <button type="button" onClick={() => setShowAttachModal(true)} className="btn-primary">
                      ➕ Vincular Portador Agora
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ---- ABA 2: ROTINAS & METAS ---- */}
            {acompTab === "rotinas" && (
              selectedPortador ? (
                <div className={styles.routineGoalsContainer}>
                  {/* Rotinas */}
                  <div className={styles.cardBox}>
                    <div className={styles.cardBoxTitle}>📅 Rotina de {selectedPortador.nome}</div>
                    <div className={styles.cardBoxSubtitle}>Tarefas que aparecem na tela do portador.</div>
                    <div className={styles.routineListAcomp}>
                      {(selectedPortador.rotinas || []).map((r) => (
                        <div key={r.id} className={styles.routineItemAcomp}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span className={styles.routineTimeBadge}>{r.hora}</span>
                            <span style={{ fontSize: "0.88rem", fontWeight: 600, color: r.concluida ? "#16a34a" : "#1e293b" }}>
                              {r.concluida ? "✓ " : ""}{r.titulo}
                            </span>
                          </div>
                          <button type="button" className={styles.removeTaskBtn} onClick={() => handleRemoveRotina(r.id)}>✕</button>
                        </div>
                      ))}
                      {(!selectedPortador.rotinas?.length) && (
                        <p style={{ color: "#64748b", fontSize: "0.88rem" }}>Nenhuma tarefa ainda. Adicione abaixo.</p>
                      )}
                    </div>
                    <form onSubmit={handleAddRotina} className={styles.addRoutineForm}>
                      <input type="time" className={styles.inputTask} style={{ maxWidth: 110 }}
                        value={novaHora} onChange={(e) => setNovaHora(e.target.value)} required />
                      <input type="text" className={styles.inputTask} placeholder="Ex: Terapia Ocupacional"
                        value={novaTarefa} onChange={(e) => setNovaTarefa(e.target.value)} required />
                      <button type="submit" className="btn-primary" style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>+ Adicionar</button>
                    </form>
                  </div>

                  {/* Metas */}
                  <div className={styles.cardBox}>
                    <div className={styles.cardBoxTitle}>🎯 Metas de {selectedPortador.nome}</div>
                    <div className={styles.cardBoxSubtitle}>Acompanhe e ajuste o progresso de cada meta.</div>
                    <div className={styles.goalsList}>
                      {(selectedPortador.metas || []).map((m) => (
                        <div key={m.id} className={styles.goalCard}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span className={styles.goalTitle}>{m.titulo}</span>
                            <span className={styles.goalProgressVal}>{m.progresso}%</span>
                          </div>
                          <div className={styles.goalProgressBar}>
                            <div className={styles.goalProgressFill}
                              style={{ width: `${m.progresso}%`, background: m.progresso === 100 ? "#16a34a" : "#0066c0" }} />
                          </div>
                          <div className={styles.goalActionBtns}>
                            <button type="button" className={styles.btnGoalStep} onClick={() => handleGoalChange(m.id, -15)}>- 15%</button>
                            <button type="button" className={styles.btnGoalStep} onClick={() => handleGoalChange(m.id, 15)}>+ 15%</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={handleAddMeta}
                      style={{ width: "100%", marginTop: 14, padding: 10, background: "white", border: "1.5px dashed #0066c0", borderRadius: 8, color: "#0066c0", fontWeight: 700, cursor: "pointer" }}>
                      ➕ Criar Nova Meta
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ background: "white", padding: 30, borderRadius: 12, textAlign: "center" }}>
                  <p style={{ color: "#64748b", marginBottom: 14 }}>Vincule um portador primeiro para gerenciar rotinas.</p>
                  <button onClick={() => setAcompTab("portadores")} className="btn-primary">Ir para Portadores</button>
                </div>
              )
            )}

            {/* ---- ABA 3: LOCALIZAÇÃO ---- */}
            {acompTab === "localizacao" && (
              selectedPortador ? (
                <div className={styles.locationSection}>
                  <div className={styles.mapVisualCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#004c97" }}>Posição em Tempo Real</h3>
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Rastreando: <strong>{selectedPortador.nome}</strong></span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button type="button" className={styles.btnGoalStep} onClick={() => setSimDist(Math.max(20, simDist - 30))}>← Aproximar</button>
                        <button type="button" className={styles.btnGoalStep} onClick={() => setSimDist(simDist + 40)}>Afastar →</button>
                      </div>
                    </div>
                    <div className={styles.mapContainer}>
                      <div className={styles.mapGridPattern} />
                      <div className={styles.geofenceCircle} style={{ width: Math.min(340, distMax * 1.2), height: Math.min(340, distMax * 1.2) }} />
                      <div className={styles.pinAcompanhante} title="Você (Acompanhante)">🏠</div>
                      <div className={styles.pinPortador}
                        style={{ transform: `translate(${Math.min(130, simDist * 0.75)}px, -${Math.min(100, simDist * 0.55)}px)` }}
                        title={`${selectedPortador.nome} (${simDist}m)`}
                      >💙</div>
                      <div className={styles.pulseWave}
                        style={{ transform: `translate(${Math.min(130, simDist * 0.75)}px, -${Math.min(100, simDist * 0.55)}px)` }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-around", marginTop: 12, fontSize: "0.78rem", color: "#64748b" }}>
                      <span>🏠 Você</span><span>💙 {selectedPortador.nome}</span><span>⭕ Cerca Virtual</span>
                    </div>
                  </div>

                  <div className={styles.mapControlsPanel}>
                    <div className={styles.geofenceCard}>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#004c97", marginBottom: 12 }}>Distância & Cerca</h3>
                      <div className={`${styles.distanceStatusBox} ${simDist > distMax ? styles.statusAlert : styles.statusSafe}`}>
                        <div>
                          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Distância Atual</span>
                          <div className={styles.distanceNumber}>{simDist}m</div>
                        </div>
                        <span style={{ fontSize: "1.8rem" }}>{simDist > distMax ? "⚠️" : "🛡️"}</span>
                      </div>

                      {simDist > distMax && (
                        <div style={{ padding: "10px 14px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, color: "#991b1b", fontWeight: 700, fontSize: "0.82rem", marginBottom: 14 }}>
                          🚨 ALERTA: {selectedPortador.nome} ultrapassou {distMax}m!
                        </div>
                      )}

                      <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                        <span>Distância Máxima Permitida:</span>
                        <strong>{distMax}m</strong>
                      </label>
                      <input type="range" min="30" max="500" step="10" value={distMax}
                        onChange={(e) => setDistMax(Number(e.target.value))}
                        className={styles.rangeSlider} />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#64748b" }}>
                        <span>30m</span><span>250m</span><span>500m</span>
                      </div>
                    </div>

                    <div className={styles.emergencyPanel}>
                      <div className={styles.emergencyTitle}>⚠️ Acionar Socorro</div>
                      <div className={styles.emergencyDesc}>
                        Envio imediato de GPS e prontuário de {selectedPortador.nome}.
                      </div>
                      <button type="button" className={styles.btnCallAuthorities}
                        onClick={() => handleEmergency("Polícia Militar", "190")}>
                        🚨 Acionar Autoridades
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: "white", padding: 30, borderRadius: 12, textAlign: "center" }}>
                  <p style={{ color: "#64748b", marginBottom: 14 }}>Selecione um portador para monitorar.</p>
                  <button onClick={() => setAcompTab("portadores")} className="btn-primary">Ir para Portadores</button>
                </div>
              )
            )}

            {/* ---- ABA 4: MENSAGENS ---- */}
            {acompTab === "mensagens" && (
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#004c97", marginBottom: 16 }}>
                  💬 Mensagens Recebidas dos Portadores
                </h3>
                {portadores.some((p) => p.mensagens?.length > 0) ? (
                  portadores.filter((p) => p.mensagens?.length > 0).map((p) => (
                    <div key={p.id} className={styles.cardBox} style={{ marginBottom: 16 }}>
                      <div style={{ fontWeight: 800, color: "#004c97", fontSize: "1rem", marginBottom: 10 }}>
                        {p.humorEmoji} {p.nome}
                      </div>
                      {p.mensagens.map((m) => (
                        <div key={m.id} style={{ padding: "8px 14px", background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 8, marginBottom: 8, fontSize: "0.875rem", color: "#1e293b" }}>
                          <span style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 700 }}>[{m.hora}]</span>&nbsp;
                          {m.texto}
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div style={{ background: "white", padding: "36px 20px", borderRadius: 16, border: "1.5px dashed #cbd5e1", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>💬</div>
                    <p style={{ color: "#64748b" }}>Nenhuma mensagem recebida ainda. Os portadores podem enviar recados rápidos da aba <strong>Meu Acompanhante</strong>.</p>
                  </div>
                )}
              </div>
            )}

            {/* ---- ABA 5: EMERGÊNCIA ---- */}
            {acompTab === "emergencia" && (
              <div style={{ maxWidth: 760, margin: "0 auto" }}>
                <div className={styles.emergencyPanel} style={{ padding: "36px 28px" }}>
                  <span style={{ fontSize: "3rem", display: "block", marginBottom: 8 }}>🚨</span>
                  <h2 style={{ fontSize: "1.7rem", fontWeight: 900, color: "#991b1b", marginBottom: 8 }}>
                    Central de Emergência
                  </h2>
                  <p style={{ color: "#7f1d1d", fontSize: "0.92rem", lineHeight: 1.6, maxWidth: 600, margin: "0 auto 26px" }}>
                    Em caso de fuga, desorientação ou crise, acione as autoridades. O sistema envia GPS exato e prontuário de <strong>{selectedPortador?.nome || "Assistido"}</strong>.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
                    {[
                      { nome: "Polícia Militar",   fone: "190", emoji: "🚓", desc: "Busca & Resgate" },
                      { nome: "SAMU",               fone: "192", emoji: "🚑", desc: "Urgência Médica" },
                      { nome: "Corpo de Bombeiros", fone: "193", emoji: "🚒", desc: "Primeiros Socorros" },
                    ].map((a) => (
                      <button key={a.fone} type="button"
                        onClick={() => handleEmergency(a.nome, a.fone)}
                        className={styles.btnCallAuthorities}
                        style={{ flexDirection: "column", padding: "18px 12px", gap: 6 }}
                      >
                        <span style={{ fontSize: "1.6rem" }}>{a.emoji}</span>
                        <span>{a.nome} ({a.fone})</span>
                        <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>{a.desc}</span>
                      </button>
                    ))}
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.7)", padding: "12px 16px", borderRadius: 10, border: "1px solid #fca5a5", fontSize: "0.83rem", color: "#7f1d1d", textAlign: "left" }}>
                    📍 <strong>GPS Pronto para Envio:</strong> Lat: -23.5505, Long: -46.6333 | Precisão: 3m
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* VIEW: ADMINISTRADOR                                              */}
        {/* ================================================================ */}
        {user.role === "administrador" && (
          <AdminPanel addToast={addToast} portadoresGlobais={portadores} savePortadores={savePortadores} />
        )}

      </main>

      {/* ================================================================ */}
      {/* MODAIS                                                           */}
      {/* ================================================================ */}

      {/* MODAL: VINCULAR PORTADOR */}
      {showAttachModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAttachModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#004c97" }}>➕ Vincular Novo Portador</h3>
              <button className={styles.closeModalBtn} onClick={() => setShowAttachModal(false)}>✕</button>
            </div>
            <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: 16 }}>
              Selecione um portador disponível para adicionar ao seu acompanhamento:
            </p>
            {disponiveis.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {disponiveis.map((c) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#004c97" }}>{c.nome} ({c.idade})</div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{c.condicao} • {c.cidade}</div>
                    </div>
                    <button type="button" onClick={() => handleVincular(c)} className="btn-primary" style={{ padding: "8px 14px", fontSize: "0.85rem" }}>
                      Conectar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#64748b", textAlign: "center", padding: "20px 0" }}>Nenhum portador disponível no momento.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: DESVINCULAR */}
      {showUnbindModal && portadorParaDesvincular && (
        <div className={styles.modalOverlay} onClick={() => setShowUnbindModal(false)}>
          <div className={styles.modalCard} style={{ textAlign: "center", maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>⚠️</div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#991b1b", marginBottom: 10 }}>
              Desvincular {portadorParaDesvincular.nome}?
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.88rem", lineHeight: 1.55, marginBottom: 22 }}>
              Você deixará de monitorar a rotina, localização e receber alertas de <strong>{portadorParaDesvincular.nome}</strong>. O usuário ficará disponível para novos vínculos.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button type="button" onClick={() => setShowUnbindModal(false)} className="btn-secondary">Cancelar</button>
              <button type="button" onClick={handleConfirmarDesvinculo}
                style={{ background: "#e11d48", color: "white", border: "none", padding: 12, borderRadius: 9999, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
                Sim, Desvincular
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EMERGÊNCIA */}
      {emergencyModal && (
        <div className={styles.modalOverlay} onClick={() => setEmergencyModal(false)}>
          <div className={styles.modalCard} style={{ textAlign: "center", maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "3rem", marginBottom: 8 }}>🚨</div>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 900, color: "#991b1b", marginBottom: 8 }}>
              Acionar {emergencyAuth?.nome} ({emergencyAuth?.fone})?
            </h3>
            <p style={{ color: "#7f1d1d", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: 18 }}>
              Será enviada a <strong>localização GPS exata</strong> e o prontuário de <strong>{selectedPortador?.nome || "Assistido"}</strong>.
            </p>
            <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", padding: "10px 14px", borderRadius: 8, fontSize: "0.83rem", color: "#991b1b", fontWeight: 600, marginBottom: 18 }}>
              📞 Linha Direta: <strong>{emergencyAuth?.fone}</strong> | GPS: -23.5505, -46.6333
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button type="button" onClick={() => setEmergencyModal(false)} className="btn-secondary">Cancelar</button>
              <button type="button" onClick={handleConfirmEmergency} className={styles.btnCallAuthorities} style={{ padding: 12, width: "100%" }}>
                Confirmar e Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PAUSA SENSORIAL */}
      {pauseModal && <BreathingExercise onClose={() => setPauseModal(false)} />}

      {/* MODAL: CHAMAR ACOMPANHANTE */}
      {callCareModal && (
        <div className={styles.modalOverlay} onClick={() => setCallCareModal(false)}>
          <div className={styles.modalCard} style={{ textAlign: "center", maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "3rem", marginBottom: 8 }}>📢</div>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#004c97", marginBottom: 8 }}>Chamar Acompanhante</h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 20 }}>
              Isso envia um alerta sonoro e sua localização atual para o celular do seu acompanhante.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button type="button" onClick={() => setCallCareModal(false)} className="btn-secondary">Cancelar</button>
              <button type="button"
                onClick={() => {
                  handleMensagemRapida("Pode vir até aqui? 🚨 Preciso de você agora!");
                  setCallCareModal(false);
                  addToast("📢", "Acompanhante notificado!", "Um alerta foi enviado com sua localização.", "#f39200");
                }}
                style={{ background: "#0066c0", color: "white", border: "none", padding: 12, borderRadius: 9999, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
                Enviar Chamado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

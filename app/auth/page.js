"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./auth.module.css";

// Único login padrão inicial do banco de dados: Administrador
const DEFAULT_ADMIN = {
  id: 1,
  name: "Administrador",
  email: "admin@hearttech.com.br",
  phone: "(11) 99999-0000",
  role: "administrador",
  password: "admin",
  birthDate: "1980-01-01"
};

const FAKE_USER_NAMES = ["Patrícia Mendes", "Lucas Silveira", "Sofia Mendes", "Gabriel Ramos", "Beatriz Lima"];

function getUsersDB() {
  try {
    const raw = localStorage.getItem("nc_users");
    let list = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      list = parsed.filter((u) => !FAKE_USER_NAMES.includes(u.name));
    }
    // Garante que o Administrador sempre exista no banco
    if (!list.some((u) => u.role === "administrador")) {
      list.unshift(DEFAULT_ADMIN);
      localStorage.setItem("nc_users", JSON.stringify(list));
    }
    return list;
  } catch {
    return [DEFAULT_ADMIN];
  }
}

function saveUsersDB(users) {
  localStorage.setItem("nc_users", JSON.stringify(users));
}

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab]           = useState("login");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'error'|'success', msg }

  const [loginData, setLoginData] = useState({ name: "", password: "" });
  const [regData, setRegData]     = useState({
    name: "", birthDate: "", role: "acompanhante",
    email: "", confirmEmail: "", phone: "", password: "",
  });

  useEffect(() => {
    // Se o usuário logado for um fake antigo, desloga
    try {
      const rawU = localStorage.getItem("nc_user");
      if (rawU) {
        const u = JSON.parse(rawU);
        if (FAKE_USER_NAMES.includes(u.name)) {
          localStorage.removeItem("nc_auth");
          localStorage.removeItem("nc_user");
        }
      }
    } catch {}

    const q = new URLSearchParams(window.location.search);
    if (q.get("mode") === "cadastro") setTab("register");
    if (localStorage.getItem("nc_auth") === "true") router.replace("/landing");
  }, [router]);

  /* ============================================================ */
  /* LOGIN COM SUPORTE A BANCO DE DADOS E ADMINISTRADOR          */
  /* ============================================================ */
  const handleLogin = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!loginData.name.trim() || !loginData.password.trim()) {
      setFeedback({ type: "error", msg: "Preencha nome/e-mail e senha." });
      return;
    }
    setLoading(true);

    // 1. Tenta autenticação no banco do servidor
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: loginData.name, password: loginData.password })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        localStorage.setItem("nc_auth", "true");
        localStorage.setItem("nc_user", JSON.stringify(data.user));
        setFeedback({ type: "success", msg: `Bem-vindo(a), ${data.user.name}! Redirecionando...` });
        setTimeout(() => router.push("/landing"), 600);
        return;
      }
    } catch (apiErr) {
      console.warn("API de login offline, usando banco local:", apiErr);
    }

    // 2. Fallback no banco local
    setTimeout(() => {
      const input = loginData.name.trim().toLowerCase();
      const pass = loginData.password.trim();
      const users = getUsersDB();

      const found = users.find((u) => {
        const matchName = u.name?.toLowerCase() === input;
        const matchEmail = u.email?.toLowerCase() === input;
        const matchAdminAlias = input === "admin" && u.role === "administrador";
        if (!(matchName || matchEmail || matchAdminAlias)) return false;

        if (u.role === "administrador" && (pass === "admin" || pass === "admin123")) return true;
        return u.password === pass;
      });

      if (!found) {
        setLoading(false);
        setFeedback({ type: "error", msg: "Nome/E-mail ou senha incorretos. Tente novamente." });
        return;
      }

      const { password: _, ...userSafe } = found;
      localStorage.setItem("nc_auth", "true");
      localStorage.setItem("nc_user", JSON.stringify(userSafe));
      setFeedback({ type: "success", msg: `Bem-vindo(a), ${userSafe.name}! Redirecionando...` });
      setTimeout(() => router.push("/landing"), 600);
    }, 300);
  };

  /* ============================================================ */
  /* CADASTRO COM PERSISTÊNCIA REAL NO BANCO DE DADOS            */
  /* ============================================================ */
  const handleRegister = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (regData.email.trim().toLowerCase() !== regData.confirmEmail.trim().toLowerCase()) {
      setFeedback({ type: "error", msg: "Os e-mails informados não coincidem." });
      return;
    }
    if (regData.password.length < 6) {
      setFeedback({ type: "error", msg: "A senha deve ter no mínimo 6 caracteres." });
      return;
    }

    setLoading(true);

    const payload = {
      name: regData.name.trim(),
      birthDate: regData.birthDate,
      role: regData.role,
      email: regData.email.trim().toLowerCase(),
      phone: regData.phone,
      password: regData.password,
    };

    // 1. Envia para o banco de dados do servidor
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        setFeedback({ type: "error", msg: data.error || "Erro ao cadastrar usuário." });
        return;
      }
      if (data.user) {
        localStorage.setItem("nc_auth", "true");
        localStorage.setItem("nc_user", JSON.stringify(data.user));

        const users = getUsersDB();
        users.push({ ...payload, id: data.user.id });
        saveUsersDB(users);

        setFeedback({ type: "success", msg: `Cadastro criado com sucesso! Entrando como ${payload.role}...` });
        setTimeout(() => router.push("/landing"), 700);
        return;
      }
    } catch (apiErr) {
      console.warn("API de registro offline, gravando no banco local:", apiErr);
    }

    // 2. Fallback no banco local
    const users = getUsersDB();
    const exists = users.find(
      (u) => u.name.trim().toLowerCase() === payload.name.toLowerCase()
    );
    if (exists) {
      setLoading(false);
      setFeedback({ type: "error", msg: "Já existe um usuário com esse nome. Escolha outro nome ou faça login." });
      return;
    }

    const localUser = { ...payload, id: Date.now() };
    users.push(localUser);
    saveUsersDB(users);

    const { password: _, ...safeLocal } = localUser;
    localStorage.setItem("nc_auth", "true");
    localStorage.setItem("nc_user", JSON.stringify(safeLocal));
    setFeedback({ type: "success", msg: `Cadastro criado! Entrando como ${payload.role}...` });
    setTimeout(() => router.push("/landing"), 700);
  };

  return (
    <main className={styles.authContainer}>
      <Link href="/" className={styles.backHomeFloating}>
        ← Voltar ao Início
      </Link>

      <div className={styles.authCard}>
        {/* BANNER LATERAL */}
        <section className={styles.sideBanner}>
          <div className={styles.brandHeader}>
            <div className={styles.brandLogo}>
              <span className={styles.logoIcon}>❤️</span>
              <span>Heart Tech</span>
            </div>
            <h1 className={styles.bannerTitle}>
              Sua área personalizada por perfil
            </h1>
            <p className={styles.bannerSubtitle}>
              O sistema identifica automaticamente se você é <strong>Portador</strong>, <strong>Acompanhante</strong> ou <strong>Administrador</strong> e abre a tela correspondente.
            </p>
          </div>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>💙</div>
              <div><h4>Portador</h4><p>Rotina visual, seleção de humor e pausa sensorial com respiração guiada.</p></div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>📋</div>
              <div><h4>Acompanhante</h4><p>Monitoramento, metas, mapa em tempo real e central de emergência.</p></div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>⚙️</div>
              <div><h4>Administrador</h4><p>Métricas gerais, gestão de usuários e relatórios da plataforma.</p></div>
            </div>
          </div>
        </section>

        {/* FORMULÁRIOS */}
        <section className={styles.formContainer}>
          {/* TABS */}
          <div className={styles.tabSwitcher}>
            <button type="button"
              className={`${styles.tabButton} ${tab === "login" ? styles.active : ""}`}
              onClick={() => { setTab("login"); setFeedback(null); }}
            >Entrar (Login)</button>
            <button type="button"
              className={`${styles.tabButton} ${tab === "register" ? styles.active : ""}`}
              onClick={() => { setTab("register"); setFeedback(null); }}
            >Criar Cadastro</button>
          </div>

          {/* FEEDBACK */}
          {feedback && (
            <div className={`${styles.feedbackAlert} ${feedback.type === "error" ? styles.alertError : styles.alertSuccess}`}>
              <span>{feedback.type === "error" ? "⚠️" : "✅"}</span>
              <span>{feedback.msg}</span>
            </div>
          )}

          {/* LOGIN */}
          {tab === "login" && (
            <div>
              <div className={styles.formHeader}>
                <h2>Acessar minha conta</h2>
                <p>Informe o nome cadastrado e sua senha para entrar.</p>
              </div>

              <form onSubmit={handleLogin}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nome de Usuário</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>👤</span>
                    <input type="text" required placeholder="Digite seu nome cadastrado"
                      className={styles.textInput}
                      value={loginData.name}
                      onChange={(e) => setLoginData({ ...loginData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Senha</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>🔒</span>
                    <input type={showPwd ? "text" : "password"} required placeholder="••••••••"
                      className={styles.textInput}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                    <button type="button" className={styles.togglePassBtn} onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading} style={{ marginTop: 16 }}>
                  {loading ? "Entrando..." : "Entrar no Sistema →"}
                </button>
              </form>
            </div>
          )}

          {/* CADASTRO */}
          {tab === "register" && (
            <div>
              <div className={styles.formHeader}>
                <h2>Criar nova conta</h2>
                <p>Preencha todos os campos para acessar sua área personalizada.</p>
              </div>

              <form onSubmit={handleRegister}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nome Completo</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>👤</span>
                    <input type="text" required placeholder="Seu nome completo"
                      className={styles.textInput} value={regData.name}
                      onChange={(e) => setRegData({ ...regData, name: e.target.value })} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Data de Nascimento</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>📅</span>
                    <input type="date" required className={styles.textInput} value={regData.birthDate}
                      onChange={(e) => setRegData({ ...regData, birthDate: e.target.value })} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Perfil / Trabalho</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>💼</span>
                    <select className={styles.selectInput} value={regData.role}
                      onChange={(e) => setRegData({ ...regData, role: e.target.value })}>
                      <option value="acompanhante">Acompanhante (Familiar / Cuidador / Terapeuta)</option>
                      <option value="portador">Portador (Pessoa com Deficiência / Neurodivergente)</option>
                      <option value="administrador">Administrador (Gestão Geral)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>E-mail</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>✉️</span>
                    <input type="email" required placeholder="seuemail@exemplo.com"
                      className={styles.textInput} value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Confirmação de E-mail</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>✉️</span>
                    <input type="email" required placeholder="Repita o e-mail acima"
                      className={styles.textInput} value={regData.confirmEmail}
                      onChange={(e) => setRegData({ ...regData, confirmEmail: e.target.value })} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Telefone / WhatsApp</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>📞</span>
                    <input type="tel" required placeholder="(11) 98765-4321"
                      className={styles.textInput} value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Senha (mín. 6 caracteres)</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>🔒</span>
                    <input type={showPwd ? "text" : "password"} required minLength={6} placeholder="Crie uma senha segura"
                      className={styles.textInput} value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })} />
                    <button type="button" className={styles.togglePassBtn} onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading} style={{ marginTop: 12 }}>
                  {loading ? "Criando conta..." : "Finalizar Cadastro →"}
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

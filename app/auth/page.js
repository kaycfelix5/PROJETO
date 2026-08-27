"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./auth.module.css";

// Usuários padrão de demonstração
const SEED_USERS = [
  { name: "Patrícia Mendes", birthDate: "1988-04-12", role: "acompanhante", email: "patricia@email.com", phone: "(11) 98765-4321", password: "123456" },
  { name: "Lucas Silveira",  birthDate: "2015-05-10", role: "portador",     email: "lucas@email.com",   phone: "(11) 97777-1111", password: "123456" },
  { name: "Sofia Mendes",    birthDate: "2012-08-20", role: "portador",     email: "sofia@email.com",   phone: "(11) 96666-2222", password: "123456" },
  { name: "Admin",           birthDate: "1980-01-01", role: "administrador",email: "admin@email.com",   phone: "(11) 00000-0000", password: "admin123" },
];

function getUsersDB() {
  try {
    const raw = localStorage.getItem("nc_users");
    if (!raw) {
      localStorage.setItem("nc_users", JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    return JSON.parse(raw);
  } catch { return SEED_USERS; }
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
    const q = new URLSearchParams(window.location.search);
    if (q.get("mode") === "cadastro") setTab("register");
    // Se já logado, redireciona
    if (localStorage.getItem("nc_auth") === "true") router.replace("/landing");
  }, [router]);

  /* ============================================================ */
  /* LOGIN                                                        */
  /* ============================================================ */
  const handleLogin = (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!loginData.name.trim() || !loginData.password.trim()) {
      setFeedback({ type: "error", msg: "Preencha nome e senha." });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const users = getUsersDB();
      const found = users.find(
        (u) => u.name.trim().toLowerCase() === loginData.name.trim().toLowerCase()
              && u.password === loginData.password
      );
      if (!found) {
        setLoading(false);
        setFeedback({ type: "error", msg: "Nome ou senha incorretos. Tente novamente." });
        return;
      }
      localStorage.setItem("nc_auth", "true");
      localStorage.setItem("nc_user", JSON.stringify(found));
      setFeedback({ type: "success", msg: `Bem-vindo(a), ${found.name}! Redirecionando...` });
      setTimeout(() => router.push("/landing"), 900);
    }, 600);
  };

  /* ============================================================ */
  /* CADASTRO                                                     */
  /* ============================================================ */
  const handleRegister = (e) => {
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
    setTimeout(() => {
      const users = getUsersDB();
      const exists = users.find(
        (u) => u.name.trim().toLowerCase() === regData.name.trim().toLowerCase()
      );
      if (exists) {
        setLoading(false);
        setFeedback({ type: "error", msg: "Já existe um usuário com esse nome. Escolha outro nome ou faça login." });
        return;
      }

      const newUser = {
        name: regData.name.trim(),
        birthDate: regData.birthDate,
        role: regData.role,
        email: regData.email.trim().toLowerCase(),
        phone: regData.phone,
        password: regData.password,
      };
      users.push(newUser);
      saveUsersDB(users);

      localStorage.setItem("nc_auth", "true");
      localStorage.setItem("nc_user", JSON.stringify(newUser));
      setFeedback({ type: "success", msg: `Cadastro criado! Entrando na sua área de ${regData.role}...` });
      setTimeout(() => router.push("/landing"), 900);
    }, 700);
  };

  /* ============================================================ */
  /* QUICK LOGIN (demonstração)                                   */
  /* ============================================================ */
  const quickLogin = (role) => {
    const map = {
      portador: "Lucas Silveira",
      acompanhante: "Patrícia Mendes",
      administrador: "Admin",
    };
    const users = getUsersDB();
    const u = users.find((x) => x.name === map[role]) || { name: map[role], role, email: "", phone: "", birthDate: "", password: "" };
    localStorage.setItem("nc_auth", "true");
    localStorage.setItem("nc_user", JSON.stringify(u));
    router.push("/landing");
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
              <span className={styles.logoIcon}>🧩</span>
              <span>NeuroCare</span>
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

          <div className={styles.testimonialSnippet}>
            <p>💡 <strong>Demo rápida:</strong> use os botões abaixo do formulário de login para entrar direto em qualquer perfil.</p>
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
                    <input type="text" required placeholder="Ex: Lucas Silveira ou Patrícia Mendes"
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

              {/* DEMO RÁPIDA */}
              <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px dashed #cbd5e1" }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: 8 }}>
                  🚀 ACESSO RÁPIDO (demonstração):
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { role: "portador", label: "💙 Portador", bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
                    { role: "acompanhante", label: "📋 Acompanhante", bg: "#fef7e6", color: "#b45309", border: "#fde68a" },
                    { role: "administrador", label: "⚙️ Admin", bg: "#ede9fe", color: "#6b21a8", border: "#ddd6fe" },
                  ].map(({ role, label, bg, color, border }) => (
                    <button key={role} type="button" onClick={() => quickLogin(role)}
                      style={{ padding: "8px 6px", background: bg, color, border: `1px solid ${border}`, borderRadius: 8, fontSize: "0.77rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                    >{label}</button>
                  ))}
                </div>
                <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 6 }}>Senha dos usuários demo: <strong>123456</strong> (admin: <strong>admin123</strong>)</p>
              </div>
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

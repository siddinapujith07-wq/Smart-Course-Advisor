import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = "/api";
const storageKey = "courseAdvisorProfile";
const sessionKey = "courseAdvisorAuthenticated";
const pageKey = "courseAdvisorPage";
const interests = ["AI/ML", "Web Development", "Cyber Security", "Cloud Computing", "Data Science", "App Development"];
const goals = ["Software Job", "Higher Studies", "Startup", "Research"];
const courseOptions = [
  ["DS101", "Data Structures"], ["ST201", "Probability and Statistics"], ["AI201", "Artificial Intelligence"],
  ["WEB220", "Full Stack Development"], ["DB210", "Database Systems"], ["ML301", "Machine Learning"]
];
const skillOptions = ["Python", "JavaScript", "React", "SQL", "Statistics", "Cloud", "Networking", "Problem Solving", "UI Design"];

function blankProfile() {
  return {
    name: "", branch: "", year: "1st Year", cgpa: 7.5, interests: [], completed: [],
    certificationsText: "", certifications: [], grades: {}, skills: Object.fromEntries(skillOptions.map((skill) => [skill, 1])),
    careerGoal: "Software Job", studyHours: 8
  };
}

function App() {
  const stored = localStorage.getItem(storageKey);
  const storedSession = localStorage.getItem(sessionKey) === "true";
  const [profile, setProfile] = useState(stored ? JSON.parse(stored) : null);
  const [page, setPage] = useState(storedSession && stored ? (localStorage.getItem(pageKey) || "dashboard") : "home");
  const [isAuthenticated, setIsAuthenticated] = useState(storedSession);
  const [authMode, setAuthMode] = useState(null);
  const [pendingPage, setPendingPage] = useState(null);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [surveySeed, setSurveySeed] = useState(null);

  const navigate = (target) => {
    if (target === "home") {
      localStorage.setItem(pageKey, "home");
      setPage("home");
      return;
    }
    if (!isAuthenticated) {
      setPendingPage(target);
      setAuthMode("signin");
      return;
    }
    if (!profile) {
      setPendingPage(target);
      setSurveyOpen(true);
      return;
    }
    localStorage.setItem(pageKey, target);
    setPage(target);
  };

  const finishAuth = (mode, account = {}) => {
    localStorage.setItem(sessionKey, "true");
    setIsAuthenticated(true);
    setAuthMode(null);
    if (mode === "signup") {
      localStorage.removeItem(storageKey);
      setProfile(null);
      setSurveySeed({ ...blankProfile(), name: account.name || "" });
      setSurveyOpen(true);
    } else if (!profile) {
      setSurveySeed(blankProfile());
      setSurveyOpen(true);
    } else {
      const destination = pendingPage || "dashboard";
      localStorage.setItem(pageKey, destination);
      setPage(destination);
      setPendingPage(null);
    }
  };

  const completeSurvey = (value) => {
    const saved = { ...value, certifications: value.certificationsText.split(",").map((item) => item.trim()).filter(Boolean) };
    localStorage.setItem(storageKey, JSON.stringify(saved));
    setProfile(saved);
    setSurveySeed(null);
    setSurveyOpen(false);
    const destination = pendingPage || "dashboard";
    localStorage.setItem(pageKey, destination);
    setPage(destination);
    setPendingPage(null);
  };

  const logout = () => {
    localStorage.removeItem(sessionKey);
    localStorage.removeItem(pageKey);
    setIsAuthenticated(false);
    setPage("home");
    setPendingPage(null);
    setAuthMode(null);
    setSurveyOpen(false);
  };

  const privatePage = {
    dashboard: profile && <Dashboard profile={profile} onEdit={() => setSurveyOpen(true)} navigate={navigate} />,
    courses: profile && <Recommendations profile={profile} />,
    timetable: profile && <Timetable profile={profile} />,
    stats: profile && <Stats profile={profile} />,
    mapping: <Mapping />,
    chat: <Chat />
  }[page];

  const inWorkspace = page !== "home" && isAuthenticated && profile;

  return (
    <main>
      {inWorkspace ? (
        <Workspace profile={profile} page={page} navigate={navigate} logout={logout}>
          {privatePage}
        </Workspace>
      ) : (
        <>
          <Navbar page={page} navigate={navigate} setAuthMode={setAuthMode} isAuthenticated={isAuthenticated} profile={profile} />
          <Home navigate={navigate} setAuthMode={setAuthMode} />
        </>
      )}
      <Footer />
      {authMode && <AuthModal mode={authMode} setMode={setAuthMode} onClose={() => setAuthMode(null)} onSuccess={finishAuth} />}
      {surveyOpen && <Onboarding initial={profile || surveySeed || blankProfile()} onComplete={completeSurvey} onClose={profile ? () => setSurveyOpen(false) : null} />}
    </main>
  );
}

function Navbar({ page, navigate, setAuthMode, isAuthenticated, profile }) {
  return (
    <header className="nav">
      <button className="brand" onClick={() => navigate("home")} aria-label="Course Advisor home">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 40 40"><path d="M8 11c5-3 9-3 14 0v20c-5-3-9-3-14 0Z" /><path d="M22 11c5-3 9-3 14 0v20c-5-3-9-3-14 0Z" /><path d="M20 8v25" /></svg>
        </span>
        <span>Course<br />Advisor</span>
      </button>
      <nav>
        {[["home", "Studio"], ["courses", "Recommender Studio"], ["timetable", "Timetable"], ["stats", "Stats"], ["mapping", "CO Mapping"], ["chat", "AI Chat"]].map(([key, label]) => (
          <button key={key} className={page === key ? "active" : ""} onClick={() => navigate(key)}>{label}</button>
        ))}
      </nav>
      <div className="auth-actions">
        {isAuthenticated ? <button className="student-chip" onClick={() => navigate("dashboard")}>{profile?.name || "Complete Profile"}</button> : (
          <>
            <button onClick={() => setAuthMode("signin")}>Sign in</button>
            <button className="dark-btn" onClick={() => setAuthMode("signup")}>Sign up</button>
          </>
        )}
      </div>
    </header>
  );
}

function Workspace({ profile, page, navigate, logout, children }) {
  const items = [
    ["dashboard", "Dashboard"],
    ["courses", "Recommender Studio"],
    ["timetable", "Timetable"],
    ["stats", "Stats"],
    ["mapping", "CO Mapping"],
    ["chat", "AI Chat"]
  ];
  const focus = profile.careerGoal || profile.interests?.[0] || "Student";
  return (
    <div className="workspace">
      <aside className="side-nav">
        <button className="side-brand" onClick={() => navigate("home")} aria-label="Return to homepage">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40"><path d="M8 11c5-3 9-3 14 0v20c-5-3-9-3-14 0Z" /><path d="M22 11c5-3 9-3 14 0v20c-5-3-9-3-14 0Z" /><path d="M20 8v25" /></svg>
          </span>
          <strong>Course Advisor</strong>
        </button>
        <section className="side-profile">
          <span className="avatar">{(profile.name || "S").charAt(0).toUpperCase()}</span>
          <div>
            <strong>{profile.name || "Student"}</strong>
            <small>{focus}</small>
          </div>
        </section>
        <nav className="side-links">
          {items.map(([key, label]) => (
            <button key={key} className={page === key ? "active" : ""} onClick={() => navigate(key)}>{label}</button>
          ))}
          <button className="logout" onClick={logout}>Logout</button>
        </nav>
      </aside>
      <section className="workspace-main">{children}</section>
    </div>
  );
}

function Home({ navigate, setAuthMode }) {
  const features = [
    ["Smart Course Recommendations", "Discover courses that suit your interests, skills, and academic readiness."],
    ["Skill Analysis", "Understand your strengths and the skills to improve for your next step."],
    ["Career Guidance", "Connect learning choices with jobs, research, higher studies, or startup goals."],
    ["Timetable Planning", "Turn recommendations into a manageable weekly learning plan."],
    ["AI Academic Assistant", "Ask questions about courses, skills, schedules, and career directions."]
  ];
  return (
    <>
      <section className="simple-hero">
        <div className="hero-copy">
          <p className="eyebrow">Your Academic Guidance Platform</p>
          <h1>Plan your learning journey with confidence.</h1>
          <p className="lead">Share your goals and skills once. Course Advisor creates personalized course suggestions and a practical study plan for you.</p>
          <div className="hero-actions">
            <button className="big-dark" onClick={() => setAuthMode("signup")}>Get started</button>
            <button className="big-light" onClick={() => navigate("courses")}>View recommendations</button>
          </div>
        </div>
        <HeroAdvisor />
      </section>
      <section className="home-features">
        {features.map(([title, text], index) => <Feature key={title} title={title} text={text} index={index} />)}
      </section>
      <section className="guidance-band">
        <div>
          <p className="eyebrow">How It Helps</p>
          <h2>From student profile to a clear next step.</h2>
        </div>
        <div className="journey">
          <span>Complete your profile</span><span>Receive guidance</span><span>Build your timetable</span><span>Track readiness</span>
        </div>
      </section>
    </>
  );
}

function HeroAdvisor() {
  return (
    <div className="mentor-visual">
      <div className="mentor-top"><span className="pulse"></span><strong>Personal Plan Ready</strong></div>
      <div className="mentor-course"><small>Recommended next course</small><strong>Machine Learning</strong><p>Strong match for your skills and goals</p></div>
      <div className="mentor-row"><span><b>88%</b> Readiness</span><span><b>High</b> Career fit</span></div>
      <div className="mentor-bars"><i></i><i></i><i></i></div>
    </div>
  );
}

function Feature({ title, text, index }) {
  return (
    <article className={`home-feature tone-${index}`}>
      <span className="feature-icon">{["01", "02", "03", "04", "05"][index]}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function Onboarding({ initial, onComplete, onClose }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ ...blankProfile(), ...initial });
  const steps = ["Your Details", "Interests & Learning", "Skills & Results", "Career Plan"];
  const toggle = (field, item) => setData((current) => ({
    ...current,
    [field]: current[field].includes(item) ? current[field].filter((value) => value !== item) : [...current[field], item]
  }));
  const validStep = step !== 0 || (data.name.trim() && data.branch.trim());

  return (
    <div className="survey-overlay">
      <section className="survey">
        <div className="survey-head">
          <div><p className="eyebrow">Student Onboarding</p><h2>Help us personalize your guidance</h2></div>
          {onClose && <button className="survey-close" onClick={onClose}>x</button>}
        </div>
        <div className="survey-progress">
          {steps.map((title, index) => <span key={title} className={index <= step ? "current" : ""}>{index + 1}<small>{title}</small></span>)}
        </div>
        {step === 0 && (
          <div className="form-grid">
            <label>Student name<input value={data.name} onChange={(event) => setData({ ...data, name: event.target.value })} placeholder="Your full name" /></label>
            <label>Department / Branch<input value={data.branch} onChange={(event) => setData({ ...data, branch: event.target.value })} placeholder="CSE / AI & DS" /></label>
            <label>Current year<select value={data.year} onChange={(event) => setData({ ...data, year: event.target.value })}><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select></label>
            <label>CGPA <strong>{data.cgpa}</strong><input type="range" min="5" max="10" step="0.1" value={data.cgpa} onChange={(event) => setData({ ...data, cgpa: Number(event.target.value) })} /></label>
          </div>
        )}
        {step === 1 && (
          <>
            <FieldGroup title="Areas of interest"><div className="survey-options">{interests.map((interest) => <CheckChip key={interest} active={data.interests.includes(interest)} onClick={() => toggle("interests", interest)}>{interest}</CheckChip>)}</div></FieldGroup>
            <FieldGroup title="Previously completed courses"><div className="survey-options">{courseOptions.map(([id, name]) => <CheckChip key={id} active={data.completed.includes(id)} onClick={() => toggle("completed", id)}>{name}</CheckChip>)}</div></FieldGroup>
          </>
        )}
        {step === 2 && (
          <div className="survey-learning">
            <label>Certification names
              <textarea value={data.certificationsText} onChange={(event) => setData({ ...data, certificationsText: event.target.value })} placeholder="AWS Cloud Basics, Python Essentials (comma separated)" />
            </label>
            {data.completed.length > 0 && <FieldGroup title="Scores obtained">
              <div className="grade-grid">{data.completed.map((id) => <label key={id}>{id}<input type="number" min="0" max="100" value={data.grades[id] ?? ""} onChange={(event) => setData({ ...data, grades: { ...data.grades, [id]: Number(event.target.value) } })} placeholder="%" /></label>)}</div>
            </FieldGroup>}
            <FieldGroup title="Rate your existing technical skills">
              <div className="skill-sliders">{skillOptions.map((skill) => <label key={skill}><span>{skill}</span><input type="range" min="1" max="5" value={data.skills[skill]} onChange={(event) => setData({ ...data, skills: { ...data.skills, [skill]: Number(event.target.value) } })} /><strong>{data.skills[skill]}/5</strong></label>)}</div>
            </FieldGroup>
          </div>
        )}
        {step === 3 && (
          <>
            <FieldGroup title="Career goal"><div className="survey-options">{goals.map((goal) => <CheckChip key={goal} active={data.careerGoal === goal} onClick={() => setData({ ...data, careerGoal: goal })}>{goal}</CheckChip>)}</div></FieldGroup>
            <div className="study-hours"><label>Weekly study hours availability <strong>{data.studyHours} hours/week</strong><input type="range" min="3" max="25" value={data.studyHours} onChange={(event) => setData({ ...data, studyHours: Number(event.target.value) })} /></label></div>
          </>
        )}
        <div className="survey-actions">
          <button className="big-light" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
          {step < 3 ? <button className="big-dark" disabled={!validStep} onClick={() => setStep(step + 1)}>Continue</button> : <button className="big-dark" onClick={() => onComplete(data)}>Generate my guidance</button>}
        </div>
      </section>
    </div>
  );
}

function FieldGroup({ title, children }) {
  return <section className="field-group"><h3>{title}</h3>{children}</section>;
}

function CheckChip({ active, onClick, children }) {
  return <button className={active ? "checked" : ""} onClick={onClick}>{children}</button>;
}

function Dashboard({ profile, onEdit, navigate }) {
  const [data, setData] = useState(null);
  useEffect(() => { post("/dashboard", profile).then(setData).catch(() => setData({ error: true })); }, [profile]);
  if (!data) return <Loading />;
  if (data.error) return <EmptyState title="Dashboard unavailable" text="Please retry in a moment or update your survey details." />;
  return (
    <PageShell eyebrow="Student Dashboard" title={`${data.greeting}, here is your guidance.`} action={<button className="big-light" onClick={onEdit}>Update survey</button>}>
      <section className="dashboard-hero">
        <article className="highlight"><span>Overall readiness</span><strong>{data.successAverage}%</strong><p>Average success outlook across your recommended courses.</p></article>
        <InsightCard title="Recommended domains" items={data.recommendedDomains} />
        <InsightCard title="Skill strengths" items={data.strengths} />
        <InsightCard title="Weak areas to improve" items={data.weakAreas} />
      </section>
      <section className="dashboard-columns">
        <InsightCard title="Career suggestions" items={data.careerSuggestions} />
        <InsightCard title="Progress insights" items={data.progressInsights} />
        <article className="quick-actions">
          <h3>Continue your plan</h3>
          <button onClick={() => navigate("courses")}>View recommended courses</button>
          <button onClick={() => navigate("timetable")}>Open timetable plan</button>
        </article>
      </section>
    </PageShell>
  );
}

function InsightCard({ title, items }) {
  return <article className="insight-card"><h3>{title}</h3>{items.map((item) => <p key={item}>{item}</p>)}</article>;
}

function Recommendations({ profile }) {
  const [items, setItems] = useState(null);
  useEffect(() => { post("/recommend", profile).then(setItems).catch(() => setItems([])); }, [profile]);
  return (
    <PageShell eyebrow="Recommender Studio" title="Courses Ranked Through Your Interests, Skills, and Readiness">
      <section className="mentor-summary">
        <SimpleReason title="Interest Match" text="Your chosen subject areas shape the recommendations." />
        <SimpleReason title="Skill Readiness" text="Your completed learning and skill ratings are considered." />
        <SimpleReason title="Career Relevance" text={`Recommendations support your goal: ${profile.careerGoal}.`} />
      </section>
      <section className="course-results">
        {!items ? <Loading /> : items.length ? items.map((item, index) => <CourseRecommendation key={item.id} item={item} index={index} />) : <EmptyState title="No new courses found" text="Update your survey to explore more learning paths." />}
      </section>
      <HowItWorks />
    </PageShell>
  );
}

function SimpleReason({ title, text }) {
  return <article><h3>{title}</h3><p>{text}</p></article>;
}

function CourseRecommendation({ item, index }) {
  return (
    <article className="course-recommendation">
      <div className="course-rank">{String(index + 1).padStart(2, "0")}</div>
      <div className="course-info">
        <p className="domain">{item.domain}</p>
        <h3>{item.name}</h3>
        <p>{item.id} - {item.credits} credits</p>
        <div className="reason-list">{item.reasons.map((reason) => <p key={reason}>{reason}</p>)}</div>
        <div className="path-note"><strong>Recommended Learning Path</strong>{item.path}</div>
      </div>
      <div className="score-panel">
        <Progress label="Interest Match" value={item.interestMatch} />
        <Progress label="Skill Readiness" value={item.skillReadiness} />
        <Progress label="Success Probability" value={item.success} />
        <Progress label="Career Relevance" value={item.careerRelevance} />
      </div>
    </article>
  );
}

function Progress({ label, value }) {
  return <div className="progress"><span>{label}</span><strong>{value}%</strong><div><i style={{ width: `${value}%` }}></i></div></div>;
}

function HowItWorks() {
  const points = ["Checks your interests", "Reviews completed courses", "Analyzes study capacity and CGPA", "Estimates success probability", "Balances workload and career value", "Suggests suitable future courses"];
  return (
    <section className="how-works">
      <div><p className="eyebrow">How Recommendations Work</p><h2>A smart academic mentor for your next semester.</h2></div>
      <div className="how-list">{points.map((point) => <p key={point}>{point}</p>)}</div>
    </section>
  );
}

function Timetable({ profile }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { post("/timetable", profile).then(setRows).catch(() => setRows([])); }, [profile]);
  return (
    <PageShell eyebrow="Timetable Planning" title="A study plan based on your recommendations and availability.">
      <p className="page-lead">Planned around your available {profile.studyHours} study hours each week.</p>
      <section className="schedule-grid">
        {!rows ? <Loading /> : rows.length ? rows.map((row) => (
          <article key={row.code}>
            <p className="domain">{row.slot}</p><h3>{row.course}</h3><span>{row.code} - {row.mode}</span><strong>{row.hours}</strong><p>{row.focus}</p>
          </article>
        )) : <EmptyState title="No ready-to-start courses" text="Review prerequisite courses in Recommender Studio, then update your plan." />}
      </section>
    </PageShell>
  );
}

function Stats({ profile }) {
  const [data, setData] = useState(null);
  useEffect(() => { post("/dashboard", profile).then(setData).catch(() => setData({ error: true })); }, [profile]);
  if (!data) return <Loading />;
  if (data.error) return <EmptyState title="Insights unavailable" text="Please try again shortly." />;
  return (
    <PageShell eyebrow="Progress Insights" title="See your readiness at a glance.">
      <section className="stats-summary">
        <article><span>Average Success</span><strong>{data.successAverage}%</strong></article>
        <article><span>Primary Direction</span><strong>{data.recommendedDomains[0]}</strong></article>
        <article><span>Weekly Capacity</span><strong>{profile.studyHours} hrs</strong></article>
      </section>
      <section className="bars">{data.bars.map((bar) => <div key={bar.label}><span>{bar.label}</span><div><i style={{ width: `${bar.value}%` }}></i></div><strong>{bar.value}%</strong></div>)}</section>
    </PageShell>
  );
}

function Mapping() {
  const rows = [
    ["CO1", "Representing student needs", "The survey creates a structured profile of interests, skills and prior learning."],
    ["CO2", "Choosing relevant courses", "The recommender searches and prioritizes suitable future subjects."],
    ["CO3", "Planning without conflicts", "Timetable planning allocates manageable study sessions."],
    ["CO4", "Balanced decisions", "Courses are evaluated for value, effort and career alignment."],
    ["CO5", "Working with uncertainty", "Success probability estimates likely readiness from student evidence."],
    ["CO6", "Integrated guidance system", "React interface, advisor chat and dashboard form a complete platform."]
  ];
  return (
    <PageShell eyebrow="Course Outcome Mapping" title="How the project demonstrates AI foundations.">
      <section className="mapping">{rows.map(([co, title, text]) => <article key={co}><strong>{co}</strong><h3>{title}</h3><p>{text}</p></article>)}</section>
    </PageShell>
  );
}

function Chat() {
  const [messages, setMessages] = useState([{ role: "assistant", text: "Hello! I can help with your course plan, skills, timetable, or career direction." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, loading]);
  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setMessages((current) => [...current, { role: "user", text }]);
    setInput("");
    setLoading(true);
    const response = await post("/chat", { message: text }).catch(() => ({ reply: "I could not connect right now. Please try again." }));
    setMessages((current) => [...current, { role: "assistant", text: response.reply }]);
    setLoading(false);
  };
  return (
    <PageShell eyebrow="AI Academic Assistant" title="Ask about your study and career journey.">
      <section className="chat-shell">
        <div className="chat-messages">
          {messages.map((message, index) => <div className={`message ${message.role}`} key={index}><p>{message.text}</p></div>)}
          {loading && <div className="message assistant"><p>Thinking...</p></div>}<div ref={endRef} />
        </div>
        <div className="chat-input"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="Ask about courses, skills or timetable..." /><button onClick={send}>Send</button></div>
      </section>
    </PageShell>
  );
}

function PageShell({ eyebrow, title, action, children }) {
  return (
    <section className="page-shell">
      <div className="page-title"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>{action}</div>
      {children}
    </section>
  );
}

function Loading() {
  return <div className="loading">Preparing your personalized guidance...</div>;
}

function EmptyState({ title, text }) {
  return <article className="empty-state"><h3>{title}</h3><p>{text}</p></article>;
}

function AuthModal({ mode, setMode, onClose, onSuccess }) {
  const signUp = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const ready = email.trim() && password.trim() && (!signUp || name.trim());
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="auth-modal" onSubmit={(event) => { event.preventDefault(); if (ready) onSuccess(mode, { name, email }); }} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close" onClick={onClose}>x</button>
        <p className="eyebrow">{signUp ? "Create Account" : "Welcome Back"}</p>
        <h2>{signUp ? "Start your guidance journey" : "Sign in to continue"}</h2>
        {signUp && <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />}
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="University email" type="email" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" />
        <button type="submit" className="big-dark" disabled={!ready}>{signUp ? "Continue to survey" : "Sign in"}</button>
        <p>{signUp ? "Already registered? " : "New student? "}<button type="button" onClick={() => setMode(signUp ? "signin" : "signup")}>{signUp ? "Sign in" : "Create an account"}</button></p>
      </form>
    </div>
  );
}

function Footer() {
  return <footer><strong>Smart Course Advisor</strong><span>Personalized academic and career guidance for students</span></footer>;
}

async function post(path, body) {
  const response = await fetch(`${API}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

createRoot(document.getElementById("root")).render(<App />);

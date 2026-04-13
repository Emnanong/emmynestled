import { useState, useEffect, useRef } from "react";

const TABS = ["Home", "Feeding", "Sleep", "Diaper", "Mama", "Journal"];

const ICONS = {
  Home: "🏠", Feeding: "🍼", Sleep: "😴", Diaper: "🌿", Mama: "💗", Journal: "📓"
};

const pastelGradient = "linear-gradient(135deg, #fde8f0 0%, #fdf3e3 40%, #e8f4fd 100%)";

const cardStyle = {
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(12px)",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.9)",
  boxShadow: "0 4px 24px rgba(180,120,160,0.08)",
  padding: "20px",
  marginBottom: "14px",
};

const btnPrimary = {
  background: "linear-gradient(135deg, #f4a7c3, #f9d29d)",
  border: "none",
  borderRadius: "50px",
  color: "#fff",
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 700,
  fontSize: "15px",
  padding: "12px 28px",
  cursor: "pointer",
  letterSpacing: "0.3px",
  boxShadow: "0 4px 16px rgba(244,167,195,0.35)",
  transition: "transform 0.15s, box-shadow 0.15s",
};

const btnSmall = {
  ...btnPrimary,
  padding: "8px 18px",
  fontSize: "13px",
};

const btnOutline = {
  ...btnSmall,
  background: "rgba(255,255,255,0.6)",
  color: "#c97aa0",
  boxShadow: "0 2px 8px rgba(180,120,160,0.12)",
  border: "1.5px solid #f4a7c3",
};

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDate(date) {
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}
function elapsed(start) {
  const ms = Date.now() - start;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

// ---- HOME ----
function HomeTab({ feeding, sleep, diaper, babyName, babyAge }) {
  const lastFeed = feeding[0];
  const lastSleep = sleep[0];
  const lastDiaper = diaper[0];

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: "56px", marginBottom: "8px" }}>👶</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", color: "#b05880", margin: 0 }}>
          {babyName || "Your Baby"}
        </h2>
        <p style={{ color: "#c49ab0", fontSize: "13px", marginTop: "4px", fontFamily: "'Nunito', sans-serif" }}>
          {babyAge}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
        {[
          { label: "Last Feed", icon: "🍼", value: lastFeed ? `${formatTime(new Date(lastFeed.time))} · ${lastFeed.type}` : "No data yet" },
          { label: "Last Sleep", icon: "😴", value: lastSleep ? `${formatTime(new Date(lastSleep.start))} · ${lastSleep.duration || "ongoing"}` : "No data yet" },
          { label: "Last Diaper", icon: "🌿", value: lastDiaper ? `${formatTime(new Date(lastDiaper.time))} · ${lastDiaper.type}` : "No data yet" },
          { label: "Today's Feeds", icon: "📊", value: `${feeding.filter(f => new Date(f.time).toDateString() === new Date().toDateString()).length} times` },
        ].map(item => (
          <div key={item.label} style={{ ...cardStyle, padding: "16px", marginBottom: 0, textAlign: "center" }}>
            <div style={{ fontSize: "24px" }}>{item.icon}</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: "11px", color: "#c49ab0", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "4px" }}>{item.label}</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: "13px", color: "#7a4060", fontWeight: 600, marginTop: "4px" }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#b05880", marginTop: 0, fontSize: "16px" }}>💡 Today's Tip</h3>
        <p style={{ fontFamily: "'Nunito', sans-serif", color: "#7a4060", fontSize: "14px", margin: 0, lineHeight: "1.6" }}>
          Newborns typically need feeding every 2–3 hours. Watch for hunger cues like rooting, sucking motions, or hand-to-mouth movements — crying is a late hunger sign.
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#b05880", marginTop: 0, fontSize: "16px" }}>🌟 Milestones to Watch</h3>
        {[
          { wk: "Week 1–2", text: "Regains birth weight, cord stump falls off" },
          { wk: "Week 3–4", text: "First social smile, tracks faces" },
          { wk: "Month 2", text: "Coos, holds head briefly during tummy time" },
        ].map(m => (
          <div key={m.wk} style={{ display: "flex", gap: "12px", marginBottom: "8px", alignItems: "flex-start" }}>
            <span style={{ background: "linear-gradient(135deg,#f4a7c3,#f9d29d)", borderRadius: "8px", padding: "2px 8px", fontSize: "11px", fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>{m.wk}</span>
            <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: "13px", color: "#7a4060" }}>{m.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- FEEDING ----
function FeedingTab({ feeding, setFeeding }) {
  const [type, setType] = useState("Breast");
  const [side, setSide] = useState("Left");
  const [duration, setDuration] = useState("");
  const [amount, setAmount] = useState("");
  const [timer, setTimer] = useState(null);
  const [timerStart, setTimerStart] = useState(null);
  const [timerDisplay, setTimerDisplay] = useState("0m 0s");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timer) {
      intervalRef.current = setInterval(() => {
        setTimerDisplay(elapsed(timerStart));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timer]);

  const startTimer = () => { setTimerStart(Date.now()); setTimer(true); };
  const stopTimer = () => {
    const mins = Math.floor((Date.now() - timerStart) / 60000);
    setDuration(String(mins));
    setTimer(false);
    setTimerDisplay("0m 0s");
  };

  const logFeed = () => {
    const entry = { time: new Date().toISOString(), type, side: type === "Breast" ? side : null, duration: duration || null, amount: amount || null };
    setFeeding(prev => [entry, ...prev]);
    setDuration(""); setAmount("");
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#b05880", marginTop: 0 }}>Feeding Tracker</h2>

      <div style={cardStyle}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
          {["Breast", "Bottle", "Formula"].map(t => (
            <button key={t} onClick={() => setType(t)} style={type === t ? btnSmall : btnOutline}>{t}</button>
          ))}
        </div>

        {type === "Breast" && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            {["Left", "Right", "Both"].map(s => (
              <button key={s} onClick={() => setSide(s)} style={side === s ? btnSmall : btnOutline}>{s}</button>
            ))}
          </div>
        )}

        {type !== "Breast" && (
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontFamily: "'Nunito',sans-serif", fontSize: "13px", color: "#c49ab0", display: "block", marginBottom: "6px" }}>Amount (oz/ml)</label>
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 3oz" style={{ width: "100%", padding: "10px 14px", borderRadius: "12px", border: "1.5px solid #f4a7c3", fontFamily: "'Nunito',sans-serif", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>
        )}

        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontFamily: "'Nunito',sans-serif", fontSize: "13px", color: "#c49ab0", display: "block", marginBottom: "6px" }}>Duration (min)</label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="minutes" style={{ flex: 1, padding: "10px 14px", borderRadius: "12px", border: "1.5px solid #f4a7c3", fontFamily: "'Nunito',sans-serif", fontSize: "14px", outline: "none" }} />
            {!timer
              ? <button onClick={startTimer} style={btnSmall}>⏱ Start</button>
              : <button onClick={stopTimer} style={{ ...btnSmall, background: "linear-gradient(135deg,#f4a7c3,#f9d29d)" }}>⏹ Stop · {timerDisplay}</button>
            }
          </div>
        </div>

        <button onClick={logFeed} style={btnPrimary}>Log Feeding</button>
      </div>

      <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#b05880", fontSize: "16px" }}>Recent Feedings</h3>
      {feeding.length === 0 && <p style={{ fontFamily: "'Nunito',sans-serif", color: "#c49ab0", textAlign: "center" }}>No feedings logged yet.</p>}
      {feeding.slice(0, 8).map((f, i) => (
        <div key={i} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: "#b05880", fontSize: "15px" }}>{f.type}{f.side ? ` · ${f.side}` : ""}</div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: "12px", color: "#c49ab0" }}>{formatDate(new Date(f.time))} at {formatTime(new Date(f.time))}</div>
          </div>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: "13px", color: "#7a4060", textAlign: "right" }}>
            {f.duration && <div>{f.duration} min</div>}
            {f.amount && <div>{f.amount}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- SLEEP ----
function SleepTab({ sleep, setSleep }) {
  const [sleeping, setSleeping] = useState(false);
  const [sleepStart, setSleepStart] = useState(null);
  const [display, setDisplay] = useState("0m 0s");
  const [note, setNote] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (sleeping) {
      intervalRef.current = setInterval(() => setDisplay(elapsed(sleepStart)), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [sleeping]);

  const startSleep = () => { setSleepStart(Date.now()); setSleeping(true); };
  const endSleep = () => {
    const dur = Math.floor((Date.now() - sleepStart) / 60000);
    setSleep(prev => [{ start: new Date(sleepStart).toISOString(), duration: `${dur} min`, note }, ...prev]);
    setSleeping(false); setNote(""); setDisplay("0m 0s");
  };

  const totalToday = sleep
    .filter(s => new Date(s.start).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + parseInt(s.duration), 0);

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#b05880", marginTop: 0 }}>Sleep Tracker</h2>

      <div style={{ ...cardStyle, textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "8px" }}>{sleeping ? "😴" : "🌙"}</div>
        {sleeping ? (
          <>
            <p style={{ fontFamily: "'Nunito',sans-serif", color: "#b05880", fontWeight: 700, fontSize: "22px", margin: "0 0 12px" }}>{display}</p>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optional)" style={{ width: "100%", padding: "10px 14px", borderRadius: "12px", border: "1.5px solid #f4a7c3", marginBottom: "12px", fontFamily: "'Nunito',sans-serif", boxSizing: "border-box", outline: "none" }} />
            <button onClick={endSleep} style={btnPrimary}>Wake Up 🌤</button>
          </>
        ) : (
          <>
            <p style={{ fontFamily: "'Nunito',sans-serif", color: "#c49ab0", marginBottom: "16px" }}>Tap to start tracking a sleep session</p>
            <button onClick={startSleep} style={btnPrimary}>Baby is Sleeping 😴</button>
          </>
        )}
      </div>

      <div style={{ ...cardStyle, display: "flex", justifyContent: "space-around", textAlign: "center" }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "24px", color: "#b05880" }}>{totalToday}</div>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: "11px", color: "#c49ab0" }}>MIN TODAY</div>
        </div>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "24px", color: "#b05880" }}>{sleep.filter(s => new Date(s.start).toDateString() === new Date().toDateString()).length}</div>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: "11px", color: "#c49ab0" }}>NAPS TODAY</div>
        </div>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "24px", color: "#b05880" }}>14–17</div>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: "11px", color: "#c49ab0" }}>GOAL HRS</div>
        </div>
      </div>

      <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#b05880", fontSize: "16px" }}>Sleep Log</h3>
      {sleep.length === 0 && <p style={{ fontFamily: "'Nunito',sans-serif", color: "#c49ab0", textAlign: "center" }}>No sleep sessions yet.</p>}
      {sleep.slice(0, 6).map((s, i) => (
        <div key={i} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: "#b05880" }}>😴 {s.duration}</div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: "12px", color: "#c49ab0" }}>{formatDate(new Date(s.start))} at {formatTime(new Date(s.start))}</div>
          </div>
          {s.note && <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: "12px", color: "#7a4060", maxWidth: "120px", textAlign: "right" }}>{s.note}</div>}
        </div>
      ))}
    </div>
  );
}

// ---- DIAPER ----
function DiaperTab({ diaper, setDiaper }) {
  const [type, setType] = useState("Wet");
  const [color, setColor] = useState("Yellow");
  const [note, setNote] = useState("");

  const logDiaper = () => {
    setDiaper(prev => [{ time: new Date().toISOString(), type, color: type !== "Wet" ? color : null, note }, ...prev]);
    setNote("");
  };

  const todayCount = diaper.filter(d => new Date(d.time).toDateString() === new Date().toDateString()).length;

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#b05880", marginTop: 0 }}>Diaper Tracker</h2>

      <div style={{ ...cardStyle, display: "flex", justifyContent: "space-around", textAlign: "center", marginBottom: "16px" }}>
        {[
          { label: "Today", val: todayCount, icon: "🌿" },
          { label: "Wet", val: diaper.filter(d => d.type === "Wet" && new Date(d.time).toDateString() === new Date().toDateString()).length, icon: "💧" },
          { label: "Dirty", val: diaper.filter(d => d.type === "Dirty" && new Date(d.time).toDateString() === new Date().toDateString()).length, icon: "💩" },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: "22px" }}>{s.icon}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", color: "#b05880" }}>{s.val}</div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: "11px", color: "#c49ab0" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          {["Wet", "Dirty", "Both"].map(t => (
            <button key={t} onClick={() => setType(t)} style={type === t ? btnSmall : btnOutline}>{t}</button>
          ))}
        </div>
        {type !== "Wet" && (
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontFamily: "'Nunito',sans-serif", fontSize: "13px", color: "#c49ab0", display: "block", marginBottom: "6px" }}>Stool Color</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["Yellow", "Green", "Brown", "Black", "Orange"].map(c => (
                <button key={c} onClick={() => setColor(c)} style={color === c ? btnSmall : btnOutline}>{c}</button>
              ))}
            </div>
          </div>
        )}
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Notes (optional)" style={{ width: "100%", padding: "10px 14px", borderRadius: "12px", border: "1.5px solid #f4a7c3", marginBottom: "12px", fontFamily: "'Nunito',sans-serif", boxSizing: "border-box", outline: "none" }} />
        <button onClick={logDiaper} style={btnPrimary}>Log Diaper Change</button>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", color: "#b05880", marginTop: 0, fontSize: "15px" }}>🩺 What's Normal?</h3>
        <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: "13px", color: "#7a4060", margin: 0, lineHeight: "1.6" }}>
          Newborns typically have 6–8 wet diapers and 3–4 dirty diapers per day after milk comes in. Black/tarry stools (meconium) are normal in first 1–2 days. Call your doctor for red, white, or gray stool.
        </p>
      </div>

      <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#b05880", fontSize: "16px" }}>Recent Changes</h3>
      {diaper.slice(0, 6).map((d, i) => (
        <div key={i} style={{ ...cardStyle, display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: "#b05880" }}>{d.type === "Wet" ? "💧" : "💩"} {d.type}{d.color ? ` · ${d.color}` : ""}</div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: "12px", color: "#c49ab0" }}>{formatDate(new Date(d.time))} at {formatTime(new Date(d.time))}</div>
          </div>
          {d.note && <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: "12px", color: "#7a4060" }}>{d.note}</div>}
        </div>
      ))}
    </div>
  );
}

// ---- MAMA ----
function MamaTab() {
  const [mood, setMood] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [moodLog, setMoodLog] = useState([]);

  const toggleSymptom = s => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const logMood = () => {
    if (!mood) return;
    setMoodLog(prev => [{ time: new Date().toISOString(), mood, symptoms: [...symptoms] }, ...prev]);
    setMood(null); setSymptoms([]);
  };

  const postpartumSymptoms = ["Fatigue", "Sore nipples", "Cramping", "Mood swings", "Anxiety", "Headache", "Night sweats", "Perineal pain", "Hair loss"];

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#b05880", marginTop: 0 }}>Mama Wellness</h2>

      <div style={cardStyle}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", color: "#b05880", marginTop: 0, fontSize: "16px" }}>How are you feeling? 💗</h3>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "16px", fontSize: "32px" }}>
          {["😊", "😐", "😢", "😰", "😤"].map(m => (
            <span key={m} onClick={() => setMood(m)} style={{ cursor: "pointer", opacity: mood === m ? 1 : 0.4, transform: mood === m ? "scale(1.3)" : "scale(1)", transition: "all 0.2s" }}>{m}</span>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
          {postpartumSymptoms.map(s => (
            <button key={s} onClick={() => toggleSymptom(s)} style={symptoms.includes(s) ? btnSmall : btnOutline}>{s}</button>
          ))}
        </div>
        <button onClick={logMood} style={btnPrimary}>Log Wellness Check</button>
      </div>

      {[
        {
          title: "🩹 Postpartum Recovery Tips",
          items: [
            "Rest when baby rests — sleep deprivation is real",
            "Sitz baths help with perineal healing",
            "Drink plenty of water, especially if breastfeeding",
            "Accept help from family and friends",
            "Your 6-week check-up is important — don't skip it",
          ]
        },
        {
          title: "💛 Mental Health Matters",
          items: [
            "Baby blues (first 2 weeks) are common — tears, mood swings",
            "Postpartum depression affects 1 in 7 mothers",
            "Symptoms: persistent sadness, anxiety, difficulty bonding",
            "Talk to your doctor — PPD is treatable",
            "You are not alone 💗",
          ]
        },
        {
          title: "🥗 Nutrition & Recovery",
          items: [
            "Iron-rich foods help rebuild blood levels",
            "Omega-3s support mood and brain recovery",
            "Breastfeeding moms need ~500 extra calories/day",
            "Continue prenatal vitamins for 3–6 months postpartum",
          ]
        }
      ].map(section => (
        <div key={section.title} style={cardStyle}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", color: "#b05880", marginTop: 0, fontSize: "15px" }}>{section.title}</h3>
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {section.items.map(item => (
              <li key={item} style={{ fontFamily: "'Nunito',sans-serif", fontSize: "13px", color: "#7a4060", lineHeight: "1.7" }}>{item}</li>
            ))}
          </ul>
        </div>
      ))}

      {moodLog.length > 0 && (
        <>
          <h3 style={{ fontFamily: "'Playfair Display',serif", color: "#b05880", fontSize: "15px" }}>Recent Check-ins</h3>
          {moodLog.slice(0, 4).map((m, i) => (
            <div key={i} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "28px" }}>{m.mood}</span>
              <div>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: "12px", color: "#c49ab0" }}>{formatDate(new Date(m.time))} at {formatTime(new Date(m.time))}</div>
                {m.symptoms.length > 0 && <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: "12px", color: "#7a4060" }}>{m.symptoms.join(", ")}</div>}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ---- JOURNAL ----
function JournalTab() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [mood, setMood] = useState("💗");

  const addEntry = () => {
    if (!text.trim()) return;
    setEntries(prev => [{ time: new Date().toISOString(), text, mood }, ...prev]);
    setText("");
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#b05880", marginTop: 0 }}>Baby Journal</h2>

      <div style={cardStyle}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px", justifyContent: "center", fontSize: "24px" }}>
          {["💗", "🌟", "😂", "😢", "🎉", "🌙"].map(m => (
            <span key={m} onClick={() => setMood(m)} style={{ cursor: "pointer", opacity: mood === m ? 1 : 0.4, transition: "opacity 0.2s" }}>{m}</span>
          ))}
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Capture a precious moment, milestone, or thought… ✨" rows={4} style={{ width: "100%", padding: "12px 14px", borderRadius: "14px", border: "1.5px solid #f4a7c3", fontFamily: "'Nunito',sans-serif", fontSize: "14px", resize: "none", outline: "none", boxSizing: "border-box", color: "#7a4060" }} />
        <button onClick={addEntry} style={{ ...btnPrimary, marginTop: "10px" }}>Save Memory ✨</button>
      </div>

      {entries.length === 0 && (
        <div style={{ textAlign: "center", padding: "30px 0", color: "#c49ab0", fontFamily: "'Nunito',sans-serif" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>📓</div>
          <p>Your memories will live here.<br />Start capturing the magic.</p>
        </div>
      )}

      {entries.map((e, i) => (
        <div key={i} style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "22px" }}>{e.mood}</span>
            <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: "12px", color: "#c49ab0" }}>{formatDate(new Date(e.time))} · {formatTime(new Date(e.time))}</span>
          </div>
          <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: "14px", color: "#7a4060", margin: 0, lineHeight: "1.6" }}>{e.text}</p>
        </div>
      ))}
    </div>
  );
}

// ---- SETUP ----
function SetupScreen({ onDone }) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: pastelGradient, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", fontFamily: "'Nunito',sans-serif" }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🌸</div>
      <h1 style={{ fontFamily: "'Playfair Display',serif", color: "#b05880", fontSize: "28px", margin: "0 0 8px", textAlign: "center" }}>Welcome to EmmyNestled</h1>
      <p style={{ color: "#c49ab0", fontSize: "15px", marginBottom: "32px", textAlign: "center" }}>Your gentle companion for newborn & postpartum care.</p>

      <div style={{ width: "100%", maxWidth: "380px" }}>
        <label style={{ display: "block", marginBottom: "6px", color: "#c49ab0", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Baby's Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Luna" style={{ width: "100%", padding: "14px 16px", borderRadius: "14px", border: "1.5px solid #f4a7c3", fontSize: "16px", marginBottom: "20px", fontFamily: "'Nunito',sans-serif", outline: "none", boxSizing: "border-box" }} />

        <label style={{ display: "block", marginBottom: "6px", color: "#c49ab0", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Date of Birth</label>
        <input type="date" value={dob} onChange={e => setDob(e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: "14px", border: "1.5px solid #f4a7c3", fontSize: "16px", marginBottom: "28px", fontFamily: "'Nunito',sans-serif", outline: "none", boxSizing: "border-box" }} />

        <button onClick={() => onDone(name || "Baby", dob)} style={{ ...btnPrimary, width: "100%", padding: "16px" }}>Get Started 🌸</button>
      </div>
    </div>
  );
}

// ---- MAIN APP ----
export default function App() {
  const [setup, setSetup] = useState(true);
  const [babyName, setBabyName] = useState("Baby");
  const [babyDOB, setBabyDOB] = useState("");
  const [activeTab, setActiveTab] = useState("Home");
  const [feeding, setFeeding] = useState([]);
  const [sleep, setSleep] = useState([]);
  const [diaper, setDiaper] = useState([]);

  const getBabyAge = () => {
    if (!babyDOB) return "Newborn";
    const diff = Date.now() - new Date(babyDOB).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 7) return `${days} day${days !== 1 ? "s" : ""} old`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? "s" : ""} old`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? "s" : ""} old`;
  };

  if (setup) return <SetupScreen onDone={(n, d) => { setBabyName(n); setBabyDOB(d); setSetup(false); }} />;

  const renderTab = () => {
    switch (activeTab) {
      case "Home": return <HomeTab feeding={feeding} sleep={sleep} diaper={diaper} babyName={babyName} babyAge={getBabyAge()} />;
      case "Feeding": return <FeedingTab feeding={feeding} setFeeding={setFeeding} />;
      case "Sleep": return <SleepTab sleep={sleep} setSleep={setSleep} />;
      case "Diaper": return <DiaperTab diaper={diaper} setDiaper={setDiaper} />;
      case "Mama": return <MamaTab />;
      case "Journal": return <JournalTab />;
      default: return null;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Nunito:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #f4a7c3; border-radius: 4px; }
      `}</style>
      <div style={{ minHeight: "100vh", background: pastelGradient, fontFamily: "'Nunito',sans-serif" }}>
        {/* Header */}
        <div style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", padding: "16px 20px", borderBottom: "1px solid rgba(244,167,195,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", color: "#b05880", fontWeight: 700 }}>🌸 EmmyNestled</div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: "12px", color: "#c49ab0" }}>{babyName} · {getBabyAge()}</div>
          </div>
          <div style={{ fontSize: "22px" }}>👶</div>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 16px 100px", maxWidth: "480px", margin: "0 auto" }}>
          {renderTab()}
        </div>

        {/* Bottom Nav */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(244,167,195,0.2)", display: "flex", justifyContent: "space-around", padding: "8px 0 12px", zIndex: 10 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", opacity: activeTab === tab ? 1 : 0.45, transition: "opacity 0.2s, transform 0.15s", transform: activeTab === tab ? "translateY(-2px)" : "none" }}>
              <span style={{ fontSize: "22px" }}>{ICONS[tab]}</span>
              <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: "10px", fontWeight: 700, color: "#b05880", textTransform: "uppercase", letterSpacing: "0.4px" }}>{tab}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
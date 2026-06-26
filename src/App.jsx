import { useState, useEffect, useRef, useCallback } from "react";

// ===== CONSTANTS =====
const ICONS = ["🐶","🐱","🐰","🐻","🐼","🦊","🐸","🐨","🦁","🐯"];
const MAX_PLAYERS = 6;
const REWARD_THEMES = ["house","farm","aquarium"];

const DIFFICULTY_MAP = {
  "やさしい":   { label:"1〜2年生", color:"#4CAF50", bg:"#E8F5E9" },
  "ふつう":     { label:"3〜4年生", color:"#FF9800", bg:"#FFF3E0" },
  "むずかしい": { label:"5〜6年生", color:"#E91E63", bg:"#FCE4EC" },
};

const REWARD_LEVELS = {
  house: [
    { emoji:"⛺", name:"テント",         desc:"テントができた！" },
    { emoji:"🏠", name:"小さいおうち",   desc:"おうちができた！" },
    { emoji:"🪟", name:"まどが増えた",   desc:"まどが増えた！" },
    { emoji:"🌳", name:"庭に木が生えた", desc:"お庭に木が生えた！" },
    { emoji:"🌸", name:"お花が咲いた",   desc:"お花が咲いた！" },
    { emoji:"🏊", name:"プールができた", desc:"プールができた！" },
    { emoji:"🏡", name:"大きなおうち",   desc:"大きなおうちになった！" },
    { emoji:"🎠", name:"遊園地ができた", desc:"遊園地ができた！" },
    { emoji:"🏯", name:"お城になった！", desc:"お城になった！すごい！" },
  ],
  farm: [
    { emoji:"🌱", name:"芽が出た",        desc:"芽が出た！" },
    { emoji:"🥕", name:"にんじんが育った",desc:"にんじんが育った！" },
    { emoji:"🐔", name:"ニワトリが来た",  desc:"ニワトリが来た！" },
    { emoji:"🐄", name:"ウシが来た",      desc:"ウシが来た！" },
    { emoji:"🌽", name:"とうもろこし畑",  desc:"とうもろこし畑ができた！" },
    { emoji:"🐷", name:"ブタが来た",      desc:"ブタが来た！" },
    { emoji:"🚜", name:"トラクターが来た",desc:"トラクターが来た！" },
    { emoji:"🌻", name:"ひまわり畑",      desc:"ひまわり畑ができた！" },
    { emoji:"🏆", name:"スーパー農場！",  desc:"スーパー農場のかんせい！" },
  ],
  aquarium: [
    { emoji:"🐠", name:"クマノミが来た",  desc:"クマノミが来た！" },
    { emoji:"🐙", name:"タコが来た",      desc:"タコが来た！" },
    { emoji:"🦈", name:"サメが来た",      desc:"サメが来た！" },
    { emoji:"🐬", name:"イルカが来た",    desc:"イルカが来た！" },
    { emoji:"🐋", name:"クジラが来た",    desc:"クジラが来た！" },
    { emoji:"🦭", name:"アザラシが来た",  desc:"アザラシが来た！" },
    { emoji:"🐡", name:"フグが来た",      desc:"フグが来た！" },
    { emoji:"🦑", name:"イカが来た",      desc:"イカが来た！" },
    { emoji:"🌊", name:"大水族館かんせい！",desc:"大水族館のかんせい！" },
  ],
};

const THEME_LABEL = { house:"🏠 マイホーム", farm:"🌾 マイ農場", aquarium:"🐠 マイ水族館" };
const THEME_BG    = { house:"linear-gradient(135deg,#e0f7fa,#fff9c4)", farm:"linear-gradient(135deg,#f1f8e9,#fff8e1)", aquarium:"linear-gradient(135deg,#e3f2fd,#e8eaf6)" };
const THEME_EMOJI = { house:"🏠", farm:"🌾", aquarium:"🐠" };

function getDifficulty(age) {
  const n = parseInt(age);
  if (n <= 8)  return "やさしい";
  if (n <= 10) return "ふつう";
  return "むずかしい";
}

function newRewardData() {
  const theme = REWARD_THEMES[Math.floor(Math.random() * REWARD_THEMES.length)];
  return { theme, danCounts:{1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0}, cleared:0 };
}

// ===== PARTICLES =====
function Particles({ active }) {
  const [ps, setPs] = useState([]);
  useEffect(() => {
    if (!active) return;
    setPs(Array.from({length:18},(_,i)=>({
      id:i, x:Math.random()*100, y:Math.random()*40+10,
      e:["⭐","🌟","✨","🎉","🎊","💫"][Math.floor(Math.random()*6)],
      d:Math.random()*0.5, t:0.8+Math.random()*0.6,
    })));
    const id = setTimeout(()=>setPs([]),2000);
    return ()=>clearTimeout(id);
  },[active]);
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999}}>
      {ps.map(p=>(
        <div key={p.id} style={{position:"absolute",left:`${p.x}%`,top:`${p.y}%`,fontSize:"2rem",animation:`fall ${p.t}s ease-in ${p.d}s both`}}>{p.e}</div>
      ))}
      <style>{`@keyframes fall{0%{opacity:1;transform:translateY(-30px) scale(1)}100%{opacity:0;transform:translateY(120px) scale(0.5)}}`}</style>
    </div>
  );
}

// ===== REWARD POPUP =====
function RewardPopup({ theme, level, onClose }) {
  const info = REWARD_LEVELS[theme][level-1];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10000}}>
      <div style={{background:"#fff",borderRadius:"2rem",padding:"2.5rem 2rem",textAlign:"center",maxWidth:"320px",width:"90%",boxShadow:"0 12px 40px rgba(0,0,0,0.25)",animation:"popIn 0.4s cubic-bezier(.34,1.56,.64,1)"}}>
        <style>{`@keyframes popIn{0%{transform:scale(0.5);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
        <div style={{fontSize:"0.95rem",color:"#888",marginBottom:"0.3rem"}}>🎉 ごほうびゲット！</div>
        <div style={{fontSize:"5rem",margin:"0.5rem 0"}}>{info.emoji}</div>
        <div style={{fontSize:"1.5rem",fontWeight:900,color:"#5C6BC0",marginBottom:"0.4rem"}}>{info.name}</div>
        <div style={{fontSize:"1rem",color:"#666",marginBottom:"1.5rem"}}>{info.desc}</div>
        <button onClick={onClose} style={{padding:"0.8rem 2rem",background:"linear-gradient(135deg,#667eea,#764ba2)",color:"#fff",border:"none",borderRadius:"1.5rem",fontSize:"1.1rem",fontWeight:700,cursor:"pointer"}}>
          やった！✨
        </button>
      </div>
    </div>
  );
}

// ===== TOP PAGE =====
function TopPage({ onNext }) {
  const [name, setName] = useState("");
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#74ebd5,#ACB6E5)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Sans JP',sans-serif",padding:"1rem"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
        @keyframes bounce{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-18px) rotate(3deg)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .land-title{animation:bounce 1.8s ease-in-out infinite}
        .star-deco{animation:spin 4s linear infinite;display:inline-block}
        input::placeholder{color:#aaa}
      `}</style>
      <div style={{textAlign:"center",marginBottom:"2rem"}}>
        <div className="land-title" style={{fontSize:"3.5rem",fontWeight:900,color:"#fff",textShadow:"3px 3px 0 #F48FB1,6px 6px 0 #CE93D8",letterSpacing:"0.05em"}}>
          <span className="star-deco">⭐</span> かけ算ランド <span className="star-deco">⭐</span>
        </div>
        <div style={{fontSize:"1.1rem",color:"#ffffffcc",marginTop:"0.5rem"}}>たのしく　かけ算を　れんしゅうしよう！</div>
      </div>
      <div style={{background:"#ffffffee",borderRadius:"2rem",padding:"2rem 2.5rem",boxShadow:"0 8px 32px rgba(0,0,0,0.15)",width:"100%",maxWidth:"380px",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"0.5rem"}}>🏰</div>
        <div style={{fontSize:"1.2rem",fontWeight:700,color:"#5C6BC0",marginBottom:"1rem"}}>なまえを　いれてね！</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="なまえ" maxLength={10}
          style={{width:"100%",padding:"0.8rem 1rem",fontSize:"1.3rem",borderRadius:"1rem",border:"3px solid #CE93D8",outline:"none",textAlign:"center",fontFamily:"inherit",boxSizing:"border-box",color:"#333"}} />
        <button onClick={()=>name.trim()&&onNext(name.trim())} disabled={!name.trim()}
          style={{marginTop:"1.5rem",width:"100%",padding:"0.9rem",background:name.trim()?"linear-gradient(135deg,#F06292,#CE93D8)":"#ccc",color:"#fff",border:"none",borderRadius:"1.5rem",fontSize:"1.3rem",fontWeight:700,cursor:name.trim()?"pointer":"not-allowed",transition:"all 0.2s"}}>
          つぎへ　→
        </button>
      </div>
    </div>
  );
}

// ===== ICON SELECT PAGE =====
function IconSelectPage({ name, onNext }) {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#FDDB92,#D1FDFF)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Sans JP',sans-serif",padding:"1rem"}}>
      <div style={{background:"#ffffffee",borderRadius:"2rem",padding:"1.5rem 1.2rem",width:"100%",maxWidth:"420px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",textAlign:"center"}}>
        <div style={{fontSize:"1.5rem",fontWeight:700,color:"#5C6BC0",marginBottom:"0.3rem"}}>{name}さん、こんにちは！</div>
        <div style={{fontSize:"1.1rem",color:"#666",marginBottom:"1.5rem"}}>すきな　アイコンを　えらんでね 🎨</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"0.5rem",marginBottom:"1.5rem"}}>
          {ICONS.map((icon,i)=>(
            <button key={i} onClick={()=>setSelected(icon)}
              style={{fontSize:"1.8rem",background:selected===icon?"#F8BBD9":"#f5f5f5",border:selected===icon?"3px solid #F06292":"3px solid transparent",borderRadius:"1rem",padding:"0.5rem 0.2rem",cursor:"pointer",transform:selected===icon?"scale(1.1)":"scale(1)",transition:"all 0.15s",lineHeight:1,minWidth:0}}>
              {icon}
            </button>
          ))}
        </div>
        <button onClick={()=>selected&&onNext(selected)} disabled={!selected}
          style={{width:"100%",padding:"0.9rem",background:selected?"linear-gradient(135deg,#43E97B,#38F9D7)":"#ccc",color:"#fff",border:"none",borderRadius:"1.5rem",fontSize:"1.3rem",fontWeight:700,cursor:selected?"pointer":"not-allowed"}}>
          これにする！ ✓
        </button>
      </div>
    </div>
  );
}

// ===== AGE PAGE =====
function AgePage({ name, icon, onNext }) {
  const [age, setAge] = useState("");
  const diff = age ? getDifficulty(age) : null;
  const diffInfo = diff ? DIFFICULTY_MAP[diff] : null;
  const valid = age && parseInt(age)>=6 && parseInt(age)<=12;
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#a8edea,#fed6e3)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Sans JP',sans-serif",padding:"1rem"}}>
      <div style={{background:"#ffffffee",borderRadius:"2rem",padding:"2rem",width:"100%",maxWidth:"380px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",textAlign:"center"}}>
        <div style={{fontSize:"4rem"}}>{icon}</div>
        <div style={{fontSize:"1.3rem",fontWeight:700,color:"#5C6BC0",margin:"0.5rem 0 1rem"}}>{name}さんは　なんさい？</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem",marginBottom:"0.8rem"}}>
          <div style={{width:"100px",padding:"0.6rem",fontSize:"2rem",fontWeight:900,borderRadius:"1rem",border:"3px solid #90CAF9",background:"#fafafa",textAlign:"center",color:"#333",minHeight:"3rem"}}>
            {age||<span style={{color:"#ccc",fontSize:"1.5rem"}}>？</span>}
          </div>
          <span style={{fontSize:"1.3rem",color:"#666"}}>さい</span>
        </div>
        {diffInfo&&<div style={{background:diffInfo.bg,border:`2px solid ${diffInfo.color}`,borderRadius:"1rem",padding:"0.6rem",marginBottom:"0.8rem",fontSize:"1rem",color:diffInfo.color,fontWeight:700}}>{diffInfo.label} → 難易度：{diff} ⭐</div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.5rem",maxWidth:"240px",margin:"0 auto 1rem"}}>
          {[7,8,9,4,5,6,1,2,3].map(n=>(
            <button key={n} onClick={()=>setAge(a=>a.length<2?a+String(n):a)}
              style={{padding:"0.8rem",fontSize:"1.5rem",fontWeight:700,background:"linear-gradient(135deg,#e3f2fd,#bbdefb)",color:"#1565C0",border:"none",borderRadius:"0.8rem",cursor:"pointer",boxShadow:"0 3px 6px rgba(0,0,0,0.1)"}}>
              {n}
            </button>
          ))}
          <button onClick={()=>setAge(a=>a.length<2?a+"0":a)} style={{padding:"0.8rem",fontSize:"1.5rem",fontWeight:700,background:"linear-gradient(135deg,#e3f2fd,#bbdefb)",color:"#1565C0",border:"none",borderRadius:"0.8rem",cursor:"pointer",boxShadow:"0 3px 6px rgba(0,0,0,0.1)"}}>0</button>
          <button onClick={()=>setAge(a=>a.slice(0,-1))} style={{padding:"0.8rem",fontSize:"1.2rem",fontWeight:700,background:"linear-gradient(135deg,#fff3e0,#ffe0b2)",color:"#E65100",border:"none",borderRadius:"0.8rem",cursor:"pointer",boxShadow:"0 3px 6px rgba(0,0,0,0.1)"}}>⌫</button>
          <button onClick={()=>valid&&onNext(parseInt(age))} disabled={!valid}
            style={{padding:"0.8rem",fontSize:"1rem",fontWeight:700,background:valid?"linear-gradient(135deg,#667eea,#764ba2)":"#ccc",color:"#fff",border:"none",borderRadius:"0.8rem",cursor:valid?"pointer":"not-allowed"}}>✓</button>
        </div>
        {age&&!valid&&<div style={{color:"#F44336",fontSize:"0.85rem"}}>6〜12さいで　いれてね</div>}
      </div>
    </div>
  );
}

// ===== PLAYER CARD =====
function PlayerCard({ player, idx, rd, onPlay, onReward }) {
  const diff = getDifficulty(player.age);
  const info = DIFFICULTY_MAP[diff];
  const cleared = rd?.cleared||0;
  const theme = rd?.theme;
  return (
    <div style={{background:"#fff",borderRadius:"1.5rem",padding:"1.2rem",boxShadow:"0 4px 16px rgba(0,0,0,0.1)",border:`3px solid ${info.color}`,display:"flex",flexDirection:"column",alignItems:"center",gap:"0.4rem"}}>
      <div style={{fontSize:"3rem"}}>{player.icon}</div>
      <div style={{fontWeight:700,fontSize:"1.1rem",color:"#333"}}>{player.name}</div>
      <div style={{fontSize:"0.9rem",color:"#666"}}>{player.age}さい</div>
      <div style={{background:info.bg,color:info.color,borderRadius:"0.8rem",padding:"0.3rem 0.8rem",fontSize:"0.85rem",fontWeight:700}}>{diff}</div>
      <div onClick={()=>onPlay(player,idx)} style={{width:"100%",textAlign:"center",background:"linear-gradient(135deg,#667eea,#764ba2)",color:"#fff",borderRadius:"1rem",padding:"0.5rem",fontSize:"0.9rem",fontWeight:700,cursor:"pointer",marginTop:"0.2rem"}}>
        ▶ れんしゅうする
      </div>
      {theme&&(
        <div onClick={()=>onReward(idx)} style={{width:"100%",textAlign:"center",background:"linear-gradient(135deg,#f9ca24,#f0932b)",color:"#fff",borderRadius:"1rem",padding:"0.4rem",fontSize:"0.85rem",fontWeight:700,cursor:"pointer"}}>
          {THEME_EMOJI[theme]} {cleared}/9
        </div>
      )}
    </div>
  );
}

// ===== HOME PAGE =====
function HomePage({ players, rewards, onAddPlayer, onPlay, onReward }) {
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#667eea,#764ba2)",fontFamily:"'Noto Sans JP',sans-serif",padding:"1.5rem"}}>
      <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
        <div style={{fontSize:"2.5rem",fontWeight:900,color:"#fff",textShadow:"2px 2px 0 rgba(0,0,0,0.2)"}}>⭐ かけ算ランド ⭐</div>
        <div style={{color:"#ffffffaa",fontSize:"0.95rem",marginTop:"0.3rem"}}>だれがれんしゅうする？</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"1rem",maxWidth:"600px",margin:"0 auto 1.5rem"}}>
        {players.map((p,i)=><PlayerCard key={i} player={p} idx={i} rd={rewards[i]} onPlay={onPlay} onReward={onReward}/>)}
        {players.length<MAX_PLAYERS&&(
          <div onClick={onAddPlayer}
            style={{background:"rgba(255,255,255,0.15)",borderRadius:"1.5rem",border:"3px dashed rgba(255,255,255,0.5)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"0.5rem",cursor:"pointer",minHeight:"160px",color:"#fff",padding:"1rem"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}>
            <div style={{fontSize:"2.5rem"}}>➕</div>
            <div style={{fontWeight:700,fontSize:"0.95rem",textAlign:"center"}}>ともだちを<br/>ついか</div>
          </div>
        )}
      </div>
      {players.length===MAX_PLAYERS&&<div style={{textAlign:"center",color:"#ffffffaa",fontSize:"0.85rem"}}>※ さいだい{MAX_PLAYERS}人まで</div>}
    </div>
  );
}

// ===== REWARD LAND PAGE =====
function RewardLandPage({ player, rd, onBack }) {
  const { theme, cleared } = rd;
  const levels = REWARD_LEVELS[theme];
  return (
    <div style={{minHeight:"100vh",background:THEME_BG[theme],fontFamily:"'Noto Sans JP',sans-serif",padding:"1.5rem"}}>
      <button onClick={onBack} style={{background:"none",border:"none",fontSize:"1.5rem",cursor:"pointer",marginBottom:"1rem"}}>← もどる</button>
      <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
        <div style={{fontSize:"2.5rem"}}>{player.icon}</div>
        <div style={{fontSize:"1.5rem",fontWeight:900,color:"#5C6BC0"}}>{player.name}さんの {THEME_LABEL[theme]}</div>
        <div style={{fontSize:"0.95rem",color:"#888",marginTop:"0.3rem"}}>{cleared}/9段　クリア済み</div>
      </div>
      <div style={{background:"#ffffffcc",borderRadius:"2rem",padding:"1.5rem",maxWidth:"480px",margin:"0 auto 1.5rem",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",textAlign:"center"}}>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"0.8rem"}}>
          {levels.map((lv,i)=>{
            const unlocked = i<cleared;
            return (
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",opacity:unlocked?1:0.25,width:"70px"}}>
                <div style={{fontSize:"2.5rem",filter:unlocked?"none":"grayscale(1)"}}>{unlocked?lv.emoji:"🔒"}</div>
                <div style={{fontSize:"0.65rem",color:unlocked?"#5C6BC0":"#aaa",textAlign:"center",marginTop:"0.2rem",fontWeight:unlocked?700:400}}>
                  {unlocked?lv.name:`${i+1}段×5回`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{maxWidth:"480px",margin:"0 auto"}}>
        <div style={{background:"#e0e0e0",borderRadius:"1rem",height:"14px"}}>
          <div style={{width:`${(cleared/9)*100}%`,background:"linear-gradient(90deg,#667eea,#f5576c)",height:"100%",borderRadius:"1rem",transition:"width 0.5s"}}/>
        </div>
        <div style={{textAlign:"center",fontSize:"0.85rem",color:"#888",marginTop:"0.4rem"}}>
          {cleared===9?"🏆 ぜんぶコンプリート！":`あと ${9-cleared} 段でコンプリート！`}
        </div>
      </div>
    </div>
  );
}

// ===== MENU PAGE =====
function MenuPage({ player, rd, onBack, onSelectMode }) {
  const diff = getDifficulty(player.age);
  const isEasy   = diff === "やさしい";
  const isNormal = diff === "ふつう";
  const isHard   = diff === "むずかしい";
  const danCounts = rd?.danCounts||{};

  const [selectedDan, setSelectedDan] = useState(null);
  const [multiDans, setMultiDans] = useState([]);

  const maxMulti = isHard ? 9 : 3;
  const toggleDan = n => {
    setMultiDans(prev =>
      prev.includes(n) ? prev.filter(x=>x!==n)
      : prev.length < maxMulti ? [...prev, n]
      : prev
    );
  };

  const bgColor = isHard
    ? "linear-gradient(135deg,#EDE7F6,#FCE4EC)"
    : isNormal
    ? "linear-gradient(135deg,#FFF3E0,#FCE4EC)"
    : "linear-gradient(135deg,#E8F5E9,#F3E5F5)";

  const accentColor = isHard ? "#7B1FA2" : isNormal ? "#FF9800" : "#667eea";

  return (
    <div style={{minHeight:"100vh",background:bgColor,fontFamily:"'Noto Sans JP',sans-serif",padding:"1.5rem"}}>
      <button onClick={onBack} style={{background:"none",border:"none",fontSize:"1.5rem",cursor:"pointer",marginBottom:"1rem"}}>← もどる</button>
      <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
        <div style={{fontSize:"2.5rem"}}>{player.icon}</div>
        <div style={{fontSize:"1.5rem",fontWeight:700,color:"#5C6BC0"}}>{player.name}さんの　練習</div>
        <div style={{fontSize:"1rem",color:accentColor}}>難易度：{diff}</div>
      </div>

      {/* ===== やさしい ===== */}
      {isEasy && (
        <div style={{background:"#fff",borderRadius:"1.5rem",padding:"1.5rem",boxShadow:"0 4px 16px rgba(0,0,0,0.08)",maxWidth:"500px",margin:"0 auto"}}>
          <div style={{fontWeight:700,fontSize:"1.1rem",color:"#333",marginBottom:"1rem",textAlign:"center"}}>📚 なんの段を　れんしゅうする？</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.6rem",marginBottom:"1rem"}}>
            {[1,2,3,4,5,6,7,8,9].map(n=>{
              const cnt=danCounts[n]||0; const done=cnt>=5;
              return(
                <button key={n} onClick={()=>setSelectedDan(n)}
                  style={{padding:"0.6rem 0.3rem",background:selectedDan===n?"#667eea":done?"#E8F5E9":"#f0f0f0",color:selectedDan===n?"#fff":done?"#2E7D32":"#333",border:selectedDan===n?"2px solid #667eea":done?"2px solid #4CAF50":"2px solid transparent",borderRadius:"1rem",fontSize:"1rem",fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>
                  {n}の段
                  <div style={{fontSize:"0.65rem",fontWeight:400,marginTop:"0.1rem",color:selectedDan===n?"#ffffffcc":done?"#4CAF50":"#aaa"}}>
                    {done?"✅ 5回":`${cnt}/5回`}
                  </div>
                </button>
              );
            })}
          </div>
          {selectedDan&&<DanButtons selectedDan={selectedDan} onSelectMode={onSelectMode}/>}
        </div>
      )}

      {/* ===== ふつう ===== */}
      {isNormal && (
        <div style={{maxWidth:"500px",margin:"0 auto",display:"flex",flexDirection:"column",gap:"1rem"}}>
          <div style={{background:"#fff",borderRadius:"1.5rem",padding:"1.5rem",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
            <div style={{fontWeight:700,fontSize:"1.1rem",color:"#FF9800",marginBottom:"0.3rem",textAlign:"center"}}>📖 1つの段を選んで練習</div>
            <div style={{fontSize:"0.85rem",color:"#888",textAlign:"center",marginBottom:"1rem"}}>じゅんばん・ばらばら・タイムアタックが使えます</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.6rem",marginBottom:"1rem"}}>
              {[1,2,3,4,5,6,7,8,9].map(n=>{
                const cnt=danCounts[n]||0; const done=cnt>=5;
                const sel = selectedDan===n && multiDans.length===0;
                return(
                  <button key={n} onClick={()=>{setSelectedDan(n);setMultiDans([]);}}
                    style={{padding:"0.6rem 0.3rem",background:sel?"#FF9800":done?"#FFF3E0":"#f0f0f0",color:sel?"#fff":done?"#E65100":"#333",border:sel?"2px solid #FF9800":done?"2px solid #FF9800":"2px solid transparent",borderRadius:"1rem",fontSize:"1rem",fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>
                    {n}の段
                    <div style={{fontSize:"0.65rem",fontWeight:400,marginTop:"0.1rem",color:sel?"#ffffffcc":done?"#FF9800":"#aaa"}}>
                      {done?"✅ 5回":`${cnt}/5回`}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedDan&&multiDans.length===0&&<DanButtons selectedDan={selectedDan} onSelectMode={onSelectMode}/>}
          </div>
          <div style={{background:"#fff",borderRadius:"1.5rem",padding:"1.5rem",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
            <div style={{fontWeight:700,fontSize:"1.1rem",color:"#E91E63",marginBottom:"0.3rem",textAlign:"center"}}>🎯 複数の段をまとめて練習（最大3つ）</div>
            <div style={{fontSize:"0.85rem",color:"#888",textAlign:"center",marginBottom:"1rem"}}>ばらばら・タイムアタックのみ</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.6rem",marginBottom:"1rem"}}>
              {[1,2,3,4,5,6,7,8,9].map(n=>{
                const sel=multiDans.includes(n);
                const disabled=!sel&&multiDans.length>=3;
                return(
                  <button key={n} onClick={()=>{if(!disabled){toggleDan(n);setSelectedDan(null);}}}
                    style={{padding:"0.6rem 0.3rem",background:sel?"#E91E63":disabled?"#eee":"#f0f0f0",color:sel?"#fff":disabled?"#bbb":"#333",border:sel?"2px solid #E91E63":"2px solid transparent",borderRadius:"1rem",fontSize:"1rem",fontWeight:700,cursor:disabled?"not-allowed":"pointer",transition:"all 0.15s",opacity:disabled?0.5:1}}>
                    {n}の段
                    {sel&&<div style={{fontSize:"0.7rem",color:"#ffffffcc"}}>✓ 選択中</div>}
                    {!sel&&!disabled&&<div style={{fontSize:"0.7rem",color:"#aaa"}}>タップで選択</div>}
                  </button>
                );
              })}
            </div>
            {multiDans.length>0
              ? <MultDanButtons dans={multiDans} onSelectMode={onSelectMode}/>
              : <div style={{textAlign:"center",color:"#bbb",fontSize:"0.9rem",padding:"0.5rem"}}>段を選んでください（最大3つ）</div>
            }
          </div>
        </div>
      )}

      {/* ===== むずかしい ===== */}
      {isHard && (
        <div style={{maxWidth:"500px",margin:"0 auto",display:"flex",flexDirection:"column",gap:"1rem"}}>

          {/* 1段選択 */}
          <div style={{background:"#fff",borderRadius:"1.5rem",padding:"1.5rem",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
            <div style={{fontWeight:700,fontSize:"1.1rem",color:"#7B1FA2",marginBottom:"0.3rem",textAlign:"center"}}>📖 1つの段を選んで練習</div>
            <div style={{fontSize:"0.85rem",color:"#888",textAlign:"center",marginBottom:"1rem"}}>じゅんばん・ばらばら・タイムアタックが使えます</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.6rem",marginBottom:"1rem"}}>
              {[1,2,3,4,5,6,7,8,9].map(n=>{
                const cnt=danCounts[n]||0; const done=cnt>=5;
                const sel = selectedDan===n && multiDans.length===0;
                return(
                  <button key={n} onClick={()=>{setSelectedDan(n);setMultiDans([]);}}
                    style={{padding:"0.6rem 0.3rem",background:sel?"#7B1FA2":done?"#EDE7F6":"#f0f0f0",color:sel?"#fff":done?"#6A1B9A":"#333",border:sel?"2px solid #7B1FA2":done?"2px solid #AB47BC":"2px solid transparent",borderRadius:"1rem",fontSize:"1rem",fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>
                    {n}の段
                    <div style={{fontSize:"0.65rem",fontWeight:400,marginTop:"0.1rem",color:sel?"#ffffffcc":done?"#AB47BC":"#aaa"}}>
                      {done?"✅ 5回":`${cnt}/5回`}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedDan&&multiDans.length===0&&<DanButtons selectedDan={selectedDan} onSelectMode={onSelectMode}/>}
          </div>

          {/* 複数段（最大9） */}
          <div style={{background:"#fff",borderRadius:"1.5rem",padding:"1.5rem",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
            <div style={{fontWeight:700,fontSize:"1.1rem",color:"#E91E63",marginBottom:"0.3rem",textAlign:"center"}}>🎯 複数の段をまとめて練習（最大9つ）</div>
            <div style={{fontSize:"0.85rem",color:"#888",textAlign:"center",marginBottom:"1rem"}}>ばらばら（15問）・タイムアタックのみ</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.6rem",marginBottom:"1rem"}}>
              {[1,2,3,4,5,6,7,8,9].map(n=>{
                const sel=multiDans.includes(n);
                return(
                  <button key={n} onClick={()=>{toggleDan(n);setSelectedDan(null);}}
                    style={{padding:"0.6rem 0.3rem",background:sel?"#E91E63":"#f0f0f0",color:sel?"#fff":"#333",border:sel?"2px solid #E91E63":"2px solid transparent",borderRadius:"1rem",fontSize:"1rem",fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>
                    {n}の段
                    {sel
                      ? <div style={{fontSize:"0.7rem",color:"#ffffffcc"}}>✓ 選択中</div>
                      : <div style={{fontSize:"0.7rem",color:"#aaa"}}>タップで選択</div>
                    }
                  </button>
                );
              })}
            </div>
            {multiDans.length>0
              ? <MultDanButtons dans={multiDans} onSelectMode={onSelectMode} questionCount={15}/>
              : <div style={{textAlign:"center",color:"#bbb",fontSize:"0.9rem",padding:"0.5rem"}}>段を選んでください</div>
            }
          </div>

          {/* 虫食いモード */}
          <div style={{background:"#fff",borderRadius:"1.5rem",padding:"1.5rem",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
            <div style={{fontWeight:700,fontSize:"1.1rem",color:"#F57F17",marginBottom:"0.3rem",textAlign:"center"}}>🐛 虫食いモード（1〜9の段すべて・15問）</div>
            <div style={{fontSize:"0.85rem",color:"#888",textAlign:"center",marginBottom:"1rem"}}>
              <span style={{background:"#FFF9C4",borderRadius:"0.5rem",padding:"0.2rem 0.6rem",fontWeight:700,color:"#F57F17"}}>□ × 3 = 21</span>　のように□を当てよう！
            </div>
            <MushikuiButtons onSelectMode={onSelectMode}/>
          </div>

        </div>
      )}
    </div>
  );
}

// ===== 複数段ボタン =====
function MultDanButtons({ dans, onSelectMode, questionCount }) {
  const [showTime, setShowTime] = useState(false);
  const label = dans.map(n=>`${n}の段`).join("・");
  const qCount = questionCount || 10;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:"0.7rem"}}>
      <div style={{textAlign:"center",fontSize:"0.9rem",color:"#E91E63",fontWeight:700,padding:"0.3rem",background:"#FCE4EC",borderRadius:"0.8rem"}}>
        選択中：{label}
      </div>
      <button onClick={()=>onSelectMode("multi_random", {dans, count: qCount})}
        style={{padding:"0.9rem",background:"linear-gradient(135deg,#f093fb,#f5576c)",color:"#fff",border:"none",borderRadius:"1rem",fontSize:"1.1rem",fontWeight:700,cursor:"pointer"}}>
        🎲 ばらばらで解く（{qCount}問）
      </button>
      <button onClick={()=>setShowTime(v=>!v)}
        style={{padding:"0.9rem",background:"linear-gradient(135deg,#FF6B6B,#FFE66D)",color:"#fff",border:"none",borderRadius:showTime?"1rem 1rem 0 0":"1rem",fontSize:"1.1rem",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem"}}>
        ⏱️ タイムアタック　{showTime?"▲":"▼"}
      </button>
      {showTime&&(
        <div style={{background:"#fff7e6",border:"2px solid #FFB74D",borderRadius:"0 0 1rem 1rem",overflow:"hidden",marginTop:"-0.7rem"}}>
          {[60,45,30,15].map((sec,i)=>(
            <button key={sec} onClick={()=>{setShowTime(false);onSelectMode("multi_time",{dans,sec});}}
              style={{width:"100%",padding:"0.9rem",fontSize:"1.1rem",fontWeight:700,background:i%2===0?"#fff3e0":"#fff7ef",color:"#E65100",border:"none",borderTop:i===0?"none":"1px solid #FFE0B2",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",paddingLeft:"1.5rem",paddingRight:"1.5rem"}}
              onMouseEnter={e=>e.currentTarget.style.background="#FFE0B2"}
              onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff3e0":"#fff7ef"}>
              <span>🔥 {sec}秒</span>
              <span style={{fontSize:"0.85rem",color:"#FF8A65",fontWeight:400}}>{sec===60?"ゆっくり":sec===45?"ふつう":sec===30?"速い":"めちゃ速い！"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== 虫食いモードボタン =====
function MushikuiButtons({ onSelectMode }) {
  const [showTime, setShowTime] = useState(false);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:"0.7rem"}}>
      <button onClick={()=>onSelectMode("mushikui_random", null)}
        style={{padding:"0.9rem",background:"linear-gradient(135deg,#f7971e,#ffd200)",color:"#fff",border:"none",borderRadius:"1rem",fontSize:"1.1rem",fontWeight:700,cursor:"pointer"}}>
        🎲 ばらばらで解く（15問）
      </button>
      <button onClick={()=>setShowTime(v=>!v)}
        style={{padding:"0.9rem",background:"linear-gradient(135deg,#FF6B6B,#FFE66D)",color:"#fff",border:"none",borderRadius:showTime?"1rem 1rem 0 0":"1rem",fontSize:"1.1rem",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem"}}>
        ⏱️ タイムアタック　{showTime?"▲":"▼"}
      </button>
      {showTime&&(
        <div style={{background:"#fff7e6",border:"2px solid #FFB74D",borderRadius:"0 0 1rem 1rem",overflow:"hidden",marginTop:"-0.7rem"}}>
          {[60,45,30,15].map((sec,i)=>(
            <button key={sec} onClick={()=>{setShowTime(false);onSelectMode("mushikui_time",{sec});}}
              style={{width:"100%",padding:"0.9rem",fontSize:"1.1rem",fontWeight:700,background:i%2===0?"#fff3e0":"#fff7ef",color:"#E65100",border:"none",borderTop:i===0?"none":"1px solid #FFE0B2",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",paddingLeft:"1.5rem",paddingRight:"1.5rem"}}
              onMouseEnter={e=>e.currentTarget.style.background="#FFE0B2"}
              onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff3e0":"#fff7ef"}>
              <span>🔥 {sec}秒</span>
              <span style={{fontSize:"0.85rem",color:"#FF8A65",fontWeight:400}}>{sec===60?"ゆっくり":sec===45?"ふつう":sec===30?"速い":"めちゃ速い！"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== DAN BUTTONS =====
function DanButtons({ selectedDan, onSelectMode }) {
  const [showTime, setShowTime] = useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"0.7rem"}}>
      <button onClick={()=>onSelectMode("order",selectedDan)}
        style={{padding:"0.9rem",background:"linear-gradient(135deg,#43E97B,#38F9D7)",color:"#fff",border:"none",borderRadius:"1rem",fontSize:"1.1rem",fontWeight:700,cursor:"pointer"}}>
        📖 じゅんばんに　とく（{selectedDan}×1〜{selectedDan}×9）
      </button>
      <button onClick={()=>onSelectMode("random",selectedDan)}
        style={{padding:"0.9rem",background:"linear-gradient(135deg,#f093fb,#f5576c)",color:"#fff",border:"none",borderRadius:"1rem",fontSize:"1.1rem",fontWeight:700,cursor:"pointer"}}>
        🎲 ばらばらで　とく（{selectedDan}の段）
      </button>
      <button onClick={()=>setShowTime(v=>!v)}
        style={{padding:"0.9rem",background:"linear-gradient(135deg,#FF6B6B,#FFE66D)",color:"#fff",border:"none",borderRadius:showTime?"1rem 1rem 0 0":"1rem",fontSize:"1.1rem",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem"}}>
        ⏱️ タイムアタック　{showTime?"▲":"▼"}
      </button>
      {showTime&&(
        <div style={{background:"#fff7e6",border:"2px solid #FFB74D",borderRadius:"0 0 1rem 1rem",overflow:"hidden",marginTop:"-0.7rem"}}>
          {[60,45,30,15].map((sec,i)=>(
            <button key={sec} onClick={()=>{setShowTime(false);onSelectMode("time",{dan:selectedDan,sec});}}
              style={{width:"100%",padding:"0.9rem",fontSize:"1.1rem",fontWeight:700,background:i%2===0?"#fff3e0":"#fff7ef",color:"#E65100",border:"none",borderTop:i===0?"none":"1px solid #FFE0B2",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",paddingLeft:"1.5rem",paddingRight:"1.5rem"}}
              onMouseEnter={e=>e.currentTarget.style.background="#FFE0B2"}
              onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff3e0":"#fff7ef"}>
              <span>🔥 {sec}びょう</span>
              <span style={{fontSize:"0.85rem",color:"#FF8A65",fontWeight:400}}>{sec===60?"ゆっくり":sec===45?"ふつう":sec===30?"はやい":"めちゃはやい！"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// タイムアタック問題数テーブル
const TIME_ATTACK_COUNT = {
  "やさしい":   { 60:15, 45:10, 30:7, 15:4 },
  "ふつう":     { 60:20, 45:15, 30:10, 15:5 },
  "むずかしい": { 60:20, 45:15, 30:10, 15:5 },
};
// mode: "order"|"random"|"time"|"multi_random"|"multi_time"
// dan: number（1段）or null
// dans: number[]（複数段）or null
// timeLimit: number or null
function QuizPage({ player, mode, dan, dans, timeLimit, rd, onBack, onFinish }) {
  const diff = getDifficulty(player.age);
  const isTimedMode  = mode==="time"||mode==="multi_time"||mode==="mushikui_time";
  const isMushikui   = mode==="mushikui_random"||mode==="mushikui_time";
  const timeQuestionCount = isTimedMode
    ? (TIME_ATTACK_COUNT[diff]?.[timeLimit] || 10)
    : null;
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent]     = useState(0);
  const [answer, setAnswer]       = useState("");
  const [score, setScore]         = useState(0);
  const [wrong, setWrong]         = useState(0);
  const [feedback, setFeedback]   = useState(null);
  const [timeLeft, setTimeLeft]   = useState(timeLimit||null);
  const [finished, setFinished]   = useState(false);
  const [stars, setStars]         = useState(0);
  const [showPart, setShowPart]   = useState(false);
  const timerRef = useRef(null);

  useEffect(()=>{
    // 直前と同じ問題が連続しないシャッフル
    const noConsecutiveShuffle = (pool) => {
      const arr = [...pool].sort(()=>Math.random()-0.5);
      for(let i=1;i<arr.length;i++){
        if(arr[i].a===arr[i-1].a && arr[i].b===arr[i-1].b){
          // 別の位置と交換
          for(let j=i+1;j<arr.length;j++){
            if(arr[j].a!==arr[i-1].a || arr[j].b!==arr[i-1].b){
              [arr[i],arr[j]]=[arr[j],arr[i]]; break;
            }
          }
        }
      }
      return arr;
    };

    // タイムアタック用：直前と異なる問題をランダム生成
    const buildTimePool = (targets, count) => {
      const qs=[];
      for(let i=0;i<count;i++){
        let a,b,tries=0;
        do {
          a=targets[Math.floor(Math.random()*targets.length)];
          b=Math.ceil(Math.random()*9);
          tries++;
        } while(tries<20 && qs.length>0 && qs[qs.length-1].a===a && qs[qs.length-1].b===b);
        qs.push({a,b});
      }
      return qs;
    };

    let qs=[];
    if (mode==="order") {
      for(let i=1;i<=9;i++) qs.push({a:dan,b:i});
    } else if (mode==="random") {
      const pool=Array.from({length:9},(_,i)=>({a:dan,b:i+1}));
      qs=noConsecutiveShuffle(pool);
    } else if (mode==="multi_random") {
      const pool=[];
      (dans||[]).forEach(d=>{ for(let i=1;i<=9;i++) pool.push({a:d,b:i}); });
      const shuffled=noConsecutiveShuffle(pool);
      const count = typeof dans==="object"&&!Array.isArray(dans) ? (dans.count||10) : 10;
      // dansがオブジェクト{dans,count}の場合に対応
      qs=shuffled.slice(0,count);
    } else if (mode==="mushikui_random"||mode==="mushikui_time") {
      // 虫食い：□×b=ans または a×□=ans をランダム生成
      const count = isTimedMode
        ? (TIME_ATTACK_COUNT[diff]?.[timeLimit]||10)
        : 15;
      qs=buildTimePool([1,2,3,4,5,6,7,8,9], count).map(q=>({
        ...q,
        mushikui: Math.random()<0.5 ? "a" : "b", // どちらを虫食いにするか
      }));
    } else {
      // time / multi_time / mushikui_time
      const dansArr = Array.isArray(dans) ? dans : (dans?.dans || null);
      const targets = dansArr ? dansArr : (dan ? [dan] : [1,2,3,4,5,6,7,8,9]);
      const count = TIME_ATTACK_COUNT[getDifficulty(player.age)]?.[timeLimit] || 10;
      qs=buildTimePool(targets,count);
    }
    setQuestions(qs);
  },[]);

  useEffect(()=>{
    if ((mode!=="time"&&mode!=="multi_time"&&mode!=="mushikui_time")||finished) return;
    timerRef.current = setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){clearInterval(timerRef.current);setFinished(true);return 0;}
        return t-1;
      });
    },1000);
    return()=>clearInterval(timerRef.current);
  },[mode,finished]);

  const handleAnswer = useCallback(()=>{
    if(!questions[current]) return;
    const q=questions[current];
    // 虫食いの場合は□の値が正解、通常はa×b
    const correct = isMushikui
      ? (q.mushikui==="a" ? q.a : q.b)
      : q.a*q.b;
    if(parseInt(answer)===correct){
      setFeedback("correct"); setScore(s=>s+1);
      setShowPart(true); setTimeout(()=>setShowPart(false),100);
    } else { setFeedback("wrong"); setWrong(w=>w+1); }
    setTimeout(()=>{
      setFeedback(null); setAnswer("");
      if(current>=questions.length-1) setFinished(true);
      else setCurrent(c=>c+1);
    },700);
  },[questions,current,answer,mode]);

  useEffect(()=>{
    if(!finished) return;
    const p = score / questions.length;
    setStars(p===1?3:p>=0.8?2:1);
  },[finished]);

  const q=questions[current];

  if(finished){
    const isTimedMode = mode==="time"||mode==="multi_time";
    const cnt = rd&&dan ? (rd.danCounts[dan]||0)+1 : 0;
    const willReward = rd&&dan&&cnt>=5&&(rd.danCounts[dan]||0)<5;
    return(
      <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#f9ca24,#f0932b)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Sans JP',sans-serif",padding:"1.5rem",textAlign:"center"}}>
        <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
        <div style={{fontSize:"5rem",animation:"bounce 0.8s ease-in-out infinite"}}>{"⭐".repeat(stars)}</div>
        <div style={{fontSize:"2rem",fontWeight:900,color:"#fff",textShadow:"2px 2px 0 rgba(0,0,0,0.2)",marginTop:"1rem"}}>
          {stars===3?"かんぺき！🎉":stars===2?"よくできました！👏":"がんばった！💪"}
        </div>
        <div style={{background:"#ffffffee",borderRadius:"2rem",padding:"2rem",marginTop:"1.5rem",boxShadow:"0 8px 24px rgba(0,0,0,0.15)",width:"100%",maxWidth:"340px"}}>
          {isTimedMode?(
            <>
              <div style={{fontSize:"1rem",color:"#888",marginBottom:"0.3rem"}}>{timeLeft>0?"時間内に全問クリア！⚡":"時間切れ！⏱"}</div>
              <div style={{fontSize:"1.2rem",fontWeight:700,color:"#333"}}>{questions.length}問中</div>
              <div style={{fontSize:"3rem",fontWeight:900,color:"#E91E63"}}>{score}問正解</div>
              <div style={{color:"#666",fontSize:"0.95rem"}}>まちがい：{wrong}問　残り：{questions.length-score-wrong}問</div>
            </>
          ):(
            <><div style={{fontSize:"1.2rem",fontWeight:700,color:"#333"}}>正解</div>
            <div style={{fontSize:"3rem",fontWeight:900,color:"#4CAF50"}}>{score}/{questions.length}</div>
            <div style={{color:"#666",fontSize:"0.95rem"}}>まちがい：{wrong}問</div></>
          )}
          {stars===3&&<div style={{marginTop:"1rem",background:"#FFF9C4",border:"2px solid #FFD600",borderRadius:"1rem",padding:"0.8rem",fontSize:"0.95rem",color:"#F57F17"}}>🏆 パーフェクト！すごい！</div>}
          {rd&&!isTimedMode&&dan&&(
            <div style={{marginTop:"0.8rem",background:willReward?"#FFF9C4":"#f5f5f5",border:`2px solid ${willReward?"#FFD600":"#ddd"}`,borderRadius:"1rem",padding:"0.7rem",fontSize:"0.9rem",color:willReward?"#E65100":"#888"}}>
              {willReward?`🎉 ${THEME_LABEL[rd.theme]}にご褒美が届く！`:`${THEME_LABEL[rd.theme]}まであと ${5-Math.min(cnt,5)}回！`}
            </div>
          )}
        </div>
        <button onClick={()=>onFinish({ dan: !isTimedMode?dan:null, mode, dans, score, total:questions.length })}
          style={{marginTop:"1.5rem",padding:"0.8rem 2rem",background:"#fff",color:"#5C6BC0",border:"2px solid #5C6BC0",borderRadius:"1.2rem",fontSize:"1rem",fontWeight:700,cursor:"pointer"}}>
          もくじへ
        </button>
      </div>
    );
  }

  if(!q) return <div style={{textAlign:"center",padding:"3rem",fontFamily:"'Noto Sans JP',sans-serif"}}>よみこみ中...</div>;

  return(
    <div style={{minHeight:"100vh",background:feedback==="correct"?"linear-gradient(135deg,#E8F5E9,#C8E6C9)":feedback==="wrong"?"linear-gradient(135deg,#FFEBEE,#FFCDD2)":"linear-gradient(135deg,#E3F2FD,#F3E5F5)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Sans JP',sans-serif",padding:"1.5rem",transition:"background 0.3s"}}>
      <Particles active={showPart}/>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>

      {/* Header */}
      <div style={{width:"100%",maxWidth:"420px",marginBottom:"1rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={onBack} style={{background:"none",border:"none",fontSize:"1.3rem",cursor:"pointer"}}>←</button>
          <div style={{display:"flex",gap:"0.3rem",alignItems:"center"}}>
            <span style={{color:"#4CAF50",fontWeight:700}}>✓{score}</span>
            <span style={{color:"#F44336",fontWeight:700,fontSize:"0.9rem"}}>✗{wrong}</span>
            {isTimedMode&&<span style={{color:"#888",fontSize:"0.85rem"}}>/　{questions.length}問</span>}
          </div>
          {isTimedMode&&(
            <div style={{background:timeLeft<=10?"#F44336":"#FF9800",color:"#fff",borderRadius:"0.8rem",padding:"0.3rem 0.8rem",fontWeight:900,fontSize:"1.2rem",animation:timeLeft<=10?"bounce 0.5s infinite":"none"}}>
              ⏱ {timeLeft}
            </div>
          )}
        </div>
        {/* プログレスバー（通常・タイムアタック共通） */}
        <div style={{marginTop:"0.5rem",background:"#e0e0e0",borderRadius:"1rem",height:"8px"}}>
          <div style={{width:`${(current/questions.length)*100}%`,background: isTimedMode?"linear-gradient(90deg,#FF6B6B,#FFE66D)":"linear-gradient(90deg,#667eea,#764ba2)",height:"100%",borderRadius:"1rem",transition:"width 0.3s"}}/>
        </div>
        <div style={{textAlign:"right",fontSize:"0.85rem",color:"#888",marginTop:"0.2rem"}}>{current+1} / {questions.length}問</div>
      </div>

      {/* Question card */}
      <div style={{background:"#fff",borderRadius:"2rem",padding:"2rem 1.5rem",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",width:"100%",maxWidth:"420px",textAlign:"center"}}>
        {feedback?(
          <div style={{fontSize:"2rem",fontWeight:900,color:feedback==="correct"?"#4CAF50":"#F44336"}}>
            {feedback==="correct" ? "⭕ 正解！" : (() => {
              if(isMushikui){
                const ans = q.mushikui==="a" ? q.a : q.b;
                return `❌ 答えは ${ans}`;
              }
              return `❌ 答えは ${q.a*q.b}`;
            })()}
          </div>
        ):(
          <>
            {/* 問題文 */}
            {isMushikui ? (
              <div style={{fontSize:"2.2rem",fontWeight:900,color:"#F57F17",marginBottom:"1rem"}}>
                {q.mushikui==="a"
                  ? <><span style={{background:"#FFF9C4",borderRadius:"0.5rem",padding:"0 0.3rem"}}>□</span> × {q.b} = {q.a*q.b}</>
                  : <>{q.a} × <span style={{background:"#FFF9C4",borderRadius:"0.5rem",padding:"0 0.3rem"}}>□</span> = {q.a*q.b}</>
                }
              </div>
            ) : (
              <div style={{fontSize:"2.5rem",fontWeight:900,color:"#5C6BC0",marginBottom:"1rem"}}>{q.a} × {q.b} = ?</div>
            )}
            <div style={{width:"140px",margin:"0 auto 1rem",padding:"0.6rem",fontSize:"2.2rem",fontWeight:900,color:"#333",borderRadius:"1rem",border:`3px solid ${isMushikui?"#FFD600":"#CE93D8"}`,background:"#fafafa",textAlign:"center",minHeight:"3rem"}}>
              {answer||<span style={{color:"#ccc"}}>？</span>}
            </div>
            {/* テンキー */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.5rem",maxWidth:"240px",margin:"0 auto"}}>
              {[7,8,9,4,5,6,1,2,3].map(n=>(
                <button key={n} onClick={()=>setAnswer(a=>a.length<3?a+String(n):a)}
                  style={{padding:"0.8rem",fontSize:"1.5rem",fontWeight:700,background:"linear-gradient(135deg,#e8eaf6,#c5cae9)",color:"#3949AB",border:"none",borderRadius:"0.8rem",cursor:"pointer",boxShadow:"0 3px 6px rgba(0,0,0,0.1)"}}>
                  {n}
                </button>
              ))}
              <button onClick={()=>setAnswer(a=>a.length<3?a+"0":a)} style={{padding:"0.8rem",fontSize:"1.5rem",fontWeight:700,background:"linear-gradient(135deg,#e8eaf6,#c5cae9)",color:"#3949AB",border:"none",borderRadius:"0.8rem",cursor:"pointer",boxShadow:"0 3px 6px rgba(0,0,0,0.1)"}}>0</button>
              <button onClick={()=>setAnswer(a=>a.slice(0,-1))} style={{padding:"0.8rem",fontSize:"1.2rem",fontWeight:700,background:"linear-gradient(135deg,#fff3e0,#ffe0b2)",color:"#E65100",border:"none",borderRadius:"0.8rem",cursor:"pointer",boxShadow:"0 3px 6px rgba(0,0,0,0.1)"}}>⌫</button>
              <button onClick={()=>answer!==""&&handleAnswer()} disabled={answer===""} style={{padding:"0.8rem",fontSize:"1rem",fontWeight:700,background:answer!==""?"linear-gradient(135deg,#667eea,#764ba2)":"#ccc",color:"#fff",border:"none",borderRadius:"0.8rem",cursor:answer!==""?"pointer":"not-allowed"}}>✓</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ===== 達成ご褒美画面 =====
// type: "dan"(やさしい段), "multi"(ふつう/むずかしい複数段), "mushikui"(虫食い)
// count: 達成回数 (5,10,15...)
// label: 表示名
function AchievementPage({ player, type, label, count, onClose }) {
  const [showParticles, setShowParticles] = useState(true);
  useEffect(()=>{ setTimeout(()=>setShowParticles(false),2000); },[]);

  const countLabel = `${Math.min(count, 50)}回`;

  return(
    <div style={{
      position:"fixed",inset:0,
      background:"linear-gradient(135deg,#667eea,#764ba2)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      fontFamily:"'Noto Sans JP',sans-serif",padding:"1.5rem",zIndex:20000,
      textAlign:"center",
    }}>
      <Particles active={showParticles}/>
      <style>{`
        @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}60%{transform:scale(1.1)}80%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .achi-card{animation:bounceIn 0.7s cubic-bezier(.34,1.56,.64,1)}
        .achi-icon{animation:float 2s ease-in-out infinite}
      `}</style>

      <div className="achi-card" style={{
        background:"#fff",borderRadius:"2.5rem",padding:"2.5rem 2rem",
        maxWidth:"360px",width:"100%",
        boxShadow:"0 16px 48px rgba(0,0,0,0.3)",
      }}>
        <div className="achi-icon" style={{fontSize:"5rem",marginBottom:"0.5rem"}}>🏆</div>

        <div style={{fontSize:"2rem",fontWeight:900,color:"#F57F17",marginBottom:"0.3rem"}}>
          おめでとう！
        </div>
        <div style={{fontSize:"1.3rem",fontWeight:700,color:"#5C6BC0",marginBottom:"1.5rem"}}>
          がんばってるね！
        </div>

        <div style={{
          background:"linear-gradient(135deg,#FFF9C4,#FFE0B2)",
          borderRadius:"1.5rem",padding:"1.2rem",marginBottom:"1.5rem",
          border:"2px solid #FFD600",
        }}>
          <div style={{fontSize:"1rem",color:"#888",marginBottom:"0.3rem"}}>{player.icon} {player.name}さん</div>
          <div style={{fontSize:"1.3rem",fontWeight:900,color:"#E65100",lineHeight:1.4}}>
            「{label}」を<br/>
            <span style={{fontSize:"2rem",color:"#F57F17"}}>{countLabel}</span>　できたよ！
          </div>
        </div>

        <div style={{
          background:"#E8F5E9",borderRadius:"1rem",padding:"1rem",
          fontSize:"1rem",fontWeight:700,color:"#2E7D32",marginBottom:"1.5rem",
          border:"2px solid #A5D6A7",
        }}>
          📣 この画面を<br/>パパかママに見せてね！
        </div>

        <button onClick={onClose} style={{
          width:"100%",padding:"1rem",
          background:"linear-gradient(135deg,#667eea,#764ba2)",
          color:"#fff",border:"none",borderRadius:"1.5rem",
          fontSize:"1.2rem",fontWeight:700,cursor:"pointer",
          boxShadow:"0 4px 12px rgba(102,126,234,0.4)",
        }}>
          とじる ✓
        </button>
      </div>
    </div>
  );
}
export default function App() {
  const [page, setPage]               = useState("top");
  const [players, setPlayers]         = useState([]);
  const [rewards, setRewards]         = useState({});
  const [tempName, setTempName]       = useState("");
  const [tempIcon, setTempIcon]       = useState("");
  const [activePlayer, setActivePlayer] = useState(null);
  const [activeIdx, setActiveIdx]     = useState(null);
  const [quizMode, setQuizMode]       = useState(null);
  const [quizDan, setQuizDan]         = useState(null);
  const [quizDans, setQuizDans]       = useState(null); // 複数段用
  const [quizTime, setQuizTime]       = useState(null);
  const [popup, setPopup]             = useState(null); // {theme,level}
  const [achievement, setAchievement] = useState(null); // {type,label,count}

  const handleTopNext  = name => { setTempName(name); setPage("icon"); };
  const handleIconNext = icon => { setTempIcon(icon); setPage("age"); };
  const handleAgeNext  = age  => {
    const idx = players.length;
    setPlayers(p=>[...p,{name:tempName,icon:tempIcon,age}]);
    setRewards(r=>({...r,[idx]:newRewardData()}));
    setPage("home");
  };
  const handlePlay = (player,idx) => { setActivePlayer(player); setActiveIdx(idx); setPage("menu"); };
  const handleReward = idx => { setActivePlayer(players[idx]); setActiveIdx(idx); setPage("reward"); };
  const handleSelectMode = (mode, param) => {
    setQuizMode(mode);
    if(mode==="time"){
      setQuizDan(param.dan); setQuizTime(param.sec); setQuizDans(null);
    } else if(mode==="multi_random"){
      setQuizDans(param); setQuizDan(null); setQuizTime(null);
    } else if(mode==="multi_time"){
      setQuizDans(param.dans); setQuizTime(param.sec); setQuizDan(null);
    } else if(mode==="mushikui_random"){
      setQuizDan(null); setQuizDans(null); setQuizTime(null);
    } else if(mode==="mushikui_time"){
      setQuizDan(null); setQuizDans(null); setQuizTime(param.sec);
    } else {
      setQuizDan(param); setQuizDans(null); setQuizTime(null);
    }
    setPage("quiz");
  };
  // QuizPageから呼ばれる：{ dan, mode, dans, score, total }
  const handleQuizFinish = ({ dan, mode, dans, score, total }) => {
    const passed = total > 0 && (score / total) >= 0.8;

    if(activeIdx !== null){
      setRewards(prev => {
        const rd = { ...prev[activeIdx] };

        // やさしい：1段ごとのカウント → ご褒美ポップアップ
        if(dan && (mode==="order"||mode==="random")){
          const prevCnt = rd.danCounts[dan]||0;
          const newCnt  = prevCnt + 1;
          rd.danCounts  = { ...rd.danCounts, [dan]: newCnt };
          if(prevCnt < 5 && newCnt >= 5){
            rd.cleared = rd.cleared + 1;
            setTimeout(()=>setPopup({theme:rd.theme,level:rd.cleared}),300);
          }
          // 8割以上・5回ごと・最大50回まで
          if(passed && newCnt % 5 === 0 && newCnt <= 50){
            setTimeout(()=>setAchievement({
              type:"dan", label:`${dan}の段`, count:newCnt,
            }),400);
          }
        }

        // ふつう：複数段のカウント
        if(mode==="multi_random"||mode==="multi_time"){
          const prevCnt = rd.multiCount||0;
          const newCnt  = prevCnt + 1;
          rd.multiCount = newCnt;
          // 8割以上・5回ごと・最大50回まで
          if(passed && newCnt % 5 === 0 && newCnt <= 50){
            const dansArr = Array.isArray(dans) ? dans : (dans?.dans||[]);
            const label = dansArr.map(n=>`${n}の段`).join("・");
            setTimeout(()=>setAchievement({
              type:"multi", label:`複数の段（${label}）`, count:newCnt,
            }),400);
          }
        }

        // むずかしい：虫食いのカウント
        if(mode==="mushikui_random"||mode==="mushikui_time"){
          const prevCnt = rd.mushikuiCount||0;
          const newCnt  = prevCnt + 1;
          rd.mushikuiCount = newCnt;
          // 8割以上・5回ごと・最大50回まで
          if(passed && newCnt % 5 === 0 && newCnt <= 50){
            setTimeout(()=>setAchievement({
              type:"mushikui", label:"虫食いモード", count:newCnt,
            }),400);
          }
        }

        return { ...prev, [activeIdx]: rd };
      });
    }
    setPage("menu");
  };

  return(
    <>
      {page==="top"    && <TopPage onNext={handleTopNext}/>}
      {page==="icon"   && <IconSelectPage name={tempName} onNext={handleIconNext}/>}
      {page==="age"    && <AgePage name={tempName} icon={tempIcon} onNext={handleAgeNext}/>}
      {page==="home"   && <HomePage players={players} rewards={rewards} onAddPlayer={()=>setPage("top")} onPlay={handlePlay} onReward={handleReward}/>}
      {page==="menu"   && <MenuPage player={activePlayer} rd={rewards[activeIdx]} onBack={()=>setPage("home")} onSelectMode={handleSelectMode}/>}
      {page==="quiz"   && <QuizPage player={activePlayer} mode={quizMode} dan={quizDan} dans={quizDans} timeLimit={quizTime} rd={rewards[activeIdx]} onBack={()=>setPage("menu")} onFinish={handleQuizFinish}/>}
      {page==="reward" && <RewardLandPage player={activePlayer} rd={rewards[activeIdx]} onBack={()=>setPage("home")}/>}
      {popup&&<RewardPopup theme={popup.theme} level={popup.level} onClose={()=>setPopup(null)}/>}
      {achievement&&<AchievementPage player={activePlayer} type={achievement.type} label={achievement.label} count={achievement.count} onClose={()=>setAchievement(null)}/>}
    </>
  );
}

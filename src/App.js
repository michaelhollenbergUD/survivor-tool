import { useState } from "react";

const CC = { A:"#2563eb", B:"#16a34a", C:"#9333ea", D:"#dc2626", E:"#0891b2", F:"#db2477" };

const CLUSTER_DEF = [
  { id:"A", size:12, color:"#2563eb", type:"1-seed", left:"Duke",        right:"Michigan",  rescue:"Iowa St.",    tertiary:"St. John's (16.2% E8!)", e8:"38.4%" },
  { id:"B", size:12, color:"#16a34a", type:"1-seed", left:"Duke",        right:"Arizona",   rescue:"Purdue",      tertiary:"Wisconsin",               e8:"32.7%" },
  { id:"C", size:10, color:"#9333ea", type:"1-seed", left:"Florida",     right:"Michigan",  rescue:"Houston",     tertiary:"Nebraska",                e8:"27.4%" },
  { id:"D", size:10, color:"#dc2626", type:"1-seed", left:"Florida",     right:"Arizona",   rescue:"Connecticut", tertiary:"Nebraska",                e8:"23.3%" },
  { id:"E", size:8,  color:"#0891b2", type:"2-seed", left:"Houston",     right:"Iowa St.",  rescue:"Alabama",     tertiary:"Vanderbilt",              e8:"~21.5%" },
  { id:"F", size:8,  color:"#db2477", type:"2-seed", left:"Connecticut", right:"Purdue",    rescue:"Arkansas",    tertiary:"Wisconsin",               e8:"~24.0%" },
];

// Track picks per cluster per day
// null = not yet picked, string = pick made
const INITIAL_PICKS = {
  A: { 1:"Ohio St.", 2:null, 3:null, 4:null, 5:null, 6:null, "7+8":null, 9:null, 10:null },
  B: { 1:"St. Mary's", 2:null, 3:null, 4:null, 5:null, 6:null, "7+8":null, 9:null, 10:null },
  C: { 1:"Nebraska", 2:null, 3:null, 4:null, 5:null, 6:null, "7+8":null, 9:null, 10:null },
  D: { 1:"Wisconsin", 2:null, 3:null, 4:null, 5:null, 6:null, "7+8":null, 9:null, 10:null },
  E: { 1:"Georgia", 2:null, 3:null, 4:null, 5:null, 6:null, "7+8":null, 9:null, 10:null },
  F: { 1:"BYU", 2:null, 3:null, 4:null, 5:null, 6:null, "7+8":null, 9:null, 10:null },
};

// Entry counts per cluster — starts at full, reduces as entries are eliminated
const INITIAL_ENTRIES = { A:12, B:12, C:10, D:10, E:8, F:8 };

// Win probabilities for key teams
const WIN_PROBS = {
  // Day 1 available
  "Ohio St.":64.4, "Saint Mary's":63.4, "St. Mary's":63.4, "Nebraska":87.1,
  "Wisconsin":73.6, "Georgia":51.0, "BYU":67.0, "Louisville":73.1,
  "Saint Louis":49.0, "TCU":35.0,
  // Day 2
  "UCLA":72.3, "Miami FL":67.5, "Kentucky":60.6, "Iowa":60.8,
  "Villanova":39.8, "Clemson":39.2,
  // 3 seeds
  "Michigan St.":94.2, "Illinois":99.5, "Gonzaga":97.3, "Virginia":95.5,
  // 4/5 seeds
  "Kansas":92.9, "St. John's":85.8, "Vanderbilt":86.7, "Alabama":87.1,
  "Arkansas":95.3, "Texas Tech":67.1,
  // 2 seeds
  "Connecticut":73.5, "Houston":83.1, "Purdue":84.0, "Iowa St.":81.9,
  // 1 seeds
  "Duke":99.7, "Florida":99.8, "Michigan":99.7, "Arizona":99.5,
};

const DAY_LABELS = ["D1","D2","D3","D4","D5","D6","E8","FF","🏆"];
const DAY_KEYS = [1,2,3,4,5,6,"7+8",9,10];

const DEPTH_CHART = {
  A: { primary:"Duke + Michigan", rescue:"Iowa St. (if Duke busts)", tertiary:"St. John's (if Duke+Iowa St. bust)", note:"St. John's has 16.2% E8 — real option" },
  B: { primary:"Duke + Arizona",  rescue:"Purdue (if Arizona busts)", tertiary:"Wisconsin (if Arizona+Purdue bust)", note:"Wisconsin 5.1% E8 — last resort" },
  C: { primary:"Florida + Michigan", rescue:"Houston (if Florida busts)", tertiary:"Nebraska (if Florida+Houston bust)", note:"Nebraska 11.5% E8 — solid tertiary" },
  D: { primary:"Florida + Arizona",  rescue:"Connecticut (if Florida busts)", tertiary:"Nebraska (if Florida+Conn bust)", note:"Connecticut+Arizona actually better than primary!" },
  E: { primary:"Houston + Iowa St.", rescue:"Alabama (if Houston busts)", tertiary:"Vanderbilt (if Houston+Alabama bust)", note:"2-seed cluster — survives all 1-seed busts" },
  F: { primary:"Connecticut + Purdue", rescue:"Arkansas (if Connecticut busts)", tertiary:"Wisconsin (if Conn+Arkansas bust)", note:"Arkansas 14.5% E8 — strong tertiary" },
};

const SUGGESTED = {
  A: { 1:"Ohio St.", 2:"St. John's", 3:"Michigan St.", 4:"Virginia", 5:"Connecticut", 6:"Iowa St.*", "7+8":"Duke+Michigan", 9:"Split", 10:"Split" },
  B: { 1:"St. Mary's", 2:"UCLA", 3:"Gonzaga", 4:"Illinois", 5:"Arkansas", 6:"Purdue*", "7+8":"Duke+Arizona", 9:"Split", 10:"Split" },
  C: { 1:"Nebraska", 2:"Miami FL", 3:"Illinois", 4:"Gonzaga", 5:"Vanderbilt", 6:"Houston*", "7+8":"Fla+Mich", 9:"Split", 10:"Split" },
  D: { 1:"Wisconsin", 2:"Kentucky", 3:"Virginia", 4:"Michigan St.", 5:"Alabama", 6:"Conn.*", "7+8":"Fla+Ariz", 9:"Split", 10:"Split" },
  E: { 1:"Georgia", 2:"Iowa", 3:"Duke🔥", 4:"Michigan🔥", 5:"Nebraska", 6:"Iowa St.", "7+8":"Hou+ISU", 9:"Split", 10:"Split" },
  F: { 1:"BYU", 2:"Kentucky", 3:"Florida🔥", 4:"Arizona🔥", 5:"Kansas", 6:"Purdue", "7+8":"Conn+Pur", 9:"Split", 10:"Split" },
};

export default function App() {
  const [activeTab, setActiveTab] = useState("tracker");
  const [picks, setPicks] = useState(INITIAL_PICKS);
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [editDay, setEditDay] = useState(null);
  const [editCluster, setEditCluster] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [eliminated, setEliminated] = useState({ A:false, B:false, C:false, D:false, E:false, F:false });

  const totalAlive = Object.entries(entries).reduce((s,[k,v]) => s + (eliminated[k] ? 0 : v), 0);
  const totalStart = 60;

  const saveEdit = () => {
    if (!editCluster || !editDay) return;
    setPicks(p => ({ ...p, [editCluster]: { ...p[editCluster], [editDay]: editVal || null } }));
    setEditDay(null); setEditCluster(null); setEditVal("");
  };

  const toggleElim = (id) => setEliminated(e => ({ ...e, [id]: !e[id] }));
  const updateEntries = (id, val) => setEntries(e => ({ ...e, [id]: Math.max(0, parseInt(val)||0) }));

  return (
    <div style={{fontFamily:"system-ui,sans-serif",maxWidth:960,margin:"0 auto",padding:16,background:"#0f172a",color:"#e2e8f0",minHeight:"100vh"}}>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:22,fontWeight:800,color:"#f8fafc"}}>🏀 Splash Sports $25 Survivor</div>
        <div style={{fontSize:13,color:"#94a3b8",marginTop:4}}>60-Entry Portfolio Tracker — Live Strategy</div>
      </div>

      {/* Summary bar */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
        {[
          {label:"Total Entries",val:totalStart,color:"#64748b"},
          {label:"Still Alive",val:totalAlive,color:"#4ade80"},
          {label:"Eliminated",val:totalStart-totalAlive,color:"#f87171"},
          {label:"Survival %",val:Math.round(totalAlive/totalStart*100)+"%",color:"#fbbf24"},
        ].map((s,i)=>(
          <div key={i} style={{background:"#1e293b",borderRadius:10,padding:12,textAlign:"center",border:`1px solid ${s.color}33`}}>
            <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.val}</div>
            <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:5,marginBottom:14,background:"#1e293b",padding:5,borderRadius:10}}>
        {[["tracker","📊 Live Tracker"],["depth","🛡️ Depth Charts"],["suggested","📅 Suggested Picks"],["rules","⚡ Key Rules"]].map(([t,lbl])=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{
            flex:1,padding:"7px 0",borderRadius:7,border:"none",cursor:"pointer",fontWeight:600,fontSize:12,
            background:activeTab===t?"#3b82f6":"transparent",color:activeTab===t?"#fff":"#94a3b8"
          }}>{lbl}</button>
        ))}
      </div>

      {activeTab==="tracker"&&(
        <div>
          <div style={{fontSize:12,color:"#94a3b8",marginBottom:12}}>Click any cell to edit a pick. Mark clusters eliminated to update survival count. * = conditional rescue pick.</div>

          {/* Cluster rows */}
          {CLUSTER_DEF.map(c=>(
            <div key={c.id} style={{background:"#1e293b",borderRadius:12,padding:14,marginBottom:10,opacity:eliminated[c.id]?0.4:1,border:`1px solid ${eliminated[c.id]?"#ef4444":c.color+"44"}`}}>
              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:4,height:36,background:c.color,borderRadius:2}}/>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontWeight:800,fontSize:15,color:c.color}}>Cluster {c.id}</span>
                      <span style={{fontSize:10,background:c.type==="2-seed"?"#0c2233":"#0f172a",border:`1px solid ${c.type==="2-seed"?"#0891b2":"#334155"}`,borderRadius:4,padding:"2px 6px",color:c.type==="2-seed"?"#22d3ee":"#94a3b8",fontWeight:700}}>{c.type.toUpperCase()}</span>
                    </div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{c.left} + {c.right} · E8: {c.e8}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{textAlign:"center"}}>
                    <input
                      type="number" min="0" max={c.size}
                      value={entries[c.id]}
                      onChange={e=>updateEntries(c.id,e.target.value)}
                      style={{width:52,background:"#0f172a",border:`1px solid ${c.color}`,borderRadius:6,color:"#f1f5f9",fontSize:16,fontWeight:800,textAlign:"center",padding:"4px 0"}}
                    />
                    <div style={{fontSize:10,color:"#64748b",marginTop:1}}>alive / {c.size}</div>
                  </div>
                  <button onClick={()=>toggleElim(c.id)} style={{
                    padding:"6px 10px",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
                    background:eliminated[c.id]?"#7f1d1d":"#1e3a1e",color:eliminated[c.id]?"#fca5a5":"#4ade80"
                  }}>{eliminated[c.id]?"❌ ELIM":"✅ ALIVE"}</button>
                </div>
              </div>

              {/* Pick grid */}
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {DAY_KEYS.map((dk,i)=>{
                  const pick = picks[c.id][dk];
                  const isE8 = dk==="7+8";
                  const isEditing = editCluster===c.id && editDay===dk;
                  return (
                    <div key={i} style={{
                      background:isE8?"#78350f":pick?"#0a1f0f":"#0f172a",
                      border:`1px solid ${isE8?"#f59e0b":pick?"#16a34a":"#334155"}`,
                      borderRadius:7,padding:"6px 8px",minWidth:58,cursor:"pointer",position:"relative"
                    }}
                    onClick={()=>{if(!isEditing){setEditCluster(c.id);setEditDay(dk);setEditVal(pick||"");}}}
                    >
                      <div style={{color:"#64748b",fontSize:9,marginBottom:2}}>{DAY_LABELS[i]}</div>
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editVal}
                          onChange={e=>setEditVal(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={e=>e.key==="Enter"&&saveEdit()}
                          style={{width:"100%",background:"transparent",border:"none",color:"#fbbf24",fontSize:10,fontWeight:700,outline:"none"}}
                        />
                      ) : (
                        <div style={{color:isE8?"#fbbf24":pick?"#4ade80":"#475569",fontWeight:700,fontSize:10}}>
                          {pick || "—"}
                        </div>
                      )}
                      {pick && WIN_PROBS[pick] && !isE8 && (
                        <div style={{fontSize:9,color:WIN_PROBS[pick]>70?"#4ade80":WIN_PROBS[pick]>50?"#fbbf24":"#f87171",marginTop:1}}>
                          {WIN_PROBS[pick]}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{background:"#1e293b",borderRadius:8,padding:12,fontSize:11,color:"#94a3b8",border:"1px solid #334155"}}>
            💡 Click any pick cell to edit. Adjust "alive" count as entries get eliminated each day. The survival % updates automatically.
          </div>
        </div>
      )}

      {activeTab==="depth"&&(
        <div>
          <div style={{fontSize:12,color:"#94a3b8",marginBottom:14}}>Three layers of protection per cluster. If primary anchor busts, rescue activates. If rescue also busts, tertiary steps in. Never be caught without a plan.</div>
          {CLUSTER_DEF.map(c=>{
            const d = DEPTH_CHART[c.id];
            return (
              <div key={c.id} style={{background:"#1e293b",borderRadius:12,padding:14,marginBottom:10,borderLeft:`5px solid ${c.color}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontWeight:800,fontSize:15,color:c.color}}>Cluster {c.id}</span>
                  <span style={{fontSize:11,color:"#64748b"}}>{entries[c.id]} entries alive</span>
                </div>
                {[
                  {tier:"🥇 PRIMARY",pick:d.primary,color:"#4ade80",bg:"#0a1f0f",border:"#16a34a"},
                  {tier:"🚨 RESCUE",pick:d.rescue,color:"#fbbf24",bg:"#1a1200",border:"#ca8a04"},
                  {tier:"🆘 TERTIARY",pick:d.tertiary,color:"#f87171",bg:"#1a0808",border:"#7f1d1d"},
                ].map((row,i)=>(
                  <div key={i} style={{background:row.bg,border:`1px solid ${row.border}`,borderRadius:8,padding:"8px 12px",marginBottom:6,display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{fontSize:10,fontWeight:700,color:row.color,minWidth:70}}>{row.tier}</div>
                    <div style={{fontSize:12,color:"#f1f5f9",fontWeight:600}}>{row.pick}</div>
                  </div>
                ))}
                <div style={{fontSize:11,color:"#64748b",marginTop:6,fontStyle:"italic"}}>💡 {d.note}</div>
              </div>
            );
          })}
          <div style={{background:"#1e293b",borderRadius:10,padding:14,border:"1px solid #334155",fontSize:12,color:"#94a3b8",lineHeight:1.7}}>
            <strong style={{color:"#fbbf24"}}>Key principle:</strong> Never burn a team that's on a cluster's depth chart until you're sure their tier above is still alive. If Duke is your primary, don't burn St. John's (tertiary) before you know Duke's status that day. Submit picks as LATE as possible on rescue decision days.
          </div>
        </div>
      )}

      {activeTab==="suggested"&&(
        <div>
          <div style={{fontSize:12,color:"#94a3b8",marginBottom:14}}>Full suggested pick sequence for all 6 clusters. 🔥 = 1-seed burned as fodder. * = conditional rescue pick — wait for results before submitting.</div>
          {CLUSTER_DEF.map(c=>(
            <div key={c.id} style={{background:"#1e293b",borderRadius:12,padding:14,marginBottom:10,borderLeft:`5px solid ${c.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontWeight:800,fontSize:15,color:c.color}}>Cluster {c.id}</span>
                <span style={{fontSize:11,color:"#64748b"}}>{c.left} + {c.right} · {c.e8} E8</span>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {DAY_KEYS.map((dk,i)=>{
                  const s = SUGGESTED[c.id][dk];
                  const isE8 = dk==="7+8";
                  const isFodder = s && s.includes("🔥");
                  const isConditional = s && s.includes("*");
                  const isSplit = s === "Split";
                  return (
                    <div key={i} style={{
                      background:isE8?"#78350f":isFodder?"#1a0808":isSplit?"#0f2a1a":"#0f172a",
                      border:`1px solid ${isE8?"#f59e0b":isFodder?"#ef4444":isSplit?"#16a34a":"#334155"}`,
                      borderRadius:7,padding:"6px 8px",minWidth:62,textAlign:"center"
                    }}>
                      <div style={{color:"#64748b",fontSize:9,marginBottom:2}}>{DAY_LABELS[i]}</div>
                      <div style={{color:isE8?"#fbbf24":isFodder?"#f87171":isConditional?"#fbbf24":isSplit?"#4ade80":"#e2e8f0",fontWeight:700,fontSize:10}}>{s}</div>
                      {WIN_PROBS[s?.replace("🔥","")] && !isE8 && !isSplit && (
                        <div style={{fontSize:9,color:WIN_PROBS[s.replace("🔥","")]>70?"#4ade80":WIN_PROBS[s.replace("🔥","")]>50?"#fbbf24":"#f87171",marginTop:1}}>
                          {WIN_PROBS[s.replace("🔥","")]}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{background:"#1e293b",borderRadius:10,padding:12,fontSize:11,color:"#94a3b8",border:"1px solid #334155",marginTop:4}}>
            🔥 Clusters E & F intentionally burn 1-seeds as fodder on Days 3-4, preserving 2-seed anchors for E8. &nbsp;* = submit these picks LAST on that day after checking if your anchor survived.
          </div>
        </div>
      )}

      {activeTab==="rules"&&(
        <div>
          {[
            {title:"⚡ Double Pick Day (Day 7+8)", body:"Both Elite Eight picks must win. One from LEFT bracket half (Duke/Florida/Houston/Connecticut), one from RIGHT (Michigan/Arizona/Iowa St./Purdue). If either loses you're eliminated. Go chalk — no heroics.", color:"#f59e0b"},
            {title:"🏆 Endgame: Split for Chop", body:"Day 9 (Final Four): Split entries 50/50 across both games. Day 10 (Championship): Put entries on BOTH finalists. Goal = maximum entries alive for the prize split. You are NOT trying to predict the winner.", color:"#3b82f6"},
            {title:"🚨 Rescue Protocol", body:"On Day 6 — wait until after Day 5 results before picking. If your 1-seed anchor is still alive → burn the rescue 2-seed normally. If your 1-seed busted → rescue 2-seed becomes your new E8 anchor. Information is leverage.", color:"#f87171"},
            {title:"🛡️ Depth Chart Priority", body:"Never burn a team on a cluster's depth chart if the tier above them is still alive. Primary → Rescue → Tertiary. Each layer only activates when the one above it is eliminated.", color:"#4ade80"},
            {title:"📋 Team Use Rule", body:"Each team can only be used ONCE per entry across the entire tournament. Track carefully — running out of teams = elimination, same as a wrong pick.", color:"#9333ea"},
            {title:"🎲 Burn Ladder", body:"Days 1-2: 7/8/9 seeds (or safe 4/5/6 seeds if 7-9s are thin). Days 3-4: 3 seeds. Days 5-6: 4 & 5 seeds. Day 7+8: 1-seed anchors. Never burn a higher-value team when a lower-value team can do the job.", color:"#d97706"},
          ].map((r,i)=>(
            <div key={i} style={{background:"#1e293b",borderRadius:12,padding:14,marginBottom:10,borderLeft:`4px solid ${r.color}`}}>
              <div style={{fontWeight:800,fontSize:14,color:r.color,marginBottom:6}}>{r.title}</div>
              <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.7}}>{r.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";

const CC = { A:"#2563eb", B:"#16a34a", C:"#9333ea", D:"#dc2626", E:"#0891b2", F:"#db2477" };

const CLUSTERS = [
  { id:"A", size:30, color:"#2563eb", type:"1-seed", left:"Duke",    right:"Michigan", rescue:"Iowa St. (if Duke busts)",     combined:"38.4%", desc:"Strongest 1-seed pair. Rescue: Iowa St. covers if Duke falls." },
  { id:"B", size:30, color:"#16a34a", type:"1-seed", left:"Duke",    right:"Arizona",  rescue:"Purdue (if Arizona busts)",    combined:"32.7%", desc:"Duke + Arizona. Rescue: Purdue covers if Arizona falls." },
  { id:"C", size:25, color:"#9333ea", type:"1-seed", left:"Florida", right:"Michigan", rescue:"Houston (if Florida busts)",   combined:"27.4%", desc:"Florida + Michigan. Rescue: Houston covers if Florida falls." },
  { id:"D", size:25, color:"#dc2626", type:"1-seed", left:"Florida", right:"Arizona",  rescue:"Connecticut (if Florida busts)",combined:"23.3%", desc:"Florida + Arizona. Rescue: Connecticut covers if Florida falls." },
  { id:"E", size:20, color:"#0891b2", type:"2-seed", left:"Houston", right:"Iowa St.", rescue:"St. John's or Vanderbilt",     combined:"~21.5%", desc:"2-seed cluster. Burns 1-seeds as fodder Days 3-4. Contrarian E8 pair." },
  { id:"F", size:20, color:"#db2477", type:"2-seed", left:"Connecticut", right:"Purdue", rescue:"Arkansas or Alabama",        combined:"~24.0%", desc:"2-seed cluster. Burns 1-seeds as fodder Days 3-4. Contrarian E8 pair." },
];

// Win probabilities for reference
const TEAMS = {
  // 7/8/9 seeds — Days 1-2 burn candidates
  "Ohio St.":    {seed:8, region:"East",    r64:64.4, s16:3.3,  e8:1.1,  tier:"7-9"},
  "Iowa":        {seed:9, region:"South",   r64:60.8, s16:9.0,  e8:3.2,  tier:"7-9"},
  "Georgia":     {seed:8, region:"Midwest", r64:51.0, s16:2.5,  e8:0.9,  tier:"7-9"},
  "Saint Louis": {seed:9, region:"Midwest", r64:49.0, s16:3.8,  e8:1.8,  tier:"7-9"},
  "Villanova":   {seed:8, region:"West",    r64:39.8, s16:2.4,  e8:0.6,  tier:"7-9"},
  "UCLA":        {seed:7, region:"East",    r64:72.3, s16:7.1,  e8:1.2,  tier:"7-9"},
  "UCF":         {seed:10,region:"East",    r64:27.7, s16:4.1,  e8:0.7,  tier:"7-9"},
  "Clemson":     {seed:8, region:"South",   r64:39.2, s16:4.5,  e8:1.5,  tier:"7-9"},
  "Saint Mary's":{seed:7, region:"South",   r64:63.4, s16:13.0, e8:4.5,  tier:"7-9"},
  "Kentucky":    {seed:7, region:"Midwest", r64:60.6, s16:11.6, e8:4.2,  tier:"7-9"},
  "Miami FL":    {seed:7, region:"West",    r64:67.5, s16:13.1, e8:4.5,  tier:"7-9"},
  // 3 seeds — Days 3-4
  "Michigan St.":{seed:3, region:"East",    r64:94.2, s16:36.8, e8:12.7, tier:"3"},
  "Illinois":    {seed:3, region:"South",   r64:99.5, s16:38.0, e8:17.0, tier:"3"},
  "Gonzaga":     {seed:3, region:"West",    r64:97.3, s16:32.4, e8:9.5,  tier:"3"},
  "Virginia":    {seed:3, region:"Midwest", r64:95.5, s16:23.4, e8:6.0,  tier:"3"},
  // 4/5 seeds — Days 5-6 (saved for deeper optionality)
  "Kansas":      {seed:4, region:"East",    r64:92.9, s16:40.3, e8:7.8,  tier:"4-5"},
  "St. John's":  {seed:5, region:"East",    r64:85.8, s16:55.4, e8:16.2, tier:"4-5"},
  "Nebraska":    {seed:4, region:"South",   r64:87.1, s16:41.6, e8:11.5, tier:"4-5"},
  "Vanderbilt":  {seed:5, region:"South",   r64:86.7, s16:54.2, e8:17.9, tier:"4-5"},
  "Alabama":     {seed:4, region:"Midwest", r64:87.1, s16:65.9, e8:8.3,  tier:"4-5"},
  "Texas Tech":  {seed:5, region:"Midwest", r64:67.1, s16:23.9, e8:2.2,  tier:"4-5"},
  "Arkansas":    {seed:4, region:"West",    r64:95.3, s16:65.7, e8:14.5, tier:"4-5"},
  "Wisconsin":   {seed:5, region:"West",    r64:73.6, s16:28.8, e8:5.1,  tier:"4-5"},
};

const DAYS = [
  {
    day:1, label:"Day 1 — Round of 64 (Thu Mar 19)", rule:"GAMBLE: 7, 8, 9 seeds",
    note:"Accept ~65-75% win prob today in exchange for keeping 4/5 seeds alive for deeper optionality. Pick the safest 7/8/9 available — UCLA (72%), Saint Mary's (63%), Ohio St. (64%), Iowa (61%), Kentucky (61%), Miami FL (68%). Avoid coin-flip 8/9s like Clemson (39%), Villanova (40%).",
    options:[
      {team:"UCLA",        seed:7,  region:"East",    winPct:72.3, burn:true,  note:"Best 7-9 option East"},
      {team:"Saint Mary's",seed:7,  region:"South",   winPct:63.4, burn:true,  note:"Best 7-9 option South"},
      {team:"Kentucky",    seed:7,  region:"Midwest", winPct:60.6, burn:true,  note:"Best 7-9 option Midwest"},
      {team:"Miami FL",    seed:7,  region:"West",    winPct:67.5, burn:true,  note:"Best 7-9 option West"},
      {team:"Ohio St.",    seed:8,  region:"East",    winPct:64.4, burn:true,  note:"Solid fallback East"},
      {team:"Iowa",        seed:9,  region:"South",   winPct:60.8, burn:true,  note:"Solid fallback South"},
      {team:"St. John's",  seed:5,  region:"East",    winPct:85.8, burn:false, note:"🟡 SAVE — 16.2% E8"},
      {team:"Vanderbilt",  seed:5,  region:"South",   winPct:86.7, burn:false, note:"🟡 SAVE — 17.9% E8"},
      {team:"Arkansas",    seed:4,  region:"West",    winPct:95.3, burn:false, note:"🟡 SAVE — 14.5% E8"},
      {team:"Alabama",     seed:4,  region:"Midwest", winPct:87.1, burn:false, note:"🟡 SAVE — 8.3% E8"},
    ],
    clusterPicks:[
      {cluster:"A", pick:"UCLA",         reason:"7-seed East. 72.3%. Best 7-9 option available. All anchors + Iowa St. rescue protected."},
      {cluster:"B", pick:"Miami FL",     reason:"7-seed West. 67.5%. Strong 7-seed. All anchors + Purdue rescue protected."},
      {cluster:"C", pick:"Saint Mary's", reason:"7-seed South. 63.4%. All anchors + Houston rescue protected."},
      {cluster:"D", pick:"Kentucky",     reason:"7-seed Midwest. 60.6%. All anchors + Connecticut rescue protected."},
      {cluster:"E", pick:"Ohio St.",     reason:"8-seed East. 64.4%. Houston & Iowa St. untouched. Diversify from Cluster A."},
      {cluster:"F", pick:"Iowa",         reason:"9-seed South. 60.8%. Connecticut & Purdue untouched. Diversify from Cluster C."},
    ]
  },
  {
    day:2, label:"Day 2 — Round of 64 (Fri Mar 20)", rule:"GAMBLE: 7, 8, 9 seeds (different region)",
    note:"Continue burning 7/8/9 seeds from DIFFERENT regions than Day 1 per cluster. Georgia (51%), Saint Louis (49%) are riskier — only use if you need region coverage. Prioritize unused 7-seeds first.",
    options:[
      {team:"UCLA",        seed:7,  region:"East",    winPct:72.3, burn:true,  note:"If unused Day 1"},
      {team:"Saint Mary's",seed:7,  region:"South",   winPct:63.4, burn:true,  note:"If unused Day 1"},
      {team:"Kentucky",    seed:7,  region:"Midwest", winPct:60.6, burn:true,  note:"If unused Day 1"},
      {team:"Miami FL",    seed:7,  region:"West",    winPct:67.5, burn:true,  note:"If unused Day 1"},
      {team:"Ohio St.",    seed:8,  region:"East",    winPct:64.4, burn:true,  note:"If unused Day 1"},
      {team:"Georgia",     seed:8,  region:"Midwest", winPct:51.0, burn:true,  note:"Riskier — use if needed"},
      {team:"Saint Louis", seed:9,  region:"Midwest", winPct:49.0, burn:true,  note:"Riskier — use if needed"},
      {team:"Iowa",        seed:9,  region:"South",   winPct:60.8, burn:true,  note:"If unused Day 1"},
    ],
    clusterPicks:[
      {cluster:"A", pick:"Kentucky",     reason:"7-seed Midwest. 60.6%. Different region from Day 1 (East). All anchors intact."},
      {cluster:"B", pick:"Saint Mary's", reason:"7-seed South. 63.4%. Different region from Day 1 (West). All anchors intact."},
      {cluster:"C", pick:"Miami FL",     reason:"7-seed West. 67.5%. Different region from Day 1 (South). All anchors intact."},
      {cluster:"D", pick:"UCLA",         reason:"7-seed East. 72.3%. Different region from Day 1 (Midwest). All anchors intact."},
      {cluster:"E", pick:"Kentucky",     reason:"7-seed Midwest. 60.6%. Diversify regions. Houston & Iowa St. untouched."},
      {cluster:"F", pick:"Saint Mary's", reason:"7-seed South. 63.4%. Diversify regions. Connecticut & Purdue untouched."},
    ]
  },
  {
    day:3, label:"Day 3 — Round of 32 (Sat Mar 22)", rule:"BURN: 3 seeds",
    note:"Menu shrinks to ~16 games. 3-seeds are perfect here — strong R32 win% (94-99%), modest E8 ceiling. NOTE: Clusters E & F now burn their 1-seeds as fodder — they don't need them for E8.",
    options:[
      {team:"Michigan St.", seed:3, region:"East",    winPct:94.2, burn:true,  note:"✓ BURN — 12.7% E8 only"},
      {team:"Illinois",     seed:3, region:"South",   winPct:99.5, burn:true,  note:"✓ BURN — 17.0% E8 only"},
      {team:"Gonzaga",      seed:3, region:"West",    winPct:97.3, burn:true,  note:"✓ BURN — 9.5% E8 only"},
      {team:"Virginia",     seed:3, region:"Midwest", winPct:95.5, burn:true,  note:"✓ BURN — 6.0% E8 only"},
      {team:"Duke",         seed:1, region:"East",    winPct:88.5, burn:false, note:"🔴 Protect (A,B) | 🔥 Fodder (E,F)"},
      {team:"Florida",      seed:1, region:"South",   winPct:86.4, burn:false, note:"🔴 Protect (C,D) | 🔥 Fodder (E,F)"},
    ],
    clusterPicks:[
      {cluster:"A", pick:"Michigan St.", reason:"3-seed East. 94.2%. Duke, Michigan + Iowa St. rescue all intact."},
      {cluster:"B", pick:"Gonzaga",      reason:"3-seed West. 97.3%. Duke, Arizona + Purdue rescue all intact."},
      {cluster:"C", pick:"Illinois",     reason:"3-seed South. 99.5%. Florida, Michigan + Houston rescue all intact."},
      {cluster:"D", pick:"Virginia",     reason:"3-seed Midwest. 95.5%. Florida, Arizona + Connecticut rescue all intact."},
      {cluster:"E", pick:"Duke",         reason:"🔥 Burn Duke as fodder. E cluster saving Houston+Iowa St. for E8. Duke expendable here."},
      {cluster:"F", pick:"Florida",      reason:"🔥 Burn Florida as fodder. F cluster saving Connecticut+Purdue for E8. Florida expendable here."},
    ]
  },
  {
    day:4, label:"Day 4 — Round of 32 (Sun Mar 23)", rule:"BURN: 3 seeds (different region) + E/F burn remaining 1-seeds",
    note:"Burn remaining 3-seeds in a different region from Day 3. Clusters E & F complete their 1-seed fodder burns today.",
    options:[
      {team:"Michigan St.", seed:3, region:"East",    winPct:94.2, burn:true},
      {team:"Illinois",     seed:3, region:"South",   winPct:99.5, burn:true},
      {team:"Gonzaga",      seed:3, region:"West",    winPct:97.3, burn:true},
      {team:"Virginia",     seed:3, region:"Midwest", winPct:95.5, burn:true},
      {team:"Michigan",     seed:1, region:"Midwest", winPct:93.7, burn:false, note:"🔴 Protect (A,C) | 🔥 Fodder (E,F)"},
      {team:"Arizona",      seed:1, region:"West",    winPct:90.8, burn:false, note:"🔴 Protect (B,D) | 🔥 Fodder (E,F)"},
    ],
    clusterPicks:[
      {cluster:"A", pick:"Virginia",     reason:"3-seed Midwest. Different region from Day 3. All 1-seed anchors + Iowa St. rescue intact."},
      {cluster:"B", pick:"Illinois",     reason:"3-seed South. Different region from Day 3. All anchors + Purdue rescue intact."},
      {cluster:"C", pick:"Gonzaga",      reason:"3-seed West. Different region from Day 3. All anchors + Houston rescue intact."},
      {cluster:"D", pick:"Michigan St.", reason:"3-seed East. Different region from Day 3. All anchors + Connecticut rescue intact."},
      {cluster:"E", pick:"Michigan",     reason:"🔥 Burn Michigan as fodder. Completes all 1-seed burns for Cluster E. Houston+Iowa St. pristine for E8."},
      {cluster:"F", pick:"Arizona",      reason:"🔥 Burn Arizona as fodder. Completes all 1-seed burns for Cluster F. Connecticut+Purdue pristine for E8."},
    ]
  },
  {
    day:5, label:"Day 5 — Sweet 16 (Thu Mar 27)", rule:"BURN: 4 & 5 seeds (now the right time)",
    note:"4/5 seeds have survived to the Sweet 16 — now you burn them. Strong win% here, and you've already passed the round where they provide rescue value. KEEP your designated rescue 2-seed in reserve.",
    options:[
      {team:"Kansas",      seed:4, region:"East",    winPct:40.3, burn:true,  note:"✓ BURN at Sweet 16"},
      {team:"St. John's",  seed:5, region:"East",    winPct:55.4, burn:true,  note:"✓ BURN at Sweet 16"},
      {team:"Nebraska",    seed:4, region:"South",   winPct:41.6, burn:true,  note:"✓ BURN at Sweet 16"},
      {team:"Vanderbilt",  seed:5, region:"South",   winPct:54.2, burn:true,  note:"✓ BURN at Sweet 16"},
      {team:"Alabama",     seed:4, region:"Midwest", winPct:65.9, burn:true,  note:"✓ BURN at Sweet 16 — best 4-seed"},
      {team:"Arkansas",    seed:4, region:"West",    winPct:65.7, burn:true,  note:"✓ BURN at Sweet 16 — strong"},
      {team:"Connecticut", seed:2, region:"East",    winPct:41.8, burn:false, note:"🚨 Rescue reserve (D)"},
      {team:"Houston",     seed:2, region:"South",   winPct:54.8, burn:false, note:"🚨 Rescue reserve (C,E)"},
      {team:"Iowa St.",    seed:2, region:"Midwest", winPct:54.8, burn:false, note:"🚨 Rescue reserve (A,E)"},
      {team:"Purdue",      seed:2, region:"West",    winPct:57.4, burn:false, note:"🚨 Rescue reserve (B,F)"},
    ],
    clusterPicks:[
      {cluster:"A", pick:"St. John's",  reason:"5-seed East. 55.4% S16 win. Iowa St. rescue still protected. Duke & Michigan locked."},
      {cluster:"B", pick:"Arkansas",    reason:"4-seed West. 65.7% S16 win. Purdue rescue still protected. Duke & Arizona locked."},
      {cluster:"C", pick:"Vanderbilt",  reason:"5-seed South. 54.2% S16 win. Houston rescue still protected. Florida & Michigan locked."},
      {cluster:"D", pick:"Alabama",     reason:"4-seed Midwest. 65.9% S16 win. Connecticut rescue still protected. Florida & Arizona locked."},
      {cluster:"E", pick:"Nebraska",    reason:"4-seed South. 41.6% S16. Good burn — Houston & Iowa St. still locked for E8."},
      {cluster:"F", pick:"Kansas",      reason:"4-seed East. 40.3% S16. Good burn — Connecticut & Purdue still locked for E8."},
    ]
  },
  {
    day:6, label:"Day 6 — Sweet 16 (Fri Mar 27)", rule:"BURN 4/5 or ACTIVATE RESCUE — check 1-seed status first",
    note:"CRITICAL DECISION. Wait until after Day 5 games resolve before submitting. Is your 1-seed anchor still alive? YES → burn remaining 4/5 seed. NO → your rescue 2-seed activates as replacement anchor for E8.",
    options:[
      {team:"Nebraska",    seed:4, region:"South",   winPct:41.6, burn:true,  note:"Burn if unused"},
      {team:"Kansas",      seed:4, region:"East",    winPct:40.3, burn:true,  note:"Burn if unused"},
      {team:"Wisconsin",   seed:5, region:"West",    winPct:28.8, burn:true,  note:"Burn if unused — lower %"},
      {team:"Texas Tech",  seed:5, region:"Midwest", winPct:23.9, burn:true,  note:"Burn if unused — lower %"},
      {team:"Iowa St.",    seed:2, region:"Midwest", winPct:54.8, burn:false, note:"🚨 A rescue — only if Duke busted"},
      {team:"Purdue",      seed:2, region:"West",    winPct:57.4, burn:false, note:"🚨 B rescue — only if Arizona busted"},
      {team:"Houston",     seed:2, region:"South",   winPct:54.8, burn:false, note:"🚨 C rescue — only if Florida busted"},
      {team:"Connecticut", seed:2, region:"East",    winPct:41.8, burn:false, note:"🚨 D rescue — only if Florida busted"},
    ],
    clusterPicks:[
      {cluster:"A", pick:"IF Duke alive → Wisconsin | IF Duke dead → Iowa St. becomes LEFT anchor for E8",    reason:"Iowa St. was held all tournament for this exact moment. Michigan stays RIGHT anchor either way."},
      {cluster:"B", pick:"IF Arizona alive → Texas Tech | IF Arizona dead → Purdue becomes RIGHT anchor for E8", reason:"Purdue rescue activates. Duke stays LEFT anchor either way."},
      {cluster:"C", pick:"IF Florida alive → Kansas    | IF Florida dead → Houston becomes LEFT anchor for E8",  reason:"Houston rescue activates. Michigan stays RIGHT anchor either way."},
      {cluster:"D", pick:"IF Florida alive → Nebraska  | IF Florida dead → Connecticut becomes LEFT anchor for E8",reason:"Connecticut rescue activates. Arizona stays RIGHT anchor. Conn+Ariz (~24%) is actually better than Fla+Ariz (~23.3%)."},
      {cluster:"E", pick:"Iowa St.",    reason:"Second E8 anchor deployed. Houston (Day 5) + Iowa St. (Day 6) — both saved fresh for E8."},
      {cluster:"F", pick:"Purdue",      reason:"Second E8 anchor deployed. Connecticut (Day 5) + Purdue (Day 6) — both saved fresh for E8."},
    ]
  },
  {
    day:"7+8", label:"⚡ Day 7+8 — Elite Eight COMBINED (Mar 28-29)", rule:"DEPLOY anchors — BOTH must win",
    note:"Deploy your protected pair. One from LEFT half (Duke/Florida/Houston/Connecticut), one from RIGHT half (Michigan/Arizona/Iowa St./Purdue). Both must win or you're eliminated.",
    options:[
      {team:"Duke",        seed:1, region:"East — LEFT",     winPct:55.9, burn:true,  note:"A,B primary anchor"},
      {team:"Florida",     seed:1, region:"South — LEFT",    winPct:39.9, burn:true,  note:"C,D primary anchor"},
      {team:"Michigan",    seed:1, region:"Midwest — RIGHT", winPct:68.7, burn:true,  note:"A,C primary anchor"},
      {team:"Arizona",     seed:1, region:"West — RIGHT",    winPct:58.5, burn:true,  note:"B,D primary anchor"},
      {team:"Iowa St.",    seed:2, region:"Midwest — RIGHT", winPct:54.8, burn:true,  note:"A rescue / E anchor"},
      {team:"Houston",     seed:2, region:"South — LEFT",    winPct:39.2, burn:true,  note:"C rescue / E anchor"},
      {team:"Purdue",      seed:2, region:"West — RIGHT",    winPct:57.4, burn:true,  note:"B rescue / F anchor"},
      {team:"Connecticut", seed:2, region:"East — LEFT",     winPct:41.8, burn:true,  note:"D rescue / F anchor"},
    ],
    clusterPicks:[
      {cluster:"A", pick:"Duke + Michigan  (rescue: Iowa St. + Michigan)",      reason:"Primary: 38.4%. Rescue path: ~37.8%. Near-zero drop-off if Duke fell."},
      {cluster:"B", pick:"Duke + Arizona   (rescue: Duke + Purdue)",            reason:"Primary: 32.7%. Rescue path: ~32.1%. Minimal drop-off if Arizona fell."},
      {cluster:"C", pick:"Florida + Michigan (rescue: Houston + Michigan)",     reason:"Primary: 27.4%. Rescue path: ~26.9%. Stays viable if Florida fell."},
      {cluster:"D", pick:"Florida + Arizona  (rescue: Connecticut + Arizona)",  reason:"Primary: 23.3%. Rescue path: ~24.0%. Actually better if Florida fell."},
      {cluster:"E", pick:"Houston + Iowa St.",                                   reason:"2-seed pair. ~21.5%. Contrarian — field mostly burned these by now."},
      {cluster:"F", pick:"Connecticut + Purdue",                                 reason:"2-seed pair. ~24.0%. Highly differentiated from 1-seed clusters."},
    ]
  },
  {
    day:9, label:"Day 9 — Final Four (Sat Apr 4)", rule:"SPLIT 50/50 across both games",
    note:"Split surviving entries evenly across both Final Four games. Never stack all on one side — a single upset wipes you out. Splitting guarantees ~half your entries reach the Championship regardless of result.",
    options:[],
    clusterPicks:[
      {cluster:"ALL", pick:"~50% on each Final Four game", reason:"Chop equity beats bold picks. Guarantees Championship representation."},
    ]
  },
  {
    day:10, label:"Day 10 — Championship (Mon Apr 7)", rule:"SPLIT on both finalists",
    note:"Entries on BOTH finalists. The prize splits equally among all survivors. Maximum entries alive = maximum chop share. You are NOT trying to predict the winner.",
    options:[],
    clusterPicks:[
      {cluster:"ALL", pick:"Split entries on both finalists", reason:"3 entries surviving in a 5-way chop = 3/5 × prize pool. The split IS the strategy."},
    ]
  },
];

const TRACK = {
  A:["UCLA","Kentucky","Mich St.","Virginia","St. John's","Duke?/Wisc","Duke+Mich","Split","Split"],
  B:["Miami FL","St. Mary's","Gonzaga","Illinois","Arkansas","Ariz?/TTech","Duke+Ariz","Split","Split"],
  C:["St. Mary's","Miami FL","Illinois","Gonzaga","Vanderbilt","Fla?/Kans","Fla+Mich","Split","Split"],
  D:["Kentucky","UCLA","Virginia","Mich St.","Alabama","Fla?/Neb","Fla+Ariz","Split","Split"],
  E:["Ohio St.","Kentucky","Duke🔥","Michigan🔥","Nebraska","Iowa St.","Hou+ISU","Split","Split"],
  F:["Iowa","St. Mary's","Florida🔥","Arizona🔥","Kansas","Purdue","Conn+Pur","Split","Split"],
};

const dayLabels=["D1","D2","D3","D4","D5","D6","E8","FF","🏆"];

// Ranked 7/8/9 options table
const OPTIONS_79 = [
  {team:"UCLA",        seed:7, region:"East",    r64:72.3, future:"Low",  rec:true},
  {team:"Miami FL",    seed:7, region:"West",    r64:67.5, future:"Low",  rec:true},
  {team:"Saint Mary's",seed:7, region:"South",   r64:63.4, future:"Low",  rec:true},
  {team:"Ohio St.",    seed:8, region:"East",    r64:64.4, future:"Low",  rec:true},
  {team:"Kentucky",    seed:7, region:"Midwest", r64:60.6, future:"Low",  rec:true},
  {team:"Iowa",        seed:9, region:"South",   r64:60.8, future:"Low",  rec:true},
  {team:"Georgia",     seed:8, region:"Midwest", r64:51.0, future:"Low",  rec:false},
  {team:"Saint Louis", seed:9, region:"Midwest", r64:49.0, future:"Low",  rec:false},
  {team:"Clemson",     seed:8, region:"South",   r64:39.2, future:"Low",  rec:false},
  {team:"Villanova",   seed:8, region:"West",    r64:39.8, future:"Low",  rec:false},
  {team:"UCF",         seed:10,region:"East",    r64:27.7, future:"Low",  rec:false},
  {team:"Missouri",    seed:10,region:"West",    r64:32.5, future:"Low",  rec:false},
];

export default function App() {
  const [activeDay, setActiveDay] = useState(0);
  const [activeTab, setActiveTab] = useState("strategy");
  const d = DAYS[activeDay];

  return (
    <div style={{fontFamily:"system-ui,sans-serif",maxWidth:900,margin:"0 auto",padding:16,background:"#0f172a",color:"#e2e8f0",minHeight:"100vh"}}>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:22,fontWeight:800,color:"#f8fafc"}}>🏀 Splash Sports $25 Survivor</div>
        <div style={{fontSize:13,color:"#94a3b8",marginTop:4}}>150-Entry Portfolio v4 — Corrected Burn Ladder</div>
      </div>

      {/* Bracket halves */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {[
          {label:"LEFT HALF",teams:["Duke (East 1)","Florida (South 1)","Houston (South 2)","Connecticut (East 2)"],color:"#f59e0b"},
          {label:"RIGHT HALF",teams:["Michigan (Midwest 1)","Arizona (West 1)","Iowa St. (Midwest 2)","Purdue (West 2)"],color:"#3b82f6"},
        ].map((h,i)=>(
          <div key={i} style={{background:"#1e293b",borderRadius:10,padding:10,border:`1px solid ${h.color}44`}}>
            <div style={{fontSize:10,fontWeight:800,color:h.color,marginBottom:5,letterSpacing:1}}>{h.label}</div>
            {h.teams.map(t=><div key={t} style={{fontSize:11,color:"#e2e8f0",marginBottom:2}}>• {t}</div>)}
            <div style={{fontSize:10,color:"#64748b",marginTop:5}}>⚠️ Same-side teams meet in F4</div>
          </div>
        ))}
      </div>

      {/* Burn ladder */}
      <div style={{display:"flex",gap:4,marginBottom:14,background:"#1e293b",borderRadius:10,padding:10,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:10,color:"#64748b",fontWeight:700,marginRight:2}}>BURN ORDER:</span>
        {[
          {label:"Days 1-2",sub:"7/8/9 seeds",color:"#ef4444"},
          {label:"Days 3-4",sub:"3 seeds",color:"#d97706"},
          {label:"Days 5-6",sub:"4 & 5 seeds",color:"#9333ea"},
          {label:"Day 7+8",sub:"Anchors",color:"#f59e0b"},
          {label:"9-10",sub:"Split/Chop",color:"#3b82f6"},
        ].map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
            {i>0&&<span style={{color:"#334155",fontSize:14}}>→</span>}
            <div style={{background:"#0f172a",border:`1px solid ${s.color}`,borderRadius:6,padding:"4px 8px",textAlign:"center"}}>
              <div style={{fontSize:10,color:s.color,fontWeight:700}}>{s.label}</div>
              <div style={{fontSize:10,color:"#94a3b8"}}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:5,marginBottom:14,background:"#1e293b",padding:5,borderRadius:10}}>
        {[["strategy","📅 Day-by-Day"],["clusters","🗂️ Clusters"],["79","🎲 7-9 Rankings"],["rescue","🚨 Rescue"],["e8","⚡ E8"]].map(([t,lbl])=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{
            flex:1,padding:"7px 0",borderRadius:7,border:"none",cursor:"pointer",fontWeight:600,fontSize:11,
            background:activeTab===t?"#3b82f6":"transparent",color:activeTab===t?"#fff":"#94a3b8"
          }}>{lbl}</button>
        ))}
      </div>

      {activeTab==="strategy"&&(
        <>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
            {DAYS.map((dy,i)=>(
              <button key={i} onClick={()=>setActiveDay(i)} style={{
                padding:"5px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
                background:activeDay===i?(dy.day==="7+8"?"#f59e0b":"#3b82f6"):"#1e293b",
                color:activeDay===i?"#fff":"#94a3b8",
                outline:dy.day==="7+8"?"2px solid #f59e0b":"none"
              }}>{dy.day==="7+8"?"⚡ E8":`Day ${dy.day}`}</button>
            ))}
          </div>
          <div style={{background:"#1e293b",borderRadius:12,padding:16,border:d.day==="7+8"?"2px solid #f59e0b":"1px solid #334155"}}>
            <div style={{fontSize:15,fontWeight:800,color:d.day==="7+8"?"#fbbf24":"#f1f5f9",marginBottom:4}}>{d.label}</div>
            <div style={{display:"inline-block",background:"#0f172a",border:"1px solid #475569",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#fbbf24",marginBottom:10}}>{d.rule}</div>
            <div style={{fontSize:12,color:"#94a3b8",marginBottom:14,lineHeight:1.6}}>{d.note}</div>
            {d.options.length>0&&(
              <>
                <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Team Menu</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:7,marginBottom:16}}>
                  {d.options.map((o,i)=>(
                    <div key={i} style={{background:o.burn?"#0a1f0f":"#1a0a0a",border:`1px solid ${o.burn?"#16a34a":"#92400e"}`,borderRadius:8,padding:9}}>
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{fontWeight:700,fontSize:13,color:o.burn?"#4ade80":"#fcd34d"}}>{o.team}</span>
                        {o.winPct&&<span style={{fontWeight:800,fontSize:13,color:o.winPct>70?"#4ade80":o.winPct>50?"#fbbf24":"#f87171"}}>{o.winPct}%</span>}
                      </div>
                      <div style={{fontSize:11,color:"#64748b",marginTop:2}}>Seed {o.seed} · {o.region}</div>
                      <div style={{fontSize:11,marginTop:4,fontWeight:600,color:o.burn?"#4ade80":"#fbbf24"}}>{o.note||(o.burn?"✓ BURN":"🔴 PROTECT")}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Cluster Assignments</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {d.clusterPicks.map((cp,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",background:"#0f172a",borderRadius:8,padding:10,borderLeft:`4px solid ${CC[cp.cluster]||"#3b82f6"}`}}>
                  <div style={{minWidth:68,fontWeight:800,fontSize:12,color:CC[cp.cluster]||"#3b82f6",flexShrink:0}}>{cp.cluster==="ALL"?"ALL":`Cls ${cp.cluster}`}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:"#f1f5f9"}}>{cp.pick}</div>
                    <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{cp.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab==="clusters"&&(
        <div>
          <div style={{fontSize:12,color:"#94a3b8",marginBottom:14}}>6 clusters × portfolio of 150. Every E8 pair crosses bracket halves. 4 one-seed clusters with rescue coverage + 2 contrarian 2-seed clusters.</div>
          {CLUSTERS.map(c=>(
            <div key={c.id} style={{background:"#1e293b",borderRadius:12,padding:14,marginBottom:10,borderLeft:`5px solid ${c.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontWeight:800,fontSize:15,color:c.color}}>Cluster {c.id}</span>
                  <span style={{background:c.type==="2-seed"?"#0c2233":"#0f172a",border:`1px solid ${c.type==="2-seed"?"#0891b2":"#334155"}`,borderRadius:4,padding:"2px 7px",fontSize:10,fontWeight:700,color:c.type==="2-seed"?"#22d3ee":"#94a3b8"}}>{c.type.toUpperCase()}</span>
                </div>
                <span style={{background:"#0f172a",borderRadius:6,padding:"3px 9px",fontSize:12,color:"#94a3b8"}}>{c.size} entries</span>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                <div style={{background:"#78350f22",border:"1px solid #f59e0b55",borderRadius:6,padding:"3px 9px",fontSize:11}}><span style={{color:"#f59e0b",fontWeight:700}}>L: </span><span style={{color:"#e2e8f0"}}>{c.left}</span></div>
                <div style={{background:"#1e3a5f22",border:"1px solid #3b82f655",borderRadius:6,padding:"3px 9px",fontSize:11}}><span style={{color:"#3b82f6",fontWeight:700}}>R: </span><span style={{color:"#e2e8f0"}}>{c.right}</span></div>
                <div style={{background:"#0f172a",border:"1px solid #334155",borderRadius:6,padding:"3px 9px",fontSize:11}}><span style={{color:"#64748b"}}>E8: </span><span style={{color:"#4ade80",fontWeight:700}}>{c.combined}</span></div>
              </div>
              {c.type==="1-seed"&&<div style={{background:"#1a1200",border:"1px solid #ca8a0444",borderRadius:6,padding:"5px 9px",fontSize:11,color:"#fbbf24",marginBottom:6}}>🚨 Rescue: {c.rescue}</div>}
              <div style={{fontSize:12,color:"#94a3b8",marginBottom:10}}>{c.desc}</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {dayLabels.map((lbl,i)=>(
                  <div key={i} style={{background:i===6?"#78350f":"#0f172a",border:`1px solid ${i===6?"#f59e0b":"#334155"}`,borderRadius:5,padding:"4px 6px",minWidth:48,textAlign:"center"}}>
                    <div style={{color:"#64748b",fontSize:9}}>{lbl}</div>
                    <div style={{color:i===6?"#fbbf24":TRACK[c.id][i].includes("🔥")?"#f87171":TRACK[c.id][i].includes("?")?"#fbbf24":"#e2e8f0",fontWeight:600,fontSize:9,marginTop:1}}>{TRACK[c.id][i]}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{background:"#1e293b",borderRadius:10,padding:12,fontSize:11,color:"#94a3b8",border:"1px solid #334155"}}>
            🔥 = 1-seed burned as fodder (Clusters E,F only) &nbsp;|&nbsp; ? = conditional pick (rescue decision day) &nbsp;|&nbsp; Keep a spreadsheet: rows = clusters, columns = days.
          </div>
        </div>
      )}

      {activeTab==="79"&&(
        <div>
          <div style={{background:"#1e293b",borderRadius:12,padding:16,marginBottom:14}}>
            <div style={{fontSize:15,fontWeight:800,color:"#f1f5f9",marginBottom:4}}>🎲 7/8/9 Seed Rankings — Days 1 & 2 Burn Candidates</div>
            <div style={{fontSize:12,color:"#94a3b8",marginBottom:14,lineHeight:1.6}}>
              You're accepting lower win% on Days 1-2 in exchange for keeping 4/5 seeds available as deep rescue options. Stick to the <span style={{color:"#4ade80",fontWeight:700}}>green recommended</span> options (&gt;60% win prob). Avoid the <span style={{color:"#f87171",fontWeight:700}}>red risky</span> ones — near coin flips not worth the gamble.
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {OPTIONS_79.map((o,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:o.rec?"#0a1f0f":"#1a0808",border:`1px solid ${o.rec?"#16a34a":"#7f1d1d"}`,borderRadius:8,padding:"8px 12px"}}>
                  <div style={{minWidth:24,height:24,borderRadius:"50%",background:o.rec?"#16a34a":"#dc2626",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontWeight:700,fontSize:14,color:o.rec?"#4ade80":"#fca5a5"}}>{o.team}</span>
                      <span style={{fontWeight:800,fontSize:16,color:o.r64>65?"#4ade80":o.r64>50?"#fbbf24":"#f87171"}}>{o.r64}%</span>
                    </div>
                    <div style={{fontSize:11,color:"#64748b"}}>Seed {o.seed} · {o.region} · Future E8 value: ~0%</div>
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color:o.rec?"#4ade80":"#f87171",minWidth:60,textAlign:"right"}}>{o.rec?"✓ USE":"⚠️ RISKY"}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#0f172a",borderRadius:8,padding:12,marginTop:14,fontSize:12,color:"#94a3b8",lineHeight:1.7,border:"1px solid #334155"}}>
              <strong style={{color:"#fbbf24"}}>The tradeoff:</strong> Using 7-seeds instead of 4-seeds on Days 1-2 costs you roughly 15-20% daily survival probability. On 150 entries, you expect to lose ~22-30 more entries by Day 2 vs. the conservative approach. BUT — you keep St. John's (16.2% E8), Vanderbilt (17.9% E8), and Arkansas (14.5% E8) in reserve as legitimate late-round rescue options, which is worth far more than the early entry losses.
            </div>
          </div>
        </div>
      )}

      {activeTab==="rescue"&&(
        <div>
          <div style={{background:"#1e293b",borderRadius:12,padding:16,marginBottom:14,border:"2px solid #f59e0b"}}>
            <div style={{fontSize:15,fontWeight:800,color:"#fbbf24",marginBottom:10}}>🚨 The Rescue System</div>
            <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.8,marginBottom:14}}>
              Each 1-seed cluster holds one 2-seed completely untouched as insurance all tournament. On Day 6 — AFTER Day 5 results — you make a binary call: 1-seed still alive? Burn the rescue normally. 1-seed dead? The rescue 2-seed becomes your new E8 anchor. Submit your Day 6 pick as LATE as possible to maximize information.
            </div>
            {[
              {cluster:"A",color:"#2563eb",anchor:"Duke",side:"LEFT",rescue:"Iowa St.",rescueSide:"RIGHT",scenario:"If Duke falls: Iowa St.+Michigan = ~37.8% combined. Nearly identical to Duke+Michigan (38.4%). Rescue is almost lossless."},
              {cluster:"B",color:"#16a34a",anchor:"Arizona",side:"RIGHT",rescue:"Purdue",rescueSide:"RIGHT",scenario:"If Arizona falls: Duke+Purdue = ~32.1% combined. vs Duke+Arizona (32.7%). Minimal drop-off."},
              {cluster:"C",color:"#9333ea",anchor:"Florida",side:"LEFT",rescue:"Houston",rescueSide:"LEFT",scenario:"If Florida falls: Houston+Michigan = ~26.9% combined. vs Florida+Michigan (27.4%). Barely any difference."},
              {cluster:"D",color:"#dc2626",anchor:"Florida",side:"LEFT",rescue:"Connecticut",rescueSide:"LEFT",scenario:"If Florida falls: Connecticut+Arizona = ~24.0% combined. vs Florida+Arizona (23.3%). BETTER than the primary — a Florida bust actually helps Cluster D."},
            ].map((r,i)=>(
              <div key={i} style={{background:"#0f172a",borderRadius:10,padding:12,marginBottom:10,borderLeft:`4px solid ${r.color}`}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                  <span style={{fontWeight:800,color:r.color,fontSize:13}}>Cluster {r.cluster}</span>
                  <span style={{fontSize:11,color:"#64748b"}}>Anchor: <span style={{color:"#f1f5f9",fontWeight:600}}>{r.anchor} ({r.side})</span></span>
                </div>
                <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                  <div style={{background:"#1a1200",border:"1px solid #ca8a04",borderRadius:6,padding:"3px 9px",fontSize:11}}>
                    <span style={{color:"#fbbf24",fontWeight:700}}>Rescue: </span><span style={{color:"#e2e8f0"}}>{r.rescue} ({r.rescueSide})</span>
                  </div>
                </div>
                <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.6}}>{r.scenario}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab==="e8"&&(
        <div>
          <div style={{background:"#1e293b",borderRadius:12,padding:16,marginBottom:14,border:"2px solid #f59e0b"}}>
            <div style={{fontSize:15,fontWeight:800,color:"#fbbf24",marginBottom:10}}>⚡ All Valid E8 Pairs</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {[
                {pair:"Duke + Michigan",      pct:"38.4%",color:"#2563eb",note:"Cluster A primary",valid:true},
                {pair:"Iowa St. + Michigan",  pct:"37.8%",color:"#2563eb",note:"Cluster A rescue",valid:true},
                {pair:"Duke + Arizona",       pct:"32.7%",color:"#16a34a",note:"Cluster B primary",valid:true},
                {pair:"Duke + Purdue",        pct:"32.1%",color:"#16a34a",note:"Cluster B rescue",valid:true},
                {pair:"Florida + Michigan",   pct:"27.4%",color:"#9333ea",note:"Cluster C primary",valid:true},
                {pair:"Houston + Michigan",   pct:"26.9%",color:"#9333ea",note:"Cluster C rescue",valid:true},
                {pair:"Connecticut + Arizona",pct:"24.0%",color:"#dc2626",note:"Cluster D rescue — better than primary!",valid:true},
                {pair:"Florida + Arizona",    pct:"23.3%",color:"#dc2626",note:"Cluster D primary",valid:true},
                {pair:"Connecticut + Purdue", pct:"~24.0%",color:"#db2477",note:"Cluster F — 2-seed pair",valid:true},
                {pair:"Houston + Iowa St.",   pct:"~21.5%",color:"#0891b2",note:"Cluster E — 2-seed pair",valid:true},
                {pair:"Duke + Florida",       pct:"❌",    color:"#475569",note:"INVALID — both LEFT half",valid:false},
                {pair:"Michigan + Arizona",   pct:"❌",    color:"#475569",note:"INVALID — both RIGHT half",valid:false},
              ].map((p,i)=>(
                <div key={i} style={{background:"#0f172a",borderRadius:8,padding:10,borderLeft:`4px solid ${p.color}`,opacity:p.valid?1:0.35}}>
                  <div style={{fontWeight:700,fontSize:12,color:p.valid?"#f1f5f9":"#64748b"}}>{p.pair}</div>
                  <div style={{fontSize:18,fontWeight:800,color:p.valid?p.color:"#ef4444",margin:"3px 0"}}>{p.pct}</div>
                  <div style={{fontSize:10,color:"#64748b"}}>{p.note}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:"#1e293b",borderRadius:12,padding:16,border:"1px solid #334155"}}>
            <div style={{fontSize:14,fontWeight:800,color:"#f1f5f9",marginBottom:12}}>🏆 Portfolio Chop Math</div>
            {[
              {title:"Expected Final Four entries",body:"Cluster A (30): ~11.5\nCluster B (30): ~9.8\nCluster C (25): ~6.9\nCluster D (25): ~5.8\nCluster E (20): ~4.3\nCluster F (20): ~4.8\n\nTotal expected: ~43 entries into FF"},
              {title:"Championship split target",body:"Split ~43 FF entries 50/50 → ~21 into Championship.\nPut entries on both finalists → guaranteed chop presence.\n\nSample: 4 yours + 2 others survive → 4/6 × $100K = $66,667 on $3,750 invested = 17.8× ROI."},
            ].map((item,i,arr)=>(
              <div key={i} style={{marginBottom:i<arr.length-1?12:0,paddingBottom:i<arr.length-1?12:0,borderBottom:i<arr.length-1?"1px solid #334155":"none"}}>
                <div style={{fontWeight:700,color:"#3b82f6",marginBottom:4}}>{item.title}</div>
                <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.8,whiteSpace:"pre-line"}}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

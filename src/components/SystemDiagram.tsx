// ART-04 / PDP-06 system diagrams (Shure "How it connects", TeleNet call flow). Redrawn from the client's
// MCS-II / MCS-III connection decks and catalogue text (06-voice/systems.json diagramNotes). Lines draw in on reveal.
import s from "./SystemDiagram.module.css";

const Y = "var(--yellow)", K = "var(--ink)";
type P = { x: number; y: number };
function Box({ x, y, w, h, label, sub, dark = false }: P & { w: number; h: number; label: string; sub?: string; dark?: boolean }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={4} fill={dark ? K : Y} stroke={K} strokeWidth={2} />
      <text x={x} y={sub ? y - 4 : y + 5} textAnchor="middle" className={s.t} fill={dark ? "var(--yellow)" : K}>{label}</text>
      {sub && <text x={x} y={y + 14} textAnchor="middle" className={s.ts} fill={dark ? "var(--on-charcoal-muted)" : K}>{sub}</text>}
    </g>
  );
}
function Phone({ x, y, label, horn = false }: P & { label?: string; horn?: boolean }) {
  return (
    <g>
      <path d={`M${x - 16} ${y - 24} h32 l6 6 v42 h-38 z`} fill={Y} stroke={K} strokeWidth={2} />
      <rect x={x - 9} y={y - 15} width={6} height={26} rx={3} fill={K} />
      <rect x={x + 2} y={y - 8} width={10} height={12} rx={1.5} fill="var(--accent-clean)" />
      {horn && <path d={`M${x + 26} ${y - 10} l16 -9 v26 l-16 -9 z M${x + 22} ${y - 6} h4 v6 h-4z`} fill="var(--surface-2)" stroke={K} strokeWidth={2} />}
      {label && <text x={x} y={y + 40} textAnchor="middle" className={s.ts}>{label}</text>}
    </g>
  );
}
function Horn({ x, y, label }: P & { label?: string }) {
  return (<g><path d={`M${x - 14} ${y - 6} h8 l20 -14 v40 l-20 -14 h-8 z`} fill="var(--surface-2)" stroke={K} strokeWidth={2} />{label && <text x={x} y={y + 38} textAnchor="middle" className={s.ts}>{label}</text>}</g>);
}
function Desk({ x, y, label }: P & { label?: string }) {
  return (<g><path d={`M${x - 22} ${y + 10} l6 -18 h32 l6 18 z`} fill="var(--surface-2)" stroke={K} strokeWidth={2} /><path d={`M${x - 18} ${y - 12} q18 -12 36 0`} fill="none" stroke={K} strokeWidth={5} strokeLinecap="round" />{label && <text x={x} y={y + 30} textAnchor="middle" className={s.ts}>{label}</text>}</g>);
}
const L = ({ d, dash = false, w = 2, color = K }: { d: string; dash?: boolean; w?: number; color?: string }) => <path d={d} fill="none" stroke={color} strokeWidth={w} className={dash ? s.dash : s.line} pathLength={1} />;
const Tag = ({ x, y, children, anchor = "middle", light = false }: P & { children: string; anchor?: "start" | "middle" | "end"; light?: boolean }) => <text x={x} y={y} textAnchor={anchor} className={s.tag} style={light ? { fill: "var(--on-charcoal)" } : undefined}>{children}</text>;

function PlantPA() {
  return (
    <svg viewBox="0 0 1200 540" className={s.svg} role="img" aria-labelledby="d-pa">
      <title id="d-pa">Two plant PA architectures. MCS-II: PA telephones with their own 30 W amplifier and horn, wired to an MCS-II master station, with an operator console and EPABX trunk lines. MCS-III: line-powered telephones wired to a rack with the MCS-III, EXA 250 W amplifiers and power supply, driving 100 V loudspeaker lines.</title>
      <text x="20" y="34" className={s.h}>MCS-II · amplifier in every phone</text>
      <rect x="40" y="62" width="500" height="120" rx="6" className={s.zone} /><Tag x={50} y={80} anchor="start">ZONE 1</Tag>
      <rect x="40" y="350" width="500" height="120" rx="6" className={s.zone} /><Tag x={50} y={368} anchor="start">ZONE 2 … 12</Tag>
      {[110, 280, 450].map((x) => <L key={x} d={`M290 260 V200 H${x} V146`} />)}
      {[110, 280, 450].map((x) => <L key={x + 1} d={`M290 290 V330 H${x} V386`} />)}
      {[110, 280, 450].map((x) => <Phone key={x} x={x} y={122} horn label="WMHS-II" />)}
      {[110, 280, 450].map((x) => <Phone key={x + 2} x={x} y={410} horn label="WMHF-II" />)}
      <L d="M60 275 H230" /><L d="M350 275 H500" />
      <Box x={290} y={275} w={120} h={58} label="MCS-II" sub="master station" />
      <Box x={60} y={275} w={80} h={44} label="EPABX" dark />
      <Tag x={160} y={300}>up to 4 trunks</Tag>
      <Box x={520} y={275} w={96} h={44} label="OC-DTHS-II" />
      <Tag x={290} y={520}>2-core 0.5 mm cable · loops up to 2000 m · 30 W at each phone</Tag>

      <line x1="600" y1="40" x2="600" y2="510" stroke="var(--line)" strokeWidth="2" />
      <text x="640" y="34" className={s.h}>MCS-III · central amplifiers</text>
      {[760, 900, 1040].map((x) => <L key={x} d={`M760 230 V180 H${x} V146`} />)}
      {[760, 900, 1040].map((x) => <Phone key={x} x={x} y={122} label="WMHS-IIIPT" />)}
      <Tag x={1120} y={112} anchor="start">line</Tag><Tag x={1120} y={128} anchor="start">powered</Tag>
      {[800, 930, 1060].map((x) => <L key={x + 3} d={`M760 340 V380 H${x} V400`} w={3} color="var(--accent-alarm)" />)}
      {[800, 930, 1060].map((x) => <Horn key={x} x={x} y={420} label="LSOD" />)}
      <Tag x={930} y={500}>100 V loudspeaker lines · up to 12</Tag>
      <g><rect x="700" y="210" width="120" height="150" rx="5" fill={K} />
        {["MCS-III", "EXA 250 W", "EXA 250 W", "PCU"].map((t, i) => <g key={i}><rect x="708" y={218 + i * 35} width="104" height="28" rx="2" fill={i === 3 ? "var(--surface)" : "var(--accent-alarm)"} /><text x="760" y={237 + i * 35} textAnchor="middle" className={s.ts} fill={i === 3 ? K : "#fff"}>{t}</text></g>)}</g>
      <L d="M820 285 H1000" /><Box x={1060} y={285} w={110} h={44} label="OC-DTHS-III" /><Tag x={910} y={276}>2-pair</Tag>
    </svg>
  );
}

function Hotline() {
  return (
    <svg viewBox="0 0 1200 520" className={s.svg} role="img" aria-labelledby="d-ht">
      <title id="d-ht">Three hotline links. HT-I: one controller with battery backup and up to four desktop phones on a single pair. HT-A: two desktop phones with loudspeakers; lifting one handset pages at the other end; up to 1 km. HT-IP: phone, SMART IP controller, single-mode fibre up to 10 km, SMART IP controller, phone.</title>
      <text x="20" y="40" className={s.h}>HT-I</text>
      <L d="M140 90 H1160" w={3} />
      <Box x={240} y={90} w={130} h={48} label="Controller" sub="battery backup" />
      {[480, 680, 880, 1080].map((x) => <g key={x}><L d={`M${x} 90 V120`} /><Desk x={x} y={136} label="desk phone" /></g>)}
      <Tag x={700} y={70}>single pair · controller anywhere on the line</Tag>

      <text x="20" y="230" className={s.h}>HT-A</text>
      <L d="M260 280 H940" w={3} />
      <g><Desk x={200} y={280} /><Horn x={150} y={236} /></g>
      <g><Desk x={1000} y={280} /><Horn x={1060} y={236} /></g>
      <Box x={600} y={280} w={120} h={44} label="Controller" />
      <Tag x={600} y={330}>2-core 0.5 sq mm · up to 1 km</Tag>
      <Tag x={420} y={262}>lift → other end pages</Tag>

      <text x="20" y="420" className={s.h}>HT-IP</text>
      <Desk x={130} y={460} /><L d="M160 460 H250" /><Box x={320} y={460} w={130} h={44} label="IP controller" />
      <L d="M385 460 H815" w={4} color="var(--accent-clean)" dash />
      <Tag x={600} y={448}>single-mode fibre · up to 10 km</Tag>
      <Box x={880} y={460} w={130} h={44} label="IP controller" /><L d="M945 460 H1040" /><Desk x={1070} y={460} />
    </svg>
  );
}

function Highway() {
  return (
    <svg viewBox="0 0 1200 520" className={s.svg} role="img" aria-labelledby="d-ecb">
      <title id="d-ecb">Highway emergency call box network. Solar-powered GSM call boxes along a road connect by radio through a GSM mast to a control room; a VOIP call box connects by cable. The control room has a 19-inch server rack with call, voice and message loggers and a PC running HTMS software showing the caller&apos;s box ID and location.</title>
      <rect x="0" y="330" width="1200" height="90" fill="var(--charcoal)" />
      <path d="M0 375 H1200" stroke="var(--yellow)" strokeWidth="4" strokeDasharray="40 30" />
      {[90, 290, 490].map((x, i) => (
        <g key={x}>
          <rect x={x - 18} y={252} width={36} height={70} rx={3} fill={Y} stroke={K} strokeWidth={2} /><circle cx={x} cy={282} r={6} fill="var(--accent-alarm)" />
          <path d={`M${x - 26} ${236} l52 -12 l4 10 l-52 12z`} fill="var(--charcoal-2)" stroke={K} /><path d={`M${x + 14} 252 V214`} stroke={K} strokeWidth={2} />
          <L d={`M${x + 14} 214 Q ${(x + 690) / 2} ${90 - i * 6} 690 110`} dash color="var(--muted)" />
          <Tag x={x} y={352} light>{`ECB-0${i + 5}`}</Tag>
        </g>
      ))}
      <g><path d="M690 110 l-24 140 h48 z" fill="none" stroke={K} strokeWidth={2} /><path d="M676 166 h28 M670 206 h40" stroke={K} strokeWidth={2} /><circle cx="690" cy="106" r="6" fill={K} /><Tag x={690} y={270}>GSM network</Tag></g>
      <rect x={672} y={258} width={0} height={0} />
      <g><rect x="852" y="262" width="36" height="60" rx="3" fill="var(--surface)" stroke={K} strokeWidth={2} /><Tag x={870} y={352} light>VOIP-ECB</Tag><L d="M888 300 H960 V250" /></g>
      <L d="M700 110 H960" />
      <rect x="930" y="40" width="250" height="210" rx="6" fill="var(--surface-2)" stroke={K} strokeWidth={2} />
      <Tag x={1055} y={62}>CONTROL ROOM</Tag>
      <g><rect x="950" y="76" width="80" height="150" rx="4" fill={K} />{["CALL LOG", "VOICE LOG", "MSG LOG", "FCT"].map((t, i) => <g key={t}><rect x="956" y={84 + i * 34} width="68" height="26" rx="2" fill="var(--accent-alarm)" /><text x="990" y={101 + i * 34} textAnchor="middle" className={s.tm} fill="#fff">{t}</text></g>)}</g>
      <g><rect x="1046" y="90" width="118" height="78" rx="4" fill={K} /><rect x="1052" y="96" width="106" height="60" fill="var(--surface)" /><path d="M1100 112 c-8 0 -12 6 -12 11 c0 8 12 20 12 20 s12 -12 12 -20 c0 -5 -4 -11 -12 -11z" fill="var(--accent-alarm)" /><text x="1105" y="150" textAnchor="middle" className={s.tm}>ECB-07</text><path d="M1095 168 v14 h20 v-14" fill="none" stroke={K} strokeWidth={2} /></g>
      <Tag x={1105} y={200}>HTMS software</Tag>
      <Tag x={290} y={460}>one button, hands-free · self-check SMS · 12 V solar option</Tag>
      <Tag x={1055} y={278}>up to 4 calls at once</Tag>
    </svg>
  );
}

function BagLine() {
  return (
    <svg viewBox="0 0 1200 500" className={s.svg} role="img" aria-labelledby="d-bc">
      <title id="d-bc">Bag-counting line. Bags travel from the packer along a conveyor to a truck loader. A sensor on the loader feeds a wall-mounted counter showing the count, set count and truck number. At the set count a relay stops the conveyor; a pre-alarm sounds for the last 10 bags. Network models send counts by Ethernet to a dispatch-office PC. Values shown are illustrative.</title>
      <rect x="30" y="200" width="120" height="150" rx="4" fill="var(--surface)" stroke={K} strokeWidth={2} /><Tag x={90} y={370}>packer</Tag>
      <path d="M150 300 L620 250" stroke={K} strokeWidth={10} strokeLinecap="round" />
      {[210, 290, 370, 450, 530].map((x) => { const yl = 300 - ((x + 22 - 150) * 50) / 470; return <rect key={x} x={x} y={yl - 27} width={44} height={22} rx={8} fill="#d8cdb4" stroke={K} strokeWidth={1.5} transform={`rotate(-6 ${x + 22} ${yl - 16})`} />; })}
      <circle cx="170" cy="306" r="12" fill={K} /><Tag x={180} y={340}>motor</Tag>
      <path d="M620 250 L760 300" stroke={K} strokeWidth={10} strokeLinecap="round" />
      <Tag x={700} y={300} anchor="end">loader</Tag>
      <g><rect x="770" y="300" width="300" height="80" rx="6" fill="var(--surface-2)" stroke={K} strokeWidth={2} /><path d="M1070 320 h60 l30 30 v30 h-90 z" fill={Y} stroke={K} strokeWidth={2} /><circle cx="840" cy="392" r="18" fill={K} /><circle cx="1110" cy="392" r="18" fill={K} /><Tag x={920} y={346}>truck</Tag></g>
      <g><rect x="676" y="200" width="22" height="28" rx="3" fill={Y} stroke={K} strokeWidth={2} /><L d="M687 228 V262" dash color="var(--accent-alarm)" /><Tag x={720} y={196} anchor="start">sensor</Tag></g>
      <L d="M687 200 V120 H560" />
      <g><rect x="330" y="50" width="230" height="130" rx="5" fill={Y} stroke={K} strokeWidth={2.5} />
        <rect x="344" y="64" width="150" height="62" fill="#1a0806" /><text x="419" y="106" textAnchor="middle" className={s.led}>0485</text>
        <text x="344" y="146" className={s.tm}>SET 0600</text><text x="344" y="166" className={s.tm}>TRUCK MH40AB1234</text>
        <g>{[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={508 + c * 14} y={66 + r * 16} width={10} height={12} rx={2} fill="var(--accent-clean)" />))}</g></g>
      <Tag x={445} y={40}>counter (illustrative values)</Tag>
      <L d="M330 150 H170 V294" color="var(--accent-alarm)" /><Tag x={250} y={140}>relay: stop at set count</Tag>
      <g><Horn x={250} y={186} /><Tag x={282} y={190} anchor="start">pre-alarm: last 10</Tag></g>
      <L d="M560 90 H940" dash color="var(--accent-clean)" />
      <g><rect x="940" y="50" width="200" height="120" rx="6" fill="var(--surface-2)" stroke={K} strokeWidth={2} /><rect x="975" y="68" width="130" height="70" fill={K} /><path d="M1030 138 v14 h20 v-14" stroke={K} strokeWidth={2} fill="none" /><Tag x={1040} y={186}>dispatch office PC</Tag></g>
      <Tag x={750} y={80}>Ethernet / wireless (network models)</Tag>
      <Tag x={600} y={470}>sensors: sensing head · non-contact · diffused optic · dual optic</Tag>
    </svg>
  );
}

const MAP: Record<string, () => React.ReactElement> = { "plant-pa-system": PlantPA, "hotline-network": Hotline, "highway-emergency-call-box-network": Highway, "bag-counting-dispatch-line": BagLine };
export function SystemDiagram({ slug }: { slug: string }) {
  const D = MAP[slug];
  if (!D) return null;
  return <figure className={`${s.fig} reveal`} tabIndex={0} role="region" aria-label="System diagram (scrolls sideways on small screens)"><D /></figure>;
}

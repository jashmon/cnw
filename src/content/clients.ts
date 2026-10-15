// "SMART Communication System Users" — client's own list, USERSLIST-2025.pdf (00-intake/client-2025/).
// Supplied by the client via Jash on 2026-10-15 with the instruction to show all clients on the homepage,
// so names are now public. Obvious typos fixed (e.g. "Quantas" → Qantas, "Schnider" → Schneider); unit names kept as given.
export const CLIENT_NAMES_CONSENT = true;

export type Sector = "Cement" | "Steel, Metals & Power" | "Pharma & Clean Rooms" | "Fertiliser & Chemicals" | "Textiles & Tyres" | "Shipping, Rigs & Defence" | "EPC & OEM Partners";
/** `logo` = slug of a file in public/clients/ (see 07-imagery/client-logos/logos.json). */
export type Client = { name: string; sector: Sector; units?: string[]; logo?: string; note?: string };
export type IntlClient = { name: string; country: string; product: string; logo?: string };

export const international: IntlClient[] = [
  { name: "Egyptian Cement Co.", country: "Egypt", product: "PA system" },
  { name: "Lafarge Cement Company", country: "Egypt", product: "PA system", logo: "lafarge" },
  { name: "United Nations", country: "Haiti", product: "PA system", logo: "united-nations" },
  { name: "Aluminium Africa Limited", country: "Tanzania", product: "PA system" },
  { name: "Caustic Soda Plant, Doha", country: "Qatar", product: "PA system" },
  { name: "Qantas Airways, Brisbane", country: "Australia", product: "Telephone amplifier", logo: "qantas" },
  { name: "Western Development Corp.", country: "Nigeria", product: "Controller, loud telephone hooter" },
  { name: "Rodeo Corporation", country: "Cameroon", product: "Hotline system" },
  { name: "S.M. Pharma", country: "Malaysia", product: "Clean room phone" },
  { name: "Able Infosat Communication", country: "USA", product: "Crane communication" },
  { name: "Pharmaceutical Solutions Industry", country: "Saudi Arabia", product: "Intercom, clean room phone" },
  { name: "Arabio", country: "Saudi Arabia", product: "Clean room phone", logo: "arabio" },
  { name: "Arab Drilling Co.", country: "Saudi Arabia", product: "Crane announcement system" },
  { name: "PT Asia Pacific Fibers Tbk", country: "Indonesia", product: "PA system", logo: "asia-pacific-fibers" },
  { name: "Hyundai Heavy Industries project", country: "Saudi Arabia", product: "Hotline system", logo: "hd-hyundai-heavy-industries" },
  { name: "West Guinea project", country: "West Guinea", product: "PA system" },
  { name: "Lanwa Sanstha Cement (via Siemens)", country: "Sri Lanka", product: "PA system" },
  { name: "Aban Ice", country: "UAE", product: "Rig communication", logo: "aban-offshore" },
];

const C = (name: string, units?: string[], logo?: string): Client => ({ name, sector: "Cement", units, logo });
const S = (name: string, units?: string[], logo?: string): Client => ({ name, sector: "Steel, Metals & Power", units, logo });
const P = (name: string, units?: string[], logo?: string): Client => ({ name, sector: "Pharma & Clean Rooms", units, logo });

export const domestic: Client[] = [
  // Cement
  C("UltraTech Cement", ["Jafrabad", "Kovaya", "Awarpur", "Durgapur", "Birla White, Jodhpur", "Kotputli", "Panipat", "Surat Magdalla", "Rajashree Cement", "Rawan", "Hotgi", "Aditya Cement", "Bela", "Rewa", "Sewagram I & II", "Wanakbori", "Dalla", "Sirohi", "Neemkathana", "Pali", "Petnikota", "Vizag", "Patratu", "Bokaro", "Balaji", "Sprint: Lucknow, Rajpura, Maihar, Kukurdih, Karur, Tadipatri, Patna, Sonar Bangla, Dhule"], "ultratech-cement"),
  C("Ambuja Cements", ["Gadchandur", "Bhatapara", "Pali", "Kodinar", "Gaja Kodinar", "Muldwarka jetty", "Surat", "Jaladhulagiri", "Dadri", "Lakerwari", "Rauri", "Nalagarh", "Suli", "Ropar", "Sanand", "Marwa Mundwa", "Warsaliganj", "Salai Banwa", "Ambuja Maratha", "Ambujanagar"], "ambuja-cements"),
  C("ACC", ["Kymore", "Chandrapur (Chanda)", "Lakheri", "Madukkarai", "Bargarh", "Jamul", "Gagal", "Wadi", "Tondebhavi", "Kymore WHRS"], "acc-limited"),
  C("Shree Cement", ["Ras", "Beawar", "Bihar", "Kushkhera", "Roorkee", "Balod", "Odisha", "Pune"], "shree-cement"),
  C("Dalmia Cement", ["Trichy", "Ariyalur", "Bokaro", "Balaji", "BCW", "KCW", "Rajgangpur", "Umrangso", "Sattur", "OCL Midnapore"], "dalmia-bharat"),
  C("Nuvoco Vistas", ["Majia", "Sonadih", "Arasmeta", "Chittorgarh", "Jojobera", "Nimbol", "Raipur", "Panagarh"], "nuvoco-vistas"),
  C("JK Cement", ["Nimbahera", "Mangrol"], "jk-cement"),
  C("JK Lakshmi Cement", undefined, "jk-lakshmi-cement"),
  C("Heidelberg Cement India", ["Tumkur", "Damoh", "Raigad", "Narsinghgarh"], "heidelberg-materials"),
  C("Wonder Cement", ["Nimbahera", "Chittor", "Badnawar"], "wonder-cement"),
  C("Orient Cement", ["Devapur", "Jalgaon", "Chittapur"], "orient-cement"),
  C("The India Cements", ["Vishnupuram", "Shankar Nagar", "Yerraguntla"], "india-cements"),
  C("Mahi Cement", ["Wajwana"]),
  C("Madras Cements (Ramco)", ["Nalgonda", "Ariyalur"], "the-ramco-cements"),
  C("Chettinad Cement", ["Solapur", "Dechpalli", "Vizag", "Kallur"], "chettinad-cement"),
  C("JSW Cement", ["Dolvi", "Salboni"], "jsw-cement"),
  C("Adani Cement", undefined, "adani-group"),
  C("Birla Corporation", ["Satna", "Raebareli", "RCCPL Yavatmal"], "birla-corporation"),
  C("Century Cement", ["Baikunth"], "century-cement"),
  C("Sanghi Industries", ["Bhuj"], "sanghi-industries"),
  C("Saurashtra Cement", ["Porbandar"], "saurashtra-cement"),
  C("Gujarat Sidhee Cement", ["Junagadh"], "gujarat-sidhee-cement"),
  C("Digvijay Cement", ["Jamnagar"]),
  C("Manikgarh Cement", ["Chanda"]),
  C("My Home Cement", ["Nalgonda"], "my-home-industries"),
  C("Kesoram Cement", ["Vishnupuram"], "kesoram-industries"),
  C("Sagar Cements", ["Nalgonda"], "sagar-cements"),
  C("KCP", ["Macherla"], "kcp-limited"),
  C("Priyadarshini Cement", ["Nalgonda"]),
  C("Zuari Cement", ["Nalgonda"], "zuari-cement"),
  C("Deccan Cements", ["Nalgonda"], "deccan-cements"),
  C("Anjani Portland Cement"),
  // Steel, metals, mining & power
  S("SAIL", ["Bhilai Steel Plant", "Alloy Steel Plant, Durgapur", "Bokaro", "Bolani"], "sail"),
  S("Tata Steel", ["Khopoli", "Boisar"], "tata-steel"),
  S("JSW Steel", ["Torangallu", "Raigarh", "Dolvi expansion"], "jsw-steel"),
  S("Hindalco", ["Hirakud Power", "Renukoot", "Birla Copper, Dahej", "Aluminium Odisha"], "hindalco"),
  S("Vedanta", undefined, "vedanta"),
  S("Hindustan Zinc", undefined, "hindustan-zinc"),
  S("Jindal Stainless", ["Hisar"], "jindal-stainless"),
  S("Jindal Steel & Power", ["Angul"], "jindal-steel-power"),
  S("Sarda Energy & Minerals", ["Raipur", "Raigarh", "Sarda Energy & Power, Raipur (1 × 80 MW)"], "sarda-energy"),
  S("Monnet Ispat", ["Raipur", "Raigarh"], "monnet-ispat"),
  S("Lloyds Metals", ["Ghugus"], "lloyds-metals"),
  S("Shyam Metalics", ["Asansol"], "shyam-metalics"),
  S("Usha Martin", ["Jamshedpur"], "usha-martin"),
  S("Jayaswal Neco", ["Raipur"], "jayaswal-neco"),
  S("Electrosteel Steels", ["Bokaro"], "electrosteel-steels"),
  S("Abhijeet Industries", ["MPP", "SEZ"]),
  S("FACOR Power", ["Odisha"], "facor"),
  S("Rungta Mines", undefined, "rungta-mines"),
  S("South Eastern Coalfields", ["Bilaspur"], "coal-india"),
  S("Chandrapur Thermal Power Station", ["CTPS, Chandrapur"], "mahagenco"),
  S("Punjab Biomass Power", ["Patiala"]),
  S("Shivalik Power & Energy", ["Raipur (1 × 23 MW)"]),
  S("Raymond captive power", ["Borgaon, Nagpur (1 × 10 MW)"], "raymond"),
  S("ESL", ["Jajpur"]),
  S("ISTM", ["Chandrapur"]),
  // Pharma & clean rooms
  P("Sandoz", undefined, "sandoz"), P("Cipla", undefined, "cipla"), P("Ranbaxy", ["Bengaluru", "Dewas"], "ranbaxy"),
  P("Biocon", ["Bengaluru"], "biocon"), P("Sun Pharmaceutical Industries", ["Dewas"], "sun-pharma"), P("Mylan Laboratories", ["Visakhapatnam", "Hosur"], "viatris"),
  P("Biological E.", ["Shameerpet"], "biological-e"), P("Fresenius Kabi Oncology", ["Solan"], "fresenius-kabi"), P("Shilpa Medicare", ["Raichur"], "shilpa-medicare"),
  P("Micro Labs", ["Bengaluru", "South Sikkim"], "micro-labs"), P("MSN Laboratories", ["Telangana"], "msn-laboratories"), P("Albert David", ["Kolkata"], "albert-david"),
  P("AuroNext Pharma", ["Bhiwadi"], "aurobindo-pharma"), P("Biopharma", ["Pune"]), P("Wintac", ["Bengaluru"]), P("E-Labs", ["Haridwar"]), P("Ciron Drugs"),
  P("Pharmaceutical Solutions Industry"), P("General Engineering", ["Kolkata"]), P("Filtrotech Control Systems", ["Kolkata"]), P("Perfect Utility", ["Gujarat"]),
  P("Perfect Engitech & Healthcare Solutions", ["Gujarat"]), P("Keerthi Communications", ["Hyderabad"]), P("GMP Technical Solutions", ["Himachal Pradesh"]),
  P("Unicom Infotel", ["Mumbai"]), P("Shafee Tools & Hardware", ["Chennai"]), P("SD Enterprises", ["Pithampur"]),
  // Fertiliser & chemicals
  { name: "IFFCO", sector: "Fertiliser & Chemicals", units: ["Paradeep", "Aonla"], logo: "iffco" },
  { name: "GNFC", sector: "Fertiliser & Chemicals", units: ["Bharuch"], logo: "gnfc" },
  { name: "FACT", sector: "Fertiliser & Chemicals", units: ["Kochi"], logo: "fact" },
  { name: "Chambal Fertilisers", sector: "Fertiliser & Chemicals", units: ["Kota"], logo: "chambal-fertilisers" },
  { name: "Godavari Fertilisers", sector: "Fertiliser & Chemicals", units: ["Kakinada"], logo: "coromandel" },
  { name: "United Phosphorus (UPL)", sector: "Fertiliser & Chemicals", units: ["Bharuch"], logo: "upl" },
  { name: "Laxmi Organic Industries", sector: "Fertiliser & Chemicals", units: ["Khopoli"], logo: "laxmi-organic-industries" },
  // Textiles & tyres
  { name: "Raymond", sector: "Textiles & Tyres", units: ["Saoner"], logo: "raymond" },
  { name: "Alok Industries", sector: "Textiles & Tyres", units: ["Silvassa"], logo: "alok-industries" },
  { name: "Indorama Synthetics", sector: "Textiles & Tyres", logo: "indorama" },
  { name: "Himatsingka Linens", sector: "Textiles & Tyres", logo: "himatsingka" },
  { name: "Birla Cellulosics", sector: "Textiles & Tyres", logo: "grasim" },
  { name: "Rajashree Polyfil", sector: "Textiles & Tyres", units: ["Bharuch"] },
  { name: "MRF Tyres", sector: "Textiles & Tyres", units: ["Medak"], logo: "mrf" },
  { name: "Birla Tyres", sector: "Textiles & Tyres", units: ["Balasore"], logo: "birla-tyres" },
  // Shipping, rigs, defence & ports
  { name: "Indian Navy", sector: "Shipping, Rigs & Defence", units: ["INS Betwa"], logo: "indian-navy" },
  { name: "Aban Offshore", sector: "Shipping, Rigs & Defence", units: ["Aban Tahara, Chennai"], logo: "aban-offshore" },
  { name: "Transocean", sector: "Shipping, Rigs & Defence", units: ["Deepwater rig"], logo: "transocean" },
  { name: "Elcome Marine Services", sector: "Shipping, Rigs & Defence", logo: "elcome" },
  { name: "Gujarat Pipavav Port", sector: "Shipping, Rigs & Defence", units: ["Amreli"], logo: "apm-terminals-pipavav" },
  // EPC & OEM partners (projects delivered through them)
  { name: "ABB", sector: "EPC & OEM Partners", units: ["Orient Cement CPP", "Facor Power", "ISTM Chandrapur", "Heidelberg Narsinghgarh", "Hindustan Zinc", "RCCPL Yavatmal", "JSW Cement Dolvi", "JSW Torangallu", "Faridabad", "Bengaluru"], logo: "abb" },
  { name: "Siemens", sector: "EPC & OEM Partners", units: ["Wonder Cement", "Birla Corp Raebareli", "JSW Raigarh", "UltraTech Mumbai", "ACC Kymore WHRS", "IP PA: Ambuja Maratha, Ambujanagar, ACC Wadi", "Mumbai"], logo: "siemens" },
  { name: "Schneider Electric", sector: "EPC & OEM Partners", units: ["Adani Cement", "Dalmia Umrangso", "Birla White", "Dalmia Bokaro", "Dalmia Sattur", "JSPL Angul", "Chettinad Vizag", "Chettinad Kallur"], logo: "schneider-electric" },
  { name: "thyssenkrupp", sector: "EPC & OEM Partners", units: ["IP PA: ACC Chanda Cement Works"], logo: "thyssenkrupp" },
  { name: "FLSmidth", sector: "EPC & OEM Partners", units: ["FLS Ventomatic"], logo: "flsmidth" },
  { name: "Larsen & Toubro", sector: "EPC & OEM Partners", units: ["L&T EAIC"], logo: "larsen-toubro" },
  { name: "BEUMER Group", sector: "EPC & OEM Partners", units: ["via Enexco"], logo: "beumer-group" },
  { name: "Enmas", sector: "EPC & OEM Partners", units: ["Chennai"] },
  { name: "BPL", sector: "EPC & OEM Partners", units: ["Chennai"] },
];

export const SECTORS: Sector[] = ["Cement", "Steel, Metals & Power", "Pharma & Clean Rooms", "Fertiliser & Chemicals", "Textiles & Tyres", "Shipping, Rigs & Defence", "EPC & OEM Partners"];

const sites = (c: Client) => Math.max(1, c.units?.length ?? 1);
export const stats = {
  groups: domestic.length,
  plants: domestic.reduce((a, c) => a + sites(c), 0),
  intl: international.length,
  countries: new Set(international.map((c) => c.country)).size,
  asOf: "2025 user list",
};
export const sitesOf = sites;

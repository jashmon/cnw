// "OUR PRESENCE" deck (c. Nov 2014), transcribed in 01-brief/company-copy.md §6a. Spellings corrected.
// CONSENT: names are only rendered when the client approves (checkpoint 1 decision). Until then the site shows
// sectors, plant counts and countries. Flip CLIENT_NAMES_CONSENT once the client confirms in writing.
export const CLIENT_NAMES_CONSENT = false;

export type Client = { name: string; sector: Sector; sites: number };
export type Sector = "Cement" | "Steel & Metals" | "Power & Mining" | "Fertiliser & Chemicals" | "Textiles & Fibres" | "Ports & Defence" | "Engineering";

export const domestic: Client[] = [
  { name: "UltraTech Cement", sector: "Cement", sites: 4 },
  { name: "Ambuja Cement", sector: "Cement", sites: 15 },
  { name: "ACC Cement", sector: "Cement", sites: 5 },
  { name: "Lafarge India", sector: "Cement", sites: 3 },
  { name: "Grasim Industries (cement units)", sector: "Cement", sites: 3 },
  { name: "India Cements", sector: "Cement", sites: 3 },
  { name: "Jaypee Cement", sector: "Cement", sites: 3 },
  { name: "Binani Cement", sector: "Cement", sites: 2 },
  { name: "J K Cement", sector: "Cement", sites: 2 },
  { name: "Gujarat Sidhee Cement", sector: "Cement", sites: 1 },
  { name: "Sagar Cement", sector: "Cement", sites: 1 },
  { name: "KCP", sector: "Cement", sites: 1 },
  { name: "Saurashtra Cement", sector: "Cement", sites: 1 },
  { name: "Sanghi Industries", sector: "Cement", sites: 1 },
  { name: "Digvijay Cement", sector: "Cement", sites: 1 },
  { name: "Century Cement", sector: "Cement", sites: 1 },
  { name: "Manikgarh Cement", sector: "Cement", sites: 1 },
  { name: "My Home Cement", sector: "Cement", sites: 1 },
  { name: "Kesoram Cement", sector: "Cement", sites: 1 },
  { name: "Madras Cements", sector: "Cement", sites: 1 },
  { name: "Priyadarshini Cement", sector: "Cement", sites: 1 },
  { name: "Zuari Cement", sector: "Cement", sites: 1 },
  { name: "Deccan Cements", sector: "Cement", sites: 1 },
  { name: "Anjani Portland Cement", sector: "Cement", sites: 1 },
  { name: "Orient Cement", sector: "Cement", sites: 1 },
  { name: "Dalmia Cement", sector: "Cement", sites: 1 },
  { name: "Mahi Cement", sector: "Cement", sites: 1 },
  { name: "SAIL (Bhilai, Durgapur)", sector: "Steel & Metals", sites: 2 },
  { name: "Tata Steel", sector: "Steel & Metals", sites: 1 },
  { name: "Jindal Stainless", sector: "Steel & Metals", sites: 1 },
  { name: "Monnet Ispat", sector: "Steel & Metals", sites: 2 },
  { name: "Usha Martin", sector: "Steel & Metals", sites: 1 },
  { name: "Lloyds Metals", sector: "Steel & Metals", sites: 1 },
  { name: "Sarda Energy & Minerals", sector: "Steel & Metals", sites: 1 },
  { name: "Jaiswal Neco", sector: "Steel & Metals", sites: 1 },
  { name: "Hindalco Birla Copper", sector: "Steel & Metals", sites: 1 },
  { name: "Abhijeet Industries", sector: "Steel & Metals", sites: 2 },
  { name: "Hirakud Power", sector: "Power & Mining", sites: 1 },
  { name: "Punjab Biomass Power", sector: "Power & Mining", sites: 1 },
  { name: "South Eastern Coalfields (SECL)", sector: "Power & Mining", sites: 1 },
  { name: "IFFCO Paradeep", sector: "Fertiliser & Chemicals", sites: 1 },
  { name: "Godavari Fertilisers", sector: "Fertiliser & Chemicals", sites: 1 },
  { name: "United Phosphorus", sector: "Fertiliser & Chemicals", sites: 2 },
  { name: "Raymond", sector: "Textiles & Fibres", sites: 1 },
  { name: "Indorama Synthetics", sector: "Textiles & Fibres", sites: 1 },
  { name: "Rajashree Polyfil", sector: "Textiles & Fibres", sites: 1 },
  { name: "Grasim (Birla Cellulosics, Birla Tyre)", sector: "Textiles & Fibres", sites: 3 },
  { name: "Gujarat Pipavav Port", sector: "Ports & Defence", sites: 1 },
  { name: "Indian Navy (INS Betwa)", sector: "Ports & Defence", sites: 1 },
  { name: "ABB", sector: "Engineering", sites: 1 },
  { name: "Siemens", sector: "Engineering", sites: 1 },
];

export const international = [
  { name: "Egyptian Cement Co.", country: "Egypt" },
  { name: "Lafarge Cement", country: "Egypt" },
  { name: "United Nations", country: "Haiti" },
  { name: "Aluminium Africa", country: "Tanzania" },
  { name: "Pharmaceutical Solutions", country: "Saudi Arabia" },
  { name: "Holcim", country: "Bangladesh" },
  { name: "Asia Pacific Fibers", country: "Indonesia" },
  { name: "Power Engineering Equipments Est.", country: "UAE (Abu Dhabi)" },
  { name: "Able Infosat Communication", country: "USA" },
  { name: "Rodeo Development", country: "Cameroon" },
];

export const SECTORS: Sector[] = ["Cement", "Steel & Metals", "Power & Mining", "Fertiliser & Chemicals", "Textiles & Fibres", "Ports & Defence", "Engineering"];
export const stats = {
  groups: 50, // the deck numbers 50 domestic client groups (Grasim split by sector here)
  plants: domestic.reduce((a, c) => a + c.sites, 0),
  countries: new Set(international.map((c) => c.country)).size,
  asOf: "2014 client list",
};

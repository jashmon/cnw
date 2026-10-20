// Display labels for catalogue codes (interface / environment). Stored values stay lower-case codes;
// these give approved spellings ("IP", "GSM", "Analogue") instead of mechanical title-casing ("Ip").
const INTERFACE: Record<string, string> = {
  analog: "Analogue", ip: "IP", gsm: "GSM", ethernet: "Ethernet", fibre: "Fibre", radio: "Radio",
  "4-20mA": "4–20 mA", software: "Software", standalone: "Stand-alone",
};
const ENVIRONMENT: Record<string, string> = {
  indoor: "Indoor", outdoor: "Outdoor", hazardous: "Hazardous", "clean-room": "Clean room", "vehicle/crane": "Vehicle / crane",
};
export const interfaceLabel = (v: string) => INTERFACE[v] ?? v;
export const environmentLabel = (v: string) => ENVIRONMENT[v] ?? v;

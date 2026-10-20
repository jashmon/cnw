// Decision fields for the comparison tables (F08): what a buyer chooses between, stated per model from the
// datasheet and catalogue copy. Only facts that the source material states are entered; anything else is left
// out and the table shows "Not specified". Keyed by category slug, then product slug.
// Edit with the catalogue: scripts/validate-content.mjs checks every slug here exists.

export type Capabilities = Record<string, string>;

const TELEPHONE_FIELDS = ["Paging / talkback", "Handset", "Hands-free", "Powering", "Vandal-resistant", "External ringer / flasher"] as const;
const CLEAN_ROOM_FIELDS = ["Network", "Hands-free", "Activation", "Front dial", "Housing", "PoE"] as const;

export const COMPARE_FIELDS: Record<string, readonly string[]> = {
  "industrial-telephones": TELEPHONE_FIELDS,
  "pa-telephones": TELEPHONE_FIELDS,
  "weatherproof-flameproof-telephones": TELEPHONE_FIELDS,
  "ip-voip-telephones-systems": TELEPHONE_FIELDS,
  "rail-metro-telephones": TELEPHONE_FIELDS,
  "clean-room-phones": CLEAN_ROOM_FIELDS,
};

export const CAPABILITIES: Record<string, Capabilities> = {
  // Industrial telephones
  "wmhs-iii": { "Paging / talkback": "No (telephone only)", Handset: "Yes, noise-cancelling", "Hands-free": "No", Powering: "Line powered", "Vandal-resistant": "No (handset model)", "External ringer / flasher": "Contact for SMART loud ringer or flasher" },
  "wmhs-iiipt": { "Paging / talkback": "PAGE and TALKBACK buttons (MCS-III field station)", Handset: "Yes, noise-cancelling", "Hands-free": "No", Powering: "Line powered", "Vandal-resistant": "No (handset model)", "External ringer / flasher": "Contact for SMART loud ringer or flasher" },
  "wmhs-iii-id": { "Paging / talkback": "Direct page and talkback buttons", Handset: "Yes, heavy-duty ABS", "Hands-free": "Yes, speakerphone", Powering: "Line powered", "Vandal-resistant": "No (desktop, ABS)" },
  "wmhs-iiiep": { "Paging / talkback": "No (emergency telephone)", Handset: "Yes, noise-cancelling", "Hands-free": "No", Powering: "Line powered", "Vandal-resistant": "No (desktop)" },
  "wmhs-iiilh": { "Paging / talkback": "No", Handset: "Yes, hearing-aid compatible with volume control", "Hands-free": "No", "Vandal-resistant": "No (handset model)", "External ringer / flasher": "Included: 40 W loud ringer and xenon flasher" },
  "wmhf-iii": { "Paging / talkback": "No", Handset: "None (no handset)", "Hands-free": "Yes, CONNECT / RELEASE / press-to-talk", Powering: "220/110 V AC", "Vandal-resistant": "Yes", "External ringer / flasher": "Contact for SMART external loud ringer" },
  "wmhf-iiigsm": { "Paging / talkback": "No", Handset: "None (no handset)", "Hands-free": "Yes, CONNECT / RELEASE / press-to-talk", Powering: "Solar with battery; optional 220 V AC pack", "Vandal-resistant": "Yes" },
  // PA telephones
  "wmhs-ii": { "Paging / talkback": "Page phone with built-in 30 W amplifier; private mode on handset lift", Handset: "Yes", "Hands-free": "No", Powering: "220/110 V AC", "Vandal-resistant": "No (handset model)" },
  "wmhf-ii": { "Paging / talkback": "Page phone with built-in amplifier (horn and internal speaker)", Handset: "None (no handset)", "Hands-free": "Yes, CONNECT / press-to-talk / RELEASE", "Vandal-resistant": "Yes" },
  "wmhs-ii-id": { "Paging / talkback": "Page phone with built-in 30 W amplifier; private mode", Handset: "Yes", "Hands-free": "No", Powering: "220/110 V AC", "Vandal-resistant": "No (desktop)" },
  // Weatherproof and flameproof
  "wmhs-iiwp": { "Paging / talkback": "Page phone with built-in 30 W amplifier; private mode", Handset: "Yes, noise-cancelling", "Hands-free": "No", Powering: "220/110 V AC", "Vandal-resistant": "No (handset model)" },
  "wmhs-iiwp-m": { "Paging / talkback": "Page phone with built-in 30 W amplifier; private mode", Handset: "Yes, noise-cancelling", "Hands-free": "No", Powering: "220/110 V AC", "Vandal-resistant": "No (handset model)" },
  "wmhs-iiiwp": { "Paging / talkback": "No (telephone only)", Handset: "Yes, noise-cancelling", "Hands-free": "No", Powering: "Line powered", "Vandal-resistant": "No (handset model)" },
  "wmhs-iiiwp-voip": { "Paging / talkback": "No (telephone only)", Handset: "Yes, noise-cancelling", "Hands-free": "No", Powering: "External power (110/220 V AC)", "Vandal-resistant": "No (handset model)" },
  "flp": { "Paging / talkback": "PA telephone with built-in 30 W amplifier", Powering: "220/110 V AC" },
  // IP / VoIP
  "wmhs-ip-pa-telephone": { "Paging / talkback": "Page phone with built-in 30 W amplifier; private mode", Handset: "Yes", "Hands-free": "No", "Vandal-resistant": "No (handset model)" },
  "wmhs-ii-ip": { "Paging / talkback": "Page phone with built-in 30 W amplifier; private mode", Handset: "Yes", "Hands-free": "No", Powering: "PoE option or 220/110 V AC", "Vandal-resistant": "No (handset model)" },
  "wmhs-ip-sip-phone": { "Paging / talkback": "No (SIP telephone)", Handset: "Yes", "Hands-free": "No", Powering: "100–220 V AC; PoE on WMHS-IP-POE", "Vandal-resistant": "Yes", "External ringer / flasher": "Relay contact for external ringer or flasher" },
  // Clean room
  "cr-iiipe": { Network: "Analogue, EPABX extension", "Hands-free": "Yes", Activation: "Manual (AUTO DIAL button and keypad)", "Front dial": "Polyester F150 (IPA washable)", Housing: "18-gauge powder-coated steel", PoE: "No" },
  "cr-iiiad": { Network: "Analogue, EPABX extension", "Hands-free": "Yes, true hands-free", Activation: "Automatic activation and deactivation; resets on busy tone", "Front dial": "Polyester F150 (IPA washable)", Housing: "18-gauge powder-coated steel", PoE: "No" },
  "cr-iii-ss": { Network: "Analogue, EPABX extension", "Hands-free": "Yes, true hands-free", Activation: "Programmable: automatic or manual", "Front dial": "SS 304 with solvent-resistant overlay", Housing: "Full stainless steel", PoE: "No" },
  "cr-iii-ip": { Network: "VoIP, SIP compatible (RJ-45 10/100)", "Hands-free": "Yes", Activation: "Manual (AUTO DIAL button and keypad)", "Front dial": "Polyester, solvent resistant", Housing: "18-gauge powder-coated steel", PoE: "No (220/110 V AC)" },
  "cr-ip": { Network: "VoIP, SIP (RJ-45 CAT-6 or Wi-Fi)", "Hands-free": "Yes, full-duplex", "Front dial": "Polyester F150 (IPA washable)", Housing: "Full stainless steel", PoE: "Yes, IEEE 802.3af" },
};

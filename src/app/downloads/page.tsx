import type { Metadata } from "next";
import Link from "next/link";
import { LiteVideo } from "@/components/LiteVideo";
import { DatasheetList } from "@/components/DatasheetList";
import { TRANSCRIPTS } from "@/content/transcripts";
import { fileCode, getFamilies, getProduct, productHref } from "@/lib/catalogue";
import s from "./downloads.module.css";

export const metadata: Metadata = { title: "Downloads: SMART datasheets, software and demos | Cables & Wireless Co.", description: "Download SMART product datasheets (PDF), listen to voice-alarm demo recordings and watch bag counter and clean-room phone videos. No sign-up needed." };

const kb = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
const VIDEOS = [
  { id: "Wj4v4-UlKZU", title: "Bag counter BC-L01 in operation" },
  { id: "F9pBGelDzmE", title: "Bag counter on a loading line" },
  { id: "x79DzQ9T8JE", title: "Clean room phone demonstration" },
  { id: "joiSFgd4Y6Y", title: "Clean room phone, second demonstration" },
];

// PDP-05 ungated downloads (E2S, Viking, Matrix). Grouped by family → category.
export default function Downloads() {
  const fams = getFamilies();
  const allP = fams.flatMap((f) => f.categories.flatMap((c) => c.products)).map((sl) => getProduct(sl)!);
  const total = allP.filter((p) => p.datasheet).length;
  const missing = allP.filter((p) => !p.datasheet);
  return (
    <>
      <section className="page-head">
        <div className="wrap"><p className="label">Downloads</p><h1 className="h-xl" style={{ marginTop: 8 }}>Datasheets, demos, software.</h1><p className="lede" style={{ marginTop: 14 }}>Datasheets for {total} of {allP.length} models as PDFs. No form, no sign-up.</p>
          <nav className={s.jump} aria-label="Jump to"><a href="#datasheets">Datasheets</a><a href="#audio">Voice alarm demos</a><a href="#videos">Videos</a><a href="#software">Software</a></nav></div>
      </section>
      <section id="datasheets" className="wrap section">
        <h2 className="h-1" style={{ marginBottom: 8 }}>Datasheets</h2>
        <p className="muted" style={{ marginBottom: 8 }}>On request ({missing.length}): {missing.map((p) => p.model || p.name).join(", ")}. A few models share one document.</p>
        <p className="muted" style={{ marginBottom: 28 }}>These are the original datasheets. Some still show older contact details. For current details, see <Link className="inline" href="/contact">Contact</Link>.</p>
        <DatasheetList
          families={fams.map((f) => ({ slug: f.slug, name: f.name }))}
          rows={fams.flatMap((f) => f.categories.flatMap((c) => c.products.map((sl) => getProduct(sl)!).filter((p) => p.datasheet).map((p) => ({
            slug: p.slug, model: p.model, name: p.name, href: p.datasheet!.href, size: kb(p.datasheet!.bytes), filename: `SMART-${fileCode(p.model)}-datasheet.pdf`,
            productHref: productHref(p), family: f.name, familySlug: f.slug, category: c.name, catSlug: c.slug,
          }))))} />
      </section>
      <section id="audio" className="band-surface section">
        <div className="wrap">
          <h2 className="h-1">Voice alarm demo recordings</h2>
          <p className="muted measure" style={{ margin: "8px 0 24px" }}>Sample induction and safety announcements of the kind a SMART voice alarm plays in a plant.</p>
          <div className={s.audio}>
            {(["english", "hindi"] as const).map((k) => {
              const t = TRANSCRIPTS[k];
              return (
                <figure key={k}>
                  <figcaption className="label" style={{ color: "var(--ink)" }}>{t.label} · {t.duration}</figcaption>
                  <audio controls preload="none" src={`/files/audio/voice-alarm-demo-${k}.mp3`} aria-describedby={`tr-${k}`} />
                  <details id={`tr-${k}`} className={s.transcript}>
                    <summary>Transcript</summary>
                    {t.text.length ? t.text.map((line, i) => <p key={i}>{line}</p>) : (
                      <p className="muted">The written transcript of this recording is being prepared. If you need it now, <Link className="inline" href="/contact">ask us</Link> and we will send the announcement script.</p>
                    )}
                  </details>
                </figure>
              );
            })}
          </div>
        </div>
      </section>
      <section id="videos" className="wrap section">
        <h2 className="h-1" style={{ marginBottom: 24 }}>Videos</h2>
        <div className={s.videos}>{VIDEOS.map((v) => <LiteVideo key={v.id} id={v.id} title={v.title} />)}</div>
      </section>
      <section id="software" className="band-dark section">
        <div className="wrap">
          <h2 className="h-1" style={{ color: "var(--yellow)" }}>SMART IP Phone software</h2>
          <p className="measure" style={{ margin: "10px 0 20px" }}>The Windows configuration tool for SMART IP and SIP phones (WMHS-IP, CR-III-IP). We send the current installer on request.</p>
          <Link className="btn btn--yellow" href="/contact">Request the installer</Link>
        </div>
      </section>
    </>
  );
}

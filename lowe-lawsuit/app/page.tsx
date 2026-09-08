import Image from 'next/image';
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from '@/lib/site';

const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: SITE_TITLE,
    description: SITE_DESCRIPTION,
    image: [`${SITE_URL}/image-2.jpeg`],
    datePublished: '2026-09-03',
    dateModified: '2026-09-03',
    author: {
        '@type': 'Organization',
        name: 'Maine News Now',
    },
    publisher: {
        '@type': 'Organization',
        name: 'Maine News Now',
    },
    mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': SITE_URL,
    },
    about: [
        {
            '@type': 'Organization',
            name: "Lowe's Home Centers, LLC",
        },
        {
            '@type': 'Person',
            name: 'Nathan Reardon',
        },
    ],
    mentions: {
        '@type': 'Legislation',
        name: 'Federal Rule of Evidence 609',
    },
};

const CASES = [
    {
        pill: 'Jury verdict',
        number: '$16.4M+',
        name: "Hendrickson v. Lowe's",
        text: "In a 2016 Nevada trial, a jury awarded more than $16.4 million to customer Kelly Hendrickson after finding Lowe's 80% at fault for a fall in water in a garden department. The reported award included medical expenses, pain and suffering, and future pain damages.",
    },
    {
        pill: 'Washington Supreme Court • 2025',
        number: null,
        name: "Galassi v. Lowe's",
        text: "A customer alleged that improperly shelved wire fencing fell and broke her toe. Lowe's won summary judgment in the trial court, but the Washington Court of Appeals reversed. In 2025, the Washington Supreme Court affirmed that reversal and sent the case back for further proceedings.",
    },
    {
        pill: 'Federal court • 2026',
        number: null,
        name: "Easter v. Lowe's",
        text: "In Louisiana, a customer alleged that a faucet display board tipped forward and landed on her shoulder. Lowe's sought summary judgment. In April 2026, the federal court denied the motion.",
    },
    {
        pill: 'Federal court • 2026',
        number: null,
        name: "Goldin v. Lowe's",
        text: "In South Carolina, plaintiffs brought negligence, gross-negligence, and recklessness claims against Lowe's. In March 2026, the federal court denied Lowe's motion for summary judgment.",
    },
];

const TIMELINE = [
    { date: 'December 2019', text: "Reardon alleges that a Lowe's employee mishandled a fence post in the Brewer store and that the post struck his thumb." },
    { date: 'March 19, 2025', text: 'Reardon files the federal negligence action.' },
    { date: 'December 3, 2025', text: "Lowe's moves for summary judgment." },
    { date: 'July 28, 2026', text: "Judge Woodcock denies Lowe's motion for summary judgment." },
    { date: 'August 17, 2026', text: "Lowe's asks to continue the October trial period because defense counsel has another scheduled trial." },
    { date: 'September 1, 2026', text: "Lowe's files its Pre-Trial Memorandum, listing conviction evidence for possible Rule 609 impeachment." },
];

const SOURCES = [
    "U.S. District Court, District of Maine, Reardon v. Lowe's Home Centers, LLC, Case No. 1:25-cv-00099-JAW, Order denying summary judgment, July 28, 2026.",
    "Defendant Lowe's Home Centers, LLC's Pre-Trial Memorandum, ECF No. 53, filed Sept. 1, 2026.",
];

const SOURCE_LINKS = [
    { href: 'https://cvn.com/proceedings/hendrickson-v-lowes-home-centers-llc-trial-2016-03-28', text: "Courtroom View Network: Hendrickson v. Lowe's Home Centers LLC" },
    { href: 'https://law.justia.com/cases/washington/supreme-court/2025/102-410-0.html', text: "Washington Supreme Court: Galassi v. Lowe's Home Centers, LLC" },
    { href: 'https://docs.justia.com/cases/federal/district-courts/louisiana/lawdce/5:2024cv01439/208156/46', text: "Easter v. Lowe's Home Centers LLC — order denying summary judgment" },
    { href: 'https://docs.justia.com/cases/federal/district-courts/south-carolina/scdce/3:2024cv03190/292038/56', text: "Goldin v. Lowe's Home Centers, LLC — order denying summary judgment" },
];

export default function Page() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            <header className="topbar">
                <div className="wrap">
                    <div className="brand">
                        MAINE <span>NEWS NOW</span>
                    </div>
                    <div className="tag">Court Records • Accountability • Maine</div>
                </div>
            </header>

            <section className="hero">
                <div className="wrap">
                    <div className="eyebrow">Special Report • Reardon v. Lowe&apos;s</div>
                    <h1>The Lowe&apos;s Case That Wouldn&apos;t Go Away</h1>
                    <div className="dek">
                        A self-represented Maine plaintiff says a Lowe&apos;s employee injured his hand. Lowe&apos;s
                        tried to end the case before trial. The federal court said no. Now the company&apos;s
                        pretrial strategy includes an effort to use the plaintiff&apos;s criminal convictions for
                        impeachment.
                    </div>
                    <div className="meta">
                        Based on public court filings in Nathan Reardon v. Lowe&apos;s Home Centers, LLC, U.S.
                        District Court for the District of Maine, Case No. 1:25-cv-00099-JAW.
                    </div>
                </div>
            </section>

            <figure className="featureImage">
                <Image
                    src="/image-2.jpeg"
                    alt="The Big Company. The Real Person. The Truth Matters. — a summary graphic on the Reardon v. Lowe's case"
                    width={1536}
                    height={1024}
                    priority
                    sizes="(max-width: 1180px) 100vw, 1180px"
                />
            </figure>

            <main className="wrapmain">
                <div className="grid">
                    <article className="story">
                        <p>
                            Nathan Reardon alleges that he was injured in the checkout area of the Lowe&apos;s store
                            in Brewer, Maine, in December 2019 when a cashier mishandled a wooden fence post.
                            According to the court record, the post fell toward Reardon, he reached to catch or
                            deflect it, and it struck his thumb. Lowe&apos;s disputes negligence, medical causation,
                            and damages.
                        </p>

                        <p>
                            Unlike many customers facing a major corporation, Reardon is not represented by a law
                            firm. Lowe&apos;s is represented by experienced outside counsel from Morrison Mahoney
                            LLP. Yet the case has survived Lowe&apos;s attempt to dispose of it before a jury could
                            hear the evidence.
                        </p>

                        <div className="callout">
                            The key fact is not that Reardon has already won. He has not. The key fact is that
                            Lowe&apos;s asked the court to end the case before trial — and the court refused.
                        </div>

                        <h2>First: Try to End the Case</h2>
                        <p>
                            Lowe&apos;s moved for summary judgment. A central defense argument was that Reardon had
                            not disclosed his own medical expert and therefore could not establish medical causation
                            for the injuries and treatment he attributes to the incident.
                        </p>

                        <p>
                            On July 28, 2026, U.S. District Judge John A. Woodcock Jr. denied Lowe&apos;s motion. The
                            court concluded that a factfinder could determine that the Lowe&apos;s employee fumbled
                            the wooden fence post, that it struck and damaged Reardon&apos;s thumb, and that he
                            sustained at least some compensable injury. The court left for trial the boundary between
                            injuries that may be understood through common sense and more complex medical-causation
                            questions requiring expert testimony.
                        </p>

                        <p>
                            That ruling did not establish final liability and did not guarantee any damages award.
                            What it did was preserve the case for trial &mdash; and only part of it. The court was
                            explicit that what survives on common-sense causation alone is &quot;the immediate
                            consequences of the injury, namely pain in his thumb.&quot; Whether the incident also
                            caused Reardon&apos;s later tendon surgery is a separate, unresolved question. Lowe&apos;s
                            own expert, orthopedic surgeon Dr. Bruce M. Leslie, has opined that the injury documented
                            in Lowe&apos;s own video footage was not consistent with the kind of tear that would
                            require surgery, and that the surgery was more likely caused by a chronic condition
                            unrelated to the incident. That dispute, unlike the thumb-pain question, may turn on
                            expert testimony Reardon has not offered.
                        </p>

                        <h2>Then: Put the Plaintiff&apos;s Criminal Record on the Trial List</h2>
                        <p>
                            With summary judgment unsuccessful, Lowe&apos;s filed its September 1, 2026 Pre-Trial
                            Memorandum. In that filing, Lowe&apos;s listed witnesses it may use to authenticate
                            Reardon&apos;s prior criminal convictions and identified copies of those convictions as
                            potential trial exhibits for impeachment under Federal Rule of Evidence 609.
                        </p>

                        <p>
                            Those convictions do not determine whether a Lowe&apos;s employee mishandled the fence
                            post or whether the post struck Reardon&apos;s thumb. Lowe&apos;s is invoking a separate
                            evidentiary rule aimed at credibility. Whether any particular conviction may actually be
                            shown to the jury is for the court to decide.
                        </p>

                        <p>
                            Reardon is seeking to exclude or tightly limit that evidence. The dispute creates a sharp
                            contrast in the case: a negligence lawsuit centered on what happened inside a Lowe&apos;s
                            checkout area may now include a fight over how much of the plaintiff&apos;s unrelated
                            criminal history the jury should be allowed to hear.
                        </p>

                        <h2>A Familiar Corporate Defense Move: Summary Judgment</h2>
                        <p>
                            Lowe&apos;s is fully entitled to contest lawsuits against it. But Reardon&apos;s case is
                            not the only injury action in which the company has asked a court to dispose of a
                            customer&apos;s claim before trial and failed.
                        </p>

                        <div className="casegrid">
                            {CASES.map((c) => (
                                <div className="casecard" key={c.name}>
                                    <span className="pill">{c.pill}</span>
                                    {c.number && <div className="number">{c.number}</div>}
                                    <h3>{c.name}</h3>
                                    <p>{c.text}</p>
                                </div>
                            ))}
                        </div>

                        <p>
                            These cases involve different facts, different states, and different legal standards.
                            They do not prove Lowe&apos;s is liable in Reardon&apos;s case. They do show something
                            narrower and verifiable: Lowe&apos;s has faced significant adverse outcomes in
                            customer-injury litigation, including a multimillion-dollar jury verdict and multiple
                            unsuccessful attempts to obtain summary judgment.
                        </p>

                        <h2>The Timeline</h2>
                        <div className="timeline">
                            {TIMELINE.map((t) => (
                                <div className="event" key={t.date}>
                                    <div className="date">{t.date}</div>
                                    <div className="text">{t.text}</div>
                                </div>
                            ))}
                        </div>

                        <h2>What Happens Next</h2>
                        <p>
                            The central questions remain for trial: whether Lowe&apos;s was negligent, what injury
                            the incident caused, and what damages — if any — should be awarded. Lowe&apos;s intends
                            to use surveillance video, medical evidence, and orthopedic expert Bruce M. Leslie, M.D.
                            Reardon intends to present his own evidence concerning the incident, his hand injury, and
                            its effect on his ability to perform skilled mechanical work.
                        </p>

                        <p>
                            A federal jury may ultimately accept Lowe&apos;s defense, accept Reardon&apos;s case, or
                            reach a result somewhere between the two. But one avenue has already closed: Lowe&apos;s
                            did not succeed in ending the entire case through summary judgment.
                        </p>

                        <div className="callout">
                            A customer does not have to be perfect to have a legal right to a fair trial. The
                            jury&apos;s job is to decide the Lowe&apos;s case on the evidence the judge allows — not
                            to decide whether it approves of the person who filed it.
                        </div>

                        <section className="sources">
                            <h2>Source Record</h2>
                            <div className="sourcebox">
                                <strong className="sourceboxLabel">Primary Source</strong>
                                <p className="sourceboxText">
                                    Order on Motion for Summary Judgment, Reardon v. Lowe&apos;s Home Centers, LLC,
                                    Case No. 1:25-cv-00099-JAW, filed July 28, 2026.
                                </p>
                                <div className="sourceboxActions">
                                    <a href="/reardon-v-lowes-summary-judgment-order.pdf" target="_blank" rel="noopener noreferrer">
                                        View PDF
                                    </a>
                                    <a href="/reardon-v-lowes-summary-judgment-order.pdf" download>
                                        Download
                                    </a>
                                </div>
                            </div>
                            <ol>
                                {SOURCES.map((s) => (
                                    <li key={s}>{s}</li>
                                ))}
                                {SOURCE_LINKS.map((s) => (
                                    <li key={s.href}>
                                        <a href={s.href} target="_blank" rel="noopener noreferrer">
                                            {s.text}
                                        </a>
                                        .
                                    </li>
                                ))}
                            </ol>
                        </section>

                        <div className="disclaimer">
                            <strong>Editorial disclosure:</strong> Nathan Reardon is the plaintiff in the pending
                            Lowe&apos;s litigation and is associated with Maine News Now. This page is
                            advocacy-oriented editorial coverage based on public court records. Lowe&apos;s denies
                            negligence, causation, and damages. No prior case cited on this page establishes
                            liability in the pending Maine action.
                        </div>
                    </article>

                    <aside className="sidebar">
                        <div className="factbox">
                            <strong>Case</strong>
                            <p>
                                Nathan Reardon v. Lowe&apos;s Home Centers, LLC
                                <br />
                                1:25-cv-00099-JAW
                                <br />
                                U.S. District Court, District of Maine
                            </p>
                        </div>
                        <div className="factbox">
                            <strong>Current posture</strong>
                            <p>
                                Summary judgment denied. Case proceeding toward trial, subject to scheduling and
                                pretrial rulings.
                            </p>
                        </div>
                        <div className="factbox">
                            <strong>Lowe&apos;s position</strong>
                            <p>
                                Lowe&apos;s denies negligence and disputes the causal connection between the store
                                incident and Reardon&apos;s claimed injuries and damages.
                            </p>
                        </div>
                        <div className="factbox">
                            <strong>Why Rule 609 matters</strong>
                            <p>
                                Lowe&apos;s has identified prior convictions for possible impeachment. The court, not
                                the company, determines whether particular conviction evidence is admissible.
                            </p>
                        </div>
                    </aside>
                </div>
            </main>

            <footer className="footer">© 2026 Maine News Now • Court-record-based editorial coverage</footer>
        </>
    );
}

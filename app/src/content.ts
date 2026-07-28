/* ═══════════════════════════════════════════════════════════════
   her echoes · content layer
   Everything she reads lives in this one file.
   To add a song / memory / promise: add one entry. Nothing else.
   Strings may contain <b> <i> — they render as authored HTML.
   ═══════════════════════════════════════════════════════════════ */

export type IconName =
  | 'moon' | 'dove' | 'home' | 'radar'
  | 'hourglass' | 'ring' | 'sunset' | 'wafa'

export interface Truth {
  icon: IconName
  category: string
  answer: string
  surface: string
  evidence: string
}

export const TRUTHS: Truth[] = [
  {
    icon: 'moon', category: 'Moon phase', answer: 'Chaudhvin ka chand',
    surface: 'The night the whole month waits for.',
    evidence: "You're the one who stays up for the midnights that matter — first through the door of every occasion of the heart. The sky spends twenty-nine nights rehearsing. <b>So did my whole life, apparently.</b>",
  },
  {
    icon: 'dove', category: 'Emotion', answer: 'Sukoon',
    surface: 'The rarest one. You generate it.',
    evidence: "I can't prove sukoon exists in general. I can prove it exists at one exact frequency: your voice, around midnight, saying nothing important at all. Seven hundred and eighty-eight hours of calls — <b>my pulse has the data.</b>",
  },
  {
    icon: 'home', category: 'Place', answer: 'Home',
    surface: "Home isn't a place anymore.",
    evidence: "I've lived out of three cities this year and been homesick in all of them — for a person, not a postcode. Home relocated itself the day someone started asking if I'd eaten. <b>Thirty times so far. Yes, I counted.</b>",
  },
  {
    icon: 'radar', category: 'Superpower', answer: 'Mood radar',
    surface: "You catch what I haven't admitted.",
    evidence: "You've diagnosed bad days I hadn't confessed to myself yet — off a one-word reply, a slower typing speed, a &ldquo;fine&rdquo; that sounded wrong. Six months of the experiment now. <b>You have never once missed.</b>",
  },
  {
    icon: 'hourglass', category: 'Love language', answer: 'Quality time',
    surface: 'The boring parts. Given only to home.',
    evidence: "You give me the unremarkable — the nap, the shake, the salon run, the two errands. That's the tell, meri jaan. People give interesting updates to everyone; <b>the boring ones they give only to home.</b>",
  },
  {
    icon: 'ring', category: 'Object', answer: 'The ring',
    surface: 'No beginning. No end.',
    evidence: "I've inspected your love thoroughly for exit clauses, conditions, fine print. There are none — just one continuous, unbroken line, exactly like the small gold circle that made it official. <b>15.02.2026. Permanent collection.</b>",
  },
  {
    icon: 'sunset', category: 'Hobby', answer: 'Collecting sunsets',
    surface: 'Beauty, saved to be handed over.',
    evidence: "You don't just watch beautiful things — you save them for me. A sunset unshared is, to you, somehow incomplete. That instinct says more than any sentence you've ever typed: <b>beauty, in your hands, is a gift mid-delivery.</b>",
  },
  {
    icon: 'wafa', category: 'Virtue', answer: 'Wafa',
    surface: 'Loyalty. The old, undiluted kind.',
    evidence: "Wafa isn't what you promise someone's face — it's what you do in rooms they aren't in. You've taken my side in rooms I've never entered, quietly, without being asked. <b>The reports reached me. I'll never recover.</b>",
  },
]

/* ── star jar · verbatim, from our chat ── */
export interface Memory { date: string; quote: string; who: string; aside: string }
export const MEMORIES: Memory[] = [
  {
    date: 'day one · 7:02 pm', quote: '&ldquo;May I call?&rdquo;', who: '— me, four messages into forever',
    aside: "The bravest four letters I've ever typed. You said <b>Yes</b> in ten seconds. One hour later we were still talking — and somewhere in that hour, so was the rest of my life.",
  },
  {
    date: '06.02.2026 · 10:45 pm', quote: "&ldquo;I was just saying k you're my baby❤️&rdquo;", who: '— you',
    aside: "Eleven days in, into the silence of my dead phone, you claimed me first. I've answered to nothing else since.",
  },
  {
    date: '13.02.2026 · 9:31 am', quote: '&ldquo;I love you&rdquo;', who: '— me, first, finally',
    aside: "You'd just said you were missing me, and it refused to stay inside one more day. Sent the morning before everything became official. My heart's timing about you has always been impeccable.",
  },
  {
    date: '15.02.2026 · 1:05 pm', quote: '&ldquo;Ring phn li ha apki🤭❤️&rdquo;', who: '— you',
    aside: 'Then: <b>&ldquo;I\'m happy.&rdquo;</b> Then three hearts. Then just my name. Four messages, and my whole future fit on one finger.',
  },
  {
    date: '26.03.2026 · 8:32 pm', quote: "&ldquo;Yeesshhh baby..you're my peace against the whole world🥺&rdquo;", who: '— you',
    aside: 'Framed. Hung somewhere in my chest. Load-bearing.',
  },
  {
    date: '30.03.2026 · 9:04 am', quote: '&ldquo;ap jb sulaty ho tu zyda achi nend ati h&rdquo;', who: '— you',
    aside: 'Minister of Your Sleep. The best position I will ever hold. Lifetime appointment accepted.',
  },
  {
    date: '14.06.2026 · 12:03 am', quote: "&ldquo;My life's been better since you..actually I've been better since you❤️&rdquo;", who: '— you, first into my birthday',
    aside: 'I turned 29 alone on a beach, under the stars — and then this arrived. <b>Alone</b> didn\'t survive it.',
  },
]

/* ── book of firsts ── */
export interface First { date: string; title: string; body: string }
export const FIRSTS: First[] = [
  {
    date: 'day one · 7:01 pm', title: 'The first hello',
    body: "Four messages old — <b>&ldquo;H &amp; H&rdquo;</b> — and I already couldn't wait: &ldquo;May I call?&rdquo; You said yes. Strangers when it rang; something else entirely by the time we hung up. One hour. And that same night: <b>&ldquo;Sweet dreams 👸&rdquo;</b> — I crowned you before I even knew your favourite colour. The rest of this kingdom is just paperwork catching up.",
  },
  {
    date: 'day two · 12:08 pm', title: 'The first &ldquo;video call?&rdquo;',
    body: 'Two words, from you. Then five more that undid me completely: <b>&ldquo;Yes I want to see you.&rdquo;</b> The fastest yes of my entire life — and the first time your smile had to be dealt with in real time. I lost. Gladly. I\'ve been losing ever since.',
  },
  {
    date: '06.02.2026 · 10:45 pm', title: 'The first claim',
    body: '&ldquo;You\'re my baby ❤️&rdquo; — you said it first, eleven days in. Quietly, like it was obvious. It was. And you know what that night did to me — I told you at 11:36: <b>&ldquo;Shed some tears.&rdquo;</b> First time in years. You claimed me; the tears just signed the paperwork.',
  },
  {
    date: '13.02.2026 · 9:31 am', title: 'The first &ldquo;I love you&rdquo;',
    body: 'Mine. You said <b>&ldquo;Actually I was missing you&rdquo;</b> and the words refused to stay inside one more day — sent on an ordinary Friday morning, exactly one day before everything became official. My heart has always had impeccable timing about you.',
  },
  {
    date: '15.02.2026 · 1:05 pm', title: 'The ring',
    body: '&ldquo;Ring phn li ha apki🤭❤️&rdquo; — the most beautiful sentence ever written in Roman Urdu. A small circle went on your finger, and my entire future stopped being hypothetical. <b>&ldquo;I\'m over the moon,&rdquo;</b> I told you. Six months later — still no descent.',
  },
  {
    date: 'every morning since', title: 'The first of many',
    body: 'The day still opens from your side — a heart before breakfast, a voice before the world. Some firsts, meri jaan, we get to keep having. <b>This one I intend to have forever.</b>',
  },
]

/* ── confessions ── */
export const CONFESSIONS: string[] = [
  "On day one, I promised — myself, and out loud to you — that I would wait, go slow, behave. The promise survived until 9:05 pm, and then your picture happened. <i>&ldquo;Dekh k ruka ni gya.&rdquo;</i> Best promise I've ever broken.",
  "Every time the delivery app announces &ldquo;Panda is arriving,&rdquo; I smile at my phone like an idiot — because in your phone, that's my name. The rider has never once understood the grin.",
  "There's a folder of your voice notes — the ones where you laugh mid-sentence and lose the sentence entirely. All <b>305</b> are kept. It has a secret name, and it gets played on every bad train ride.",
  "I keep a dear diary — a real one, hidden where no one will find it in my lifetime. Nearly every page is somehow about you. Turns out, guddu, <b>you're not the only one with a little lock.</b>",
]

/* ── promises ── */
export const PROMISES: string[] = [
  'To answer every <b>&ldquo;kya kr rhy hain?&rdquo;</b> for the rest of my life — first ring, no voicemail. You\'re 128 for 128 so far. The streak stands.',
  'To learn your chai by heart — strength, sweetness, and the exact minute you need it.',
  'To guard your sleep like a national treasure. <b>&ldquo;ap jb sulaty ho tu zyda achi nend ati h&rdquo;</b> — your words. My life\'s work.',
  'To be your peace against the whole world — your words again, now my permanent job description.',
  'To keep every <b>&ldquo;lazmi&rdquo;</b> you have ever said to me. Starting with the sunsets. All of them, in person.',
  'To still be asking <b>&ldquo;may I call?&rdquo;</b> at eighty — and still feeling the same nerves.',
]

/* ── the mirror · briefed with receipts ── */
export interface MirrorLine { text: string; src?: string }
export const MIRROR_LINES: MirrorLine[] = [
  { text: '&ldquo;Fairest in the land? Obviously. Next question.&rdquo;' },
  { text: "&ldquo;You look the hoor pari of someone's dreams.&rdquo;", src: 'me · night one · 9:12 pm' },
  { text: "&ldquo;Masha'Allah — nazar na lage. The mirror said it first.&rdquo;" },
  { text: '&ldquo;Cutie you are elite level awesome, no match, unique, a gem.&rdquo;', src: 'me · 04.02 · 11:58 am' },
  { text: '&ldquo;That smile is illegal in several kingdoms. No fines pending — royalty.&rdquo;' },
  { text: '&ldquo;hai ek hoor pari, a girl of superior intellect.&rdquo;', src: 'me · 29.01' },
  { text: '&ldquo;Have the prettiest, smartest wife.&rdquo;', src: 'me · 11.02 · 9:55 am' },
  { text: '&ldquo;Road py bhi har taraf Hajra nazar aa rhi thi.&rdquo;', src: 'me · 10.02 · every road, apparently' },
  { text: '&ldquo;The mirror would like to marry you too. It cannot. Hassan wins.&rdquo;' },
  { text: '&ldquo;You not only make my world beautiful, you have become my world.&rdquo;', src: 'me · 11.02 · 10:01 am' },
  { text: '&ldquo;The cutest, meri ho forever.&rdquo;', src: 'me · 01.02' },
  { text: '&ldquo;Turfa Haseen.&rdquo;', src: 'me · 01.02 · two words, whole truth' },
  { text: "&ldquo;Twelve verdicts, one ruling: it's you. It was always you.&rdquo;" },
]

/* ── two cities · deliveries ── */
export const DELIVERIES: string[] = [
  'one &ldquo;kya kr rhy hain?&rdquo; — answered before the second ring. always. ♥',
  "this side's snowfall — you told me you've never seen it. <b>your first one is reserved.</b>",
  'one dua — express shipping, no customs, straight to you.',
  'a &ldquo;Have a safe flight&rdquo; returned — <b>you have blessed every takeoff I\'ve ever had.</b>',
  'one goodnight — leave it on the pillow until I arrive.',
  'the sunset you owe me, stamped <b>lazmi</b> — collection scheduled: in person.',
  'an &ldquo;I love you&rdquo; — fragile. handle with your whole heart.',
]

/* ── the replays · real, word for word ── */
export type Speaker = 'him' | 'her' | 'sys'
export interface Scene { title: string; date: string; messages: [Speaker, string, string?][] }
export const SCENES: Scene[] = [
  {
    title: 'the first hello', date: '26.01 · day one',
    messages: [
      ['him', 'H & H', '7:01 pm'], ['him', 'Hajra', '7:01 pm'], ['him', 'Hassan here', '7:01 pm'],
      ['her', 'Welcome', '7:02 pm'], ['him', 'May I call?', '7:02 pm'], ['her', 'Yes', '7:02 pm · ten seconds later'],
      ['sys', '📞 voice call · 1 hr'],
      ['sys', 'two strangers dialled. neither of us hung up as one.'],
    ],
  },
  {
    title: 'the dead-phone night', date: '06.02',
    messages: [
      ['her', 'And I think your phone is dead', '10:45 pm'],
      ['her', "I was just saying k you're my baby❤️", '10:45 pm'],
      ['her', "And I'll say this loud and clear k you're just mine and I'm just yours❤️", '10:52 pm'],
      ['her', "You're whole mine and I'm whole yours❤️", '10:53 pm'],
      ['her', 'Pls never ever give me a heart attack like this again', '10:54 pm'],
      ['sys', '· forty minutes of a dark screen ·'],
      ['him', "I'm back since a while ago", '11:35 pm'],
      ['him', "Was feeling this, I've never had this feeling before", '11:36 pm'],
      ['him', 'Shed some tears', '11:36 pm'],
      ['him', "And you're my bacha ♥️", '11:36 pm'],
      ['him', 'Pyar hua tha, iqraar bhi ho gya♥️', '11:37 pm'],
    ],
  },
  {
    title: 'the first i love you', date: '13.02',
    messages: [
      ['her', 'Can I tell you something', '9:27 am'],
      ['her', 'Actually I was missing you', '9:28 am'],
      ['him', 'You own my mind, body and soul', '9:29 am'],
      ['him', 'I miss my baby too♥️', '9:29 am'],
      ['her', 'Can I say the same?🫣', '9:30 am'],
      ['him', 'Please', '9:30 am'],
      ['her', 'Same🤭', '9:30 am'],
      ['him', 'I love you', '9:31 am'],
      ['him', "You're the love of my life♥️", '9:31 am'],
      ['her', 'Hassssaannn🫣🫣🫣🫣❤️❤️❤️❤️❤️', '9:33 am'],
    ],
  },
  {
    title: 'the ring', date: '15.02',
    messages: [
      ['her', 'Koi call ki unhn ne', '1:04 pm'],
      ['her', 'Wo kya khty hain', '1:04 pm'],
      ['her', 'Ring phn li ha apki🤭❤️', '1:05 pm'],
      ['her', "I'm happy", '1:05 pm'],
      ['her', '❤️❤️❤️', '1:05 pm'],
      ['her', 'Hassan', '1:05 pm'],
      ['sys', '· one voice note later ·'],
      ['him', "I'm over the moon :)", '1:23 pm'],
    ],
  },
  {
    title: "can't be measured", date: '01.03',
    messages: [
      ['him', "It's coz of something called Love", '3:46 pm'],
      ['him', 'Ap kia kr ry hain?', '3:46 pm'],
      ['her', 'How much you love me?', '3:47 pm'],
      ['her', 'Thak gai hn', '3:47 pm'],
      ['him', "To the infinity, with my heart, mind and soul, can't be measured", '3:48 pm'],
      ['him', 'Kia hua?', '3:48 pm'],
      ['him', 'Shopping trip py thak gyi?', '3:48 pm'],
      ['sys', 'he answered the universe, then worried about the shopping trip.'],
    ],
  },
]

/* ── the 🥺 protocol ── */
export const GRANTS: string[] = [
  'the moon — <b>granted.</b> (it was already yours. see: sitara &amp; chand.)',
  'five more minutes of sleep — <b>granted.</b> renewed daily since 13.02, 9:20 am.',
  'one more hour on call — <b>granted.</b> precedent set on night one.',
  "this side's snowfall — <b>granted.</b> reserved under your name.",
  'the last gulab jamun — <b>granted.</b> in perpetuity.',
  'the sunset, in person, lazmi — <b>granted.</b> rider en route.',
  "Hassan's entire heart — <b>request unnecessary.</b> transferred on day one.",
  'anything. everything. — <b>granted</b> before you finish typing.',
]

/* ── our songs ── */
export interface Song { title: string; artist: string; yt: string; alt?: string }
export const OUR_SONGS: Song[] = [
  { title: 'Him & I', artist: 'G-Eazy & Halsey', yt: 'SA7AIQw-7Ms', alt: 'NdSJ1pyaAH8' },
  { title: 'Achchi Lagti Ho', artist: 'Udit Narayan & Kavita Krishnamurthy', yt: 'HJIRktKAahU', alt: 'VSYbtrB79kc' },
  { title: 'Aarzu', artist: 'Noor, Khan & Madhurxo', yt: 'M5OCLifZK1w', alt: 'LlwHphMhUOo' },
]
export const PLAYER_VOLUME = 35

/* ── hero / static copy ── */
export const HERO = {
  eyebrow: 'for Her Royal Highness',
  name: 'Hajra',
  nastaliq: 'شہزادی ہاجرہ',
  moonCorner: 'ma hon sitara,\ntu ha chand mera',
  crest: 'princess of <b>earths &amp; skies</b>,<br/>of <b>oceans &amp; lands</b> — and, by her own<br/>gracious permission, of <b>me</b>.',
  sub: 'eight truths · the replays · two cities<br/>one decree · one letter',
  begin: 'enter the kingdom',
  whispers: ['', '', '(psst — tap once more)', '(yes. that name is my favourite word in any language.)'],
}

export const COVER = {
  eyebrow: 'once upon a time',
  title: 'there lived a princess<br/>who never knew<br/>she was the whole story',
  sub: 'so the stars wrote it down —<br/>every echo of her.',
  cta: '✦\u00a0 touch the stars to begin \u00a0✦',
}

export const PHOTO_MOON = {
  q: '&ldquo;Ma hon Sitara —<br/>Tu ha Chand mera ❤️&rdquo;',
  who: '— you · 26.03.2026 · 8:33 pm',
  aside: "You handed me the sky's bigger job like it was nothing. I've been trying to deserve it every night since. Look up, meri jaan — whatever the map says, <b>we have always lived in the same sky.</b>",
  src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/1280px-FullMoon2010.jpg',
  srcSet: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/640px-FullMoon2010.jpg 640w, https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/1280px-FullMoon2010.jpg 1280w',
  alt: 'The full moon in a dark sky',
}

export const PHOTO_SUNSET = {
  q: '&ldquo;Kl ma apko yhn ka sunset<br/>dikhaon ge lazmi&rdquo;',
  who: '— you · 25.03.2026',
  aside: "Still uncollected, meri jaan. Accruing interest daily. I'm coming to be paid <b>in person</b> — every postponed sunset, every saved sky. Bring them all.",
  src: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1600&q=80',
  srcSet: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=640&q=75 640w, https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1080&q=78 1080w, https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1600&q=80 1600w',
  alt: 'A golden sunset',
}

export const FINALE_BG = {
  src: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1600&q=80',
  srcSet: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=640&q=75 640w, https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1080&q=78 1080w, https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1600&q=80 1600w',
}

export const DECREE = {
  kicker: 'by royal proclamation',
  heading: 'Let it be known',
  p1: 'across earths and skies, oceans and lands: Hajra — <b>&ldquo;the hoor pari of someone\'s dreams&rdquo;</b> <i>(on record since night one)</i>, chaudhvin ka chand, keeper of my sukoon, and by her own sworn words <b>&ldquo;my peace against the whole world&rdquo;</b> — is, and shall forever remain, <b>the most loved</b>.',
  p2: "Any nazar is hereby banned from the realm.<br/>Masha'Allah stands as law.",
  sign: '— Hassan',
  witness: 'witnessed by every star above two cities',
  sealLabel: 'sealed for Princess Hajra',
}

export const LETTER = {
  to: 'Meri jaan, Guddu,',
  p1: "They asked me to describe you, and eight answers later I still hadn't started. Because you're not a colour or a season — you're the girl who made evenings something I rush toward, who hears my silences from six thousand kilometres away, who turned a stranger's <b>&ldquo;may I call?&rdquo;</b> into the best question I've ever asked.",
  p2: "Wait for me just a little longer. I'm coming for every sunset you saved, every walk you postponed, every lantern I promised. Until then, look up — we share the same sky, and I've already told every star which one of them you are.",
  p3: 'Nazar na lage. I love you — more than the answers, more than the words, more every single day.',
  sig: '— your Hassan, your Panda ♥',
  ps: 'day one → forever',
}

export const PANDA_STEPS: string[] = [
  'order confirmed — dispatch note on file: <b>&ldquo;Panda aa ra hai… receive kr lena&rdquo;</b> <i>(me · 05.05)</i>',
  'picked up · pallaresos park',
  'crossing ~6,000 km — customs waived, <b>dua onboard</b>',
  'out for delivery · alhamd town',
  'arriving: a little longer → <b>then forever</b>',
]

export const PANDA_INTRO = 'Registered under that name in your phone since 25.03 —<br/><i>&ldquo;ma apka nam ab panda se save krne lge hn😂&rdquo;</i> — your words.<br/>One order has been <b>out for delivery ever since.</b>'

export const PANDA_DELIVERED = '<b>1 × Hassan</b> — whole, unreturned, non-refundable. Rider: <b>Panda</b>.<br/>Signature required: one 🥺. <span class="dpaid">tip received. heart, kept.</span>'

export const METER = {
  intro: 'Precision-engineered to measure exactly<br/>how loved you are. <b>State of the art.</b> Probably fine.',
  err: '⚠ error — value exceeds instrument range',
  sub: 'You asked me once — <b>&ldquo;How much you love me?&rdquo;</b> · 01.03, 3:47 pm. My answer is on record: &ldquo;to the infinity, with my heart, mind and soul — <b>can\'t be measured.</b>&rdquo; The needle has now verified this experimentally. That\'s the third meter this month, Hajra.<br/>Please love responsibly. (Don\'t.)',
}

export interface SectionCopy { fl: string; h2: string; p: string }
export const HEADS: Record<string, SectionCopy> = {
  truths: { fl: 'part one', h2: 'If you were…', p: 'I had thirty answers once. I kept the eight that were<br/>really just one answer wearing costumes.<br/>Each opens twice: the surface, <b>then the evidence.</b>' },
  mirror: { fl: 'interlude', h2: 'Mirror, mirror…', p: 'Every palace needs one. This one has been briefed with<br/><b>six months of receipts</b> — real entries, real dates.<br/>Ask it anything.' },
  jar: { fl: 'part two', h2: 'The Star Jar', p: "Every time you said something my heart couldn't put down,<br/>I caught it and kept it — <b>your exact words, your exact spelling,</b><br/>the exact minute. Tap the jar." },
  firsts: { fl: 'the royal archives', h2: 'The Book of Firsts', p: 'Dates I never wrote down anywhere —<br/>because they wrote themselves <b>on me</b>. Tap each star.' },
  cities: { fl: 'interlude', h2: 'Two Cities, One Sky', p: 'They measure us in kilometres.<br/>The sky <b>refuses to cooperate</b>. Send something home.' },
  replays: { fl: 'from the royal records', h2: 'The Replays', p: 'Five conversations, preserved exactly as they happened —<br/><b>word for word, minute for minute.</b> Press play. Watch us happen again.' },
  confessions: { fl: 'classified', h2: 'Things I never told you', p: 'Four confessions, sealed until today.<br/><b>Tap an envelope</b> to open it. Gently.' },
  promises: { fl: 'sworn in writing', h2: 'The Promise Scroll', p: 'Not vows for a stage — vows for <b>Tuesdays</b>,<br/>for phone calls, for the rest of it. Unroll me.' },
  protocol: { fl: 'weapons registry', h2: 'The 🥺 Protocol', p: 'Your face makes it. My hands approve it. The paperwork is<br/>a formality — <b>no request has ever been denied.</b> Test the system.' },
  meter: { fl: 'interlude', h2: 'The Royal Love Meter', p: METER.intro },
  decree: { fl: 'interlude', h2: 'The Royal Decree', p: 'Sealed with wax, signed under our sky.<br/><b>Rub the seal</b> to break it open.' },
  panda: { fl: 'one last parcel', h2: 'Panda Delivery', p: PANDA_INTRO },
}

export const FOOTNOTE = 'made under our same sky ✦ for the princess only'
export const MOON_CREDIT = 'moon photograph · Gregory H. Revera · CC BY-SA 3.0'

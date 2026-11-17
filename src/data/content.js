// ✏️ EDIT THIS FILE — most of the site's text comes from here.
// Anything marked (placeholder) is sample text to be replaced with your real details.
//
// COPY STYLE GUIDE (keep the wording consistent when you edit):
//  - Sentence case everywhere ("Senior product designer", not "Senior Product Designer").
//  - One word per idea: "project" (not case study / work item), "resume", "Work" (nav + section).
//  - "&" in short labels and headings, "and" inside sentences.
//  - First person ("I led…"), lead with what the visitor gets, cut filler words.
//  - Buttons and links say what happens: "View my work", "Email me", "Resume (PDF)".
//  - Say "two-step verification" (not MFA / 2FA) and "backup codes" (not recovery codes), everywhere.

export const profile = {
  name: 'Rahul',
  role: 'Senior product designer',
  hello: "Hi, I'm Rahul —",
  // Pronunciation hint shown under your name. **double stars** make text bold.
  nameHint: '**rah** + c**ool**',
  headline: ['I design', 'products that', 'people trust', '& love to use.'],
  tags: ['SaaS', 'IoT', 'Enterprise'],
  // Split-flap board: 2 rows max 16 characters each, use "|" to break the line.
  flapPhrases: ['DESIGNING|CLEAR PRODUCTS', 'SIMPLIFYING|COMPLEX FLOWS', 'TESTING WITH|REAL USERS', 'FROM RESEARCH|TO HANDOFF'],
  // What the board spells in the opening intro (the card sits in the middle of the screen before the site opens), then the phrases above follow.
  flapIntro: 'RAHUL PONGDE|PRODUCT DESIGNER',
  photo: '', // e.g. '/me.jpg' (put the file in /public). Empty = "Photo coming soon" placeholder
  photoCaption: 'Rahul',
  email: 'pongderahul@gmail.com',
  resume: '/resume.pdf', // put resume.pdf in /public
  socials: [
    { label: 'LinkedIn', url: 'https://linkedin.com/in/' }, // (placeholder)
  ],
}

// (placeholder)
export const education = [
  { title: 'Senior product designer', place: 'Faclon Labs · 2022 – now' },
  { title: 'Design intern', place: 'Faclon Labs · 2022' },
  { title: 'B.Sc. in Computer Science', place: 'Kishinchand Chellaram College' },
]

export const strengths = [
  'UX design',
  'Design systems',
  'Data-heavy dashboards',
  'Design to code',
]

export const hobbies = ['cactus', 'sun', 'rocket', 'headphones', 'camera']

// Real projects (content from your Notion portfolio).
export const projects = [
  {
    slug: 'onboarding-at-scale',
    // Bubble above the title on the Work page. The **bold** word also becomes the changing last word of the heading on the left.
    hmw: `How might we give people their **time** back when adding hundreds of devices?`,
    title: 'Adding hundreds of devices from one Excel sheet',
    subtitle: 'Adding devices by hand was slow and full of mistakes',
    headline: 'How I made adding 250 devices take 8 minutes',
    eyebrow: 'Faclon Labs · IO Sense · Adding devices',
    methods: ['Interviews', 'Talks with the hardware team', 'Sketching', 'Testing with 4 users', 'Handing over to developers'],
    blurb: 'Big clients like JSW and Tata had to add 200 to 300 devices one by one. Now they upload them all at once. 250 devices take 8 minutes. 100 used to take 20.',
    company: 'Faclon Labs',
    year: '', // add the year when you know it, e.g. '2024'
    tags: ['Product design', 'Connected devices'],
    color: 'var(--sky)',
    art: 'devices', // the banner on the work list and home: the original three-step drawing (components/art/DevicesHero.jsx)
    // the live prototype (embed.html), shown in the right-hand column of the case study on a grey card, with the timeline under it.
    // demo: which prototype; viewW/viewH: the size it is laid out at (scaled down to the card when viewW is given)
    prototype: {
      demo: 'devices',
      viewW: 1100,
      viewH: 640,
      heading: 'Bulk device upload prototype',
      blurb: 'Click through it: add devices in bulk, fix the errors and confirm.',
      title: 'Interactive prototype: adding devices in bulk. A glowing pointer shows what to click next; the steps under it can also be clicked.',
    },
    role: 'Product designer',
    team: 'Only designer',
    timeline: '2 weeks',
    overview: 'I designed a way to upload many devices at once, from the Excel sheet we already give clients.',
    // "At a glance" cards under the hero, and the numbered process strip.
    glance: [
      { label: 'The problem', text: 'Devices were added one at a time, by hand.' },
      { label: 'My role', text: 'Product designer, the only designer' },
      { label: 'Timeline', big: '2 weeks' },
      { label: 'Result', big: '8 min', text: 'for 250 devices. 100 used to take 20.' },
    ],
    // the timeline under the live prototype: the steps of the bulk upload, then "Done!". Each `step` is a screen of the
    // prototype (src/embed/DevicesFlow.jsx); clicking a step shows that screen, and the timeline follows the prototype.
    process: [
      { label: 'Devices', step: 'devices' },
      { label: 'Add device', step: 'choose' },
      { label: 'Bulk add', step: 'upload' },
      { label: 'Upload file', step: 'file' },
      { label: 'Check', step: 'preview' },
      { label: 'Fix errors', step: 'fixed' },
      { label: 'Uploading', step: 'progress' },
    ],
    links: [{ label: 'View the Figma file', url: 'https://www.figma.com/design/O95C2MQm0skIxj050ML3WL/Portfolio?node-id=0-1' }],
    editorial: true, // the numbered-section layout (see components/CaseBlocks.jsx); the other case studies switch to it once this one is approved
    blocks: [
      // ---------- 01 Overview ----------
      { type: 'heading', heading: 'Overview' },
      { type: 'opener', body: 'I was ==the only designer== on this project, and it took ==2 weeks==.' },
      {
        type: 'callout',
        sub: 'Context',
        body: 'IO Sense is a tool clients use to ==connect devices==, like sensors and machines, and ==read the data they send==.',
      },
      {
        type: 'facts',
        sub: 'What I did',
        items: [
          { label: 'Researched', text: 'Interviews and talks with the hardware team' },
          { label: 'Designed', text: 'The upload flow and every screen in it' },
          { label: 'Tested', text: 'With 4 users' },
          { label: 'Reviewed', text: 'With the Product Manager, Product Lead and Design Team Lead' },
        ],
      },

      // ---------- 02 The problem ----------
      { type: 'heading', heading: 'The problem' },
      { type: 'opener', body: 'Each device was added ==by hand==, one at a time. It was slow, and people made many mistakes.' },
      {
        type: 'cols',
        cols: [
          [
            {
              type: 'callout',
              sub: 'Context',
              body: 'For big clients like ==JSW and Tata==, one project can mean ==200 to 300 devices==. Before a device can send data, someone has to add it to IO Sense.',
            },
          ],
          [
            {
              type: 'stats',
              sub: 'What went wrong',
              items: [
                { value: '20 min', label: 'to add 100 devices' },
                { value: '14', label: 'mistakes in each upload of 100 devices' },
                { value: '70%', label: 'of people had to redo devices, because they only saw mistakes afterwards' },
              ],
            },
          ],
        ],
      },
      {
        type: 'finding',
        sub: 'What we found',
        text: 'Mistakes showed up too late.',
        source: 'From interviews with technicians and operations managers',
        note: 'Nothing checked the details as people typed, so people had to start again.',
      },

      // ---------- 03 What we learned ----------
      { type: 'heading', heading: 'What we learned' },
      { type: 'opener', body: 'Everything we needed to add devices was ==already in an Excel sheet==.' },
      {
        type: 'cols',
        cols: [
          [
            {
              type: 'voices',
              sub: 'From the hardware team',
              items: [
                { label: 'On the devices', text: 'Every device has its own ID and a name that no other device has.', by: 'Hardware team' },
                { label: 'On the list', text: 'We already give most clients their device list as an Excel sheet. It has everything we need.', by: 'Hardware team' },
              ],
            },
          ],
          [{ type: 'callout', sub: 'What it meant', body: 'So the data already existed. We only had to let people ==upload it==.' }],
        ],
      },

      // ---------- 04 What people needed ----------
      { type: 'heading', heading: 'What people needed' },
      { type: 'opener', body: 'Interviews with technicians and operations managers showed ==five problems==.' },
      {
        type: 'pairs',
        sub: 'Five problems, five goals',
        items: [
          { from: 'Hard to tell what state each device is in', to: 'Be clear', body: 'Show every step and the status of every device.' },
          { from: 'No help along the way', to: 'Guide people', body: 'Short steps, with help built in.' },
          { from: 'Doing the same task again and again', to: 'Do it at once', body: 'Add many devices in one go.' },
          { from: 'No sign that it worked', to: 'Say it worked', body: 'Check as people go, and show a message at the end.' },
          { from: 'Hard to fix mistakes', to: 'Make fixing easy', body: 'Messages that say how to fix each mistake.' },
        ],
      },

      // ---------- 05 How it works now ----------
      { type: 'heading', heading: 'How it works now' },
      { type: 'opener', body: 'Adding many devices now takes ==five short steps==.' },
      {
        type: 'rows',
        sub: 'The steps',
        items: [
          { label: 'Choose', text: 'Pick In bulk', note: 'One device keeps the simple form' },
          { label: 'Upload', text: 'Add the Excel sheet', note: 'IDs and names fill in on their own' },
          { label: 'Fix', text: 'Fix the pink cells in the preview', note: 'Every mistake is fixed right there' },
          { label: 'Confirm', text: 'Press Confirm Upload', note: 'It stays off until every mistake is fixed' },
          { label: 'Submit', text: 'Press Submit after a last look', note: 'IO Sense adds the devices in a few minutes' },
        ],
      },

      // ---------- 06 Design decisions ----------
      { type: 'heading', heading: 'Design decisions' },
      { type: 'opener', body: 'The design checks the sheet ==before== anything is saved.' },
      {
        type: 'items',
        sub: 'Why it works this way',
        columns: 2,
        items: [
          { title: 'Build around the sheet', body: 'Clients already hold the Excel sheet, so we built around it.' },
          { title: 'Check before anything is saved', body: 'Every row shows its status. A cell with a mistake turns pink, and Confirm Upload stays off until every mistake is fixed.' },
          { title: 'Two steps at the end, on purpose', body: 'Confirm Upload accepts the sheet. Submit starts adding the devices, once everything is checked.' },
          { title: 'Nothing fails afterwards', body: 'Every mistake is fixed before Submit, so devices do not fail while IO Sense adds them. Nobody has to hunt for failed devices later.' },
        ],
      },
      {
        type: 'gallery',
        sub: 'User flow and sketches',
        images: [
          { src: '/images/devices/user-flow.webp', caption: 'How the steps connect', bare: true },
          { src: '/images/devices/wireframes.webp', caption: 'Early sketches' },
        ],
      },

      // ---------- 07 Testing & final design ----------
      { type: 'heading', heading: 'Testing & final design' },
      { type: 'opener', body: 'We tested with ==4 users==, then the team reviewed the design.' },
      {
        type: 'callout',
        sub: 'How we tested',
        body: 'The 4 users added different kinds of devices, from upload to submit. Then the ==Product Manager, Product Lead and Design Team Lead== reviewed the design.',
      },
      { type: 'image', sub: 'Review notes', src: '/images/devices/critique.png', caption: 'Review notes on the preview screen', wide: true },
      {
        type: 'flow',
        sub: 'The final design',
        kind: 'devices',
        real: '/images/devices/final-design.png',
        spots: [
          { x: 29, y: 19.4, title: 'Mistake count up front', body: 'A red number next to the file name shows how many mistakes are left to fix.' },
          { x: 48, y: 37.5, title: 'Mistakes where they happen', body: 'A cell with a mistake turns pink, so people fix it without searching.' },
          { x: 97.4, y: 19.4, title: 'Confirm waits', body: '“Confirm Upload” stays off until every mistake is fixed. “Re-upload” is the way out.' },
          { x: 37.5, y: 83, title: 'Every tab is checked', body: 'The device and sensor tabs show their own mistakes, so none are missed.' },
        ],
      },

      // ---------- 08 Testing feedback ----------
      { type: 'heading', heading: 'Testing feedback' },
      { type: 'opener', body: 'The review led to ==two changes==.' },
      {
        type: 'voices',
        sub: 'What the review asked for',
        items: [
          {
            label: 'On the preview',
            text: 'The preview shows the whole file. People should fix a mistake right there, by clicking the cell and typing.',
            by: 'Product Manager',
            now: 'Now: people fix mistakes in the preview.',
          },
          {
            label: 'On the exit',
            text: 'If someone wants to stop, there needs to be a Cancel button.',
            by: 'Product Lead and Design Team Lead',
            now: 'Now: Cancel takes people back to choosing a way to add.',
          },
        ],
      },
      {
        type: 'finding',
        sub: 'What changed',
        text: 'People fix a mistake ==right in the preview==, by clicking the cell and typing.',
        source: 'Product Manager feedback',
        note: 'There is also a Cancel button, which takes people back to choosing a way to add.',
      },

      // ---------- 09 Results ----------
      { type: 'heading', heading: 'Results' },
      { type: 'opener', body: '250 devices now take ==8 minutes==. 100 used to take 20.' },
      {
        type: 'stats',
        sub: 'The numbers',
        items: [
          { value: '8 min', label: 'for 250 devices, start to finish. 100 used to take 20.' },
          { value: '14 → 3', label: 'mistakes in each upload, for most uploads' },
          { value: '~3 min', label: 'of those 8 is IO Sense adding the devices' },
        ],
      },
      {
        type: 'callout',
        sub: 'In short',
        body: 'A slow task became a few simple steps. Clients like ==JSW and Tata== no longer add hundreds of devices by hand.',
      },
      { type: 'links', items: [{ label: 'View the Figma file ↗', url: 'https://www.figma.com/design/O95C2MQm0skIxj050ML3WL/Portfolio?node-id=0-1' }] },
        ],
  },
  {
    slug: 'security-without-friction',
    hmw: `How might we add security without taking away **ease**?`,
    title: 'Two-step verification people actually use',
    subtitle: 'Three ways to verify, built into the IO Sense sign-in',
    headline: 'How I made signing in safer without making it harder',
    eyebrow: 'Faclon Labs · IO Sense · Signing in',
    methods: ['Customer requests', 'Studying other products', 'Interviews', 'Sketching', 'Testing with 3 users', 'Handing over to developers'],
    blurb: 'Most customers wanted more than a password. I designed two-step verification after studying Google, Microsoft Teams and ClickUp.',
    company: 'Faclon Labs',
    year: '', // add the year when you know it
    tags: ['Product design', 'Security'],
    color: 'var(--mint)',
    art: 'mfa', // the banner on the work list and home: the original three cascading step cards (components/art/MfaBanner.jsx)
    // the live sign-in prototype (embed.html?demo=signin), at the top of the right-hand column with the timeline under it
    prototype: {
      demo: 'signin',
      viewH: 620,
      heading: 'Sign-in prototype',
      blurb: 'Click through it: sign in, enter the code, or try another way.',
      title: 'Interactive prototype: signing in with two-step verification. A glowing pointer shows what to do next; the steps under it can also be clicked.',
    },
    role: 'Lead designer',
    team: 'Team of 3',
    timeline: '3 weeks',
    overview:
      'I designed two-step verification, which asks for a code as well as a password, so accounts are safer and signing in stays simple.',
    glance: [
      { label: 'The problem', text: 'Only a password protected each account.' },
      { label: 'My role', text: 'Lead designer, team of 3' },
      { label: 'Timeline', big: '3 weeks' },
      { label: 'Result', big: '80%', text: 'of clients turned it on' },
    ],
    // the timeline under the live prototype: its screens, then "Done!". Each `step` is a screen of the sign-in prototype
    // (src/embed/SignInFlow.jsx); clicking a step shows that screen, and the timeline follows the prototype.
    process: [
      { label: 'Sign in', step: 'login' },
      { label: 'Enter code', step: 'code' },
      { label: 'Another way', step: 'pick' },
    ],
    links: [
      {
        label: 'View the Figma file',
        url: 'https://www.figma.com/design/5LpQG9FDkW0UG9Rg8febWf/2-Factor-Authentication-_IOsense_V1?node-id=64-11295&t=6pIw74f4nR047NzH-1',
      },
    ],
    editorial: true, // the numbered-section layout, like the Adding many devices case study
    blocks: [
      // ---------- 01 Overview ----------
      { type: 'heading', heading: 'Overview' },
      { type: 'opener', body: 'I led ==a team of 3== for ==3 weeks==, with little time and users who have very different computer skills.' },
      { type: 'callout', sub: 'Context', body: 'IO Sense is a tool clients use to ==connect devices== and ==read their data==.' },
      {
        type: 'facts',
        sub: 'What I did',
        items: [
          { label: 'Researched', text: 'Customer requests, other products and interviews' },
          { label: 'Designed', text: 'The setup and the sign-in, from sketches' },
          { label: 'Tested', text: 'With 3 users' },
          { label: 'Reviewed', text: 'With the Product Manager and the developers' },
        ],
      },

      // ---------- 02 The problem ----------
      { type: 'heading', heading: 'The problem' },
      { type: 'opener', body: 'Only ==a password== protected each account, and most customers asked for more.' },
      {
        type: 'callout',
        sub: 'Why it mattered',
        body: 'Several people use each customer’s system, each with their own account, so ==one weak or stolen password== puts the whole system at risk.',
      },

      // ---------- 03 Looking at other products ----------
      { type: 'heading', heading: 'Looking at other products' },
      { type: 'opener', body: 'I studied ==Google, Microsoft Teams and ClickUp==. All three offer the same three ways to check it is you.' },
      {
        type: 'items',
        sub: 'The three ways',
        columns: 3,
        items: [
          {
            title: 'A code by text message',
            body: 'A one-time code is sent to your phone. We already had phone numbers from sign-up, but none were confirmed. Confirming one turns this on.',
          },
          {
            title: 'An authenticator app',
            body: 'An app on your phone shows a new code. People scan a QR code once to connect it.',
          },
          {
            title: 'Backup codes',
            body: 'Codes you use once each, for when the other two are out of reach.',
          },
        ],
      },

      // ---------- 04 What people needed ----------
      { type: 'heading', heading: 'What people needed' },
      { type: 'opener', body: 'We interviewed clients for ==a week==: administrators, managers and everyday users. Most already used an authenticator app.' },
      {
        type: 'pairs',
        sub: 'Four worries, four goals',
        items: [
          { from: 'Setting it up felt confusing', to: 'Keep it simple' },
          { from: 'Security must not slow the day down', to: 'Stay out of the way' },
          { from: 'Fear of losing access with a new phone', to: 'Never get locked out' },
          { from: 'Wanted clearer instructions', to: 'Feel sure' },
        ],
      },

      // ---------- 05 Design decisions ----------
      { type: 'heading', heading: 'Design decisions' },
      { type: 'opener', body: 'Setup starts with ==what people already have==: a phone number and, for most, an authenticator app.' },
      {
        type: 'items',
        sub: 'Why it works this way',
        columns: 2,
        items: [
          { title: 'Start with the phone number', body: 'Every account has one already. Confirming it is the quickest way in.' },
          { title: 'The app, for those who know it', body: 'Most clients already use one, so scanning a QR code feels familiar. A typed key works too.' },
          { title: 'Check before turning on', body: 'It only turns on after the person enters a code. That proves it works.' },
          { title: 'Backup codes, shown once', body: 'Each code works once. People download or print them, so a lost phone does not lock them out.' },
        ],
      },

      // ---------- 06 How signing in works now ----------
      { type: 'heading', heading: 'How signing in works now' },
      { type: 'opener', body: 'Signing in now asks for ==a password and a code==.' },
      {
        type: 'list',
        sub: 'The steps',
        items: [
          '**Enter your username and password.** Then press Let’s go.',
          '**Enter the six digit code.** It comes from your authenticator app or a text message.',
          '**Not working? Try Another Way.** Choose the text message, the app or a backup code.',
          '**No text yet?** After a short countdown, ask for a new code with Resend OTP.',
        ],
      },
      { type: 'image', sub: 'User flow', src: '/images/mfa/user-flow.webp', caption: 'How signing in works', wide: true },

      // ---------- 07 Choices we made ----------
      { type: 'heading', heading: 'Choices we made' },
      { type: 'opener', body: 'Two-step verification is ==optional, not forced==: ==80% of clients== turned it on.' },
      {
        type: 'items',
        sub: 'What we chose',
        columns: 2,
        items: [
          { title: 'Step by step', body: 'One step at a time is easier to follow than one big window.' },
          { title: 'All three ways', body: 'The text message is the easiest start, because we already hold a phone number. We recommend the app.' },
          { title: 'Optional, not forced', body: 'Forcing everyone at once is too much. We sent emails and let people skip the prompt for a few days. 80% turned it on.' },
          { title: 'Downloading backup codes', body: 'The developers disagreed at first. We added it later.' },
        ],
      },

      // ---------- 08 Testing & final design ----------
      { type: 'heading', heading: 'Testing & final design' },
      { type: 'opener', body: 'We tested with ==3 users==. Each tried all three ways at least twice.' },
      { type: 'callout', sub: 'How we tested', body: 'With only 3 people, ==treat the results as a guide==.' },
      {
        type: 'finding',
        sub: 'What we found',
        text: '==80%== finished their tasks.',
        source: 'Tests with 3 users',
        note: 'The rest chose to stop: they did not want to add an app. That is why the text message sits beside our recommended way.',
      },
      {
        type: 'flow',
        sub: 'The final design',
        kind: 'mfa',
        real: '/images/mfa/final-design-1.webp',
        spots: [
          { x: 28, y: 28, title: 'Setup as a short checklist', body: 'Steps are listed up front: confirm your phone, add an app, get codes.' },
          { x: 36.5, y: 38.6, title: 'Turn on comes last', body: 'The “Turn on 2-Step Verification” button stays off until setup is done.' },
          { x: 84, y: 20.5, title: 'Status on every way', body: 'Each way shows where it stands, so people see what is left.' },
          { x: 84, y: 30.7, title: 'Backup codes as a safety net', body: 'One-time backup codes, so a lost phone is not a lost account.' },
        ],
      },

      // ---------- 09 Testing feedback ----------
      { type: 'heading', heading: 'Testing feedback' },
      { type: 'opener', body: 'Feedback from the ==Product Manager and the developers== led to ==five changes==.' },
      {
        type: 'list',
        sub: 'The five changes',
        items: ['Clearer instructions', 'Simpler error messages', 'Backup code reminders', 'Cleaner layout', 'Success messages'],
      },

      // ---------- 10 Results ----------
      { type: 'heading', heading: 'Results' },
      { type: 'opener', body: '==80%== of clients turned it on.' },
      {
        type: 'stats',
        sub: 'The numbers',
        items: [
          { value: '80%', label: 'of testers finished their tasks' },
          { value: '10% faster', label: 'to set up than the average for authenticator apps' },
          { value: '80%', label: 'of clients turned it on' },
        ],
      },
      {
        type: 'callout',
        sub: 'Comparison',
        body: 'A 2019 study of Google’s setup found that an authenticator app took ==110 seconds== on average (Reese et al., SOUPS 2019).',
      },
      {
        type: 'callout',
        sub: 'In short',
        body: 'IO Sense went from a password-only login to its ==first two-step verification==. People can choose from three ways to verify, and we recommend the app.',
      },
      {
        type: 'links',
        items: [
          {
            label: 'View the Figma file ↗',
            url: 'https://www.figma.com/design/5LpQG9FDkW0UG9Rg8febWf/2-Factor-Authentication-_IOsense_V1?node-id=64-11295&t=6pIw74f4nR047NzH-1',
          },
        ],
      },
    ],
  },
  {
    slug: 'faclon-design-system',
    hmw: `How might we keep every screen **consistent**, whether a designer, a developer or AI builds it?`,
    title: 'Building Faclon’s first design system',
    subtitle: 'Shared building blocks for designers, developers and Bruce, our AI',
    headline: 'How I built one set of building blocks for every Faclon screen',
    eyebrow: 'Faclon Labs · Design system',
    teamDetail: 'A developer, a designer who made the parts in Figma, and me',
    methods: ['Research', 'Building parts in Figma', 'Testing the parts', 'Page layouts', 'Rules for the AI', 'Team leadership'],
    blurb: 'Faclon had no shared building blocks, so new screens were copied from old ones. I led a team of 3 to build them. New screens now take 1 day instead of 3.',
    company: 'Faclon Labs',
    year: '', // add the year when you know it
    tags: ['Design system', 'AI'],
    color: 'var(--lilac)',
    art: 'design-system', // the banner on the work list and home (components/art/DesignSystemBanner.jsx): tokens, components, screens
    // the live Bruce prototype (embed.html?demo=fds): a question makes Bruce write a screen, and the design system draws it
    prototype: {
      demo: 'fds',
      viewW: 960,
      viewH: 780,
      heading: 'Bruce prototype',
      blurb: 'Ask a question: Bruce writes the screen as JSON, and the design system draws it.',
      title: 'Interactive prototype: Bruce writes a screen as JSON and the design system draws it. A glowing pointer shows what to click next; the steps under it can also be clicked.',
    },
    mock: 'system', // fallback if the banner is ever switched off
    role: 'Lead designer',
    team: 'Team of 3',
    timeline: '2 months',
    overview:
      'Faclon had no design system, so every new screen started as a copy of an old one. I led a team of 3 to build one in about 2 months. Bruce, our AI, builds from it too.',
    glance: [
      { label: 'The problem', text: 'No shared building blocks. New screens were copied from old ones.' },
      { label: 'My role', text: 'Lead designer, team of 3' },
      { label: 'Timeline', big: '2 months' },
      { label: 'Result', big: '3 → 1 day', text: 'to build a new set of screens' },
    ],
    // the timeline under the live prototype: its stages, then "Done!". Each `step` is a stage of the Bruce prototype
    // (src/components/FdsDemo.jsx); clicking a step shows that stage, and the timeline follows the prototype.
    process: [
      { label: 'Ask', step: 'ask' },
      { label: 'Write', step: 'write' },
      { label: 'Draw', step: 'draw' },
    ],
    // links: [{ label: 'View the Figma file', url: '' }], // add the Figma link when you have it
    editorial: true, // the numbered-section layout, like the Adding many devices case study
    blocks: [
      // ---------- 01 Overview ----------
      { type: 'heading', heading: 'Overview' },
      { type: 'opener', body: 'A design system is ==a shared set of ready-made parts==, like buttons, forms and colours, that every screen is built from.' },
      {
        type: 'callout',
        sub: 'Context',
        body: 'Faclon Labs makes products for ==industrial teams==. We were ==a very small team==, and the first version took ==about 2 months==. A design system never really ends, so ours keeps growing.',
      },
      {
        type: 'facts',
        sub: 'The team',
        items: [
          { label: 'Developer', text: 'Built the parts in code, so what is in Figma is what ships.' },
          { label: 'Component designer', text: 'Designed and organised the parts in Figma.' },
          { label: 'Me, team lead', text: 'Set the direction, made decisions and kept things moving.' },
        ],
      },

      // ---------- 02 The problem ----------
      { type: 'heading', heading: 'The problem' },
      { type: 'opener', body: 'Every new screen started as ==a copy of an older one==. So old mistakes were copied too, and our products stopped matching.' },
      {
        type: 'finding',
        sub: 'What it cost',
        text: 'A new set of screens took ==3 days== to build.',
        note: 'Each one started as a copy of an older screen, so the old mistakes came along too.',
      },

      // ---------- 03 Why we built it now ----------
      { type: 'heading', heading: 'Why we built it now' },
      { type: 'opener', body: 'There were ==two reasons==: copying kept old problems alive, and Bruce needed parts to build with.' },
      {
        type: 'items',
        sub: 'The two reasons',
        columns: 2,
        items: [
          {
            title: 'Copying kept old problems alive',
            body: 'Every flaw was copied with the screen, and there was no one place to fix it for everyone.',
          },
          {
            title: 'Bruce builds with it',
            body: 'Bruce, our company AI, lets users make their own apps and dashboards. What it builds must look like the rest of Faclon.',
          },
        ],
      },

      // ---------- 04 Goals ----------
      { type: 'heading', heading: 'Goals' },
      { type: 'opener', body: 'The problem and Bruce gave us ==four goals==.' },
      {
        type: 'pairs',
        sub: 'Four problems, four goals',
        items: [
          { from: 'Screens copied from old designs', to: 'One place for everything', body: 'One set of parts that every product builds from.' },
          { from: 'Products that looked different', to: 'Matching products', body: 'The same colours, text and spacing everywhere.' },
          { from: 'An AI that builds apps for users', to: 'Dependable AI output', body: 'Bruce uses the same parts as designers and developers.' },
          { from: 'Design and code kept apart', to: 'Figma and code together', body: 'The system exists in both, so they stay in step.' },
        ],
      },

      // ---------- 05 Options we weighed ----------
      { type: 'heading', heading: 'Options we weighed' },
      { type: 'opener', body: 'There were ==three ways== to get a library of parts.' },
      {
        type: 'items',
        sub: 'The three options',
        columns: 3,
        items: [
          { title: 'Copy a free, shared system', body: 'Take most parts from an existing open-source design system.' },
          { title: 'Build everything ourselves', body: 'Code and decide every part on our own.' },
          { title: 'Build on an existing one (our choice)', body: 'Use Razorpay’s Blade design system as the base, and build our own library on top.' },
        ],
      },

      // ---------- 06 Design decisions ----------
      { type: 'heading', heading: 'Design decisions' },
      { type: 'opener', body: 'We chose ==Blade as the base== and built our own library on top.' },
      {
        type: 'items',
        sub: 'Why it works this way',
        columns: 2,
        items: [
          { title: 'Shared colours, text and spacing', body: 'Every part uses the same ones, so one change reaches the whole system.' },
          { title: 'Figma and code from day one', body: 'The system lives in both, so designers and developers use the same parts.' },
          { title: 'Learn from one that works', body: 'Blade gave us a proven base, so we did not start from nothing.' },
          { title: 'A system that keeps growing', body: 'It never ends. It keeps getting new parts, like a product.' },
        ],
      },

      // ---------- 07 How we built it ----------
      { type: 'heading', heading: 'How we built it' },
      { type: 'opener', body: 'We built it in ==four steps==, from research to layouts.' },
      {
        type: 'rows',
        sub: 'The steps',
        items: [
          { label: 'Research first', text: 'We started with research, then moved to the parts.' },
          { label: 'Parts in Figma', text: 'As designers, we made the parts ourselves in Figma.' },
          { label: 'Test the parts', text: 'We tested them before building anything on top.' },
          { label: 'Layouts for the rest', text: 'Then we designed layouts, pop-up windows and flows.' },
        ],
      },

      // ---------- 08 Results ----------
      { type: 'heading', heading: 'Results' },
      { type: 'opener', body: 'A new set of screens now takes ==1 day== instead of 3.' },
      {
        type: 'stats',
        sub: 'The numbers',
        items: [
          { value: '3 → 1 day', label: 'to build a new set of screens' },
          { value: '~3 days', label: 'to deliver it fully, including testing once it is connected to our data' },
          { value: 'Every', label: 'new project at Faclon now uses the system' },
        ],
      },
      {
        type: 'callout',
        sub: 'In short',
        body: 'Faclon went from copying old screens to building ==every new product on one system==. The same parts now let Bruce build users’ own apps and dashboards that still look and feel like Faclon.',
      },
      // Still to add (needs your input): screenshots of the library and of something Bruce built, a { type: 'flow' }
      // walkthrough of the real components, and the Figma link.
    ],
  },
]

// Only facts you've already shared are used here. To personalise it, add what you care about and what you want next.
export const about = {
  intro:
    "I'm a senior product designer at Faclon Labs. I joined in 2022 as a design intern and grew into a senior role, designing IoT products for industrial teams. I like turning complex workflows into products that feel simple.",
  facts: [
    ['Based in', 'Mumbai, India'],
    ['Role', 'Senior product designer at Faclon Labs, since 2022'],
    ['Tools', 'Figma, Sketch & Jitter'],
    ['Outside work', 'Football, trekking and swimming'],
  ],
}

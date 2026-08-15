/**
 * Every user-facing string in the app.
 *
 * Nothing gets hard-coded into JSX. Two reasons: P2 Spanish support becomes a
 * matter of adding a second object rather than hunting through components, and
 * keeping the copy in one file makes it possible to actually read it end to end
 * and check it stays at a middle-school reading level.
 *
 * Wording rules baked in here:
 *  - "likely qualify", never "qualify". The app screens; the county determines.
 *  - No claim that this app applies for you or talks to any state system.
 *  - No jargon without an inline explanation.
 */

export const strings = {
  app: {
    name: "Medi-Cal Coverage Helper",
    tagline: "Don't lose your Medi-Cal.",
  },

  home: {
    tabs: {
      screener: "See if you qualify",
      hours: "Track your hours",
    },
    accountChip: {
      signIn: "Sign in",
      profileAria: "Your account",
    },
  },

  profile: {
    heading: "Your account",
    signedOutHeading: "Sign in to your account",
    signedOutBody:
      "Your account holds your logged work hours and your exemption answer, nothing else. No passwords: use Google or an emailed link.",
    emailLabel: "Email",
    memberSince: (date: string) => `Member since ${date}`,
    screening: {
      heading: "Your eligibility check",
      savedOn: (date: string) => `Saved ${date}`,
      pathwayLine: (label: string) => `Based on the ${label} pathway.`,
      pathways: {
        magi_adult: "adult income",
        children: "children's coverage",
        pregnancy: "pregnancy coverage",
        seniors: "65-and-older",
      } as Record<string, string>,
      none: "Nothing saved yet. Run a quick check and you can save the result here.",
      runCheck: "See if I qualify",
      checkAgain: "Run a new check",
      remove: "Remove saved result",
      removeHint: "Removing it only deletes the saved copy. It doesn't change anything with the county.",
    },
    exemptionHeading: "Work rule exemption",
    exemptionExempt: (label: string) => `You said: "${label}." The work-hours rule shouldn't apply to you.`,
    exemptionNotExempt: "You said none of the exemptions apply, so you're logging hours.",
    exemptionUnanswered: "You haven't answered the exemption check yet, so the tracker will ask you first.",
    changeAnswer: "Change my answer",
    signOut: "Sign out",
    signOutHint: "Your saved hours stay in your account for when you come back.",
  },

  intro: {
    heading: "Let's see if you likely qualify for Medi-Cal.",
    body: "A few quick questions. No account, no name, no Social Security number. We don't save your answers.",
    timeEstimate: "About 2 minutes",
    start: "Start",
    disclaimerHeading: "What this does and doesn't do",
    disclaimer:
      "This tool checks your answers against California's published rules and tells you what it finds. It is not an application, and it can't decide your case. Only your county can do that.",
  },

  nav: {
    back: "Back",
    continue: "Continue",
    yes: "Yes",
    no: "No",
    notSure: "I'm not sure",
    progress: (current: number, total: number) => `Question ${current} of ${total}`,
    startOver: "Start over",
  },

  loading: {
    checking: "Checking the rules…",
  },

  result: {
    likely_eligible: {
      badge: "Likely qualifies",
      note: "This is a good sign, but it's not a decision. Your county makes the final call.",
    },
    likely_not_eligible: {
      badge: "May not qualify this way",
      note: "Other programs may still help you. It's worth checking with your county.",
    },
    needs_human: {
      badge: "Needs a person",
      note: "Some situations are too complicated for a quick check, and guessing would not help you.",
    },
    /**
     * Post-result account pitch, shown ONLY on likely_eligible. The screener
     * stays anonymous; an account is offered, never required, and only when
     * there's a real next step to save.
     */
    keepCoverage: {
      heading: "Getting covered is step one. Keeping it is step two.",
      body: "Make a free account and you'll be ready before it counts: track the work hours that start in 2027, and see everything in one place.",
      cta: "Make my free account",
      goToTracker: "Go to my hours tracker",
      signedInAs: (email: string) => `You're signed in as ${email}.`,
    },
    save: {
      cta: "Save this result to my account",
      saving: "Saving…",
      saved: "Saved to your account. You can see it anytime on your profile.",
    },
    whyHeading: "Why we said this",
    verifiedThrough: (date: string) => `Based on rules verified ${date}`,
    notVerifiedYet:
      "Heads up: we haven't finished confirming this year's numbers with the state, so we won't guess at them.",
    ruleSetVersion: (version: string) => `Rule set ${version}`,
    startOver: "Check a different situation",
  },

  error: {
    heading: "Something went wrong on our end.",
    body: "That's a bug, not a problem with your answers. Try again in a moment.",
    retry: "Try again",
    offlineHint:
      "If you're running this locally, make sure the Firebase emulators are running.",
  },

  tracker: {
    heading: "Work hours tracker",
    /**
     * The judges-and-users framing: this requirement is NOT in force yet. The
     * start date is filled from the rule's effective_date via the API; the
     * UI never hard-codes it.
     */
    notYetBanner: {
      badge: "Not required yet",
      body: (startDate: string) =>
        `The work-hours rule starts ${startDate}. Nothing is required today, but tracking now makes it a habit before it counts.`,
    },
    signIn: {
      heading: "Save your hours as you go",
      body: "Sign in so your logged hours are saved to your account. We only use your account to store your own entries. Nothing is shared.",
      googleButton: "Sign in with Google",
      devButton: "Dev sign-in (emulator only)",
      signOut: "Sign out",
      or: "or",
      emailLabel: "Your email address",
      emailSend: "Email me a sign-in link",
      emailSent: (email: string) =>
        `Check your email: we sent a sign-in link to ${email}. Open it on this device to finish signing in.`,
      emailInvalid: "That doesn't look like an email address.",
      confirmHeading: "One more step",
      confirmBody:
        "Enter the email address your sign-in link was sent to, so we know it's really you.",
      confirmButton: "Finish signing in",
      linkFailed: "That sign-in link didn't work. It may have expired, so send yourself a new one.",
    },
    exemption: {
      heading: "First, a quick check",
      body: "Some people are exempt from the work-hours rule entirely. Do any of these describe you?",
      none: "None of these apply to me",
      confirm: "Save my answer",
      change: "Change my exemption answer",
      exemptHeading: "Good news: you look exempt.",
      exemptBody:
        "Based on your answer, the work-hours rule shouldn't apply to you. You don't need to log hours. Your county confirms exemptions, so keep an eye on your renewal paperwork.",
      categories: {
        american_indian_urban_indian: "I'm American Indian or Urban Indian",
        caregiver_child_13_or_younger_or_disabled_person:
          "I care for a child 13 or younger, or for someone with a disability",
        veteran_total_disability: "I'm a veteran with a total disability rating",
        medically_frail_blind_disabled: "I'm medically frail, blind, or disabled",
        substance_use_disorder_or_disabling_mental_health:
          "I have a substance use disorder or a disabling mental health condition",
        physical_intellectual_developmental_disability:
          "I have a physical, intellectual, or developmental disability that limits daily tasks",
        serious_or_complex_medical_condition: "I have a serious or complex medical condition",
        meeting_calfresh_calworks_work_requirements:
          "I already meet CalFresh or CalWORKs work requirements",
        drug_or_alcohol_treatment_program: "I'm in a drug or alcohol treatment program",
        currently_incarcerated: "I'm currently incarcerated",
        pregnant_or_postpartum_12_months: "I'm pregnant, or gave birth in the last 12 months",
        enrolled_in_school_or_training: "I'm enrolled in school or a training program",
        short_term_hardship:
          "I'm dealing with a short-term hardship (like a disaster or hospital stay)",
      } as Record<string, string>,
    },
    dashboard: {
      hoursOf: (total: number, target: number) => `${total} of ${target}`,
      hoursUnit: "hours this month",
      status: {
        met: "Goal met",
        on_pace: "On pace",
        behind: "Behind pace",
        exempt: "Exempt",
        unknown: "Can't check yet",
      },
      logHeading: "Log your activities",
      listHeading: "This month's log",
      emptyLog: "Nothing logged yet this month. Add your first activity above.",
    },
    form: {
      kindLabel: "What did you do?",
      kinds: {
        job: "Work",
        school: "School",
        training: "Job training",
        volunteer: "Volunteering",
      } as Record<string, string>,
      dateLabel: "What day?",
      hoursLabel: "How many hours?",
      submit: "Add hours",
      hoursRange: "Enter between 0.5 and 24 hours.",
      delete: "Remove",
      deleteAriaLabel: (desc: string) => `Remove entry: ${desc}`,
    },
    errors: {
      loadFailed: "We couldn't load your hours. Check your connection and try again.",
      saveFailed: "That didn't save. Try again in a moment.",
      retry: "Try again",
    },
  },

  rulesPanel: {
    heading: "Where our numbers come from",
    summary: (verified: number, total: number) =>
      `${verified} of ${total} rules verified against a primary source`,
    columnRule: "Rule",
    columnValue: "Value",
    columnSource: "Source",
    unverified: "Not verified yet",
    noSource: "No source yet",
    verifiedOn: (date: string) => `Verified ${date}`,
    effectiveFrom: (date: string) => `Effective ${date}`,
    devOnlyNote:
      "This panel is here so you can see exactly which numbers are sourced and which aren't. Nothing is guessed.",
  },

  /**
   * Shown when a typed answer can't be used.
   *
   * Every one of these has to say what to do next, not just that something is
   * wrong. A greyed-out button with no explanation is a dead end.
   */
  validation: {
    required: "Enter a number to keep going.",
    notANumber: "That doesn't look like a number.",
  },

  questions: {
    householdSize: {
      prompt: "How many people are in your household?",
      help: "Count yourself, plus anyone you file taxes with: a partner, kids, or anyone you claim.",
      unit: "people",
      rangeMessage:
        "Enter a number between 1 and 12. If your household is bigger than that, your county office can help you directly.",
    },
    monthlyIncomeUsd: {
      prompt: "About how much does your household make each month?",
      help: "Before taxes are taken out. A close estimate is fine; we don't need an exact number.",
      unit: "dollars per month",
      rangeMessage:
        "Enter an amount between $0 and $100,000 a month. If you typed what you make in a year, use the monthly amount instead.",
    },
    age: {
      prompt: "How old are you?",
      help: "Age changes which rules apply to you.",
      unit: "years old",
      rangeMessage: "Enter an age between 0 and 120.",
    },
    isPregnant: {
      prompt: "Are you pregnant?",
      help: "Pregnancy has its own coverage rules, and they're more generous.",
    },
    hasDisability: {
      prompt: "Do you have a disability?",
      help: "This can open up other kinds of coverage.",
    },
    isFullTimeStudent: {
      prompt: "Are you a full-time student?",
      help: "School can count toward the work-hours requirement later on.",
    },
    needsLongTermCare: {
      prompt: "Do you need long-term care, like a nursing home or in-home care?",
      help: "These rules are complicated. If this is you, we'll send you to a person instead of guessing.",
    },
    hasComplexImmigrationStatus: {
      prompt: "Is your immigration status something you'd like help figuring out?",
      help: "We never ask for document numbers. We just want to know whether to send you to someone who can help.",
    },
  },
} as const;

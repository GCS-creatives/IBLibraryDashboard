// Default/seed content for every content bank.
// This is what loads before any Admin edits exist in storage,
// and is also the "restore default" target for the Statement of Inquiry.

export const defaultContent = {
  statementsOfInquiry: {
    activeId: 'soi-default',
    items: [
      {
        id: 'soi-default',
        text: 'Access to information and diverse perspectives shapes how we understand, question, and participate in the world.',
        isDefault: true,
        status: 'active',
        schedule: null,
        es: { text: '', approved: false }
      }
    ]
  },

  inquiryQuestions: {
    mode: 'auto', // auto | hold | custom  (SCHEDULE is per-item, see each item's `schedule`)
    heldId: null,
    customValue: null, // { factual, conceptual, debatable }
    items: [
      {
        id: 'q-1',
        factual: 'What resources and strategies can we use to find reliable information and diverse perspectives?',
        conceptual: 'How does access to different perspectives influence our understanding?',
        debatable: 'Does having access to more information always lead to better understanding?',
        tags: ['Access', 'Perspective', 'Evidence'],
        schedule: null,
        es: { factual: '', conceptual: '', debatable: '', approved: false }
      }
    ]
  },

  atlSpotlights: {
    mode: 'auto',
    heldId: null,
    customValue: null, // { category, title, text }
    items: [
      {
        id: 'atl-1',
        category: 'Research',
        title: 'Evaluating Sources',
        text: 'I examine who created information, why it was created, and what evidence supports it.',
        schedule: null,
        es: { title: '', text: '', approved: false }
      },
      {
        id: 'atl-2',
        category: 'Self-Management',
        title: 'Responsibility',
        text: 'I manage shared resources responsibly so they remain available to others.',
        schedule: null,
        es: { title: '', text: '', approved: false }
      }
    ]
  },

  learnerProfileSpotlights: {
    mode: 'auto',
    heldId: null,
    customValue: null, // { attribute, text }
    items: [
      {
        id: 'lp-principled',
        attribute: 'Principled',
        text: 'We act with integrity and take responsibility for our choices and our shared community.',
        schedule: null,
        es: { text: '', approved: false }
      },
      {
        id: 'lp-inquirer',
        attribute: 'Inquirer',
        text: 'We ask questions and seek deeper understanding.',
        schedule: null,
        es: { text: '', approved: false }
      }
    ]
  },

  todaysFocus: {
    mode: 'auto',
    heldId: null,
    customValue: null, // { text, subtext }
    items: [
      { id: 'focus-1', text: 'Evaluate information.', subtext: 'Small steps. Big understanding.', schedule: null, es: { text: '', subtext: '', approved: false } },
      { id: 'focus-2', text: 'Ask a better question.', subtext: '', schedule: null, es: { text: '', subtext: '', approved: false } },
      { id: 'focus-3', text: 'Return what others need.', subtext: '', schedule: null, es: { text: '', subtext: '', approved: false } },
      { id: 'focus-4', text: 'Notice another perspective.', subtext: '', schedule: null, es: { text: '', subtext: '', approved: false } },
      { id: 'focus-5', text: 'Cite what you use.', subtext: '', schedule: null, es: { text: '', subtext: '', approved: false } }
    ]
  },

  voiceLevel: {
    current: 2,
    levels: [
      { level: 0, label: 'Silent', description: 'No talking.' },
      { level: 1, label: 'Quiet', description: 'Whisper-level or very quiet conversation.' },
      { level: 2, label: 'Working Human', description: 'Normal collaborative working voice.' },
      { level: 3, label: 'Outside Voice', description: 'Not used in the library.', disabled: true }
    ]
  },

  media: {
    mode: 'default',
    current: null // { type: 'youtube'|'slides'|'pdf'|'image'|'iframe', url, title }
  },

  learnerProfile: [
    'Inquirer', 'Knowledgeable', 'Thinker', 'Communicator', 'Principled',
    'Open-minded', 'Caring', 'Risk-taker', 'Balanced', 'Reflective'
  ],

  languageSettings: {
    spanishEnabled: false,
    defaultLanguage: 'en'
  },

  announcements: {
    items: []
    // Each item: { id, text, es: { text, approved }, schedule: {start,end} | null, active: bool }
  },

  rules: {
    es: { general: [], checkout: [], yellowTag: [], mediaOffice: [] },
    general: [
      'Respect people, ideas, materials, and shared spaces.',
      'No horseplay.',
      'Follow the current voice level.',
      'Students may not eat in the library.',
      'Staff who eat in the library should use designated non-carpeted/concrete areas.',
      'Leave spaces as you found them or better.',
      'Reset furniture and materials after use.',
      'If you notice something out of place, help care for the library by restoring it when appropriate.',
      'Follow staff directions and instructional-space expectations.',
      'When a class is using a space, that space may be unavailable for general student use.'
    ],
    checkout: [
      'Standard checkout period: 14 days / two weeks.',
      'Standard maximum: 3 books.',
      'Battle of the Books participants may check out up to 3 additional Battle of the Books titles (possible total of 6).',
      'Students must check books out before removing them from the library.',
      'Materials behind the circulation desk are not automatically available for checkout.',
      'Students should not check books out for other students.',
      'Students should not share, use, or memorize another student\u2019s library number.',
      'Fines and fees should be resolved in a timely manner.',
      'Students should return materials so others can access them.'
    ],
    yellowTag: [
      'Yellow Tag / RYA materials are intended for older students, including Year 4/Year 5 learners.',
      'A signed parent/guardian permission form is required for students below the approved age/grade range.',
      'Library staff must verify permission before checkout.',
      'Students may not bypass this process by using another student\u2019s account or checking a book out for someone else.'
    ],
    mediaOffice: [
      'Media Office \u2014 Staff Area.',
      'Access limited to library staff, authorized library aides, and other individuals specifically permitted by library staff.',
      'Students should not enter independently.'
    ]
  },

  spaces: {
    es: { doerMaker: [], garage: [], instructional: [], paisleyShelves: [], lowranceShelves: [] },
    doerMaker: [
      'Students must check out a book before using the DOER space.',
      'Students check in with Grace/library staff at the circulation desk first.',
      'Staff may confirm the student\u2019s current checkout status.',
      'The space is not available for general use while a class or scheduled group is using it.',
      'Materials and furniture must be reset after use.',
      'Shared tools and supplies should be used responsibly.',
      'Students should help restore the space when they notice something out of place.',
      'Collaboration is encouraged while respecting the current voice level and other library users.'
    ],
    garage: [
      'Scheduled use.',
      'Equipment care.',
      'Appropriate media production.',
      'Reset equipment after use.',
      'Follow staff directions.',
      'Respect recordings and privacy.',
      'Return equipment to assigned locations.',
      'Leave the room ready for the next group.'
    ],
    instructional: [
      'Classes and scheduled instruction have priority.',
      'When instruction is taking place, general-use traffic and conversation should not interfere.',
      'Students should follow the displayed voice level.',
      'Furniture and materials should be restored after instruction.',
      'The space remains part of the library even though it is open to surrounding areas.'
    ],
    paisleyShelves: [
      'Some resources are assigned, purchased, reserved, licensed, or organized for particular school populations, programmes, grade levels, or instructional purposes.',
      'Responsible access includes understanding intended audience, programme ownership, grade-level appropriateness, licensing, curricular purpose, funding source, and availability.'
    ],
    lowranceShelves: [
      'Some resources are assigned, purchased, reserved, licensed, or organized for particular school populations, programmes, grade levels, or instructional purposes.',
      'Responsible access includes understanding intended audience, programme ownership, grade-level appropriateness, licensing, curricular purpose, funding source, and availability.'
    ]
  },

  specialCollections: [
    { id: 'sc-1', name: 'Battle of the Books', description: '' },
    { id: 'sc-2', name: 'Multilingual Collection', description: '' },
    { id: 'sc-3', name: 'Reference Materials', description: '' }
  ],

  eResourcesLinks: [],
  researchHelpLinks: []
};

export const conceptTags = [
  'Access', 'Information', 'Perspective', 'Responsibility', 'Community', 'Evidence',
  'Curiosity', 'Credibility', 'Identity', 'Language', 'Culture', 'Ethics', 'Stewardship',
  'Reading', 'Inquiry', 'Reflection', 'Communication', 'Collaboration', 'Creativity',
  'Technology', 'Media', 'Privacy', 'Artificial Intelligence', 'Intellectual Freedom',
  'Representation', 'Multilingualism', 'Digital Citizenship', 'Source Evaluation',
  'Attribution', 'Belonging', 'Agency'
];

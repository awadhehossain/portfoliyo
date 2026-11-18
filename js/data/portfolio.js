/**
 * ------------------------------------------------------------------
 *  portfolio.js — ALL editable site content lives in this file.
 * ------------------------------------------------------------------
 *  Update text, links, skills, projects and education here.
 *  The page is rendered from this data, so you never need to touch
 *  the HTML to add a project or a timeline entry.
 *
 *  Icons: use any id from the SVG sprite at the bottom of index.html
 *  (e.g. "code", "chart", "network", "robot", "leaf", "cpu" ...).
 * ------------------------------------------------------------------
 */

/* ---------------------------------------------------------------- */
/*  Profile                                                          */
/* ---------------------------------------------------------------- */
export const profile = {
  name: 'Md. Awadhe Hossain',
  initials: 'AH',
  roles: ['Computer Science Student', 'Developer', 'AI & ML Enthusiast'],
  intro:
    'I build across the stack, from Python data pipelines and machine learning models ' +
    'to microcontrollers that sense and move. I like turning ideas into working ' +
    'prototypes, and I learn best by building.',

  /** Phrases cycled by the typing animation in the hero. */
  currently: [
    'training machine learning models',
    'analysing data with Pandas',
    'programming an ESP32',
    'building autonomous robots',
    'solving problems in C and C++',
  ],
};

/* ---------------------------------------------------------------- */
/*  Contact                                                          */
/* ---------------------------------------------------------------- */
export const contact = {
  /** Shown in the contact section and used by the contact form. */
  email: 'awadhe12302@gmail.com',

  /** Phone: `display` is what visitors see, `tel` is the dialable number. */
  phone: {
    display: '+880 1821-947177',
    local: '01821947177',
    tel: '+8801821947177',
  },

  /** WhatsApp: number in international format without + or spaces. */
  whatsapp: {
    number: '8801821947177',
    message: 'Hi Awadhe, I found your portfolio and would like to get in touch.',
  },

  /**
   * Form backend. FormSubmit (https://formsubmit.co) delivers each message
   * to the email above with no account needed. The very first message sends
   * you an activation email: click "Activate Form" once and every message
   * after that arrives in your inbox.
   * Formspree also works: paste e.g. 'https://formspree.io/f/abcdwxyz'.
   * Leave empty to open the visitor's email app instead.
   */
  formEndpoint: 'https://formsubmit.co/ajax/awadhe12302@gmail.com',
};

/* ---------------------------------------------------------------- */
/*  Social profiles                                                  */
/*  `primary: true` → also listed as a contact method.               */
/* ---------------------------------------------------------------- */
export const socials = [
  {
    id: 'github',
    label: 'GitHub',
    handle: '@awadhehossain',
    url: 'https://github.com/awadhehossain',
    icon: 'github',
    primary: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'in/paraffin67',
    url: 'https://www.linkedin.com/in/paraffin67/',
    icon: 'linkedin',
    primary: true,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    handle: 'paraffin67',
    url: 'https://www.facebook.com/paraffin67/',
    icon: 'facebook',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@paraffin67',
    url: 'https://www.instagram.com/paraffin67/',
    icon: 'instagram',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    handle: '+880 1821-947177',
    url: 'https://wa.me/8801821947177',
    icon: 'whatsapp',
  },
];

/* ---------------------------------------------------------------- */
/*  About                                                            */
/* ---------------------------------------------------------------- */
export const about = {
  paragraphs: [
    'I study Computer Science and Engineering, and most of what I build sits where code ' +
      'meets the real world. I use Python to analyse data and train machine learning models, ' +
      'and C and C++ to program the microcontrollers that act on the results.',
    'Robotics is where it all comes together: sensors feed data in, an algorithm makes a ' +
      'decision, and motors carry it out. Getting that loop right takes careful problem ' +
      'solving, and that is the part I enjoy most.',
    'I am always learning something new, whether it is a library, a board, or a cleaner ' +
      'way to structure a program.',
  ],
  focus: [
    {
      icon: 'layers',
      title: 'Computer Science & Engineering',
      text: 'Algorithms, data structures and the fundamentals of how software really runs.',
    },
    {
      icon: 'chart',
      title: 'Python & data analytics',
      text: 'Cleaning, exploring and visualising data to find out what it actually says.',
    },
    {
      icon: 'network',
      title: 'Machine learning & AI',
      text: 'Building, training and evaluating models with scikit-learn and TensorFlow.',
    },
    {
      icon: 'robot',
      title: 'Robotics & embedded systems',
      text: 'Arduino, ESP32 and Raspberry Pi projects that sense their surroundings and respond.',
    },
    {
      icon: 'bulb',
      title: 'Problem solving & learning',
      text: 'Breaking hard problems into small, testable steps, and picking up new tools on the way.',
    },
  ],
};

/* ---------------------------------------------------------------- */
/*  Skills                                                           */
/*  `layout` maps to a grid area in css/sections.css (bento grid).   */
/* ---------------------------------------------------------------- */
export const skillGroups = [
  {
    id: 'programming',
    layout: 'prog',
    icon: 'code',
    title: 'Programming',
    blurb: 'The languages I write every week, from quick scripts to low-level firmware.',
    skills: ['Python', 'C', 'C++', 'Java'],
  },
  {
    id: 'ml',
    layout: 'ml',
    icon: 'network',
    title: 'Machine Learning',
    blurb: 'Models that learn patterns from data and make predictions on new inputs.',
    skills: ['Machine Learning fundamentals', 'TensorFlow'],
    illustration: true,
  },
  {
    id: 'data',
    layout: 'data',
    icon: 'chart',
    title: 'Data Science',
    blurb: 'Turning raw, messy data into clear numbers and charts.',
    skills: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn'],
  },
  {
    id: 'web',
    layout: 'web',
    icon: 'globe',
    title: 'Web Development',
    blurb: 'Responsive, accessible interfaces like this one.',
    skills: ['HTML', 'CSS', 'JavaScript'],
  },
  {
    id: 'hardware',
    layout: 'hw',
    icon: 'cpu',
    title: 'Hardware',
    blurb: 'Microcontrollers and single-board computers for robotics and IoT.',
    skills: ['Arduino', 'ESP32', 'Raspberry Pi'],
  },
  {
    id: 'tools',
    layout: 'tools',
    icon: 'terminal',
    title: 'Tools',
    blurb: 'Version control and an editor set up for speed.',
    skills: ['Git', 'GitHub', 'VS Code'],
  },
];

/* ---------------------------------------------------------------- */
/*  Projects                                                         */
/*  - `category` must match one of the `projectFilters` ids below.   */
/*  - `image` (1200 px) and `imageSmall` (640 px): .webp/.jpg/.png.  */
/*  - `github`: link to the repository.                              */
/*  - `demo`:   link to a live demo or video. Leave '' and the card   */
/*              shows a "View Details" button that opens a modal.     */
/* ---------------------------------------------------------------- */
const GITHUB_REPOS = 'https://github.com/awadhehossain?tab=repositories';

export const projectFilters = [
  { id: 'all', label: 'All' },
  { id: 'robotics', label: 'Robotics', icon: 'robot' },
  { id: 'iot', label: 'IoT', icon: 'leaf' },
  { id: 'ml', label: 'Machine learning', icon: 'network' },
  { id: 'data', label: 'Data analytics', icon: 'chart' },
];

export const projects = [
  {
    id: 'autonomous-robot',
    title: 'Autonomous Navigation Robot',
    category: 'robotics',
    image: 'assets/images/projects/autonomous-robot.webp',
    imageSmall: 'assets/images/projects/autonomous-robot-640.webp',
    imageAlt: 'Four-wheeled robot car whose ultrasonic sensor sweeps a beam across a block and a traffic cone',
    summary:
      'A self-driving rover that reads its distance sensors, decides on a path in real time ' +
      'and steers around obstacles without a remote control.',
    details:
      'The robot runs a continuous sense, decide and act loop on a microcontroller. ' +
      'Ultrasonic and infrared sensors measure the space around it, a decision routine picks ' +
      'the clearest direction, and PWM signals drive the motors through an H-bridge.',
    features: [
      'Ultrasonic and IR sensing for obstacle detection',
      'Real-time steering logic written in C++',
      'PWM motor speed control through an H-bridge driver',
      'Modular code so new sensors can be added easily',
    ],
    tech: ['C++', 'Arduino', 'ESP32', 'Ultrasonic sensors', 'Motor driver'],
    github: GITHUB_REPOS,
    demo: '',
  },
  {
    id: 'smart-agriculture',
    title: 'Smart Agriculture System',
    category: 'iot',
    image: 'assets/images/projects/smart-agriculture.webp',
    imageSmall: 'assets/images/projects/smart-agriculture-640.webp',
    imageAlt: 'Raised bed of seedlings with a soil moisture probe wired to an ESP32 node sending readings over Wi-Fi',
    summary:
      'An ESP32 sensor node that tracks soil moisture, temperature and humidity, and waters ' +
      'the crops automatically when the soil gets too dry.',
    details:
      'Sensors in the field report soil and air conditions to an ESP32, which switches a ' +
      'water pump on and off based on moisture thresholds and sends readings over Wi-Fi so ' +
      'the field can be monitored remotely.',
    features: [
      'Soil moisture, temperature and humidity sensing',
      'Automatic pump control using moisture thresholds',
      'Wi-Fi data logging for remote monitoring',
      'Power-aware sleep cycles for longer field use',
    ],
    tech: ['ESP32', 'C++', 'IoT', 'Sensors', 'Wi-Fi'],
    github: GITHUB_REPOS,
    demo: '',
  },
  {
    id: 'crop-health-classifier',
    title: 'Crop Health Classifier',
    category: 'ml',
    image: 'assets/images/projects/ml-classifier.webp',
    imageSmall: 'assets/images/projects/ml-classifier-640.webp',
    imageAlt: 'Leaf with early blight lesions marked by detection boxes, feeding a neural network that outputs early blight',
    summary:
      'A TensorFlow image classifier that spots signs of disease in photos of leaves, ' +
      'trained and evaluated on a labelled plant dataset.',
    details:
      'Leaf images are resized, normalised and augmented, then used to train a convolutional ' +
      'neural network. The model is evaluated on a held-out test set and can be exported to ' +
      'run on a Raspberry Pi in the field.',
    features: [
      'Image preprocessing and augmentation pipeline',
      'Convolutional neural network built with TensorFlow and Keras',
      'Accuracy, precision, recall and confusion-matrix evaluation',
      'Exportable model for edge devices',
    ],
    tech: ['Python', 'TensorFlow', 'NumPy', 'Matplotlib'],
    github: GITHUB_REPOS,
    demo: '',
  },
  {
    id: 'data-analytics',
    title: 'Exploratory Data Analysis',
    category: 'data',
    image: 'assets/images/projects/data-analytics.webp',
    imageSmall: 'assets/images/projects/data-analytics-640.webp',
    imageAlt: 'Laptop showing an exploratory data analysis dashboard, with floating scatter and bar charts',
    summary:
      'A Python workflow that cleans a real-world dataset, explores its trends and turns the ' +
      'findings into clear visual reports.',
    details:
      'The analysis starts with cleaning and feature engineering in Pandas, moves through ' +
      'statistical summaries and correlation analysis, and ends with charts and a baseline ' +
      'predictive model that put the findings in context.',
    features: [
      'Data cleaning and feature engineering with Pandas',
      'Statistical summaries and correlation analysis',
      'Clear, labelled charts with Matplotlib',
      'Baseline predictive model with scikit-learn',
    ],
    tech: ['Python', 'Pandas', 'Matplotlib', 'Scikit-learn', 'Jupyter'],
    github: GITHUB_REPOS,
    demo: '',
  },
];

/* ---------------------------------------------------------------- */
/*  Education timeline (oldest first — the line fills as you scroll) */
/*  TODO: add your institutions and years.                           */
/*  Empty `institution` values are simply not shown.                 */
/* ---------------------------------------------------------------- */
export const education = [
  {
    period: 'Secondary',
    title: 'Secondary School Certificate (SSC)',
    institution: '',
    description:
      'Where my interest in computers, mathematics and figuring out how things work began.',
    tags: ['Mathematics', 'Science'],
  },
  {
    period: 'Higher secondary',
    title: 'Higher Secondary Certificate (HSC)',
    institution: '',
    description:
      'Built the foundation in mathematics and physics that led me to study computer science.',
    tags: ['Mathematics', 'Physics'],
  },
  {
    period: 'Undergraduate, present',
    title: 'B.Sc. in Computer Science & Engineering',
    institution: '',
    description:
      'Studying algorithms, data structures, object-oriented programming, computer ' +
      'architecture and software engineering.',
    tags: ['Algorithms', 'Data structures', 'OOP', 'Systems'],
    current: true,
  },
  {
    period: 'Ongoing',
    title: 'Independent work in AI, ML & robotics',
    institution: 'Projects and self-study',
    description:
      'Going beyond the syllabus with machine learning, data analytics and embedded ' +
      'projects on Arduino, ESP32 and Raspberry Pi.',
    tags: ['Machine learning', 'Data analytics', 'Embedded systems'],
  },
];

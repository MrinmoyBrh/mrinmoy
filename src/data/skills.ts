export interface SkillCategory {
  id: string;
  code: string;
  title: string;
  tagline: string;
  skills: {
    name: string;
    context: string;
    highlight?: boolean;
  }[];
}

export const skillCategories: SkillCategory[] = [
  {
    id: 'backend-web',
    code: 'MOD_01 // BACKEND & WEB',
    title: 'Backend & Web Development',
    tagline: 'Server-side development, database integration, administrative portals, and secure user authentication.',
    skills: [
      { name: 'Laravel & PHP', context: 'Backend routing, MVC controllers, and application logic', highlight: true },
      { name: 'MySQL Database', context: 'Relational schema design, SQL queries, and database integration', highlight: true },
      { name: 'Admin Dashboards', context: 'Dynamic administrative workflows and component interfaces', highlight: true },
      { name: 'Authentication Systems', context: 'User login workflows, session handling, and access control', highlight: false },
      { name: 'Email Notifications', context: 'Transactional verification emails and automated alert dispatch', highlight: false },
      { name: 'REST API Fundamentals', context: 'HTTP methods, JSON communication, and endpoint routing', highlight: false },
    ]
  },
  {
    id: 'languages',
    code: 'MOD_02 // LANGUAGES',
    title: 'Programming Languages',
    tagline: 'Core languages used for problem solving, backend development, and application building.',
    skills: [
      { name: 'Python', context: 'General scripting, image processing scripts, and automation', highlight: true },
      { name: 'C & C++', context: 'Core programming fundamentals, data structures, and algorithms', highlight: true },
      { name: 'PHP', context: 'Server-side scripting and dynamic web applications', highlight: true },
      { name: 'SQL', context: 'Relational data querying, joins, and table definitions', highlight: false },
      { name: 'JavaScript', context: 'Client-side interactions and asynchronous requests', highlight: false },
      { name: 'HTML & CSS', context: 'Semantic page structuring and responsive web styling', highlight: false },
    ]
  },
  {
    id: 'cloud-infra',
    code: 'MOD_03 // CLOUD & INFRA',
    title: 'Cloud & Infrastructure',
    tagline: 'Foundations of cloud computing, virtual instances, storage, and Linux environments.',
    skills: [
      { name: 'AWS Fundamentals', context: 'Core concepts of cloud architecture and cloud services', highlight: true },
      { name: 'Amazon EC2 & S3', context: 'Virtual compute instances and object storage management', highlight: true },
      { name: 'IAM & Basic VPC', context: 'Access management, security policies, and network concepts', highlight: false },
      { name: 'Linux (Ubuntu)', context: 'Operating system navigation, bash terminal, and file management', highlight: false },
    ]
  },
  {
    id: 'developer-tools',
    code: 'MOD_04 // DEV TOOLS',
    title: 'Developer Tools',
    tagline: 'Essential developer tooling for version control, local stacks, and workflows.',
    skills: [
      { name: 'Git & GitHub', context: 'Version control, commits, branching, and remote repositories', highlight: true },
      { name: 'Linux Terminal', context: 'Command-line execution, directory navigation, and file editing', highlight: true },
      { name: 'XAMPP & phpMyAdmin', context: 'Local Apache, MySQL server, and database administration', highlight: false },
      { name: 'Docker Fundamentals', context: 'Basic container concepts and environment consistency', highlight: false },
      { name: 'VS Code', context: 'Primary code editor with extensions and debugging setup', highlight: false },
    ]
  },
  {
    id: 'ml-vision',
    code: 'MOD_05 // ML & VISION',
    title: 'Machine Learning & Vision',
    tagline: 'Image processing fundamentals, color analysis, and academic research applied to plant pathology.',
    skills: [
      { name: 'Python for Vision', context: 'NumPy and image processing routines for pixel array operations', highlight: true },
      { name: 'Color Segmentation', context: 'HSV and LAB color space transformations for leaf pathology', highlight: true },
      { name: 'Basic Machine Learning', context: 'Fundamental classification concepts and model training basics', highlight: false },
      { name: 'Crop Disease Project', context: 'Academic research identifying foliar infections from leaf images', highlight: false },
    ]
  }
];

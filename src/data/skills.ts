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
    tagline: 'Languages used for problem solving, backend development, and application building.',
    skills: [
      { name: 'Python', context: 'General scripting, data processing scripts, and backend tasks', highlight: true },
      { name: 'PHP', context: 'Server-side scripting and dynamic web applications', highlight: true },
      { name: 'SQL', context: 'Relational data querying, joins, and table definitions', highlight: true },
      { name: 'C & C++ (Fundamentals)', context: 'Basic programming syntax, foundational memory concepts, and simple algorithms', highlight: false },
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
    id: 'microbounty',
    code: 'MOD_05 // MICROBOUNTY',
    title: 'MicroBounty Code Runner',
    tagline: 'Automated code execution and PR evaluation using Docker containers and task queues.',
    skills: [
      { name: 'Docker Execution', context: 'Running submitted code inside isolated containers with resource limits', highlight: true },
      { name: 'Queue Buffering', context: 'Buffering evaluation jobs through BullMQ and Redis queues', highlight: true },
      { name: 'Webhook Ingestion', context: 'Processing incoming GitHub webhook triggers for test verification', highlight: false },
      { name: 'Node.js & Express', context: 'Backend API service managing execution requests and job states', highlight: false },
    ]
  }
];

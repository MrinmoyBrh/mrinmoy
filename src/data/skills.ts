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
    id: 'queues-async',
    code: 'MOD_01 // ASYNC & QUEUES',
    title: 'Distributed Systems & Queues',
    tagline: 'Asynchronous task orchestration, backpressure management, and failover design.',
    skills: [
      { name: 'BullMQ', context: 'Job queues, worker concurrency, and exponential retry backoff', highlight: true },
      { name: 'Redis', context: 'State machines, sliding-window rate limiters, pub/sub, and prompt caching', highlight: true },
      { name: 'Circuit Breakers', context: 'Tracking failures across CLOSED, OPEN, and HALF_OPEN states in Redis', highlight: true },
      { name: 'Server-Sent Events', context: 'Pushing real-time job status directly to clients', highlight: false },
      { name: 'Rate Limiting', context: 'Sliding-window counters and rolling 24-hour token consumption limits', highlight: false },
    ]
  },
  {
    id: 'runtimes',
    code: 'MOD_02 // RUNTIMES',
    title: 'Backend Runtimes & Frameworks',
    tagline: 'Building services and APIs in Node.js, TypeScript, Python, and PHP.',
    skills: [
      { name: 'Node.js & TypeScript', context: 'Primary environment for writing asynchronous APIs and queue workers', highlight: true },
      { name: 'Fastify v5', context: 'Lightweight HTTP gateway routing with schema validation', highlight: true },
      { name: 'Express.js', context: 'REST routing, auth middleware, and webhook handlers', highlight: false },
      { name: 'Python 3', context: 'Image processing scripts, OpenCV routines, and Flask service backends', highlight: false },
      { name: 'Laravel 13 & PHP 8.4', context: 'Used at APGCL for portal logic, Fortify security, and Livewire components', highlight: false },
    ]
  },
  {
    id: 'databases',
    code: 'MOD_03 // PERSISTENCE',
    title: 'Databases & Storage',
    tagline: 'Relational schema design, normalization, and document stores.',
    skills: [
      { name: 'PostgreSQL', context: 'Relational table design, telemetry logging, and transaction tracking', highlight: true },
      { name: 'MySQL 8.0', context: '3NF normalization, foreign key cascades, and InnoDB indexing', highlight: true },
      { name: 'MongoDB Atlas', context: 'Document storage for sandboxed execution outputs and metadata', highlight: false },
      { name: 'Content-Addressed Storage', context: 'Deduplicating stored files using SHA-256 digests', highlight: false },
    ]
  },
  {
    id: 'security',
    code: 'MOD_04 // DEFENSE',
    title: 'Security & Sandboxing',
    tagline: 'Restricting untrusted code and securing authentication flows.',
    skills: [
      { name: 'Docker Sandboxing', context: 'Air-gapped execution with --network=none, memory caps, and non-root users', highlight: true },
      { name: 'WebAuthn / Passkeys', context: 'Hardware-backed biometric and passkey authentication at APGCL', highlight: true },
      { name: 'Two-Factor (TOTP)', context: 'Authenticator app challenges for administrative access', highlight: false },
      { name: 'Cryptographic Hashing', context: 'Deterministic SHA-256 cache keys and bcrypt password salting', highlight: false },
      { name: 'Webhook Idempotency', context: 'Redis key-locking to prevent duplicate event processing', highlight: false },
    ]
  },
  {
    id: 'vision-ai',
    code: 'MOD_05 // VISION & LLM',
    title: 'Computer Vision & AI Integration',
    tagline: 'Digital image analysis and resilient multi-model routing.',
    skills: [
      { name: 'Multi-Provider Failover', context: 'Routing to Groq with automatic fallback to Gemini upon errors', highlight: true },
      { name: 'OpenCV & NumPy', context: 'HSV/LAB color segmentation and bilateral noise filtering for leaf analysis', highlight: true },
      { name: 'Deep Learning Diagnostics', context: 'CNN image classification for crop disease identification', highlight: false },
      { name: 'Mathematical Morphology', context: 'Otsu thresholding and contour extraction to isolate lesions', highlight: false },
    ]
  }
];

export interface SkillCategory {
  title: string;
  tagline: string;
  skills: {
    name: string;
    context: string;
    primary?: boolean;
  }[];
}

export const skillCategories: SkillCategory[] = [
  {
    title: 'Distributed Systems & Queues',
    tagline: 'Asynchronous orchestration, fault tolerance, and high-throughput pipelines',
    skills: [
      { name: 'BullMQ', context: 'Asynchronous job queues, exponential backoff, worker pools', primary: true },
      { name: 'Redis', context: 'ioredis, distributed state machines, atomic ZSETs, Pub/Sub, SHA-256 caching', primary: true },
      { name: 'Circuit Breaker Pattern', context: 'CLOSED / OPEN / HALF_OPEN state machine implementation', primary: true },
      { name: 'Server-Sent Events (SSE)', context: 'Real-time asynchronous job streaming and push updates', primary: true },
      { name: 'Rate Limiting & Backpressure', context: 'Sliding-window counters, 24h rolling tenant token quotas', primary: true },
    ]
  },
  {
    title: 'Backend Runtimes & Frameworks',
    tagline: 'High-performance asynchronous servers and enterprise backends',
    skills: [
      { name: 'Node.js & TypeScript', context: 'Primary runtime for distributed microservices & gateways', primary: true },
      { name: 'Fastify v5', context: 'High-throughput low-overhead REST gateway architecture', primary: true },
      { name: 'Express.js', context: 'RESTful API routing, security middleware, webhook handlers' },
      { name: 'Python 3', context: 'Computer vision pipelines, Flask service layers, NumPy / OpenCV' },
      { name: 'Laravel 13 & PHP 8.4', context: 'Enterprise portal architecture, Fortify security, Livewire' },
    ]
  },
  {
    title: 'Databases & Data Modeling',
    tagline: 'Relational 3NF schemas, transactional integrity, and key-value stores',
    skills: [
      { name: 'PostgreSQL', context: 'Schema design, telemetry logging, relational audit trails', primary: true },
      { name: 'MySQL 8.0', context: '3NF normalization, InnoDB engine, foreign key cascades', primary: true },
      { name: 'MongoDB Atlas', context: 'Document storage, sandboxed execution logs, Mongoose ODM' },
      { name: 'Content-Addressable Storage', context: 'Cryptographic SHA-256 sharded file deduplication' },
    ]
  },
  {
    title: 'Security & Sandboxing',
    tagline: 'Zero-trust workload containment and defensive identity architecture',
    skills: [
      { name: 'Docker Sandboxing', context: 'Air-gapped execution (--network=none, memory/CPU caps)', primary: true },
      { name: 'FIDO2 / WebAuthn', context: 'Hardware passkey registration and authentication' },
      { name: 'Multi-Factor Auth (TOTP)', context: 'Time-based OTP challenge and email verification flows' },
      { name: 'Cryptographic Hashing', context: 'SHA-256 deterministic cache keys, bcrypt password salting' },
      { name: 'Idempotency Controls', context: 'Atomic Redis locks preventing duplicate webhook replay' },
    ]
  },
  {
    title: 'Computer Vision & AI Integration',
    tagline: 'Digital image processing and resilient multi-provider LLM failover',
    skills: [
      { name: 'Multi-Provider LLM Fallbacks', context: 'Primary (Groq) to secondary (Gemini) circuit failover', primary: true },
      { name: 'Digital Image Processing', context: 'Color space transformations (HSV/LAB), Otsu segmentation' },
      { name: 'OpenCV & NumPy', context: 'Foliar lesion extraction, spatial filters, matrix math' },
      { name: 'Deep Learning Diagnostics', context: 'Convolutional feature evaluation for pathological classification' },
    ]
  }
];

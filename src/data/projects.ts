export interface ProjectMetric {
  label: string;
  value: string;
  detail: string;
}

export interface ProjectArchitectureStep {
  step: string;
  name: string;
  description: string;
  technology: string;
}

export interface ProjectCaseStudy {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: 'Distributed Systems' | 'Enterprise Backend' | 'Computer Vision & AI';
  role: string;
  organization?: string;
  period: string;
  featured: boolean;
  githubUrl?: string;
  liveUrl?: string;
  badges: string[];
  summary: string;
  challenge: string;
  architectureNarrative: string;
  architectureSteps: ProjectArchitectureStep[];
  technicalHighlights: {
    title: string;
    description: string;
    codeSnippet?: string;
  }[];
  verifiedClaims: string[];
  stack: {
    runtime: string[];
    dataStores: string[];
    messaging: string[];
    protocols: string[];
    tooling: string[];
  };
}

export const projects: ProjectCaseStudy[] = [
  {
    id: 'ai-resilient-gateway',
    slug: 'ai-resilient-gateway',
    title: 'Adaptive AI Gateway & Resilient Workflow Engine',
    tagline: 'High-throughput Fastify API gateway with Redis-backed BullMQ task queueing, stateful multi-provider circuit breakers, and deterministic SHA-256 prompt caching.',
    category: 'Distributed Systems',
    role: 'Lead Backend Engineer',
    period: '2024',
    featured: true,
    githubUrl: 'https://github.com/MrinmoyBrh/ai-resilient-gateway',
    badges: ['Fastify', 'BullMQ', 'Redis', 'PostgreSQL', 'Circuit Breakers', 'TypeScript'],
    summary: 'An asynchronous, fault-tolerant AI orchestration gateway designed to shield upstream LLM providers from burst traffic, automate multi-provider failover, and eliminate redundant inference expenses through sub-5ms cryptographic caching.',
    challenge: 'Direct client-to-LLM connections suffer from three fatal flaws in production: upstream rate limiting (HTTP 429/503), unpredictable tail latencies exceeding several seconds, and runaway billing costs from identical repetitive queries. The system required guaranteed asynchronous delivery, zero-cost cache hits, and instant failover without human intervention.',
    architectureNarrative: 'The gateway decouples ingestion from compute using Fastify and BullMQ. Inbound requests pass through a 24-hour sliding token quota check before querying a Redis SHA-256 cache. Upon a cache hit, the gateway responds instantaneously (<5ms). On cache misses, the request is recorded in PostgreSQL and dispatched to a BullMQ worker queue with exponential backoff. A stateful Redis circuit breaker monitors upstream health across Groq and Gemini, executing immediate failovers if error thresholds are reached.',
    architectureSteps: [
      {
        step: '01',
        name: 'Ingress & Quota Gate',
        description: 'Validates payload schemas with Zod and enforces rolling 24-hour tenant token consumption boundaries.',
        technology: 'Fastify + PostgreSQL'
      },
      {
        step: '02',
        name: 'Deterministic Prompt Caching',
        description: 'Normalizes prompt whitespace and case; computes SHA-256 hash to query Redis cache with 1-hour TTL.',
        technology: 'Node.js Crypto + Redis'
      },
      {
        step: '03',
        name: 'Asynchronous Task Ingestion',
        description: 'Initializes a pending job row in PostgreSQL and buffers the inference payload into an isolated BullMQ queue.',
        technology: 'BullMQ + Redis Streams'
      },
      {
        step: '04',
        name: 'Circuit-Breaker Orchestrator',
        description: 'Queries Redis state machine (CLOSED, OPEN, HALF_OPEN). Routes to primary provider (Groq Llama 3.3 70B) or falls back to Gemini.',
        technology: 'Custom Redis State Machine'
      },
      {
        step: '05',
        name: 'Telemetry & Event Dispatch',
        description: 'Records token expenditure and latency metrics into usage_logs; broadcasts completion events over Redis Pub/Sub & SSE.',
        technology: 'PostgreSQL + Redis Pub/Sub'
      }
    ],
    technicalHighlights: [
      {
        title: 'Redis Stateful Circuit Breaker Pattern',
        description: 'Maintains state machine in Redis with failure counting and cooldown timestamps. When failures exceed 3, circuit trips to OPEN, fast-failing traffic directly to fallback providers without waiting for network timeouts.',
        codeSnippet: `// Redis-backed Circuit Breaker state query
async getState(): Promise<CircuitState> {
  const state = await redisConnection.get(this.getKey('state'));
  if (!state || state === 'CLOSED') return 'CLOSED';
  if (state === 'OPEN') {
    const openedAt = Number(await redisConnection.get(this.getKey('opened_at'))) || 0;
    if (Date.now() - openedAt > this.cooldownPeriodMs) {
      await redisConnection.set(this.getKey('state'), 'HALF_OPEN');
      return 'HALF_OPEN';
    }
    return 'OPEN';
  }
  return 'HALF_OPEN';
}`
      },
      {
        title: 'Sub-5ms SHA-256 Cache Resolution',
        description: 'Prevents redundant billing costs by computing a deterministic cryptographic hash over normalized prompt text, serving cached responses instantly.',
        codeSnippet: `static getCacheKey(prompt: string): string {
  const normalized = prompt.trim().toLowerCase();
  const hash = crypto.createHash('sha256').update(normalized).digest('hex');
  return \`cache:prompt:\${hash}\`;
}`
      },
      {
        title: 'Asynchronous Backpressure & Retry Orchestration',
        description: 'Decouples client timeouts from variable LLM response times using BullMQ with exponential backoff and concurrency control.',
        codeSnippet: `await aiQueue.add('triage-job', payload, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: true,
  removeOnFail: false,
});`
      }
    ],
    verifiedClaims: [
      'Verified: Fastify 5 HTTP server with custom job submission and analytics routes',
      'Verified: Redis-backed BullMQ queue with concurrency: 5 and exponential backoff retry policies',
      'Verified: Deterministic SHA-256 prompt caching in Redis with 3600-second TTL',
      'Verified: Multi-state Circuit Breaker (CLOSED / OPEN / HALF_OPEN) stored in Redis',
      'Verified: Multi-tier LLM failover architecture (Groq primary -> Gemini secondary)',
      'Verified: 24-hour rolling token quota validation per tenant in PostgreSQL telemetry'
    ],
    stack: {
      runtime: ['Node.js', 'TypeScript', 'Fastify v5'],
      dataStores: ['PostgreSQL', 'Redis (ioredis)'],
      messaging: ['BullMQ', 'Redis Pub/Sub', 'Server-Sent Events (SSE)'],
      protocols: ['HTTP/2', 'REST', 'SSE'],
      tooling: ['Docker', 'Zod', 'TSX']
    }
  },
  {
    id: 'apgcl-app',
    slug: 'apgcl-app',
    title: 'APGCL Web Application & Administrative Dashboard',
    tagline: 'Enterprise public utility operations portal with multi-factor authentication, passkey support, and transactional notification workflows.',
    category: 'Enterprise Backend',
    role: 'Software Engineering Intern',
    organization: 'Assam Power Generation Corporation Limited (APGCL)',
    period: '2024',
    featured: true,
    badges: ['Laravel 13', 'PHP 8.4', 'Livewire 4', 'Fortify', 'WebAuthn', 'MySQL'],
    summary: 'A secure, high-integrity operations portal and document administration system engineered for Assam Power Generation Corporation Limited, providing hardened authentication and centralized regulatory distribution.',
    challenge: 'State-owned power generation infrastructure requires absolute integrity, rigorous role-based access control, strict compliance with statutory disclosure mandates, and zero-trust administrative authentication to defend critical utility data.',
    architectureNarrative: 'Built on PHP 8.4 and Laravel 13, the platform implements Laravel Fortify for security foundations. Administrative users authenticate with multi-factor challenge protocols (TOTP) and hardware-backed WebAuthn / Passkeys. The architecture incorporates an automated transactional email verification engine and a structured document distribution subsystem handling regulatory tariffs, Right to Information (RTI) records, annual statements, and executive policies.',
    architectureSteps: [
      {
        step: '01',
        name: 'Passkey & 2FA Gate',
        description: 'Implements WebAuthn passkey registration and TOTP two-factor challenge before granting administrative clearance.',
        technology: 'Laravel Fortify + WebAuthn'
      },
      {
        step: '02',
        name: 'Administrative Control Center',
        description: 'Livewire and Flux UI dynamic interfaces allowing authenticated operators to manage utility directives with zero full-page reloads.',
        technology: 'Livewire 4 + Flux UI'
      },
      {
        step: '03',
        name: 'Transactional Email Engine',
        description: 'Dispatches authenticated verification emails, password recovery events, and administrative security alerts.',
        technology: 'Laravel Mail Pipeline'
      },
      {
        step: '04',
        name: 'Statutory Document Subsystem',
        description: 'Compartmentalized archival system serving regulatory tariffs, RTI disclosures, acts, and annual financial returns.',
        technology: 'MySQL + Storage Engine'
      }
    ],
    technicalHighlights: [
      {
        title: 'Multi-Factor & WebAuthn Passkey Security',
        description: 'Engineered hardware-backed FIDO2 / WebAuthn passkey verification alongside time-based one-time password (TOTP) two-factor challenges to ensure zero-trust access control.',
        codeSnippet: `// Fortify Two-Factor Challenge & Passkey verification
Route::middleware(['auth', 'verified'])->group(function () {
    Route::view('dashboard', 'dashboard')->name('dashboard');
});`
      },
      {
        title: 'Statutory Public Document Routing Subsystem',
        description: 'Cleanly scoped prefix routing architecture organizing legislative mandates, electricity tariff filings, and RTI disclosures.',
        codeSnippet: `Route::prefix('documents')->name('documents.')->group(function () {
    Route::view('acts-policies', 'pages.documents.acts-policies')->name('acts-policies');
    Route::view('certificates', 'pages.documents.certificates')->name('certificates');
    Route::view('tariff', 'pages.documents.tariff')->name('tariff');
    Route::view('rti', 'pages.documents.rti')->name('rti');
    Route::view('annual-statement', 'pages.documents.annual-statement')->name('annual-statement');
});`
      }
    ],
    verifiedClaims: [
      'Verified: Production codebase configured with Laravel 13 and PHP 8.4 runtime',
      'Verified: Full administrative dashboard with Livewire and Flux UI component architecture',
      'Verified: Transactional email verification and security alerts via Laravel Fortify',
      'Verified: Passkey / WebAuthn registration and TOTP two-factor challenge implementation',
      'Verified: Scoped statutory document subsystem for tariffs, RTI, acts, and annual statements'
    ],
    stack: {
      runtime: ['PHP 8.4', 'Laravel 13'],
      dataStores: ['MySQL (InnoDB)'],
      messaging: ['Laravel Queue Workers', 'SMTP / Mail Engine'],
      protocols: ['HTTPS', 'FIDO2 / WebAuthn', 'TOTP'],
      tooling: ['Laravel Fortify', 'Livewire 4', 'Flux UI', 'Tailwind CSS']
    }
  },
  {
    id: 'crop-disease-detection',
    slug: 'crop-disease-detection',
    title: 'Crop Disease Detection Using Image Processing',
    tagline: 'Pathological computer vision pipeline for automated foliar lesion diagnosis and early agricultural risk mitigation.',
    category: 'Computer Vision & AI',
    role: 'Lead Researcher & CV Engineer',
    organization: 'Associated with National Institute of Technology Silchar (NIT Silchar)',
    period: 'Academic Research',
    featured: true,
    badges: ['Computer Vision', 'OpenCV', 'TensorFlow', 'Deep Learning', 'Image Processing'],
    summary: 'An academic research and machine learning initiative associated with NIT Silchar, engineering a digital image processing pipeline to autonomously recognize, isolate, and classify foliage diseases across staple agricultural crops.',
    challenge: 'Agricultural producers suffer substantial crop loss due to delayed detection of foliar pathologies such as blight, rust, and chlorosis. Traditional diagnosis requires trained agronomists in the field, leading to severe intervention delays in rural communities.',
    architectureNarrative: 'The system ingests leaf photographs captured in diverse environmental lighting conditions. A digital image processing pipeline applies adaptive histogram equalization, bilateral noise filtering, and color space transformations (RGB to HSV/LAB) to isolate pathological regions from background foliage. Extracted features are processed through a trained convolutional neural network classifier that generates diagnostic disease classifications with associated confidence scores.',
    architectureSteps: [
      {
        step: '01',
        name: 'Digital Image Acquisition & Filtering',
        description: 'Applies bilateral smoothing to preserve lesion edges while removing environmental speckle noise.',
        technology: 'OpenCV + NumPy'
      },
      {
        step: '02',
        name: 'Color Space Transformation',
        description: 'Converts RGB leaf images to HSV and LAB color spaces to segment chlorotic patches and necrotic tissue from healthy chlorophyll.',
        technology: 'Digital Image Processing'
      },
      {
        step: '03',
        name: 'Morphological Segmentation',
        description: 'Executes Otsu thresholding and contour extraction to delineate the exact boundaries of infection areas.',
        technology: 'Mathematical Morphology'
      },
      {
        step: '04',
        name: 'Convolutional Deep Classification',
        description: 'Feeds segmented regions into a trained deep network to distinguish between fungal, bacterial, and viral pathologies.',
        technology: 'TensorFlow / PyTorch'
      }
    ],
    technicalHighlights: [
      {
        title: 'Multi-Stage Chromatic Segmentation Pipeline',
        description: 'Isolates foliar degradation by transforming raw camera captures into color spaces where luminescence is decoupled from chromaticity, eliminating shadows and false positives.',
        codeSnippet: `# Chromatic leaf segmentation in HSV space
hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
lower_green = np.array([25, 40, 40])
upper_green = np.array([85, 255, 255])
mask = cv2.inRange(hsv, lower_green, upper_green)
lesion_mask = cv2.bitwise_not(mask)`
      },
      {
        title: 'Feature Extraction & Pathological Diagnostics',
        description: 'Extracts spatial texture and color variance metrics alongside deep convolutional representations to achieve robust classification despite field variance.',
        codeSnippet: `# Quantitative lesion area ratio calculation
total_leaf_pixels = np.count_nonzero(leaf_contour)
infected_pixels = np.count_nonzero(lesion_mask)
infection_ratio = infected_pixels / max(1, total_leaf_pixels)`
      }
    ],
    verifiedClaims: [
      'Verified: Academic research project conducted in association with NIT Silchar',
      'Verified: Focus on digital image processing, color space transformations, and lesion segmentation',
      'Verified: Automated classification pipeline addressing rural agricultural pathology diagnostics'
    ],
    stack: {
      runtime: ['Python 3'],
      dataStores: ['Dataset Repositories'],
      messaging: [],
      protocols: ['REST API Inference'],
      tooling: ['OpenCV', 'TensorFlow', 'NumPy', 'Matplotlib']
    }
  },
  {
    id: 'microbounty',
    slug: 'microbounty',
    title: 'MicroBounty — Sandboxed Code Evaluation & PR Verifier Engine',
    tagline: 'Asynchronous distributed code execution engine running untrusted programs in ephemeral, resource-capped Docker sandboxes with Redis BullMQ backpressure.',
    category: 'Distributed Systems',
    role: 'Backend Architect',
    period: '2024',
    featured: false,
    badges: ['Node.js', 'Docker API', 'BullMQ', 'Redis', 'MongoDB Atlas'],
    summary: 'A resilient code evaluation platform that ingests untrusted code submissions and GitHub pull requests, isolating execution inside disposable Docker containers with zero network access and strict CPU/memory caps.',
    challenge: 'Executing untrusted arbitrary code submitted by external users introduces catastrophic host compromise risks: fork bombs, crypto miners, and remote socket connections.',
    architectureNarrative: 'MicroBounty mitigates these threats through multi-layered defense. An Express API gateway buffers submissions into Redis BullMQ queues with sliding-window rate limiting. Dedicated worker processes spawn ephemeral Docker containers with --network=none, 128MB RAM limits, 0.5 core CPU constraints, and 5-second hard timeouts, preventing escape.',
    architectureSteps: [
      {
        step: '01',
        name: 'Webhook Ingestion & Idempotency',
        description: 'Locks GitHub delivery IDs in Redis with 10-minute TTL to prevent duplicate test runs from webhooks.',
        technology: 'Redis Key Locks'
      },
      {
        step: '02',
        name: 'Asynchronous Backpressure',
        description: 'Buffers submissions into BullMQ to decouple compute execution from incoming web traffic spikes.',
        technology: 'BullMQ + Redis'
      },
      {
        step: '03',
        name: 'Air-Gapped Container Sandbox',
        description: 'Spawns temporary Docker container with NetworkDisabled=true, Memory=128MB, and non-root execution.',
        technology: 'Docker Engine API'
      }
    ],
    technicalHighlights: [
      {
        title: 'Air-Gapped Disposable Container Isolation',
        description: 'Guarantees execution safety by stripping networking and capping memory.',
        codeSnippet: `// Ephemeral container configuration
const container = await docker.createContainer({
  Image: 'sandbox-runner:node',
  NetworkDisabled: true,
  HostConfig: {
    Memory: 128 * 1024 * 1024, // 128MB hard cap
    NanoCPUs: 500000000,        // 0.5 CPU cores
    AutoRemove: true
  }
});`
      }
    ],
    verifiedClaims: [
      'Verified: Full working repository in local development environment',
      'Verified: BullMQ and Redis backpressure decoupled from compute workers',
      'Verified: Strict Docker container sandboxing with NetworkDisabled and memory limits'
    ],
    stack: {
      runtime: ['Node.js', 'Express'],
      dataStores: ['MongoDB Atlas', 'Redis'],
      messaging: ['BullMQ'],
      protocols: ['GitHub Webhooks', 'Docker Engine API'],
      tooling: ['Docker Multi-stage Builds']
    }
  },
  {
    id: 'securevault',
    slug: 'securevault',
    title: 'SecureVault — Role-Based Document Management & File Storage Engine',
    tagline: 'Self-hosted Python storage engine with 3NF relational schema, SHA-256 data integrity verification, and content-addressable deduplication.',
    category: 'Enterprise Backend',
    role: 'Backend Architect',
    period: '2024',
    featured: false,
    badges: ['Python', 'Flask', 'MySQL 3NF', 'Docker', 'Cryptography'],
    summary: 'An enterprise-grade document management and storage engine built on clean layered architecture (Presentation, Middleware, Service Layer, Repository Pattern) with zero cloud lock-in.',
    challenge: 'Enterprise document workflows often leak data through unvalidated direct file paths, cloud vendor lock-in, and lack of verifiable content integrity over time.',
    architectureNarrative: 'SecureVault solves this through cryptographic content-addressable storage. Files are streamed through SHA-256 hashers to deduplicate identical payloads automatically on disk. A 3NF normalized MySQL database maintains relational access boundaries, storage quotas, and an append-only audit trail.',
    architectureSteps: [
      {
        step: '01',
        name: 'Streaming File Ingestion',
        description: 'Streams chunks into memory while simultaneously generating cryptographic SHA-256 digests.',
        technology: 'Python Stream IO'
      },
      {
        step: '02',
        name: 'Content-Addressable Deduplication',
        description: 'Stores file payloads keyed by their hash, eliminating duplicate storage consumption.',
        technology: 'Sharded Disk Store'
      },
      {
        step: '03',
        name: 'Immutable Audit Trail',
        description: 'Logs all file access, sharing, and modifications in normalized relational audit tables.',
        technology: 'MySQL 8.0 (InnoDB)'
      }
    ],
    technicalHighlights: [
      {
        title: 'Cryptographic Content-Addressable Storage',
        description: 'Generates SHA-256 digests during streaming upload to ensure end-to-end data integrity.',
        codeSnippet: `def compute_file_hash(stream):
    hasher = hashlib.sha256()
    while chunk := stream.read(65536):
        hasher.update(chunk)
    stream.seek(0)
    return hasher.hexdigest()`
      }
    ],
    verifiedClaims: [
      'Verified: Complete local codebase with layered Flask architecture',
      'Verified: 3NF normalized MySQL database schema with foreign key constraints',
      'Verified: Content-addressable storage deduplication and cryptographic verification'
    ],
    stack: {
      runtime: ['Python 3', 'Flask', 'Gunicorn'],
      dataStores: ['MySQL 8.0 (3NF InnoDB)', 'Isolated File Store'],
      messaging: [],
      protocols: ['HTTP/1.1', 'WSGI'],
      tooling: ['Docker Compose', 'Pytest']
    }
  }
];

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
    tagline: 'Fastify API gateway with BullMQ task queues, stateful Redis circuit breakers, and deterministic SHA-256 prompt caching.',
    category: 'Distributed Systems',
    role: 'Lead Backend Engineer',
    period: '2024',
    featured: true,
    githubUrl: 'https://github.com/MrinmoyBrh/ai-resilient-gateway',
    badges: ['Fastify', 'BullMQ', 'Redis', 'PostgreSQL', 'Circuit Breakers', 'TypeScript'],
    summary: 'A custom API gateway built to keep AI features reliable when upstream providers lag or fail. It queues inference requests in BullMQ, serves identical prompts instantly from a Redis SHA-256 cache in under 5ms, and trips a circuit breaker to switch from Groq to Gemini if errors spike.',
    challenge: 'Direct connections to external AI APIs fail easily in production: sudden rate limits cause HTTP 429 errors, responses occasionally take several seconds, and repetitive queries inflate API bills. I needed an asynchronous gateway that guarantees request delivery, caches answers instantly, and fails over cleanly without manual intervention.',
    architectureNarrative: 'The gateway decouples incoming HTTP requests from AI compute using Fastify and BullMQ. Inbound requests first check tenant quotas, then query a Redis SHA-256 cache. If there is a cache hit, the gateway answers in under 5ms. On a cache miss, the task is saved in PostgreSQL and queued in BullMQ. A Redis circuit breaker monitors provider status, failing over from Groq (Llama 3.3 70B) to Gemini (1.5 Flash) when failure thresholds are crossed.',
    architectureSteps: [
      {
        step: '01',
        name: 'Ingress & Quotas',
        description: 'Validates request bodies with Zod and checks rolling 24-hour token usage per tenant.',
        technology: 'Fastify + PostgreSQL'
      },
      {
        step: '02',
        name: 'Deterministic Cache',
        description: 'Normalizes prompt casing and whitespace, hashes with SHA-256, and queries Redis (<5ms response).',
        technology: 'Node.js Crypto + Redis'
      },
      {
        step: '03',
        name: 'Task Ingestion',
        description: 'Creates a pending job record in PostgreSQL and enqueues the payload into BullMQ with retry backoff.',
        technology: 'BullMQ + Redis Streams'
      },
      {
        step: '04',
        name: 'Circuit Failover',
        description: 'Checks provider state (CLOSED, OPEN, HALF_OPEN) in Redis. Routes to Groq primary or switches to Gemini.',
        technology: 'Redis State Machine'
      },
      {
        step: '05',
        name: 'Telemetry & Events',
        description: 'Logs token usage and latency into PostgreSQL; pushes completion events over Redis Pub/Sub & SSE.',
        technology: 'PostgreSQL + Redis Pub/Sub'
      }
    ],
    technicalHighlights: [
      {
        title: 'Redis Stateful Circuit Breaker',
        description: 'Tracks consecutive upstream errors in Redis. After 3 failures, the circuit trips to OPEN and immediately redirects requests to Gemini without waiting on stalled network connections.',
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
        title: 'Sub-5ms SHA-256 Prompt Caching',
        description: 'Eliminates repetitive inference expenses by computing a deterministic cryptographic hash of the prompt and returning stored results from memory.',
        codeSnippet: `static getCacheKey(prompt: string): string {
  const normalized = prompt.trim().toLowerCase();
  const hash = crypto.createHash('sha256').update(normalized).digest('hex');
  return \`cache:prompt:\${hash}\`;
}`
      },
      {
        title: 'Asynchronous Task Queueing',
        description: 'Buffers spikes in client traffic using BullMQ, decoupling client timeout limits from upstream model processing times.',
        codeSnippet: `await aiQueue.add('triage-job', payload, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: true,
  removeOnFail: false,
});`
      }
    ],
    verifiedClaims: [
      'Fastify 5 server with dedicated /jobs and /analytics routes',
      'BullMQ queue running with 5 concurrent workers and exponential backoff retry',
      'Deterministic SHA-256 prompt caching in Redis with 1-hour expiration',
      'Three-state circuit breaker (CLOSED / OPEN / HALF_OPEN) stored in Redis',
      'Automated failover between Groq (Llama 3.3 70B) and Gemini (1.5 Flash)',
      '24-hour rolling token consumption tracking per tenant in PostgreSQL'
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
    tagline: 'Operations portal developed during my internship at Assam Power Generation Corporation Limited.',
    category: 'Enterprise Backend',
    role: 'Software Engineering Intern',
    organization: 'Assam Power Generation Corporation Limited (APGCL)',
    period: '2026',
    featured: true,
    badges: ['Laravel', 'PHP', 'Livewire', 'MySQL', 'Admin Dashboard'],
    summary: 'An internal web application and administrative portal for Assam Power Generation Corporation Ltd. Features secure user authentication, an administrative dashboard, transactional email notifications, and structured archiving for official state electricity filings.',
    challenge: 'State power utility operations need dependable access control, administrative dashboards for daily tasks, and organized public disclosure workflows for regulatory filings and notices.',
    architectureNarrative: 'Built with PHP and Laravel. Administrative workflows are managed through an interactive dashboard with Livewire components. The platform features an automated email verification pipeline and organizes regulatory documents, electricity tariffs, Right to Information (RTI) records, and annual filings into clean scoped routes.',
    architectureSteps: [
      {
        step: '01',
        name: 'User Authentication Gate',
        description: 'Implements user authentication, login workflows, and session management for administrative access.',
        technology: 'Laravel Auth'
      },
      {
        step: '02',
        name: 'Admin Dashboard',
        description: 'Interactive Livewire interfaces for managing utility updates, viewing notifications, and handling administrative tasks.',
        technology: 'Livewire + Blade'
      },
      {
        step: '03',
        name: 'Email Notifications',
        description: 'Dispatches authenticated account verification emails and administrative alert notifications.',
        technology: 'Laravel Mail Pipeline'
      },
      {
        step: '04',
        name: 'Document Archiving',
        description: 'Organized archival subsystem for regulatory tariffs, RTI disclosures, and annual financial statements.',
        technology: 'MySQL + Storage'
      }
    ],
    technicalHighlights: [
      {
        title: 'Authentication & Session Security',
        description: 'Integrated secure authentication middleware and session protection to safeguard administrative access.',
        codeSnippet: `// Authenticated administrative routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::view('dashboard', 'dashboard')->name('dashboard');
});`
      },
      {
        title: 'Statutory Document Routing',
        description: 'Clean prefix routing architecture to manage public electricity tariffs, RTI disclosures, and state policy documents.',
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
      'Built with PHP and Laravel framework',
      'Administrative dashboard with dynamic Livewire components',
      'Transactional email verification and notifications',
      'Secure administrative authentication and password management',
      'Scoped document management system for electricity tariffs, RTI, and policies'
    ],
    stack: {
      runtime: ['PHP', 'Laravel'],
      dataStores: ['MySQL'],
      messaging: ['Mail Notifications'],
      protocols: ['HTTPS', 'REST'],
      tooling: ['Livewire', 'Tailwind CSS', 'Blade']
    }
  },
  {
    id: 'crop-disease-detection',
    slug: 'crop-disease-detection',
    title: 'Crop Disease Detection Using Image Processing',
    tagline: 'Computer vision and deep learning pipeline for plant leaf disease diagnosis, associated with NIT Silchar.',
    category: 'Computer Vision & AI',
    role: 'Lead Researcher & CV Engineer',
    organization: 'Associated with National Institute of Technology Silchar (NIT Silchar)',
    period: 'Academic Research',
    featured: false,
    badges: ['Computer Vision', 'OpenCV', 'TensorFlow', 'Deep Learning', 'Image Processing'],
    summary: 'An academic research project associated with NIT Silchar that detects and classifies plant leaf diseases from camera captures. It isolates diseased foliage using HSV and LAB color spaces and classifies pathologies using a convolutional neural network.',
    challenge: 'Delayed detection of crop diseases like rust and chlorosis leads to severe agricultural loss in smallholder farms. Diagnosing infections traditionally requires field agronomists, causing critical delays in intervention.',
    architectureNarrative: 'The pipeline takes leaf photographs captured under changing outdoor lighting conditions. OpenCV applies bilateral smoothing to remove speckle noise while preserving lesion edges, then converts RGB images into HSV and LAB color spaces to isolate damaged tissue from healthy green chlorophyll. Extracted contours are classified by a convolutional neural network to identify specific infections.',
    architectureSteps: [
      {
        step: '01',
        name: 'Image Preprocessing',
        description: 'Applies bilateral filtering to smooth background noise while keeping lesion contours sharp.',
        technology: 'OpenCV + NumPy'
      },
      {
        step: '02',
        name: 'Color Space Transformation',
        description: 'Converts leaf images to HSV and LAB color spaces to isolate chlorotic and necrotic tissue.',
        technology: 'Digital Image Processing'
      },
      {
        step: '03',
        name: 'Lesion Segmentation',
        description: 'Uses Otsu thresholding and contour detection to compute the exact boundaries of infected areas.',
        technology: 'Mathematical Morphology'
      },
      {
        step: '04',
        name: 'Neural Classification',
        description: 'Feeds segmented regions into a trained convolutional network to diagnose fungal and bacterial diseases.',
        technology: 'TensorFlow / PyTorch'
      }
    ],
    technicalHighlights: [
      {
        title: 'Chromatic Leaf Segmentation in HSV Space',
        description: 'Decouples color information from light intensity by converting RGB images to HSV space, eliminating shadows and false positives.',
        codeSnippet: `# Chromatic leaf segmentation in HSV space
hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
lower_green = np.array([25, 40, 40])
upper_green = np.array([85, 255, 255])
mask = cv2.inRange(hsv, lower_green, upper_green)
lesion_mask = cv2.bitwise_not(mask)`
      },
      {
        title: 'Quantitative Lesion Area Ratio',
        description: 'Calculates the proportion of damaged leaf tissue against total leaf area to assist severity scoring.',
        codeSnippet: `# Quantitative lesion area ratio calculation
total_leaf_pixels = np.count_nonzero(leaf_contour)
infected_pixels = np.count_nonzero(lesion_mask)
infection_ratio = infected_pixels / max(1, total_leaf_pixels)`
      }
    ],
    verifiedClaims: [
      'Academic research project associated with NIT Silchar',
      'OpenCV image processing with HSV/LAB color transformations and morphological filtering',
      'Automated deep learning classification for early crop disease intervention'
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
    tagline: 'Asynchronous code runner that executes submitted programs in isolated Docker containers.',
    category: 'Distributed Systems',
    role: 'Backend Developer',
    period: '2024',
    featured: true,
    badges: ['Node.js', 'Express', 'Docker', 'BullMQ', 'Redis'],
    summary: 'A code evaluation runner that tests code submissions and pull requests inside isolated Docker containers. Applies resource limits (128MB RAM, 0.5 CPU) and buffers evaluation tasks through BullMQ and Redis queues to maintain a reliable, responsive execution service.',
    challenge: 'Executing submitted code creates resource contention risks like infinite loops and high memory consumption that can degrade host server availability.',
    architectureNarrative: 'An Express gateway buffers incoming evaluation requests into BullMQ queues. Dedicated worker processes spawn temporary Docker containers with memory limits capped at 128MB, CPU throttled, and a strict timeout before returning execution logs and results.',
    architectureSteps: [
      {
        step: '01',
        name: 'Webhook Ingestion',
        description: 'Receives code evaluation triggers from GitHub webhooks or direct API submissions.',
        technology: 'Express + Webhooks'
      },
      {
        step: '02',
        name: 'Queue Buffering',
        description: 'Buffers submissions into BullMQ to prevent sudden bursts of jobs from overwhelming memory.',
        technology: 'BullMQ + Redis'
      },
      {
        step: '03',
        name: 'Isolated Container Execution',
        description: 'Spawns an ephemeral Docker container with memory caps (128MB) and CPU ceilings.',
        technology: 'Docker Engine API'
      }
    ],
    technicalHighlights: [
      {
        title: 'Resource-Constrained Docker Containers',
        description: 'Enforces execution safety by applying strict memory and CPU caps on test runners.',
        codeSnippet: `// Ephemeral container configuration
const container = await docker.createContainer({
  Image: 'sandbox-runner:node',
  HostConfig: {
    Memory: 128 * 1024 * 1024, // 128MB hard cap
    NanoCPUs: 500000000,        // 0.5 CPU cores
    AutoRemove: true
  }
});`
      }
    ],
    verifiedClaims: [
      'Backend service built with Express, BullMQ, and Docker',
      'Asynchronous task buffering via BullMQ and Redis',
      'Isolated Docker container execution with memory and CPU resource caps'
    ],
    stack: {
      runtime: ['Node.js', 'Express'],
      dataStores: ['MongoDB Atlas', 'Redis'],
      messaging: ['BullMQ'],
      protocols: ['GitHub Webhooks', 'Docker Engine API'],
      tooling: ['Docker']
    }
  },
  {
    id: 'securevault',
    slug: 'securevault',
    title: 'SecureVault — Role-Based Document Management & File Storage Engine',
    tagline: 'Self-hosted Python storage engine with a 3NF normalized MySQL database and SHA-256 deduplication.',
    category: 'Enterprise Backend',
    role: 'Backend Architect',
    period: '2024',
    featured: false,
    badges: ['Python', 'Flask', 'MySQL 3NF', 'Docker', 'Cryptography'],
    summary: 'A self-hosted storage backend built with Python, Flask, and a normalized MySQL database. Streams file uploads through cryptographic SHA-256 hashing to deduplicate identical files on disk, keeping storage lean without relying on commercial cloud buckets.',
    challenge: 'File storage systems frequently store duplicate copies of the same files and lack cryptographic verification to prove that stored files have not been modified or corrupted.',
    architectureNarrative: 'Files stream through SHA-256 hashers during upload to automatically detect identical files and share storage on disk. A 3NF normalized MySQL database manages access boundaries, storage quotas, and an append-only audit trail.',
    architectureSteps: [
      {
        step: '01',
        name: 'Streaming Ingestion',
        description: 'Reads incoming file chunks and calculates a cryptographic SHA-256 digest in real time.',
        technology: 'Python Stream IO'
      },
      {
        step: '02',
        name: 'Content Deduplication',
        description: 'Stores files indexed by their hash, saving disk space when identical files are uploaded.',
        technology: 'Sharded Disk Store'
      },
      {
        step: '03',
        name: 'Relational Audit Log',
        description: 'Records file uploads, downloads, and link access in normalized MySQL audit tables.',
        technology: 'MySQL 8.0 (InnoDB)'
      }
    ],
    technicalHighlights: [
      {
        title: 'Cryptographic Content-Addressable Storage',
        description: 'Computes SHA-256 digests on streaming uploads to verify integrity and prevent duplicate files on disk.',
        codeSnippet: `def compute_file_hash(stream):
    hasher = hashlib.sha256()
    while chunk := stream.read(65536):
        hasher.update(chunk)
    stream.seek(0)
    return hasher.hexdigest()`
      }
    ],
    verifiedClaims: [
      'Layered Flask architecture with repository and service layers',
      'Normalized 3NF MySQL schema with foreign keys and index optimization',
      'Content-addressable file deduplication using streaming SHA-256 hashes'
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

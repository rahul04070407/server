export interface ScalabilityTopic {
  id: string;
  badge: string;
  badgeColor: 'teal' | 'gold' | 'coral' | 'sky';
  title: string;
  headline: string;
  explanation: string;
  analogy?: {
    title: string;
    description: string;
  };
  concepts: {
    name: string;
    description: string;
    pros: string[];
    cons: string[];
  }[];
  architectureDiagram?: string;
  practicalCodeSnippet?: {
    title: string;
    code: string;
    notes: string;
  };
  keyTakeaways: string[];
}

export const SCALABILITY_DATA: ScalabilityTopic[] = [
  {
    id: 'scale-up-vs-scale-out',
    badge: 'Scale 1',
    badgeColor: 'teal',
    title: 'Scale Up (Vertical) vs Scale Out (Horizontal)',
    headline: 'When traffic grows from 1,000 visitors to 1,000,000 visitors, how do you handle the surge?',
    explanation: 'There are only two ways to add computing power: make your single server bigger (Scale Up), or add more servers and run them together as a team (Scale Out).',
    analogy: {
      title: '🚚 Analogy: Monster Truck vs Fleet of Moving Vans',
      description: 'You need to deliver furniture for a growing city. Scale Up means buying a gigantic monster truck with a bigger engine (expensive, and if it blows a tire, all deliveries stop). Scale Out means hiring a fleet of 10 standard vans: if one van gets a flat tire, the other 9 vans keep delivering without stopping!'
    },
    concepts: [
      {
        name: 'Scale Up (Vertical Scaling)',
        description: 'Upgrading the existing machine by adding more CPU cores, RAM, or faster NVMe SSDs (e.g. going from 4 cores / 16GB RAM to 32 cores / 128GB RAM).',
        pros: ['Dead simple: zero architectural changes needed', 'No network latency between multiple servers', 'Software works as-is without clustering'],
        cons: ['Hard hardware ceiling (you cannot buy an infinite CPU)', 'Single Point of Failure: if the motherboard dies, the whole website dies', 'Extremely expensive at the high end']
      },
      {
        name: 'Scale Out (Horizontal Scaling)',
        description: 'Adding multiple identical smaller servers behind a Load Balancer that spreads visitors across them evenly.',
        pros: ['Virtually infinite ceiling: add 10, 50, or 200 servers as traffic spikes', 'High Availability: if Server 2 crashes, Servers 1, 3, and 4 keep serving users', 'Cheaper standard commodity hardware or cloud instances'],
        cons: ['Requires stateless app design (sessions stored in Redis, not in server memory)', 'More complex deployment and log aggregation', 'Requires a Load Balancer']
      }
    ],
    architectureDiagram: `               [ 1,000,000 Web Visitors ]
                           |
                           v
               +-----------------------+
               |     Load Balancer     | (e.g. Nginx / AWS ALB)
               +-----------------------+
                 /         |         \\
                /          |          \\
               v           v           v
         +-----------+ +-----------+ +-----------+
         | Web App 1 | | Web App 2 | | Web App 3 |
         +-----------+ +-----------+ +-----------+
                \\          |          /
                 \\         |         /
                  v        v        v
               +-----------------------+
               | Redis In-Memory Cache |
               +-----------------------+
                           |
                           v
               +-----------------------+
               |   Database Cluster    |
               +-----------------------+`,
    keyTakeaways: [
      'Stateless Apps are mandatory for scaling out: Never store user logins in local file memory; store sessions in a central Redis cache.',
      'Start with Vertical Scaling (Scale Up) until your single server costs too much or requires high availability, then transition to Horizontal Scaling.'
    ]
  },
  {
    id: 'load-balancers-and-caching',
    badge: 'Scale 2',
    badgeColor: 'gold',
    title: 'Load Balancers & In-Memory Caching (Redis)',
    headline: 'How companies distribute traffic evenly and reduce database query load by 90%.',
    explanation: 'A Load Balancer directs traffic so no single web server gets overwhelmed. In-memory caching stores frequent database results directly in RAM so queries return in 1 millisecond.',
    analogy: {
      title: '🚦 Analogy: Highway Toll Officer & Sticky Note Cheat Sheet',
      description: 'The Load Balancer is a highway traffic cop pointing oncoming cars down open toll booth lanes so no single lane backs up for miles. Redis is keeping the answers to frequent questions written on a sticky note right next to your computer so you do not have to walk down to the basement filing cabinet (database) 10,000 times a minute.'
    },
    concepts: [
      {
        name: 'Load Balancing Algorithms',
        description: 'How the Load Balancer decides which web server receives the next incoming visitor.',
        pros: [
          'Round Robin: 1st visitor -> Server 1, 2nd visitor -> Server 2, 3rd visitor -> Server 3.',
          'Least Connections: Sends visitor to the server with fewest active connections (best for long downloads).',
          'IP Hash (Sticky): Maps client IP to a specific server so the user always talks to the same node.'
        ],
        cons: ['Requires active Health Checks: if Server 2 fails /health, the balancer must immediately bypass it.']
      },
      {
        name: 'In-Memory Caching (Redis)',
        description: 'Reading data from a hard drive takes 5ms to 50ms. Reading from RAM takes 0.5ms (100x faster).',
        pros: [
          'Cache-Aside Pattern: App checks Redis first. If found (Cache Hit), return in 1ms!',
          'If not found (Cache Miss), query PostgreSQL once, save result into Redis with a 10-minute expiry (TTL), and return.'
        ],
        cons: ['Cache Invalidation: Must delete or update cache entry when data changes in the database.']
      }
    ],
    practicalCodeSnippet: {
      title: 'Production Nginx Load Balancer Configuration',
      code: `upstream backend_pool {
    # Load balancing pool across 3 web servers
    server 192.168.1.101:3000 max_fails=3 fail_timeout=10s;
    server 192.168.1.102:3000 max_fails=3 fail_timeout=10s;
    server 192.168.1.103:3000 max_fails=3 fail_timeout=10s;
}

server {
    listen 80;
    server_name myapp.com;

    location / {
        proxy_pass http://backend_pool;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_connect_timeout 3s;
    }
}`,
      notes: 'If 192.168.1.102 crashes, Nginx detects the failure within 3s and automatically routes all traffic to the remaining two servers with zero downtime.'
    },
    keyTakeaways: [
      'A Load Balancer is the front door of all modern high-traffic infrastructure.',
      'Redis in front of PostgreSQL/MySQL can protect your database from melting down during viral traffic spikes.'
    ]
  },
  {
    id: 'database-replication-ha',
    badge: 'Scale 3',
    badgeColor: 'coral',
    title: 'Database Scaling: Primary & Read Replicas',
    headline: 'In almost every web application, 95% of database queries are Reads (viewing posts, browsing products) and only 5% are Writes.',
    explanation: 'A single database machine handling both reads and writes will hit CPU limits quickly. We solve this by having one Primary database (for writes) replicating data to multiple Read Replicas.',
    analogy: {
      title: '📖 Analogy: The Head Accountant & Carbon Copy Ledgers',
      description: 'The Primary database is the Head Accountant with the master signing pen: only they can execute write operations (debiting money or creating an account). Read Replicas are carbon-copy ledger duplicates handed to 5 bank tellers across the lobby: 10,000 customers can check their account balances at the tellers simultaneously without ever forming a line at the head accountant\'s desk.'
    },
    concepts: [
      {
        name: 'Read Replica Architecture',
        description: 'Splitting database traffic into Write queries (INSERT, UPDATE, DELETE) and Read queries (SELECT).',
        pros: [
          'All INSERT / UPDATE / DELETE queries route to the Primary database.',
          'The Primary continuously streams transaction logs (WAL) to 2 or 3 Read Replicas.',
          'All SELECT queries (95% of traffic) are load-balanced across the Read Replicas.'
        ],
        cons: ['Replication Lag: Takes a few milliseconds for replicas to catch up with the primary after a write.']
      },
      {
        name: 'Automatic Failover (High Availability)',
        description: 'What happens if the Primary database hardware physically dies at 3 AM?',
        pros: [
          'Clustering software (e.g. Patroni for PostgreSQL) monitors the Primary with 1-second heartbeats.',
          'If the Primary fails, Replica 1 is automatically promoted to become the new Primary.',
          'Applications reconnect to the new Primary in under 5 seconds with zero data loss.'
        ],
        cons: ['Requires minimum 3 nodes (Quorum) to prevent "Split-Brain" where two nodes both think they are primary.']
      }
    ],
    architectureDiagram: `               [ Backend API Nodes ]
                 /               \\
    Writes Only /                 \\ Reads Only (95% traffic)
               v                   v
     +-------------------+   +-------------------+ +-------------------+
     |  PRIMARY DATABASE |   |  READ REPLICA 1   | |  READ REPLICA 2   |
     | (Postgres Leader) |   |  (Read-Only Node) | |  (Read-Only Node) |
     +-------------------+   +-------------------+ +-------------------+
               |                       ^                     ^
               +-- Replication Stream -+---------------------+
                   (Continuous WAL log shipping)`,
    keyTakeaways: [
      'Read Replicas allow database read capacity to scale almost infinitely.',
      'Never run a production database as a single standalone server without automated failover and daily off-site backups.'
    ]
  }
];

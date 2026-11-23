// One source for everything the site and the resume say about me.

export const person = {
  name: "Azzeddine Lachgar",
  role: "DevOps engineer",
  line: "I build Kubernetes platforms that know what they cost.",
  city: "Casablanca, Morocco",
  github: "https://github.com/lachgar-Azzeddine",
  linkedin: "https://www.linkedin.com/in/lachgar-azzeddine",
  site: "https://azzhomelab.tech",
};

export const summary =
  "DevOps engineer in a regulated Medtech environment and Kubestronaut. I design multi-tenant Kubernetes platforms that are zero-trust by default and energy-aware: every tenant is measured in watts and held to a budget. I contribute fixes upstream to the CNCF projects I build on.";

export const experience = [
  {
    role: "DevOps Engineer",
    org: "Omnishore",
    place: "Casablanca",
    when: "Nov 2025 – present",
    points: [
      "Kubernetes operations for a Medtech production environment, across several environments.",
      "Infrastructure automation with Ansible, and CI/CD pipelines for containerised applications.",
      "Works under Medtech security constraints: supply chain integrity, least privilege and audit trails.",
    ],
  },
  {
    role: "Final-year intern, DevOps",
    org: "Tech My Team",
    place: "Marrakesh",
    when: "Feb 2025 – Jun 2025",
    points: [
      "Built a sovereign DevOps platform from scratch: GitLab CE, RKE2, Argo CD, Harbor, SonarQube, Helm and Sealed Secrets.",
      "Migrated the team's source control from GitHub to GitLab and rebuilt the CI/CD pipelines end to end.",
      "Ran Argo CD's app-of-apps pattern at team scale.",
    ],
  },
  {
    role: "Intern",
    org: "Datalink",
    place: "Casablanca",
    when: "Jun 2024 – Sep 2024",
    points: [
      "Deployed a local language model for internal developers on hardware without a GPU, tuning inference and serving to fit.",
    ],
  },
];

export const education = [
  { what: "Computer Network Engineering and Intelligent Telecommunication Systems", where: "Faculty of Sciences and Techniques, Settat", when: "2023 – 2025" },
  { what: "Electrical Engineering and Automated Systems", where: "Faculty of Sciences and Techniques, Settat", when: "2022 – 2023" },
  { what: "DEUST, Electrical and Mechanical Engineering", where: "Faculty of Sciences and Techniques, Settat", when: "2020 – 2022" },
];

export const certifications = [
  { code: "CKA", name: "Certified Kubernetes Administrator" },
  { code: "CKAD", name: "Certified Kubernetes Application Developer" },
  { code: "CKS", name: "Certified Kubernetes Security Specialist" },
  { code: "KCNA", name: "Kubernetes and Cloud Native Associate" },
  { code: "KCSA", name: "Kubernetes and Cloud Native Security Associate" },
];

export const skills = [
  { group: "Kubernetes and platforms", items: ["Kubernetes", "Talos Linux", "Kamaji", "Capsule", "Cilium", "Istio", "Helm"] },
  { group: "Delivery", items: ["Argo CD", "GitOps", "GitHub Actions", "GitLab CI", "Ansible"] },
  { group: "Security", items: ["SPIFFE/SPIRE", "OpenBao / Vault", "cosign", "SLSA", "Kyverno", "Pod Security Standards"] },
  { group: "Observability and energy", items: ["Kepler", "Prometheus / PromQL", "Grafana", "Datadog"] },
  { group: "Code", items: ["Go (controller-runtime)", "Python", "Bash"] },
];

export const projects = [
  {
    name: "joule-budget",
    url: "https://github.com/lachgar-Azzeddine/joule-budget",
    line: "An energy budget for each Kubernetes tenant.",
    body: "Quotas cap how much capacity a tenant can hold. joule-budget caps how much energy it spends. It measures each tenant's joules every minute, and when the daily budget runs out it puts the tenant to sleep: its control plane and workloads scale to zero, the tenant is cordoned, and its worker machines are powered off. Everything wakes at the next window.",
    facts: ["Go, controller-runtime", "Signed images, SLSA build provenance"],
  },
  {
    name: "kamaji-trustd",
    url: "https://github.com/lachgar-Azzeddine/kamaji-trustd",
    line: "Talos Linux workers for Kamaji hosted control planes.",
    body: "A Talos node gets its API certificate from trustd, which a Kamaji control plane does not run. Without it, workers waited 70 minutes and rebooted, forever. kamaji-trustd runs beside the tenant control plane and signs those certificates with the tenant's own CA. Workers now boot in 28 seconds.",
    facts: ["Go, gRPC", "Signed images, SLSA build provenance"],
  },
];

export const contributions = [
  { project: "Kepler", url: "https://github.com/sustainable-computing-io/kepler/pull/2764", what: "VMs keep their real name, so their energy is billed to the right machine.", status: "merged" },
  { project: "Capsule", url: "https://github.com/projectcapsule/capsule/pull/2314", what: "A namespace deleted mid-sync no longer breaks a tenant's quotas.", status: "merged" },
  { project: "Kamaji", url: "https://github.com/clastix/kamaji/pull/1419", what: "Hosted control planes report a standard Ready condition.", status: "merged" },
  { project: "Capsule", url: "https://github.com/projectcapsule/capsule/pull/2317", what: "Parallel creates can no longer push a tenant past its namespace quota.", status: "in review" },
  { project: "Kamaji", url: "https://github.com/clastix/kamaji/pull/1433", what: "The network profile default now applies its port default.", status: "in review" },
  { project: "Kamaji", url: "https://github.com/clastix/kamaji/pull/1432", what: "Guide: hosted control planes under the restricted Pod Security Standard.", status: "in review" },
] as const;

// Each era of the journey has its own waveform, drawn in a 72 x 30 box.
export const journey = [
  {
    when: "2020 – 2023",
    tag: "Volts",
    title: "Electrical engineering",
    wave: "M0 15 C 6 0, 12 0, 18 15 S 30 30, 36 15 S 48 0, 54 15 S 66 30, 72 15",
    body: "Electrical and mechanical engineering, then automated systems, at the Faculty of Sciences and Techniques in Settat. I learned to think in signals, loads and feedback loops before I thought in software. It is still how I look at infrastructure: what flows, what it costs, what controls it.",
  },
  {
    when: "2023 – 2025",
    tag: "Packets",
    title: "Network engineering",
    wave: "M0 24 H8 V6 H18 V24 H26 V6 H32 V24 H44 V6 H50 V24 H58 V6 H72",
    body: "Computer networks and intelligent telecommunication systems. The signal became data, and the data started moving between machines. Routing, protocols, and the habit of following a packet end to end when something breaks.",
  },
  {
    when: "2024",
    tag: "Inference",
    title: "A language model without a GPU",
    wave: "M0 22 L10 22 L14 8 L20 26 L26 14 L34 18 L44 10 L54 16 L64 12 L72 14",
    body: "Internship at Datalink: a local LLM for internal developers, on hardware that was never meant for it. My first lesson in the gap between \"it works on my laptop\" and \"it runs reliably for a team\".",
  },
  {
    when: "2025",
    tag: "Platform",
    title: "A DevOps platform from scratch",
    wave: "M0 26 H14 V20 H28 V14 H42 V9 H56 V5 H72",
    body: "Final-year project at Tech My Team: a sovereign platform built from nothing, with source control, a cluster, GitOps, a private registry and quality gates. The first time I ran GitOps at a scale where mistakes cost someone else's afternoon.",
  },
  {
    when: "2025 – now",
    tag: "Production",
    title: "DevOps engineer in Medtech",
    wave: "M0 15 H20 L24 6 L28 24 L32 15 H44 L48 6 L52 24 L56 15 H72",
    body: "Omnishore, Casablanca. Kubernetes in a regulated field, where supply chain integrity, least privilege and audit trails are daily work, not a slide. Along the way, all five CNCF Kubernetes certifications.",
  },
  {
    when: "2026",
    tag: "Watts",
    title: "Platforms that know what they cost",
    wave: "M0 20 L6 19 L10 21 L14 18 L18 20 L22 6 L25 21 L30 19 L36 20 L40 17 L46 20 L52 19 L56 26 L60 26 L62 19 L68 20 L72 18",
    body: "A lab built, broken and rebuilt. Workload identity instead of secrets, tenants with their own clusters, an energy budget per tenant and a controller that enforces it. And my first fixes merged into the projects I build on.",
    now: true,
  },
];

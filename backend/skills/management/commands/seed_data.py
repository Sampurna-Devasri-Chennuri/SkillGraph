from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from skills.models import SkillCategory, Skill, SkillDependency, LearningResource, UserSkill
from careers.models import CareerRole, CareerRequiredSkill
from projects.models import Project, ProjectSkillEvidence
from learning_paths.models import LearningPath, LearningPathStep
from analytics.models import UserActivity

class Command(BaseCommand):
    help = 'Seeds database with realistic skills, dependencies, career paths, and sample demo data.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting SkillGraph database seeding...'))

        # 1. Categories
        categories_data = [
            {'name': 'Programming Languages', 'slug': 'programming-languages', 'icon': 'Code', 'color_hex': '#3b82f6', 'description': 'Foundational coding languages powering modern software.'},
            {'name': 'Web & Frontend', 'slug': 'web-frontend', 'icon': 'Layout', 'color_hex': '#06b6d4', 'description': 'Client-side architectures, styling, state management, and modern browsers.'},
            {'name': 'Backend & APIs', 'slug': 'backend-apis', 'icon': 'Server', 'color_hex': '#8b5cf6', 'description': 'Server logic, REST/GraphQL protocols, microservices, and distributed architecture.'},
            {'name': 'Databases & Storage', 'slug': 'databases-storage', 'icon': 'Database', 'color_hex': '#ec4899', 'description': 'Relational modeling, NoSQL systems, indexing, and transactional caching.'},
            {'name': 'AI & Machine Learning', 'slug': 'ai-machine-learning', 'icon': 'Brain', 'color_hex': '#10b981', 'description': 'Deep learning, neural networks, LLM agentics, and statistical algorithms.'},
            {'name': 'Data Analytics & Engineering', 'slug': 'data-analytics', 'icon': 'BarChart3', 'color_hex': '#f59e0b', 'description': 'ETL pipelines, data warehousing, business intelligence, and mathematical statistics.'},
            {'name': 'Cloud & DevOps', 'slug': 'cloud-devops', 'icon': 'Cloud', 'color_hex': '#6366f1', 'description': 'Infrastructure as code, containerization, orchestration, and CI/CD pipelines.'},
            {'name': 'Cybersecurity', 'slug': 'cybersecurity', 'icon': 'Shield', 'color_hex': '#ef4444', 'description': 'Defensive architecture, network security, penetration testing, and cryptography.'},
            {'name': 'IoT & Embedded', 'slug': 'iot-embedded', 'icon': 'Cpu', 'color_hex': '#14b8a6', 'description': 'Hardware programming, microcontrollers, sensor networks, and edge computing.'},
            {'name': 'UI/UX & Product Design', 'slug': 'ui-ux-design', 'icon': 'Figma', 'color_hex': '#f43f5e', 'description': 'Design systems, user research, wireframing, usability testing, and interaction design.'},
        ]

        categories_map = {}
        for cat in categories_data:
            obj, _ = SkillCategory.objects.get_or_create(
                slug=cat['slug'],
                defaults={'name': cat['name'], 'icon': cat['icon'], 'color_hex': cat['color_hex'], 'description': cat['description']}
            )
            categories_map[cat['slug']] = obj

        # 2. Skills
        skills_data = [
            # Programming Languages
            {'name': 'Python', 'slug': 'python', 'cat': 'programming-languages', 'diff': 'Beginner', 'weight': 1.8, 'icon': 'Code', 'tags': 'python, py, backend, scripting, algorithms, data', 'desc': 'Versatile language for backend services, data analysis, automation, and AI models.'},
            {'name': 'JavaScript', 'slug': 'javascript', 'cat': 'programming-languages', 'diff': 'Beginner', 'weight': 1.8, 'icon': 'FileCode', 'tags': 'javascript, js, es6, frontend, web', 'desc': 'Core language of web browsers, supporting asynchronous event-driven applications.'},
            {'name': 'TypeScript', 'slug': 'typescript', 'cat': 'programming-languages', 'diff': 'Intermediate', 'weight': 1.5, 'icon': 'FileCode2', 'tags': 'typescript, ts, typed js, frontend, backend', 'desc': 'Typed superset of JavaScript bringing compile-time type safety and scalability.'},
            {'name': 'SQL', 'slug': 'sql', 'cat': 'programming-languages', 'diff': 'Beginner', 'weight': 1.7, 'icon': 'Database', 'tags': 'sql, queries, relational, joins, select, ddl', 'desc': 'Declarative language for querying, updating, and managing relational databases.'},
            {'name': 'C / C++', 'slug': 'c-cpp', 'cat': 'programming-languages', 'diff': 'Intermediate', 'weight': 1.6, 'icon': 'Terminal', 'tags': 'c, cpp, memory, pointers, low-level, embedded', 'desc': 'High-performance systems programming language with manual memory management.'},
            {'name': 'Go (Golang)', 'slug': 'golang', 'cat': 'programming-languages', 'diff': 'Intermediate', 'weight': 1.4, 'icon': 'Cpu', 'tags': 'go, golang, concurrency, microservices, backend', 'desc': 'Concurrent language designed at Google for robust, high-throughput cloud microservices.'},

            # Web & Frontend
            {'name': 'HTML5 & Semantic Markup', 'slug': 'html5', 'cat': 'web-frontend', 'diff': 'Beginner', 'weight': 1.0, 'icon': 'Globe', 'tags': 'html, html5, accessibility, a11y, web', 'desc': 'Foundational structure of the World Wide Web and accessible document hierarchies.'},
            {'name': 'CSS3 & Responsive Design', 'slug': 'css3', 'cat': 'web-frontend', 'diff': 'Beginner', 'weight': 1.2, 'icon': 'Palette', 'tags': 'css, css3, flexbox, grid, responsive, styling', 'desc': 'Styling, animations, grid systems, and multi-device layouts.'},
            {'name': 'Tailwind CSS', 'slug': 'tailwind-css', 'cat': 'web-frontend', 'diff': 'Beginner', 'weight': 1.1, 'icon': 'Wind', 'tags': 'tailwind, utility css, ui, components', 'desc': 'Utility-first CSS framework for rapid modern interface construction.'},
            {'name': 'React.js', 'slug': 'react', 'cat': 'web-frontend', 'diff': 'Intermediate', 'weight': 1.8, 'icon': 'Atom', 'tags': 'react, reactjs, jsx, hooks, state, virtual dom', 'desc': 'Component-driven frontend library for reactive user interfaces and web applications.'},
            {'name': 'Next.js & SSR', 'slug': 'nextjs', 'cat': 'web-frontend', 'diff': 'Advanced', 'weight': 1.5, 'icon': 'Zap', 'tags': 'nextjs, ssr, ssg, react framework, fullstack', 'desc': 'Production React framework with server-side rendering, hydration, and API routes.'},
            {'name': 'Frontend State Management', 'slug': 'state-management', 'cat': 'web-frontend', 'diff': 'Intermediate', 'weight': 1.3, 'icon': 'Layers', 'tags': 'redux, zustand, recoil, context, store', 'desc': 'Managing complex predictable client state across deeply nested component trees.'},

            # Backend & APIs
            {'name': 'RESTful API Architecture', 'slug': 'rest-apis', 'cat': 'backend-apis', 'diff': 'Beginner', 'weight': 1.6, 'icon': 'Network', 'tags': 'rest, api, http, endpoints, json, status codes', 'desc': 'Designing predictable HTTP endpoints, status codes, and JSON serialization protocols.'},
            {'name': 'Node.js & Express', 'slug': 'nodejs', 'cat': 'backend-apis', 'diff': 'Intermediate', 'weight': 1.5, 'icon': 'Server', 'tags': 'nodejs, express, event loop, npm, api', 'desc': 'Asynchronous V8 runtime for non-blocking server applications and web backends.'},
            {'name': 'Django & Django REST Framework', 'slug': 'django', 'cat': 'backend-apis', 'diff': 'Intermediate', 'weight': 1.7, 'icon': 'ShieldCheck', 'tags': 'django, drf, python backend, orm, rest api', 'desc': 'High-level Python web framework with batteries-included ORM, auth, and REST APIs.'},
            {'name': 'Microservices & Distributed Systems', 'slug': 'microservices', 'cat': 'backend-apis', 'diff': 'Advanced', 'weight': 1.8, 'icon': 'Boxes', 'tags': 'microservices, distributed, event-driven, kafka, grpc', 'desc': 'Decoupled services communicating through asynchronous messaging and gRPC.'},
            {'name': 'System Design & Scalability', 'slug': 'system-design', 'cat': 'backend-apis', 'diff': 'Advanced', 'weight': 2.0, 'icon': 'Network', 'tags': 'system design, scalability, caching, load balancing, sharding', 'desc': 'Architecting highly available, fault-tolerant systems serving millions of users.'},

            # Databases & Storage
            {'name': 'Relational Database Design', 'slug': 'relational-db', 'cat': 'databases-storage', 'diff': 'Intermediate', 'weight': 1.6, 'icon': 'Database', 'tags': 'postgresql, mysql, schema, normalization, foreign keys, acid', 'desc': 'ACID transaction compliance, third normal form, indexing strategies, and PostgreSQL.'},
            {'name': 'PostgreSQL & Query Optimization', 'slug': 'postgresql', 'cat': 'databases-storage', 'diff': 'Intermediate', 'weight': 1.5, 'icon': 'Database', 'tags': 'postgres, indexing, explain analyze, execution plans', 'desc': 'Advanced indexing, query plan inspection, connection pooling, and MVCC internals.'},
            {'name': 'NoSQL & Document Stores', 'slug': 'nosql-stores', 'cat': 'databases-storage', 'diff': 'Intermediate', 'weight': 1.3, 'icon': 'HardDrive', 'tags': 'mongodb, nosql, json, aggregation, horizontal scaling', 'desc': 'Flexible schema document stores, wide-column tables, and distributed data lakes.'},
            {'name': 'Redis & In-Memory Caching', 'slug': 'redis-caching', 'cat': 'databases-storage', 'diff': 'Intermediate', 'weight': 1.4, 'icon': 'Zap', 'tags': 'redis, cache, in-memory, pubsub, ttl, rates', 'desc': 'Sub-millisecond latency key-value data structures, rate limiting, and pub/sub.'},

            # AI & Machine Learning
            {'name': 'Linear Algebra & Calculus', 'slug': 'math-foundations', 'cat': 'ai-machine-learning', 'diff': 'Beginner', 'weight': 1.4, 'icon': 'Sigma', 'tags': 'linear algebra, calculus, matrices, vectors, derivatives', 'desc': 'Mathematical vector spaces, matrix factorizations, and gradient calculations.'},
            {'name': 'Probability & Statistics', 'slug': 'prob-stats', 'cat': 'ai-machine-learning', 'diff': 'Beginner', 'weight': 1.5, 'icon': 'TrendingUp', 'tags': 'statistics, hypothesis testing, bayesian, distributions', 'desc': 'Statistical inference, hypothesis testing, probability distributions, and sampling.'},
            {'name': 'NumPy & Scientific Computing', 'slug': 'numpy', 'cat': 'ai-machine-learning', 'diff': 'Beginner', 'weight': 1.4, 'icon': 'Cpu', 'tags': 'numpy, multidimensional arrays, broadcasting, vectorization', 'desc': 'Fast N-dimensional vector computations and linear algebraic transformations.'},
            {'name': 'Pandas & Data Wrangling', 'slug': 'pandas', 'cat': 'ai-machine-learning', 'diff': 'Intermediate', 'weight': 1.6, 'icon': 'Table', 'tags': 'pandas, dataframes, aggregation, cleaning, exploratory', 'desc': 'Tabular data analysis, feature engineering, missing value imputation, and wrangling.'},
            {'name': 'Machine Learning Algorithms', 'slug': 'classical-ml', 'cat': 'ai-machine-learning', 'diff': 'Intermediate', 'weight': 1.8, 'icon': 'Brain', 'tags': 'scikit-learn, regression, random forest, svm, cross validation', 'desc': 'Supervised and unsupervised models, ensemble learning, and hyperparameter tuning.'},
            {'name': 'Deep Learning & Neural Networks', 'slug': 'deep-learning', 'cat': 'ai-machine-learning', 'diff': 'Advanced', 'weight': 2.0, 'icon': 'Sparkles', 'tags': 'pytorch, tensorflow, backprop, cnn, rnn, transformers', 'desc': 'Backpropagation, PyTorch tensors, convolutional networks, and attention mechanisms.'},
            {'name': 'Natural Language Processing (NLP)', 'slug': 'nlp', 'cat': 'ai-machine-learning', 'diff': 'Advanced', 'weight': 1.7, 'icon': 'MessageSquare', 'tags': 'nlp, tokenization, embeddings, bert, sentiment analysis', 'desc': 'Text preprocessing, semantic vector embeddings, classification, and sequence modeling.'},
            {'name': 'LLMs, RAG & AI Agentics', 'slug': 'llm-rag-agents', 'cat': 'ai-machine-learning', 'diff': 'Advanced', 'weight': 2.2, 'icon': 'Bot', 'tags': 'llm, rag, langchain, prompt engineering, vector dbs, agents', 'desc': 'Retrieval-augmented generation, vector databases (Chroma/Pinecone), tool calling, and agents.'},
            {'name': 'MLOps & Model Deployment', 'slug': 'mlops', 'cat': 'ai-machine-learning', 'diff': 'Advanced', 'weight': 1.8, 'icon': 'Activity', 'tags': 'mlflow, model registry, triton, inference, monitoring', 'desc': 'Tracking model experiments, automated retraining pipelines, and low-latency inference serving.'},

            # Data Analytics & Engineering
            {'name': 'Exploratory Data Analysis (EDA)', 'slug': 'eda', 'cat': 'data-analytics', 'diff': 'Beginner', 'weight': 1.3, 'icon': 'Eye', 'tags': 'eda, visualization, matplotlib, seaborn, insights', 'desc': 'Uncovering statistical patterns, correlations, distributions, and visual anomalies.'},
            {'name': 'Data Warehousing & Dimensional Modeling', 'slug': 'data-warehousing', 'cat': 'data-analytics', 'diff': 'Intermediate', 'weight': 1.6, 'icon': 'Archive', 'tags': 'snowflake, bigquery, star schema, dbt, facts dimensions', 'desc': 'Star and snowflake schemas, OLAP query engines, and analytical reporting models.'},
            {'name': 'Data Pipelines & ETL (Airflow/Kafka)', 'slug': 'etl-pipelines', 'cat': 'data-analytics', 'diff': 'Advanced', 'weight': 1.8, 'icon': 'Workflow', 'tags': 'etl, airflow, kafka, spark, batch, stream', 'desc': 'Building automated DAG-based data ingestion, transformation, and validation pipelines.'},
            {'name': 'Business Intelligence & Dashboards', 'slug': 'bi-dashboards', 'cat': 'data-analytics', 'diff': 'Beginner', 'weight': 1.2, 'icon': 'PieChart', 'tags': 'tableau, powerbi, dashboards, kpis, reporting', 'desc': 'Executive metrics, interactive charts, conversion funnels, and KPI visualizations.'},

            # Cloud & DevOps
            {'name': 'Linux OS & Bash Shell Scripting', 'slug': 'linux-bash', 'cat': 'cloud-devops', 'diff': 'Beginner', 'weight': 1.4, 'icon': 'Terminal', 'tags': 'linux, bash, shell, permissions, process management', 'desc': 'UNIX philosophy, permissions, process monitoring, piping, and shell automation.'},
            {'name': 'Git & Collaborative Version Control', 'slug': 'git', 'cat': 'cloud-devops', 'diff': 'Beginner', 'weight': 1.5, 'icon': 'GitBranch', 'tags': 'git, github, branching, merge, pull requests, rebase', 'desc': 'Distributed version control, conflict resolution, rebase workflows, and CI triggers.'},
            {'name': 'Docker & Containerization', 'slug': 'docker', 'cat': 'cloud-devops', 'diff': 'Intermediate', 'weight': 1.7, 'icon': 'Box', 'tags': 'docker, containers, dockerfile, compose, images', 'desc': 'Building reproducible application container images, volumes, and multi-stage builds.'},
            {'name': 'Kubernetes & Container Orchestration', 'slug': 'kubernetes', 'cat': 'cloud-devops', 'diff': 'Advanced', 'weight': 2.0, 'icon': 'Anchor', 'tags': 'k8s, kubernetes, pods, ingress, helm, deployments', 'desc': 'Clustered container scheduling, auto-scaling, service discovery, and rolling deployments.'},
            {'name': 'CI/CD Pipelines (GitHub Actions)', 'slug': 'ci-cd', 'cat': 'cloud-devops', 'diff': 'Intermediate', 'weight': 1.5, 'icon': 'PlayCircle', 'tags': 'cicd, github actions, automated testing, deployment', 'desc': 'Automated linting, integration testing, vulnerability scans, and deployment workflows.'},
            {'name': 'Cloud Infrastructure (AWS/GCP/Azure)', 'slug': 'cloud-platforms', 'cat': 'cloud-devops', 'diff': 'Intermediate', 'weight': 1.8, 'icon': 'CloudRain', 'tags': 'aws, gcp, azure, s3, ec2, iam, vpc', 'desc': 'Cloud compute, object storage, virtual private clouds, security groups, and serverless.'},
            {'name': 'Infrastructure as Code (Terraform)', 'slug': 'terraform', 'cat': 'cloud-devops', 'diff': 'Advanced', 'weight': 1.7, 'icon': 'Code2', 'tags': 'terraform, iac, hcl, cloudformation, state files', 'desc': 'Declarative infrastructure management, state drift detection, and modular cloud provisioning.'},

            # Cybersecurity
            {'name': 'Networking Protocols & TCP/IP', 'slug': 'networking-protocols', 'cat': 'cybersecurity', 'diff': 'Beginner', 'weight': 1.5, 'icon': 'Wifi', 'tags': 'networking, tcp, ip, dns, http, ssl, tls, packets', 'desc': 'OSI model, packet inspection, TLS handshakes, DNS routing, and firewall filtering.'},
            {'name': 'Cryptography & PKI Foundations', 'slug': 'cryptography', 'cat': 'cybersecurity', 'diff': 'Intermediate', 'weight': 1.6, 'icon': 'Key', 'tags': 'crypto, aes, rsa, hashing, sha256, certificates', 'desc': 'Symmetric and asymmetric encryption, digital signatures, hashing, and certificates.'},
            {'name': 'Web Application Security (OWASP Top 10)', 'slug': 'web-security', 'cat': 'cybersecurity', 'diff': 'Intermediate', 'weight': 1.8, 'icon': 'ShieldAlert', 'tags': 'owasp, xss, csrf, sql injection, auth bypass', 'desc': 'Identifying and mitigating common vulnerabilities, injection attacks, and authorization flaws.'},
            {'name': 'Penetration Testing & Vulnerability Assessment', 'slug': 'penetration-testing', 'cat': 'cybersecurity', 'diff': 'Advanced', 'weight': 1.9, 'icon': 'Crosshair', 'tags': 'pentesting, burp suite, nmap, metasploit, exploits', 'desc': 'Ethical hacking methodologies, port scanning, payload execution, and vulnerability reporting.'},
            {'name': 'SIEM & Threat Intelligence', 'slug': 'siem-threat-intel', 'cat': 'cybersecurity', 'diff': 'Advanced', 'weight': 1.7, 'icon': 'Search', 'tags': 'siem, splunk, soc, incident response, threat hunting', 'desc': 'Log aggregation, anomaly detection, incident response, and zero-day threat analysis.'},

            # IoT & Embedded Systems
            {'name': 'Computer Architecture & Microcontrollers', 'slug': 'microcontrollers', 'cat': 'iot-embedded', 'diff': 'Beginner', 'weight': 1.5, 'icon': 'Cpu', 'tags': 'arduino, esp32, gpio, registers, interrupts, timers', 'desc': 'Registers, GPIO pins, interrupt service routines, and microcontroller architectures.'},
            {'name': 'Embedded C/C++ Programming', 'slug': 'embedded-c', 'cat': 'iot-embedded', 'diff': 'Intermediate', 'weight': 1.7, 'icon': 'Terminal', 'tags': 'embedded c, real time, memory constrained, firmware', 'desc': 'Writing bare-metal firmware with strict latency and memory constraints.'},
            {'name': 'IoT Communication Protocols (MQTT/CoAP)', 'slug': 'iot-protocols', 'cat': 'iot-embedded', 'diff': 'Intermediate', 'weight': 1.5, 'icon': 'Radio', 'tags': 'mqtt, coap, zigbee, bluetooth ble, telemetry', 'desc': 'Lightweight publish/subscribe telemetry protocols for constrained sensor networks.'},
            {'name': 'Real-Time Operating Systems (FreeRTOS)', 'slug': 'rtos', 'cat': 'iot-embedded', 'diff': 'Advanced', 'weight': 1.8, 'icon': 'Clock', 'tags': 'rtos, freertos, task scheduling, semaphores, queues', 'desc': 'Deterministic scheduling, thread synchronization, semaphores, and inter-task queues.'},

            # UI/UX & Product Design
            {'name': 'User Research & Wireframing', 'slug': 'user-research', 'cat': 'ui-ux-design', 'diff': 'Beginner', 'weight': 1.2, 'icon': 'Users', 'tags': 'ux research, interviews, personas, wireframes, flows', 'desc': 'Conducting user interviews, journey mapping, personas, and low-fidelity wireframing.'},
            {'name': 'Figma & Design Systems', 'slug': 'figma-design-systems', 'cat': 'ui-ux-design', 'diff': 'Intermediate', 'weight': 1.6, 'icon': 'Figma', 'tags': 'figma, design system, tokens, autolayout, components', 'desc': 'Component libraries, design tokens, responsive auto-layout, and interactive prototypes.'},
            {'name': 'Interaction Design & Usability Testing', 'slug': 'interaction-design', 'cat': 'ui-ux-design', 'diff': 'Intermediate', 'weight': 1.4, 'icon': 'MousePointer', 'tags': 'microinteractions, usability, heuristics, a/b testing', 'desc': 'Micro-interactions, state transitions, cognitive ergonomics, and accessibility auditing.'},
        ]

        skills_map = {}
        for s in skills_data:
            obj, _ = Skill.objects.get_or_create(
                slug=s['slug'],
                defaults={
                    'name': s['name'],
                    'category': categories_map[s['cat']],
                    'difficulty_level': s['diff'],
                    'importance_weight': s['weight'],
                    'icon_name': s['icon'],
                    'tags': s['tags'],
                    'description': s['desc']
                }
            )
            skills_map[s['slug']] = obj

        # 3. Skill Dependencies (Strict DAG: Source is Prerequisite, Target is Dependent)
        dependencies_data = [
            # Programming -> Web/Backend
            ('javascript', 'typescript', 'STRICT_PREREQUISITE', 5, 'TypeScript builds directly on top of JavaScript semantics.'),
            ('html5', 'css3', 'RECOMMENDED', 4, 'Styling requires structured markup.'),
            ('html5', 'javascript', 'RECOMMENDED', 3, 'DOM manipulation builds upon HTML elements.'),
            ('css3', 'tailwind-css', 'STRICT_PREREQUISITE', 5, 'Tailwind generates atomic CSS classes based on CSS fundamentals.'),
            ('javascript', 'react', 'STRICT_PREREQUISITE', 5, 'Modern React utilizes ES6+ syntax, closures, and promises.'),
            ('html5', 'react', 'RECOMMENDED', 4, 'React JSX renders semantic HTML elements.'),
            ('react', 'state-management', 'STRICT_PREREQUISITE', 4, 'Global state managers coordinate React component trees.'),
            ('react', 'nextjs', 'STRICT_PREREQUISITE', 5, 'Next.js is a server-rendered React framework.'),
            ('typescript', 'nextjs', 'RECOMMENDED', 4, 'Type safety enables scalable fullstack Next.js applications.'),

            # Backend
            ('python', 'django', 'STRICT_PREREQUISITE', 5, 'Django is written in Python and requires strong object-oriented fluency.'),
            ('javascript', 'nodejs', 'STRICT_PREREQUISITE', 5, 'Node.js runs server-side JavaScript applications.'),
            ('rest-apis', 'django', 'RECOMMENDED', 4, 'Django REST Framework implements REST API design patterns.'),
            ('sql', 'relational-db', 'STRICT_PREREQUISITE', 5, 'Database design requires understanding SQL queries and constraints.'),
            ('relational-db', 'postgresql', 'STRICT_PREREQUISITE', 5, 'PostgreSQL optimizations build upon relational modeling.'),
            ('relational-db', 'django', 'RECOMMENDED', 4, 'Django ORM abstracts relational table models and queries.'),
            ('rest-apis', 'microservices', 'STRICT_PREREQUISITE', 4, 'Microservices communicate through standardized API interfaces.'),
            ('microservices', 'system-design', 'STRICT_PREREQUISITE', 5, 'System design synthesizes microservices, caches, and load balancers.'),
            ('redis-caching', 'system-design', 'RECOMMENDED', 4, 'Caching strategies are vital for distributed system scalability.'),

            # AI & Data Science
            ('python', 'numpy', 'STRICT_PREREQUISITE', 5, 'NumPy is the foundational array computing library for Python.'),
            ('numpy', 'pandas', 'STRICT_PREREQUISITE', 5, 'Pandas DataFrames are built directly on NumPy arrays.'),
            ('math-foundations', 'prob-stats', 'RECOMMENDED', 4, 'Probability relies on calculus and linear transformations.'),
            ('prob-stats', 'classical-ml', 'STRICT_PREREQUISITE', 5, 'Machine learning loss functions and metrics are rooted in statistics.'),
            ('numpy', 'classical-ml', 'STRICT_PREREQUISITE', 4, 'ML feature matrices and model weights are vectorized with NumPy.'),
            ('pandas', 'eda', 'STRICT_PREREQUISITE', 5, 'EDA requires slicing, filtering, and summarizing data with Pandas.'),
            ('classical-ml', 'deep-learning', 'STRICT_PREREQUISITE', 5, 'Deep learning scales gradient descent and loss optimization concepts.'),
            ('math-foundations', 'deep-learning', 'STRICT_PREREQUISITE', 4, 'Matrix multiplications and partial derivatives power backpropagation.'),
            ('deep-learning', 'nlp', 'STRICT_PREREQUISITE', 4, 'Modern NLP relies on transformer neural networks and dense embeddings.'),
            ('nlp', 'llm-rag-agents', 'STRICT_PREREQUISITE', 5, 'RAG systems, embeddings, and prompting require solid NLP fundamentals.'),
            ('python', 'llm-rag-agents', 'STRICT_PREREQUISITE', 4, 'Python is the de facto language for LangChain, LlamaIndex, and OpenAI APIs.'),
            ('deep-learning', 'mlops', 'STRICT_PREREQUISITE', 4, 'MLOps automates training and serving deep neural network checkpoints.'),
            ('docker', 'mlops', 'RECOMMENDED', 4, 'Inference containers package models into reproducible deployable units.'),

            # Data Analytics & Pipelines
            ('sql', 'eda', 'RECOMMENDED', 3, 'SQL extracts raw analytical tables for exploratory inspection.'),
            ('sql', 'data-warehousing', 'STRICT_PREREQUISITE', 5, 'Data warehouse queries, schemas, and views are written in SQL.'),
            ('relational-db', 'data-warehousing', 'STRICT_PREREQUISITE', 4, 'Dimensional modeling evolves from standard transactional schemas.'),
            ('python', 'etl-pipelines', 'RECOMMENDED', 4, 'Airflow DAGs and Spark transformations are scripted in Python.'),
            ('sql', 'etl-pipelines', 'RECOMMENDED', 4, 'ETL queries transform data staging layers.'),
            ('eda', 'bi-dashboards', 'RECOMMENDED', 4, 'BI dashboards translate EDA findings into executive metrics.'),

            # DevOps & Cloud
            ('git', 'ci-cd', 'STRICT_PREREQUISITE', 5, 'CI/CD workflows trigger on Git commits, branches, and PRs.'),
            ('linux-bash', 'docker', 'RECOMMENDED', 4, 'Dockerfile instructions execute Linux shell commands.'),
            ('docker', 'kubernetes', 'STRICT_PREREQUISITE', 5, 'Kubernetes orchestrates multi-container Docker workloads.'),
            ('docker', 'ci-cd', 'RECOMMENDED', 4, 'Automated pipelines build and test container images.'),
            ('networking-protocols', 'cloud-platforms', 'RECOMMENDED', 4, 'VPCs, subnets, and security groups require networking knowledge.'),
            ('cloud-platforms', 'terraform', 'STRICT_PREREQUISITE', 5, 'Terraform automates provisioning resources in cloud providers.'),
            ('kubernetes', 'cloud-platforms', 'RECOMMENDED', 3, 'Managed clusters (EKS, GKE, AKS) operate inside cloud VPCs.'),

            # Cybersecurity
            ('networking-protocols', 'cryptography', 'RECOMMENDED', 3, 'Understanding network packet transit clarifies encryption needs.'),
            ('networking-protocols', 'web-security', 'RECOMMENDED', 4, 'Web attacks exploit HTTP headers, cookies, and CORS mechanisms.'),
            ('web-security', 'penetration-testing', 'STRICT_PREREQUISITE', 5, 'Penetration testing systematically exploits web application vulnerabilities.'),
            ('cryptography', 'penetration-testing', 'RECOMMENDED', 3, 'Cracking hashes and testing SSL configs requires crypto awareness.'),
            ('networking-protocols', 'siem-threat-intel', 'STRICT_PREREQUISITE', 4, 'SIEM tools analyze netflow logs, firewall alerts, and IP reputations.'),

            # IoT & Embedded
            ('c-cpp', 'embedded-c', 'STRICT_PREREQUISITE', 5, 'Firmware development relies on deep C/C++ memory semantics.'),
            ('microcontrollers', 'embedded-c', 'STRICT_PREREQUISITE', 4, 'Writing firmware requires understanding hardware register registers.'),
            ('embedded-c', 'iot-protocols', 'RECOMMENDED', 4, 'Microcontrollers publish sensor packets via MQTT or CoAP clients.'),
            ('embedded-c', 'rtos', 'STRICT_PREREQUISITE', 5, 'FreeRTOS organizes multitasking firmware into real-time threads.'),

            # UI/UX Design
            ('user-research', 'figma-design-systems', 'STRICT_PREREQUISITE', 4, 'Wireframe flows inform design system component specifications.'),
            ('figma-design-systems', 'interaction-design', 'RECOMMENDED', 4, 'Design components are animated and tested with real users.'),
            ('figma-design-systems', 'html5', 'RECOMMENDED', 3, 'Understanding design systems makes HTML component modeling intuitive.'),
            ('figma-design-systems', 'tailwind-css', 'RECOMMENDED', 3, 'Tailwind utility tokens closely mirror Figma token properties.'),
        ]

        for src, tgt, dtype, strength, reason in dependencies_data:
            if src in skills_map and tgt in skills_map:
                SkillDependency.objects.get_or_create(
                    source_skill=skills_map[src],
                    target_skill=skills_map[tgt],
                    defaults={'dependency_type': dtype, 'strength': strength, 'reason': reason}
                )

        # 4. Learning Resources
        resources_data = [
            ('python', 'Python Official Tutorial & Docs', 'https://docs.python.org/3/tutorial/', 'DOCUMENTATION', 'Python Software Foundation', True, 20),
            ('javascript', 'The Modern JavaScript Tutorial', 'https://javascript.info/', 'COURSE', 'javascript.info', True, 30),
            ('react', 'React Documentation: Quick Start & Hooks', 'https://react.dev/learn', 'DOCUMENTATION', 'Meta Open Source', True, 25),
            ('django', 'Django Girls & Official Django Documentation', 'https://docs.djangoproject.com/en/stable/', 'DOCUMENTATION', 'Django Project', True, 35),
            ('classical-ml', 'Scikit-Learn Machine Learning in Python', 'https://scikit-learn.org/stable/tutorial/index.html', 'DOCUMENTATION', 'Scikit-Learn Team', True, 40),
            ('deep-learning', 'Deep Learning with PyTorch: A 60 Minute Blitz', 'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html', 'COURSE', 'PyTorch Foundation', True, 15),
            ('llm-rag-agents', 'LangChain Academy & RAG Architecture Course', 'https://python.langchain.com/docs/tutorials/', 'DOCUMENTATION', 'LangChain', True, 30),
            ('docker', 'Docker Getting Started Guide & Labs', 'https://docs.docker.com/get-started/', 'DOCUMENTATION', 'Docker Inc', True, 15),
            ('system-design', 'System Design Primer (Open Source Architecture)', 'https://github.com/donnemartin/system-design-primer', 'REPOSITORY', 'GitHub Community', True, 45),
            ('figma-design-systems', 'Figma Design Systems Guide', 'https://help.figma.com/hc/en-us/articles/360039238194', 'DOCUMENTATION', 'Figma', True, 15),
            ('web-security', 'OWASP Web Security Testing Guide', 'https://owasp.org/www-project-web-security-testing-guide/', 'DOCUMENTATION', 'OWASP', True, 35),
        ]

        for s_slug, title, url, rtype, provider, is_free, hours in resources_data:
            if s_slug in skills_map:
                LearningResource.objects.get_or_create(
                    skill=skills_map[s_slug],
                    title=title,
                    defaults={'url': url, 'resource_type': rtype, 'provider': provider, 'is_free': is_free, 'estimated_hours': hours}
                )

        # 5. Career Roles
        careers_data = [
            {
                'title': 'AI Engineer',
                'slug': 'ai-engineer',
                'category': 'AI Engineering',
                'salary': '$135,000 - $210,000',
                'demand': 'Explosive',
                'icon': 'Brain',
                'short': 'Designs, fine-tunes, and deploys production-grade AI agents, RAG architectures, and multimodal foundation models.',
                'detailed': 'AI Engineers bridge modern machine learning capabilities with enterprise software engineering. You will architect retrieval-augmented generation pipelines, optimize LLM inference latencies, build autonomous agent swarms, and integrate vector embeddings into production user experiences.',
                'progression': ['Junior AI Engineer', 'AI Software Engineer', 'Senior AI Engineer', 'Lead AI Architect', 'VP of AI Technology'],
                'projects': [
                    {'title': 'RAG Knowledge Assistant', 'description': 'Full-stack enterprise retrieval system combining vector search with citation verification.'},
                    {'title': 'Autonomous Code Review Agent', 'description': 'Multi-agent orchestration analyzing git pull requests for security vulnerabilities and performance bottlenecks.'}
                ],
                'skills': [
                    ('python', True, 3, 3.0),
                    ('math-foundations', True, 2, 2.0),
                    ('numpy', True, 2, 2.0),
                    ('deep-learning', True, 3, 2.8),
                    ('nlp', True, 3, 2.8),
                    ('llm-rag-agents', True, 3, 3.0),
                    ('rest-apis', True, 2, 1.8),
                    ('docker', True, 2, 1.8),
                    ('mlops', False, 2, 1.5),
                    ('redis-caching', False, 2, 1.4),
                    ('system-design', False, 2, 1.6),
                ]
            },
            {
                'title': 'Full-Stack Developer',
                'slug': 'full-stack-developer',
                'category': 'Full-Stack Development',
                'salary': '$105,000 - $165,000',
                'demand': 'Very High',
                'icon': 'Layers',
                'short': 'Builds end-to-end responsive web applications spanning sleek frontend interfaces and robust backend microservices.',
                'detailed': 'Full-Stack Developers command the entire web stack. You will craft reactive client user interfaces, implement REST/GraphQL APIs, design relational schemas, secure endpoints against OWASP threats, and maintain deployment pipelines.',
                'progression': ['Junior Full-Stack Dev', 'Full-Stack Engineer', 'Senior Full-Stack Engineer', 'Staff Engineer', 'Engineering Manager'],
                'projects': [
                    {'title': 'Collaborative Kanban SaaS', 'description': 'Real-time drag-and-drop workspace featuring WebSocket sync and team permissions.'},
                    {'title': 'E-Commerce Marketplace', 'description': 'High-traffic storefront with Stripe payment webhooks, inventory caching, and analytics.'}
                ],
                'skills': [
                    ('html5', True, 3, 2.0),
                    ('css3', True, 3, 2.0),
                    ('javascript', True, 3, 2.5),
                    ('typescript', True, 2, 2.0),
                    ('react', True, 3, 2.8),
                    ('tailwind-css', False, 2, 1.5),
                    ('rest-apis', True, 3, 2.5),
                    ('django', True, 2, 2.2),
                    ('relational-db', True, 2, 2.0),
                    ('git', True, 3, 2.0),
                    ('docker', False, 2, 1.6),
                    ('redis-caching', False, 1, 1.4),
                ]
            },
            {
                'title': 'Machine Learning Engineer',
                'slug': 'machine-learning-engineer',
                'category': 'Machine Learning Engineering',
                'salary': '$130,000 - $195,000',
                'demand': 'Very High',
                'icon': 'Sparkles',
                'short': 'Develops statistical models, trains deep neural networks, and deploys scalable inference pipelines into production.',
                'detailed': 'Machine Learning Engineers transform data science prototypes into robust production systems. You will implement distributed training loops, run automated hyperparameter searches, monitor model drift, and optimize latency on GPU clusters.',
                'progression': ['Associate ML Engineer', 'ML Engineer', 'Senior ML Engineer', 'Principal ML Systems Architect'],
                'projects': [
                    {'title': 'Real-Time Fraud Detection', 'description': 'Streaming anomaly classification system scoring transactions with sub-20ms latency.'},
                    {'title': 'Computer Vision Quality Inspector', 'description': 'Edge-deployed convolutional neural network identifying defect patterns on assembly lines.'}
                ],
                'skills': [
                    ('python', True, 3, 3.0),
                    ('math-foundations', True, 3, 2.5),
                    ('prob-stats', True, 3, 2.5),
                    ('numpy', True, 3, 2.2),
                    ('pandas', True, 3, 2.2),
                    ('classical-ml', True, 3, 2.8),
                    ('deep-learning', True, 3, 2.8),
                    ('mlops', True, 2, 2.2),
                    ('docker', True, 2, 1.8),
                    ('system-design', False, 2, 1.5),
                ]
            },
            {
                'title': 'Data Scientist',
                'slug': 'data-scientist',
                'category': 'Data Science',
                'salary': '$115,000 - $175,000',
                'demand': 'High',
                'icon': 'LineChart',
                'short': 'Applies statistical rigor, predictive modeling, and data storytelling to extract strategic business intelligence.',
                'detailed': 'Data Scientists formulate hypotheses, run rigorous A/B experiments, build predictive models, and communicate complex empirical findings to executive stakeholders to drive strategic product growth.',
                'progression': ['Junior Data Scientist', 'Data Scientist', 'Senior Data Scientist', 'Lead Data Scientist', 'Chief Data Officer'],
                'projects': [
                    {'title': 'Customer Lifetime Value Predictor', 'description': 'Hierarchical Bayesian regression modeling churn risk and recurring monetization.'},
                    {'title': 'Dynamic Pricing Engine', 'description': 'Elasticity modeling engine calculating optimal price points given historical demand.'}
                ],
                'skills': [
                    ('python', True, 3, 2.8),
                    ('sql', True, 3, 2.8),
                    ('prob-stats', True, 3, 3.0),
                    ('math-foundations', True, 2, 2.0),
                    ('pandas', True, 3, 2.8),
                    ('eda', True, 3, 2.5),
                    ('classical-ml', True, 3, 2.5),
                    ('bi-dashboards', False, 2, 1.6),
                    ('nlp', False, 2, 1.5),
                ]
            },
            {
                'title': 'Data Analyst',
                'slug': 'data-analyst',
                'category': 'Data Analytics',
                'salary': '$80,000 - $125,000',
                'demand': 'High',
                'icon': 'BarChart',
                'short': 'Translates raw transactional databases into actionable executive dashboards, KPIs, and operational reports.',
                'detailed': 'Data Analysts work across marketing, finance, and engineering to measure business health. You will write complex analytical SQL, build automated reporting pipelines, conduct cohort analyses, and create intuitive visual dashboards.',
                'progression': ['Junior Data Analyst', 'Data Analyst', 'Senior Business Analyst', 'Analytics Lead', 'Head of Business Intelligence'],
                'projects': [
                    {'title': 'Product Growth Funnel Dashboard', 'description': 'Automated cohort tracking analyzing onboarding drop-off and retention curves.'},
                    {'title': 'Marketing Attribution Model', 'description': 'Multi-touch attribution script assessing ROI across organic and paid channels.'}
                ],
                'skills': [
                    ('sql', True, 3, 3.0),
                    ('prob-stats', True, 2, 2.2),
                    ('eda', True, 3, 2.8),
                    ('bi-dashboards', True, 3, 2.8),
                    ('pandas', True, 2, 2.0),
                    ('relational-db', False, 2, 1.8),
                    ('data-warehousing', False, 1, 1.5),
                ]
            },
            {
                'title': 'Cloud Infrastructure Engineer',
                'slug': 'cloud-engineer',
                'category': 'Cloud Engineering',
                'salary': '$120,000 - $180,000',
                'demand': 'Very High',
                'icon': 'Cloud',
                'short': 'Architects resilient, multi-region cloud networks, security perimeters, and automated infrastructure as code.',
                'detailed': 'Cloud Engineers construct the enterprise foundation in AWS, GCP, or Azure. You will design VPC network topologies, enforce least-privilege IAM policies, manage disaster recovery pipelines, and provision infrastructure via Terraform.',
                'progression': ['Cloud Associate', 'Cloud Engineer', 'Senior Cloud Infrastructure Architect', 'Director of Cloud Platforms'],
                'projects': [
                    {'title': 'Multi-Region High Availability VPC', 'description': 'Terraform-provisioned cross-region AWS topology with automated failover and peering.'},
                    {'title': 'Serverless Event Ingestion Lake', 'description': 'Zero-maintenance streaming pipeline processing 10k events/sec into S3 via Kinesis.'}
                ],
                'skills': [
                    ('linux-bash', True, 3, 2.5),
                    ('networking-protocols', True, 3, 2.8),
                    ('cloud-platforms', True, 3, 3.0),
                    ('terraform', True, 3, 2.8),
                    ('docker', True, 2, 2.0),
                    ('git', True, 2, 1.8),
                    ('kubernetes', False, 2, 2.0),
                    ('ci-cd', False, 2, 1.8),
                ]
            },
            {
                'title': 'DevOps / SRE Engineer',
                'slug': 'devops-engineer',
                'category': 'DevOps',
                'salary': '$125,000 - $185,000',
                'demand': 'Very High',
                'icon': 'GitBranch',
                'short': 'Ensures 99.99% system availability through CI/CD automation, container orchestration, and observability.',
                'detailed': 'Site Reliability and DevOps Engineers bridge development and production operations. You will eliminate manual toil with automated deployments, monitor telemetry metrics via Prometheus, manage Kubernetes clusters, and conduct post-mortems.',
                'progression': ['Junior DevOps', 'DevOps / SRE Engineer', 'Senior Site Reliability Engineer', 'Staff SRE', 'Head of Infrastructure'],
                'projects': [
                    {'title': 'Zero-Downtime GitOps Pipeline', 'description': 'Automated ArgoCD and GitHub Actions deployment with canary testing.'},
                    {'title': 'Global Distributed Prometheus Stack', 'description': 'Federated monitoring and alerting system managing 500+ microservice targets.'}
                ],
                'skills': [
                    ('linux-bash', True, 3, 2.6),
                    ('git', True, 3, 2.4),
                    ('docker', True, 3, 2.8),
                    ('kubernetes', True, 3, 3.0),
                    ('ci-cd', True, 3, 2.8),
                    ('cloud-platforms', True, 2, 2.2),
                    ('terraform', False, 2, 2.0),
                    ('system-design', False, 2, 1.8),
                    ('networking-protocols', False, 2, 1.8),
                ]
            },
            {
                'title': 'Cybersecurity Engineer',
                'slug': 'cybersecurity-engineer',
                'category': 'Cybersecurity',
                'salary': '$120,000 - $185,000',
                'demand': 'Explosive',
                'icon': 'Shield',
                'short': 'Defends mission-critical infrastructure against modern attack vectors through vulnerability research and SIEM monitoring.',
                'detailed': 'Cybersecurity Engineers secure networks, applications, and cloud environments against adversaries. You will conduct threat assessments, perform penetration tests, investigate security telemetry, and architect zero-trust perimeters.',
                'progression': ['Security Analyst', 'Cybersecurity Engineer', 'Senior Security Architect', 'Chief Information Security Officer (CISO)'],
                'projects': [
                    {'title': 'Automated Vulnerability Scanner', 'description': 'Custom script auditing microservice endpoints against OWASP API security risks.'},
                    {'title': 'SOC SIEM Threat Correlation Engine', 'description': 'Real-time alert aggregation correlating authentication anomalies with external IP blacklists.'}
                ],
                'skills': [
                    ('networking-protocols', True, 3, 3.0),
                    ('cryptography', True, 3, 2.8),
                    ('web-security', True, 3, 3.0),
                    ('penetration-testing', True, 2, 2.5),
                    ('siem-threat-intel', True, 2, 2.5),
                    ('linux-bash', True, 2, 2.0),
                    ('python', False, 2, 1.8),
                    ('cloud-platforms', False, 2, 1.6),
                ]
            },
            {
                'title': 'IoT & Embedded Systems Engineer',
                'slug': 'iot-engineer',
                'category': 'IoT Engineering',
                'salary': '$110,000 - $165,000',
                'demand': 'High',
                'icon': 'Cpu',
                'short': 'Programs low-power microcontrollers, sensory telemetry pipelines, and real-time embedded operating systems.',
                'detailed': 'IoT Engineers build connected physical devices. You will write deterministic C/C++ firmware, manage hardware interrupts, implement power-efficient sleep states, and stream telemetry over MQTT networks.',
                'progression': ['Embedded Firmware Junior', 'IoT Systems Engineer', 'Senior Embedded Engineer', 'Hardware Architecture Lead'],
                'projects': [
                    {'title': 'Solar-Powered Environmental Telemetry Node', 'description': 'ESP32 device collecting particulate metrics and publishing via MQTT over cellular modem.'},
                    {'title': 'RTOS Motor Controller', 'description': 'Deterministic FreeRTOS firmware regulating brushless motors with microsecond timing.'}
                ],
                'skills': [
                    ('c-cpp', True, 3, 3.0),
                    ('microcontrollers', True, 3, 2.8),
                    ('embedded-c', True, 3, 3.0),
                    ('iot-protocols', True, 2, 2.5),
                    ('rtos', True, 2, 2.5),
                    ('networking-protocols', False, 2, 1.8),
                    ('linux-bash', False, 1, 1.4),
                ]
            },
            {
                'title': 'UI/UX & Product Designer',
                'slug': 'ui-ux-designer',
                'category': 'UI/UX Design',
                'salary': '$95,000 - $155,000',
                'demand': 'High',
                'icon': 'Palette',
                'short': 'Crafts intuitive, accessible user experiences, cohesive design systems, and delightful digital interfaces.',
                'detailed': 'Product Designers blend empirical user research with visual polish. You will interview end-users, design responsive tokenized component libraries in Figma, test prototypes, and collaborate closely with frontend engineers.',
                'progression': ['Associate Designer', 'Product Designer', 'Senior UI/UX Designer', 'Lead Design Architect', 'Head of Design'],
                'projects': [
                    {'title': 'Fintech Mobile Design System', 'description': 'Atomic Figma library with 120+ dark-mode components and WCAG AA accessibility.'},
                    {'title': 'Healthcare Patient Portal Prototype', 'description': 'Interactive click-through prototype tested with 25 real clinical practitioners.'}
                ],
                'skills': [
                    ('user-research', True, 3, 2.8),
                    ('figma-design-systems', True, 3, 3.0),
                    ('interaction-design', True, 3, 2.8),
                    ('html5', False, 2, 1.8),
                    ('css3', False, 2, 1.8),
                    ('tailwind-css', False, 1, 1.4),
                ]
            },
            {
                'title': 'Software Engineer (Core)',
                'slug': 'software-engineer',
                'category': 'Software Engineering',
                'salary': '$115,000 - $175,000',
                'demand': 'Very High',
                'icon': 'Terminal',
                'short': 'Solves fundamental algorithmic problems, designs high-concurrency backend services, and builds resilient architectures.',
                'detailed': 'Core Software Engineers design maintainable software backbones. You will apply object-oriented design patterns, master algorithm complexity, manage transactional integrity, and optimize distributed services.',
                'progression': ['Software Engineer I', 'Software Engineer II', 'Senior Software Engineer', 'Staff Engineer', 'Principal Architect'],
                'projects': [
                    {'title': 'Distributed Key-Value Store', 'description': 'In-memory store featuring consistent hashing and write-ahead log replication.'},
                    {'title': 'High-Throughput Rate Limiting Proxy', 'description': 'Reverse proxy enforcing sliding window counters using Redis and Go.'}
                ],
                'skills': [
                    ('python', True, 3, 2.5),
                    ('sql', True, 3, 2.5),
                    ('rest-apis', True, 3, 2.5),
                    ('relational-db', True, 3, 2.5),
                    ('system-design', True, 3, 3.0),
                    ('git', True, 3, 2.0),
                    ('linux-bash', True, 2, 2.0),
                    ('docker', True, 2, 2.0),
                    ('microservices', False, 2, 2.2),
                    ('redis-caching', False, 2, 1.8),
                ]
            },
        ]

        careers_map = {}
        for c in careers_data:
            role_obj, _ = CareerRole.objects.get_or_create(
                slug=c['slug'],
                defaults={
                    'title': c['title'],
                    'category': c['category'],
                    'salary_range_usd': c['salary'],
                    'market_demand': c['demand'],
                    'icon_name': c['icon'],
                    'short_description': c['short'],
                    'detailed_description': c['detailed'],
                    'progression_opportunities': c['progression'],
                    'example_projects': c['projects']
                }
            )
            careers_map[c['slug']] = role_obj

            for s_slug, is_core, min_prof, weight in c['skills']:
                if s_slug in skills_map:
                    CareerRequiredSkill.objects.get_or_create(
                        career_role=role_obj,
                        skill=skills_map[s_slug],
                        defaults={'is_core': is_core, 'minimum_proficiency': min_prof, 'weight': weight}
                    )

        # 6. Demo User & Initial State
        demo_user, created = User.objects.get_or_create(
            username='demouser',
            defaults={
                'email': 'demo@skillgraph.io',
                'first_name': 'Alex',
                'last_name': 'Mercer',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            demo_user.set_password('DemoPassword123!')
            demo_user.save()

        # Update profile
        profile = demo_user.profile
        profile.headline = 'Aspiring AI & Full-Stack Systems Engineer'
        profile.bio = 'Passionate computer science student actively mastering modern web systems, distributed APIs, and retrieval-augmented AI agents.'
        profile.education_degree = 'B.S. in Computer Science & Artificial Intelligence'
        profile.education_institution = 'Stanford University (Online)'
        profile.experience_level = 'Intermediate'
        profile.career_interests = 'AI Engineering, Full-Stack Development, Cloud Systems'
        target_role = careers_map.get('ai-engineer')
        profile.target_career = target_role
        profile.save()

        # Add initial user skills for demouser (representing an authentic student journey)
        user_skills_init = [
            ('python', 3, 'DEMONSTRATED', 'Built automation tools and Django REST backends'),
            ('javascript', 3, 'DEMONSTRATED', 'Created dynamic SPAs and modern web client apps'),
            ('html5', 3, 'DEMONSTRATED', 'Accessible, semantic markup standards'),
            ('css3', 2, 'PRACTICED', 'Flexbox, CSS grid, and responsive mobile layouts'),
            ('tailwind-css', 2, 'PRACTICED', 'Used across multiple SaaS and side projects'),
            ('react', 2, 'PRACTICED', 'Interactive dashboard interfaces and state hooks'),
            ('sql', 2, 'PRACTICED', 'Complex joins, aggregations, and subqueries'),
            ('git', 3, 'DEMONSTRATED', 'Branching, PRs, and collaborative open-source flow'),
            ('rest-apis', 2, 'PRACTICED', 'Designed CRUD endpoints and JWT authentication'),
            ('numpy', 2, 'PRACTICED', 'Matrix operations and vector broadcasting'),
            ('pandas', 2, 'PRACTICED', 'Data cleaning, grouping, and CSV manipulations'),
            ('math-foundations', 2, 'PRACTICED', 'Linear algebra, matrix transforms, and calculus'),
            ('linux-bash', 2, 'PRACTICED', 'Daily terminal usage, shell pipelines, and SSH'),
        ]

        for s_slug, prof, stat, notes in user_skills_init:
            if s_slug in skills_map:
                UserSkill.objects.get_or_create(
                    user=demo_user,
                    skill=skills_map[s_slug],
                    defaults={'proficiency_level': prof, 'status': stat, 'notes': notes}
                )

        # Create sample project for demouser
        proj, _ = Project.objects.get_or_create(
            user=demo_user,
            title='Real-Time Distributed Chat & File Streamer',
            defaults={
                'description': 'Engineered a scalable messaging platform utilizing Python, Django REST Framework, WebSockets, and React. Built relational PostgreSQL models with Redis message brokering.',
                'technologies': ['Python', 'Django', 'React.js', 'PostgreSQL', 'Redis', 'Git', 'RESTful API Architecture'],
                'github_url': 'https://github.com/demouser/realtime-chat-streamer',
                'live_demo_url': 'https://chat-demo.skillgraph.io',
                'status': 'COMPLETED'
            }
        )

        for p_slug, rating, verified in [('python', 4, True), ('react', 3, True), ('django', 3, True), ('rest-apis', 4, True)]:
            if p_slug in skills_map:
                ProjectSkillEvidence.objects.get_or_create(
                    project=proj,
                    skill=skills_map[p_slug],
                    defaults={'strength_rating': rating, 'verified_by_nlp': verified, 'evidence_snippet': f'Demonstrated in {proj.title}'}
                )

        # Log sample activity
        UserActivity.objects.get_or_create(
            user=demo_user,
            action_type='CAREER_TARGET_SET',
            description='Set target career to AI Engineer',
            defaults={'metadata': {'career': 'AI Engineer'}}
        )
        UserActivity.objects.get_or_create(
            user=demo_user,
            action_type='PROJECT_ADDED',
            description=f'Added project: {proj.title}',
            defaults={'metadata': {'project_id': proj.id, 'title': proj.title}}
        )

        self.stdout.write(self.style.SUCCESS(
            f'Seeding successfully completed!\n'
            f'- Categories: {SkillCategory.objects.count()}\n'
            f'- Skills: {Skill.objects.count()}\n'
            f'- Dependencies: {SkillDependency.objects.count()}\n'
            f'- Career Roles: {CareerRole.objects.count()}\n'
            f'- Career Skills: {CareerRequiredSkill.objects.count()}\n'
            f'- Demo User: demouser / DemoPassword123!'
        ))

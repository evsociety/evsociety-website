import { ProgramConfig } from '../../../types/evto';

export const EVTO_PROGRAM_CONFIG: ProgramConfig = {
    id: "evto",
    title: "Certified Electric Vertical Technology Officer (EVTO™)",
    tagline: "The Gold Standard for Electric Vertical Technology Leadership",
    description: "The EVTO™ program is an executive-grade certification designed for engineering leaders, architects, and founders who want to master the end-to-end Electric Vertical (eVTOL) ecosystem. From battery dynamics to AI-driven operations, this program shapes the CTOs of the future.",
    roleDefinition: [
        "The Electric Vertical Technology Officer (EVTO) is a high-level strategic technologist responsible for the entire lifecycle of Electric Vertical (eVTOL) products and platforms.",
        "They bridge the gap between hardware engineering (battery, electric propulsion) and software intelligence (AI, cloud, data).",
        "They make high-stakes architectural decisions that impact safety, profitability, and user experience."
    ],
    responsibilities: [
        "Define and own the end-to-end Electric Vertical technology roadmap.",
        "Architect safe, scalable, and intelligent eVTOL platforms.",
        "Lead cross-functional teams across mechanical, electrical, and software domains.",
        "Ensure compliance with global aviation safety and certification standards (DGCA, EASA, FAA, ISO, IEC).",
        "Drive innovation in battery management, AI integration, and digital twins."
    ],
    pillars: [
        {
            id: "pillar0",
            title: "Eligibility & Prerequisites",
            themeQuestion: "How do you design a system that is sustainable, scalable, and commercially viable?",
            keyOutcomes: [
                "Mastery of eVTOL system-of-systems architecture.",
                "Ability to make trade-offs between cost, range, payload, and performance.",
                "Understanding of green energy principles and carbon footprint reduction."
            ],
            requiredArtifacts: [
                "Architectural Design Portfolio / Case Studies",
                "Green Leadership Statement"
            ],
            estimatedDuration: "2 Weeks"
        },
        {
            id: "pillar1",
            title: "Pillar 1 – Electric Vertical System Ownership",
            themeQuestion: "Do you truly own the engineering behind the aircraft?",
            keyOutcomes: [
                "Deep dive into electric propulsion selection and optimization.",
                "Airframe integration and flight dynamics.",
                "Safety critical systems and failure mode analysis."
            ],
            requiredArtifacts: [
                "Electric Vertical System Comparison Matrix",
                "Electric Vertical Architecture Review Document",
                "Safety Risk Register"
            ],
            estimatedDuration: "3 Weeks"
        },
        {
            id: "pillar2",
            title: "Pillar 2 – AI & Digital Intelligence",
            themeQuestion: "How do you transform an aircraft into an intelligent agent?",
            keyOutcomes: [
                "Integrating AI/ML for predictive maintenance and range estimation.",
                "Digital Twin implementation for fleet monitoring.",
                "Cloud-native architectures for connected aircraft fleets."
            ],
            requiredArtifacts: [
                "AI vs Rule-based Decision Map",
                "AI System Architecture for Electric Vertical Ops",
                "RAG + Agent Flow Design"
            ],
            estimatedDuration: "3 Weeks"
        },
        {
            id: "pillar3",
            title: "Pillar 3 – Electric Vertical Battery",
            themeQuestion: "Is the heart of your eVTOL safe and efficient?",
            keyOutcomes: [
                "Cell chemistry selection and pack design.",
                "BMS algorithms and thermal management strategies.",
                "Battery lifecycle management and second-life applications."
            ],
            requiredArtifacts: [
                "Battery Safety Decision Checklist",
                "Thermal Runaway Prevention Framework",
                "Battery Aadhaar Lifecycle Map"
            ],
            estimatedDuration: "4 Weeks"
        },
        {
            id: "pillar4",
            title: "Pillar 4 – CTO Grade System",
            themeQuestion: "Can you build an organization that builds eVTOL aircraft?",
            keyOutcomes: [
                "Setting up engineering processes and quality gates.",
                "Supply chain strategy and component sourcing.",
                "Regulatory compliance and type-certification roadmap."
            ],
            requiredArtifacts: [
                "End-to-End Electric Vertical Platform Architecture",
                "Architecture Decision Records (ADR)",
                "Risk & Compliance Mapping"
            ],
            estimatedDuration: "3 Weeks"
        },
        {
            id: "pillar5",
            title: "Pillar 5 – Business Magnate",
            themeQuestion: "Can you turn technology into a market-dominating business?",
            keyOutcomes: [
                "Developing a profitable Electric Vertical business model.",
                "Go-to-market strategies for air taxi, cargo, and emergency-response segments.",
                "Investment planning and ROI analysis."
            ],
            requiredArtifacts: [
                "Electric Vertical Business Model Canvas",
                "Platform Dominance Strategy",
                "10-Year Technology Roadmap"
            ],
            estimatedDuration: "2 Weeks"
        }
    ],
    capstone: {
        mandatoryNote: "The Capstone project is the final gate for certification. It requires synthesizing knowledge from all pillars into a cohesive, defense-grade solution.",
        topics: [
            "AI-driven Electric Vertical Battery Safety System",
            "Next-Gen Urban Air Mobility Platform",
            "Autonomous eVTOL Cargo Fleet Architecture"
        ],
        deliverables: [
            "Capstone Proposal",
            "System Architecture + Diagrams",
            "AI Integration Plan",
            "Business & Scaling Roadmap"
        ],
        evaluationCriteria: [
            "Technical Depth & Feasibility",
            "Innovation & Originality",
            "Business Viability",
            "Clarity of Presentation"
        ]
    },
    eligibility: {
        requirements: [
            "Proven experience in architectural design (Software, Hardware, or Systems).",
            "Demonstrated managerial or technical leadership experience.",
            "Passion for the Electric Vertical (eVTOL) ecosystem."
        ],
        note: "More eligibility criteria will be added later. Admission is selective."
    },
    certificationCriteria: [
        "Completion of all 5 Pillars and associated artifacts.",
        "Successful submission and defense of the Capstone project.",
        "Review and approval by the EV Society certification board."
    ],
    tracks: [
        {
            name: "Executive Track",
            duration: "6 Months",
            targetAudience: "CTOs, VPs, and Founders looking to sharpen their strategic edge."
        },
        {
            name: "Professional Track",
            duration: "9 Months",
            targetAudience: "Senior Engineers and Architects transitioning into leadership roles."
        },
        {
            name: "Fellowship Track",
            duration: "12 Months",
            targetAudience: "Researchers and Academics focusing on deep-tech innovation."
        }
    ],
    pdfUrl: "/programs/EVTO/Certified%20EV%20Technology%20Officer%20(EVTO%E2%84%A2).pdf",
    pdfName: "Certified EV Technology Officer (EVTO™).pdf",
    pdfLastUpdated: "2026-01"
};

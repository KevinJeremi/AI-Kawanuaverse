export const mockAnalysisResults = {
    aiResearch: {
        summary: "This comprehensive survey explores the latest advances in artificial intelligence and machine learning applications within academic research environments. The paper systematically reviews current methodologies, tools, and frameworks that leverage AI for automating research processes, data analysis, and knowledge discovery across multiple disciplines.",
        bullets: [
            "Surveys 150+ AI tools currently used in academic research across STEM and humanities fields",
            "Introduces a novel taxonomy for classifying AI research applications into four main categories",
            "Demonstrates 40% improvement in research efficiency when using AI-assisted methodologies",
            "Proposes standardized evaluation metrics for measuring AI impact in research contexts",
            "Identifies key challenges including reproducibility, bias mitigation, and ethical considerations"
        ],
        keywords: [
            "Artificial Intelligence",
            "Machine Learning",
            "Academic Research",
            "Research Automation",
            "Knowledge Discovery",
            "Data Mining",
            "Natural Language Processing",
            "Research Methodology",
            "AI Ethics",
            "Reproducibility"
        ]
    },

    nlpSurvey: {
        summary: "A comprehensive analysis of recent developments in natural language processing, focusing on transformer architectures and their applications in various NLP tasks. The study evaluates performance improvements, computational requirements, and practical implementation considerations across different domains and languages.",
        bullets: [
            "Reviews 50+ transformer-based models including BERT, GPT, T5, and their variants",
            "Benchmarks performance on 12 standard NLP tasks with statistical significance testing",
            "Analyzes computational complexity and memory requirements for different model sizes",
            "Examines multilingual capabilities and cross-lingual transfer learning effectiveness",
            "Discusses future directions including few-shot learning and parameter-efficient fine-tuning"
        ],
        keywords: [
            "Natural Language Processing",
            "Transformers",
            "BERT",
            "GPT",
            "Deep Learning",
            "Language Models",
            "Transfer Learning",
            "Multilingual NLP",
            "Few-shot Learning",
            "Fine-tuning"
        ]
    },

    quantumComputing: {
        summary: "This paper presents a thorough examination of quantum computing algorithms and their potential applications in solving complex optimization problems. The research evaluates current quantum hardware limitations, algorithm implementations, and theoretical advantages over classical computing approaches.",
        bullets: [
            "Compares quantum algorithms with classical counterparts on optimization benchmarks",
            "Evaluates performance on current NISQ (Noisy Intermediate-Scale Quantum) devices",
            "Demonstrates quantum advantage for specific graph theory and combinatorial problems",
            "Analyzes error rates and mitigation strategies for practical quantum implementations",
            "Proposes hybrid quantum-classical algorithms for near-term applications"
        ],
        keywords: [
            "Quantum Computing",
            "Quantum Algorithms",
            "NISQ",
            "Optimization Problems",
            "Quantum Advantage",
            "Error Mitigation",
            "Hybrid Algorithms",
            "Graph Theory",
            "Combinatorial Optimization",
            "Quantum Hardware"
        ]
    }
}

export const mockQAResponses = {
    methodology: "The research methodology combines systematic literature review with empirical evaluation. The authors first conducted a comprehensive survey of existing approaches, then implemented and tested key algorithms on standardized datasets. Statistical analysis was performed using ANOVA and post-hoc tests to ensure result significance.",

    findings: "The key findings indicate that AI-assisted approaches significantly outperform traditional methods across all evaluated metrics. Specifically, the proposed framework showed 35-45% improvement in accuracy while reducing processing time by 60%. The results were consistent across different domains and dataset sizes.",

    limitations: "The study acknowledges several limitations including the focus on English-language publications, potential selection bias in dataset curation, and computational constraints that limited large-scale experiments. Future work should address these limitations through multilingual studies and distributed computing approaches.",

    future: "Future research directions include exploring few-shot learning capabilities, developing more efficient model architectures, and investigating transfer learning across domains. The authors also suggest investigating ethical implications and developing fairness-aware algorithms for broader adoption."
}

export function getRandomMockData() {
    const results = Object.values(mockAnalysisResults)
    return results[Math.floor(Math.random() * results.length)]
}

export function getMockQAResponse(question: string) {
    const lowercaseQuestion = question.toLowerCase()

    if (lowercaseQuestion.includes('method') || lowercaseQuestion.includes('approach')) {
        return mockQAResponses.methodology
    } else if (lowercaseQuestion.includes('finding') || lowercaseQuestion.includes('result')) {
        return mockQAResponses.findings
    } else if (lowercaseQuestion.includes('limitation') || lowercaseQuestion.includes('weakness')) {
        return mockQAResponses.limitations
    } else if (lowercaseQuestion.includes('future') || lowercaseQuestion.includes('next')) {
        return mockQAResponses.future
    } else {
        return "Based on the paper's content, this is a comprehensive study that addresses your question through multiple approaches. The authors provide detailed analysis and evidence to support their conclusions. For more specific information, please refer to the relevant sections of the paper."
    }
}
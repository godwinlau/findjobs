const SECTION_KEYWORDS = [
    "responsibilities",
    "skills",
    "requirements",
    "qualifications",
    "experience",
    "what you need",
    "about the role",
    "competencies",
];

function extractCandidateLines(text) {
    const lines = text.split(/\n+/);
    const candidates = [];
    let isRelevantSection = false;

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        const lower = line.toLowerCase();

        // Section header detection
        const isHeader =
            SECTION_KEYWORDS.some(
                (kw) => lower.includes(kw) && lower.length < 80
            ) && !/[.:]/.test(lower);

        if (isHeader) {
            isRelevantSection = true;
            console.log(`[DEBUG] Found Header: "${line}"`);
            continue;
        }

        const isBullet = /^[-•*>]/.test(line);

        if (isRelevantSection) {
            if (isBullet || line.length > 20) {
                console.log(`[DEBUG] Kept Candidate: "${line.substring(0, 30)}..." (Bullet: ${isBullet}, Len: ${line.length})`);
                candidates.push(line.replace(/^[-•*>\s]+/, "").trim());
            } else {
                console.log(`[DEBUG] Dropped (Short/NoBullet): "${line}"`);
            }
        } else {
            // console.log(`[DEBUG] Skipped (Not Relevant Section): "${line.substring(0, 30)}..."`);
        }
    }

    if (candidates.length === 0) return lines.map((l) => l.trim()).filter(Boolean);

    return candidates;
}

const SOFT_SKILLS_MAP = {
    "self starter": "Self Starter",
    "problem solving": "Problem Solving",
};

function extractSoftSkillsRegex(text) {
    const found = new Set();
    const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, " ");
    console.log(`[DEBUG] Normalized Text Snippet: "${normalizedText.substring(normalizedText.length - 200)}"`); // Show end where skills are

    for (const [key, label] of Object.entries(SOFT_SKILLS_MAP)) {
        const keyPattern = key.toLowerCase().replace(/[^\w\s]/g, " ");
        const pattern = new RegExp(`\\b${keyPattern}\\b`, "i");
        if (pattern.test(normalizedText)) {
            console.log(`[DEBUG] MATCHED: ${key}`);
            found.add(label);
        } else {
            console.log(`[DEBUG] FAILED: ${key}`);
        }
    }
    return Array.from(found);
}

const text = `
About the Role
Senior Product Manager Pharmaceutical/Consumer Health/Consumer Goods

We are looking for an ambitious Senior Product Manager to take full charge of a key portfolio in our client’s Philippines organization.

In this role, we give you the space to truly take ownership and act as the lead architect for your products’ market journey. We need someone who has spent time in the field winning over customers (Sales) and time in the office building winning strategies (Marketing). If you love the challenge of managing multiple brands and want a role where your results truly show, this is for you!

As the Senior Product Manager, you are the person responsible for the growth and "health" of your brands.

Your responsibilities
Strategy & Growth
Create smart short-term and long-term plans to grow your products.
Take care of the budget. You’ll find ways to increase sales while keeping costs in check to maximize profit.
Work closely with the supply chain to make sure products are always in stock and priced correctly for the market.
Marketing & Communication
Lead the way in introducing new products or updated versions to the market.
Create the brochures, posters, and digital tools that help the sales team win.
You are the link between the office and the field. You’ll explain the strategy clearly so the sales team knows exactly how to beat the competition.
Building Relationships
Connect with industry experts and "Key Opinion Leaders" to build trust in our brands.
Talk regularly to distributors and customers. You need to know exactly what they need before they even ask for it.
We need a "people person" who is also great with data. You should be someone who fits in well with the team but can also work independently to get things done.

Your Experience
A university degree in Business, Marketing, or a Science-related field.
10 years of working experience with at least 2 years of experience in Sales, plus at least 3 years in Marketing.
You should have experience managing multiple brands at once and a clear history of hitting your targets.
Your Skills
Self-Starter: You don’t need someone watching over your shoulder. You see what needs to be done and you do it.
Great Communicator: You can explain complex ideas in a way that is easy to understand and exciting to hear.
Problem Solver: When things change fast, you stay calm and find a solution.
If you are excited about product management and ready to take the next big step in your career, we would like to hear from you.
`;

console.log("--- DEBUG START ---");
const candidates = extractCandidateLines(text);
const relevantText = candidates.join("\n").substring(0, 2000);
console.log(`[DEBUG] Relevant Text Length: ${relevantText.length}`);
const skills = extractSoftSkillsRegex(relevantText);
console.log("Extracted:", skills);

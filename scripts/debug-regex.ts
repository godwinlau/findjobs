import { extractRelevantLines } from '../lib/skills/skills_extraction';

const text = `We are looking for a Senior Software Engineer with experience in React, Node.js, and TypeScript.
You should be familiar with AWS, Docker, and Kubernetes.
Strong communication skills and leadership ability are required.
Experience with Python and machine learning is a plus.
We also use Jira and Confluence.
Looking for someone who knows their way around a Linux terminal.`;

const lines = extractRelevantLines(text);
console.log("Relevant lines returned:");
lines.forEach((l, i) => console.log(`  ${i}: "${l}"`));

// Quick debug script to check CI/CD extraction
const text = "Experience with CI/CD pipelines for mobile builds is a plus";

const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, " ");
console.log("Normalized text:", normalizedText);

const pattern = new RegExp(`\\bci cd\\b`, "i");
console.log("Pattern test:", pattern.test(normalizedText));

const match = normalizedText.match(/ci\s+cd/);
console.log("Match result:", match);

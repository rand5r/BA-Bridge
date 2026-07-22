import { Router } from "express";
import OpenAI from "openai";

const router = Router();

router.post("/generate-tbrd", async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OPENROUTER_API_KEY is not configured." });
    return;
  }

  const {
    projectName,
    projectDescription,
    businessGoals,
    stakeholders,
    functionalRequirements,
    nonFunctionalRequirements,
    businessRules,
    notes,
    lang,
  } = req.body;

  if (!projectName || !projectDescription) {
    res.status(400).json({ error: "projectName and projectDescription are required." });
    return;
  }

  const isArabic = lang === "ar";

  const langInstruction = isArabic
    ? "IMPORTANT: Write ALL text values in Arabic. Use Arabic numerals where appropriate. Keep JSON keys in English exactly as specified."
    : "Write all text values in English.";

  const exampleUserStory = isArabic
    ? "بصفتي [دور]، أريد أن [إجراء]، حتى أتمكن من [فائدة]."
    : "As a [role], I want to [action], so that [benefit].";

  const exampleAcceptanceCriteria = isArabic
    ? "بالنظر إلى [سياق]، عندما [إجراء]، إذن [نتيجة]."
    : "Given [context], when [action], then [outcome].";

  const prompt = `You are a senior software architect and business analyst. Analyze the following Business Requirements Document (BRD) and generate a comprehensive Technical BRD.

${langInstruction}

BRD INPUT:
- Project Name: ${projectName}
- Project Description: ${projectDescription}
- Business Goals: ${businessGoals || "Not specified"}
- Stakeholders: ${stakeholders || "Not specified"}
- Functional Requirements: ${functionalRequirements || "Not specified"}
- Non-Functional Requirements: ${nonFunctionalRequirements || "Not specified"}
- Business Rules: ${businessRules || "Not specified"}
- Notes: ${notes || "None"}

Return ONLY a valid JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "missingRequirements": ["list of identified gaps or missing requirements from the BRD"],
  "recommendations": ["list of technical recommendations based on the BRD"],
  "technicalOverview": "2-3 paragraph technical overview of the system architecture",
  "functionalSpecification": [
    { "module": "module name", "description": "what it does", "details": ["key detail 1", "key detail 2"] }
  ],
  "nonFunctionalSpecification": [
    { "category": "e.g. Performance", "requirement": "specific requirement", "metric": "measurable target" }
  ],
  "databaseTables": [
    { "name": "table_name", "description": "what it stores", "fields": "id, field1, field2, created_at" }
  ],
  "apis": [
    { "method": "GET|POST|PUT|DELETE|PATCH", "endpoint": "/api/v1/resource", "description": "what it does" }
  ],
  "userStories": [
    { "epic": "epic name", "stories": ["${exampleUserStory}"] }
  ],
  "acceptanceCriteria": [
    { "feature": "feature name", "criteria": ["${exampleAcceptanceCriteria}"] }
  ]
}`;

  try {
    const openai = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content ?? "";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      res.status(422).json({ error: "AI returned invalid JSON.", raw: text });
      return;
    }

    res.json({ success: true, data: parsed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: `OpenRouter API error: ${message}` });
  }
});

export default router;

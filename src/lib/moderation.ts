/**
 * Integration with Google's Perspective API for content moderation.
 * Helps prevent spam, profanity, and harassment on the platform.
 */
export async function checkContentSafety(text: string): Promise<{ isSafe: boolean; reason?: string }> {
  if (!text || text.trim().length === 0) return { isSafe: true };
  
  const API_KEY = import.meta.env.VITE_PERSPECTIVE_API_KEY;
  if (!API_KEY) {
    console.warn("VITE_PERSPECTIVE_API_KEY is not set. Skipping content moderation.");
    return { isSafe: true };
  }

  try {
    const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comment: { text },
        languages: ["en"], // Can expand to multiple languages if needed
        requestedAttributes: {
          TOXICITY: {},
          SEVERE_TOXICITY: {},
          PROFANITY: {},
          SPAM: {},
        }
      })
    });

    if (!response.ok) {
      console.error("Perspective API returned an error:", await response.text());
      return { isSafe: true }; // Fail open to not block users if API fails
    }

    const data = await response.json();
    const scores = {
      toxicity: data.attributeScores?.TOXICITY?.summaryScore?.value || 0,
      profanity: data.attributeScores?.PROFANITY?.summaryScore?.value || 0,
      spam: data.attributeScores?.SPAM?.summaryScore?.value || 0,
    };

    // Thresholds (0 to 1, higher is worse)
    if (scores.toxicity > 0.75) return { isSafe: false, reason: "Content flagged as toxic or harassing." };
    if (scores.profanity > 0.70) return { isSafe: false, reason: "Content flagged for profanity." };
    if (scores.spam > 0.70) return { isSafe: false, reason: "Content flagged as spam." };

    return { isSafe: true };
  } catch (error) {
    console.error("Moderation check failed:", error);
    return { isSafe: true }; // Fail open
  }
}

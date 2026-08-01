/**
 * Integration with Google's Perspective API for content moderation.
 * Helps prevent spam, profanity, and harassment on the platform.
 */

export const PROFANITY_WORDS = [
  // Add common english and telugu profanity words / spam markers
  "spam", "scam", "click here", "free money", "lottery",
  "fuck", "shit", "bitch", "asshole", "dick",
  "lathkor", "lanja", "na kodaka", "erri", "puku",
];

export async function checkContentSafety(text: string): Promise<{ isSafe: boolean; reason?: string }> {
  if (!text || text.trim().length === 0) return { isSafe: true };
  
  // 1. First run a local check (super fast and covers basic bad words)
  const normalized = text.toLowerCase().replace(/[^\w\s\u0C00-\u0C7F]/gi, ""); // Remove punctuation, keep english & telugu
  const words = normalized.split(/\s+/);
  
  for (const word of words) {
    if (PROFANITY_WORDS.some(bad => word.includes(bad) || normalized.includes(bad))) {
      return { isSafe: false, reason: "Inappropriate language or spam detected." };
    }
  }

  // Check for repeated character spam (e.g. "aaaaaaa")
  if (/(.)\1{5,}/.test(text)) {
    return { isSafe: false, reason: "Excessive repeated characters detected (spam)." };
  }

  // 2. Then try Perspective API
  const API_KEY = import.meta.env.VITE_PERSPECTIVE_API_KEY;
  if (!API_KEY) {
    console.warn("VITE_PERSPECTIVE_API_KEY is not set. Falling back to local moderation only.");
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

// Simple local storage rate limiter for client-side
export function checkRateLimit(action: string, limitCount: number, timeWindowMs: number): boolean {
  if (typeof window === "undefined") return true;
  try {
    const key = `ratelimit_${action}`;
    const now = Date.now();
    const historyStr = localStorage.getItem(key);
    let history: number[] = historyStr ? JSON.parse(historyStr) : [];
    
    // Filter history to only include timestamps within the timeWindowMs
    history = history.filter(time => now - time < timeWindowMs);
    
    if (history.length >= limitCount) {
      return false; // Rate limit exceeded
    }
    
    // Add current action timestamp
    history.push(now);
    localStorage.setItem(key, JSON.stringify(history));
    return true; // Allowed
  } catch (err) {
    console.error("Rate limit check failed, allowing by default", err);
    return true;
  }
}

/**
 * Moderation, Profanity, and Spam Detection Engine for ManaOoru
 */

const BANNED_TERMS = [
  // Profanity & Offensive Terms (English & Telugu Transliterated)
  "fuck", "shit", "bitch", "bastard", "asshole", "idiot", "stupid", "scam",
  "dengu", "lanja", "pooku", "modda", "laddoke", "khoja", "gand", "madarchod",
  "bhenchod", "chutiya", "harami", "raand", "kasai", "fraud", "scammer", "porn",
  "sex", "gambling", "casino", "betting", "lottery winner", "free money",
];

const SPAM_PATTERNS = [
  /\b(?:https?:\/\/|www\.)[^\s]+\b/gi, // Unapproved external links
  /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Aggressive phone spam patterns if repeated
  /(.)\1{6,}/gi, // Character spam (e.g., "hhhhhhh", "aaaaaaa")
];

export interface ContentCheckResult {
  isClean: boolean;
  reason?: string;
}

/**
 * Checks text content for profanity, hate speech, and spam patterns.
 */
export function checkContentSpam(text: string): ContentCheckResult {
  if (!text || !text.trim()) {
    return { isClean: true };
  }

  const normalized = text.toLowerCase().trim();

  // 1. Profanity check
  for (const word of BANNED_TERMS) {
    // Regex for word boundary matching
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(normalized)) {
      return {
        isClean: false,
        reason: `Please remove inappropriate language ("${word}") before posting.`,
      };
    }
  }

  // 2. Character spam check
  if (/(.)\1{7,}/gi.test(normalized)) {
    return {
      isClean: false,
      reason: "Your post contains excessive repeated characters.",
    };
  }

  return { isClean: true };
}

/**
 * Memory cache for recent submissions to prevent duplicate double-clicks
 */
const recentSubmissions = new Map<string, number>();

export function isDuplicateSubmission(userId: string, content: string): boolean {
  const key = `${userId}:${content.trim().toLowerCase()}`;
  const now = Date.now();
  const lastTime = recentSubmissions.get(key);

  if (lastTime && now - lastTime < 10000) { // 10 seconds duplicate window
    return true;
  }

  recentSubmissions.set(key, now);
  
  // Cleanup old items
  if (recentSubmissions.size > 100) {
    const oldestKey = recentSubmissions.keys().next().value;
    if (oldestKey) recentSubmissions.delete(oldestKey);
  }

  return false;
}

import admin from "firebase-admin";

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      console.log("[FCM Server] Initializing Firebase Admin with FIREBASE_SERVICE_ACCOUNT JSON env");
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error("[FCM Server] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON env:", e);
    }
  }

  if (privateKey && clientEmail && projectId) {
    try {
      console.log("[FCM Server] Initializing Firebase Admin with individual credentials env");
      const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
      });
    } catch (e) {
      console.error("[FCM Server] Failed to initialize Firebase Admin with individual credentials:", e);
    }
  }

  // Fallback to Application Default Credentials
  try {
    console.log("[FCM Server] Attempting fallback to Application Default Credentials");
    return admin.initializeApp();
  } catch (e) {
    console.warn(
      "[FCM Server] Firebase Admin could not be initialized (missing FIREBASE_SERVICE_ACCOUNT or credentials). FCM push notifications will be disabled."
    );
    return null;
  }
}

export async function sendFcmNotification(
  tokens: string[],
  payload: {
    title: string;
    body: string;
    url?: string;
    tag?: string;
    notificationId?: string;
  }
) {
  console.log("[FCM Server] Preparing FCM push notification:", payload);
  console.log("[FCM Server] Token count:", tokens.length);

  const cleanTokens = tokens.filter(Boolean);
  if (cleanTokens.length === 0) {
    console.warn("[FCM Server] No tokens provided; skipping notification.");
    return { attempted: 0, sent: 0, failed: 0, failedTokens: [] };
  }

  const app = initializeFirebaseAdmin();
  if (!app) {
    console.warn("[FCM Server] Firebase Admin not initialized. Skipping notification.");
    return { attempted: cleanTokens.length, sent: 0, failed: cleanTokens.length, failedTokens: [] };
  }

  try {
    const response = await admin.messaging(app).sendEachForMulticast({
      tokens: cleanTokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        url: payload.url || "/",
        tag: payload.tag || "",
        notificationId: payload.notificationId || "",
      },
      webpush: {
        notification: {
          title: payload.title,
          body: payload.body,
          icon: "/site-icon.svg",
          badge: "/notification-badge.svg",
          tag: payload.tag || "",
          renotify: true,
          vibrate: [200, 100, 200],
          data: {
            url: payload.url || "/",
          },
        },
        fcmOptions: {
          link: payload.url || "/",
        },
      },
    });

    console.log(
      `[FCM Server] FCM delivery result: ${response.successCount} success, ${response.failureCount} failure`
    );

    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const error = resp.error;
        console.error(`[FCM Server] Error sending to token index ${idx} (${cleanTokens[idx]}):`, error);
        if (
          error &&
          (error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered")
        ) {
          failedTokens.push(cleanTokens[idx]);
        }
      }
    });

    return {
      attempted: cleanTokens.length,
      sent: response.successCount,
      failed: response.failureCount,
      failedTokens,
    };
  } catch (error) {
    console.error("[FCM Server] Critical error in FCM sending:", error);
    return {
      attempted: cleanTokens.length,
      sent: 0,
      failed: cleanTokens.length,
      failedTokens: [],
    };
  }
}

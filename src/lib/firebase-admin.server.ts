import admin from "firebase-admin";

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID;

  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);

      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error(
        "[FCM Server] Failed to parse FIREBASE_SERVICE_ACCOUNT:",
        e,
      );
    }
  }

  if (privateKey && clientEmail && projectId) {
    try {
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
    } catch (e) {
      console.error(
        "[FCM Server] Failed to initialize Firebase Admin:",
        e,
      );
    }
  }

  try {
    return admin.initializeApp();
  } catch {
    console.warn(
      "[FCM Server] Firebase Admin credentials not configured. Push notifications are disabled.",
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
  },
) {
  const cleanTokens = tokens.filter(Boolean);

  if (cleanTokens.length === 0) {
    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      failedTokens: [],
    };
  }

  const app = initializeFirebaseAdmin();

  if (!app) {
    return {
      attempted: cleanTokens.length,
      sent: 0,
      failed: cleanTokens.length,
      failedTokens: [],
    };
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

    const failedTokens: string[] = [];

    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error) {
        if (
          resp.error.code ===
            "messaging/invalid-registration-token" ||
          resp.error.code ===
            "messaging/registration-token-not-registered"
        ) {
          failedTokens.push(cleanTokens[idx]);
        }

        console.error(
          `[FCM Server] Failed to send notification to token ${idx}:`,
          resp.error.message,
        );
      }
    });

    return {
      attempted: cleanTokens.length,
      sent: response.successCount,
      failed: response.failureCount,
      failedTokens,
    };
  } catch (error) {
    console.error("[FCM Server] Failed to send notifications:", error);

    return {
      attempted: cleanTokens.length,
      sent: 0,
      failed: cleanTokens.length,
      failedTokens: [],
    };
  }
}
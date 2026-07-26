/**
 * PWA & Browser Push Notification Service
 * Manages browser notification permissions and triggers local push notifications for reminders, orders, and appointments.
 */

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.warn("Tarayıcı bildirimleri desteklemiyor.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function sendLocalNotification(title, body, icon = "/pwa-192x192.png") {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    console.log("Bildirim izni yok:", title, body);
    return;
  }

  try {
    const options = {
      body: body,
      icon: icon,
      badge: icon,
      vibrate: [100, 50, 100],
      data: { dateOfArrival: Date.now() },
    };

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  } catch (err) {
    console.error("Local notification error:", err);
  }
}

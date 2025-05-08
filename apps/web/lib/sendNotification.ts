export async function sendNotification({
  title,
  message,
  url,
  externalUserIds,
}: {
  title: string
  message: string
  url?: string
  externalUserIds?: string[]
}) {
  const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID!
  const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY!

  const body: any = {
    app_id: ONESIGNAL_APP_ID,
    headings: { en: title },
    contents: { en: message },
    url,
  }

  if (externalUserIds && externalUserIds.length > 0) {
    body.include_external_user_ids = externalUserIds
  } else {
    body.included_segments = ["Admins"] // fallback general
  }

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        Authorization: `Basic ${ONESIGNAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("❌ Error al enviar notificación:", result.errors || result)
      throw new Error("Error al enviar notificación.")
    }

    console.log("🔔 Notificación enviada con éxito:", result)
    return result
  } catch (error) {
    console.error("❌ Fallo al enviar notificación:", error)
    throw error
  }
}

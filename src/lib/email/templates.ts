export function getLandingPageUrl(campaignId: string, baseUrl?: string, recipientId?: string): string {
  const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const url = new URL(`/lp/${campaignId}`, appUrl)
  if (recipientId) {
    url.searchParams.set('rid', recipientId)
  }
  return url.toString()
}

export function getTrackingPixelUrl(campaignId: string, recipientId: string, baseUrl?: string): string {
  const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${appUrl}/api/events/track?campaign=${campaignId}&recipient=${recipientId}&type=OPEN`
}

interface PhishingEmailOptions {
  campaignId: string
  recipientId: string
  recipientName?: string | null
  landingUrl?: string
  trackingPixelUrl?: string
  baseUrl?: string
  messageOverride?: string
}

export function generatePhishingEmail(options: PhishingEmailOptions): string {
  const {
    campaignId,
    recipientId,
    recipientName,
    landingUrl,
    trackingPixelUrl,
    baseUrl,
    messageOverride,
  } = options

  const resolvedLandingUrl = landingUrl || getLandingPageUrl(campaignId, baseUrl, recipientId)
  const trackingPixel = trackingPixelUrl || getTrackingPixelUrl(campaignId, recipientId, baseUrl)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Action Required</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${recipientName || 'Valued Customer'},</p>
    
    <p>${messageOverride || 'We have detected unusual activity on your account. For your security, please verify your account information immediately.'}</p>
    
    <p>Click the button below to verify your account:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resolvedLandingUrl}" 
         style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Verify Account Now
      </a>
    </div>
    
    <p style="font-size: 12px; color: #666; margin-top: 30px;">
      If you did not request this verification, please ignore this email or contact our support team.
    </p>
    
    <p style="font-size: 12px; color: #666;">
      This is a simulated phishing email for educational purposes. Please report suspicious emails to your security team.
    </p>
  </div>
  
  <img src="${trackingPixel}" width="1" height="1" style="display: none;" alt="" />
</body>
</html>
  `.trim()
}

import { createServiceClient } from '@/lib/supabase/service'
import { createTransporter } from './transporter'
import {
  generatePhishingEmail,
  getLandingPageUrl,
  getTrackingPixelUrl,
} from './templates'
import {
  getUrlScanResult,
  submitUrlForScan,
  isHighRiskVerdict,
  type VirusTotalScanResult,
} from '@/lib/security/virus-total'

export interface SendCampaignEmailsOptions {
  campaignId: string
  subject?: string
  recipientIds?: string[]
  messageOverride?: string
}

export interface CampaignEmailResult {
  recipientId: string
  email: string
  status: 'sent' | 'blocked' | 'failed'
  error?: string
  scan?: VirusTotalScanResult | null
}

export async function sendCampaignEmails(
  options: SendCampaignEmailsOptions
): Promise<CampaignEmailResult[]> {
  const { campaignId, subject, recipientIds, messageOverride } = options

  const supabase = createServiceClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL

  const [{ data: campaign, error: campaignError }, { data: recipients, error: recipientsError }] =
    await Promise.all([
      supabase.from('campaigns').select('*').eq('id', campaignId).single(),
      supabase
        .from('recipients')
        .select('*')
        .eq('campaign_id', campaignId)
        .in('id', recipientIds && recipientIds.length > 0 ? recipientIds : undefined),
    ])

  if (campaignError) {
    throw new Error(campaignError.message)
  }
  if (recipientsError) {
    throw new Error(recipientsError.message)
  }

  const transporter = createTransporter()
  const from = process.env.SMTP_FROM || 'CyberMirror <no-reply@cybermirror.local>'
  const resolvedSubject = subject || `${campaign.title} - Security Verification`

  const results: CampaignEmailResult[] = []

  for (const recipient of recipients ?? []) {
    const landingUrl = getLandingPageUrl(campaign.id, baseUrl, recipient.id)
    const trackingPixel = getTrackingPixelUrl(campaign.id, recipient.id, baseUrl)

    let scanResult: VirusTotalScanResult | null = null
    try {
      scanResult = await getUrlScanResult(landingUrl)
      if (!scanResult || scanResult.status !== 'completed') {
        scanResult = await submitUrlForScan(landingUrl)
      }

      if (scanResult) {
        await supabase
          .from('link_scans')
          .upsert(
            {
              campaign_id: campaign.id,
              url: landingUrl,
              scan_id: scanResult.id,
              status: scanResult.status,
              risk_label: scanResult.verdict,
              details: scanResult,
            },
            { onConflict: 'campaign_id,url' }
          )
      }
    } catch (scanError) {
      console.error('VirusTotal scan failed:', scanError)
    }

    const blocked = isHighRiskVerdict(scanResult)

    if (blocked) {
      results.push({
        recipientId: recipient.id,
        email: recipient.email,
        status: 'blocked',
        scan: scanResult,
        error: 'Link flagged as high risk by VirusTotal',
      })

      await supabase.from('email_logs').insert({
        campaign_id: campaign.id,
        recipient_id: recipient.id,
        status: 'blocked',
        error: 'VirusTotal marked landing URL as suspicious/malicious',
        meta: { scan: scanResult },
      })

      continue
    }

    try {
      const html = generatePhishingEmail({
        campaignId: campaign.id,
        recipientId: recipient.id,
        recipientName: recipient.name,
        landingUrl,
        trackingPixelUrl: trackingPixel,
        messageOverride,
      })

      await transporter.sendMail({
        to: recipient.email,
        from,
        subject: resolvedSubject,
        html,
        headers: {
          'X-Campaign-ID': campaign.id,
          'X-Training': 'CyberMirror',
        },
      })

      await supabase.from('email_logs').insert({
        campaign_id: campaign.id,
        recipient_id: recipient.id,
        status: 'sent',
        subject: resolvedSubject,
        meta: {
          scan: scanResult,
        },
      })

      results.push({
        recipientId: recipient.id,
        email: recipient.email,
        status: 'sent',
        scan: scanResult,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Failed to send email to ${recipient.email}`, error)

      await supabase.from('email_logs').insert({
        campaign_id: campaign.id,
        recipient_id: recipient.id,
        status: 'failed',
        subject: resolvedSubject,
        error: message,
        meta: {
          scan: scanResult,
        },
      })

      results.push({
        recipientId: recipient.id,
        email: recipient.email,
        status: 'failed',
        error: message,
        scan: scanResult,
      })
    }
  }

  return results
}

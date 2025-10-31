import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import type { EventType } from './risk-score'

export interface TrackEventPayload {
  type: EventType
  campaignId?: string | null
  recipientId?: string | null
  userId?: string | null
  ip?: string | null
  meta?: Record<string, unknown>
}

type SupabaseQueryBuilderLike = {
  insert(values: Record<string, unknown> | Record<string, unknown>[]): Promise<PostgrestSingleResponse<any>>
  select(columns?: string): Promise<PostgrestSingleResponse<any>>
  eq(column: string, value: any): SupabaseQueryBuilderLike
  order(column: string, opts: { ascending: boolean }): SupabaseQueryBuilderLike
}

export interface SupabaseClientLike {
  from<T extends string>(table: T): SupabaseQueryBuilderLike
}

export function anonymizeIp(ip: string | null | undefined): string | null {
  if (!ip) return null
  if (ip.includes(':')) {
    // IPv6: zero the last segments
    const segments = ip.split(':')
    return segments.slice(0, 4).join(':') + '::'
  }

  // IPv4
  const parts = ip.split('.')
  if (parts.length !== 4) return ip
  return `${parts[0]}.${parts[1]}.${parts[2]}.0`
}

export function parseIpFromHeaders(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return null
}

export async function recordEvent(
  supabase: SupabaseClientLike,
  payload: TrackEventPayload
) {
  const { type, campaignId, recipientId, userId, meta } = payload

  const enrichedMeta = {
    ...meta,
    ip: anonymizeIp(payload.ip ?? null),
  }

  return supabase.from('events').insert({
    type,
    campaign_id: campaignId ?? null,
    recipient_id: recipientId ?? null,
    user_id: userId ?? null,
    meta: enrichedMeta,
  })
}

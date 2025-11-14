import { NextResponse } from 'next/server'

interface Attack {
  id: string
  type: string
  timestamp: string
  source: string
  destination: string
  category: 'malware' | 'phishing' | 'exploit' | 'other'
}

// Generate deterministic data based on time to avoid hydration issues
function generateAttacks(seed: number): Attack[] {
  const attacks: Attack[] = []
  const attackTypes = [
    'Microsoft Multiple Products Memory Corruption',
    'Apache HTTP Server Server-Side Request Forgery',
    'NULL Encoding detected within a HTTP Request',
    'DNS MX record null prefix',
    'Phishing.RS.TC.e3b7BMtw',
    'Apache Log4j Remote Code Execution',
    'SQL Injection Attempt',
    'Cross-Site Scripting (XSS)',
    'Remote File Inclusion',
    'Command Injection',
    'Path Traversal',
    'Brute Force Attack',
    'Ransomware Attack Detected',
    'DDoS Attack Pattern',
    'Malware Download Attempt',
    'Credential Stuffing Attack',
    'Zero-Day Exploit Attempt',
    'Man-in-the-Middle Attack',
    'Port Scanning Activity',
    'Botnet Communication',
    'Cryptocurrency Mining Malware',
    'Data Exfiltration Attempt',
    'Privilege Escalation Attack',
    'Session Hijacking Attempt',
    'DNS Tunneling Detected',
    'Web Shell Upload Attempt',
    'Fileless Malware Execution',
    'Supply Chain Attack',
    'Advanced Persistent Threat (APT)',
    'Trojan Horse Download',
  ]

  const countries = [
    'United States',
    'Netherlands',
    'India',
    'Japan',
    'Bahamas',
    'China',
    'Russia',
    'Germany',
    'United Kingdom',
    'France',
    'Brazil',
    'Australia',
    'Canada',
    'Mexico',
    'South Korea',
    'Singapore',
    'United Arab Emirates',
    'Saudi Arabia',
    'Turkey',
    'Italy',
    'Spain',
    'Poland',
    'Sweden',
    'Norway',
    'South Africa',
    'Egypt',
    'Nigeria',
    'Argentina',
    'Chile',
    'Thailand',
    'Vietnam',
    'Indonesia',
    'Malaysia',
    'Philippines',
    'Taiwan',
    'Hong Kong',
  ]

  const states = ['VA', 'CA', 'NY', 'TX', 'FL', 'IL', 'MI', 'WA']

  // Use seed to generate consistent data
  const rng = (n: number) => {
    const x = Math.sin(n) * 10000
    return x - Math.floor(x)
  }

  const now = new Date()
  const baseTime = Math.floor(now.getTime() / 1000) // Use seconds as base

  // Generate more attacks to show high volume - simulate real threat map with many attacks
  const numAttacks = 20 + Math.floor(rng(seed * 100) * 15) // 20-35 attacks
  for (let i = 0; i < numAttacks; i++) {
    const attackSeed = seed + i
    const typeIndex = Math.floor(rng(attackSeed) * attackTypes.length)
    const sourceCountryIndex = Math.floor(rng(attackSeed * 2) * countries.length)
    const destCountryIndex = Math.floor(rng(attackSeed * 3) * countries.length)
    
    const sourceCountry = countries[sourceCountryIndex]
    const destCountry = countries[destCountryIndex]
    
    // Sometimes add state for US
    const source = sourceCountry === 'United States' && rng(attackSeed * 4) > 0.5
      ? `${states[Math.floor(rng(attackSeed * 5) * states.length)]}, ${sourceCountry}`
      : sourceCountry
    
    const destination = destCountry === 'United States' && rng(attackSeed * 6) > 0.5
      ? `${states[Math.floor(rng(attackSeed * 7) * states.length)]}, ${destCountry}`
      : destCountry

    const secondsAgo = Math.floor(rng(attackSeed * 8) * 60) // 0-60 seconds ago
    const attackTime = new Date((baseTime - secondsAgo) * 1000)
    const timestamp = attackTime.toTimeString().slice(0, 8) // HH:MM:SS

    const category = typeIndex < 4 ? 'exploit' 
      : typeIndex === 4 ? 'phishing'
      : typeIndex < 7 ? 'malware'
      : 'other'

    attacks.push({
      id: `attack-${baseTime}-${i}`,
      type: attackTypes[typeIndex],
      timestamp,
      source,
      destination,
      category,
    })
  }

  return attacks.sort((a, b) => {
    // Sort by timestamp (newest first)
    const timeA = a.timestamp.split(':').map(Number)
    const timeB = b.timestamp.split(':').map(Number)
    const secondsA = timeA[0] * 3600 + timeA[1] * 60 + timeA[2]
    const secondsB = timeB[0] * 3600 + timeB[1] * 60 + timeB[2]
    return secondsB - secondsA
  })
}

export async function fetchLiveAttacks() {
  // Use current 1 second as seed to get very fast updates
  const now = new Date()
  const seed = Math.floor(now.getTime() / 1000) // Change every 1 second
  
  const attacks = generateAttacks(seed)
  
  // Increase current rate to show high attack frequency
  const currentRate = 8 + Math.floor(Math.sin(seed) * 5) // 8-13 attacks per second
  
  return {
    attacks,
    currentRate,
  }
}

export async function GET() {
  try {
    const data = await fetchLiveAttacks()
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error generating attacks:', error)
    return NextResponse.json(
      { error: 'Failed to generate attacks', attacks: [], currentRate: 0 },
      { status: 500 }
    )
  }
}


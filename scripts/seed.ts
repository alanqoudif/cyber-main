import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log('Starting seed...')

  try {
    // Create a test admin user (if not exists)
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@cybermirror.local',
      password: 'admin123',
      email_confirm: true,
      user_metadata: { name: 'Admin User' },
    })

    if (adminError && !adminError.message.includes('already registered')) {
      console.error('Error creating admin user:', adminError)
    } else if (adminUser?.user) {
      // Update user role to ADMIN
      await supabase
        .from('users')
        .update({ role: 'ADMIN' })
        .eq('id', adminUser.user.id)

      console.log('Admin user created:', adminUser.user.email)
    }

    // Create a test regular user
    const { data: regularUser, error: regularError } = await supabase.auth.admin.createUser({
      email: 'user@cybermirror.local',
      password: 'user123',
      email_confirm: true,
      user_metadata: { name: 'Test User' },
    })

    if (regularError && !regularError.message.includes('already registered')) {
      console.error('Error creating regular user:', regularError)
    } else if (regularUser?.user) {
      console.log('Regular user created:', regularUser.user.email)
    }

    // Get admin user ID
    const { data: users } = await supabase.from('users').select('id, role').eq('role', 'ADMIN')
    const adminId = users?.[0]?.id

    if (!adminId) {
      console.log('No admin user found, skipping campaign creation')
      return
    }

    // Create a sample campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        title: 'Q1 2024 Security Awareness Campaign',
        description: 'Educational phishing simulation for security training',
        created_by: adminId,
      })
      .select()
      .single()

    if (campaignError) {
      console.error('Error creating campaign:', campaignError)
    } else {
      console.log('Campaign created:', campaign.title)

      // Add recipients
      const recipients = [
        { email: 'user@cybermirror.local', name: 'Test User' },
        { email: 'test1@example.com', name: 'John Doe' },
        { email: 'test2@example.com', name: 'Jane Smith' },
      ]

      const { error: recipientsError } = await supabase.from('recipients').insert(
        recipients.map((r) => ({
          email: r.email,
          name: r.name,
          campaign_id: campaign.id,
        }))
      )

      if (recipientsError) {
        console.error('Error creating recipients:', recipientsError)
      } else {
        console.log(`${recipients.length} recipients added`)
      }
    }

    console.log('Seed completed successfully!')
    console.log('\nTest credentials:')
    console.log('Admin: admin@cybermirror.local / admin123')
    console.log('User: user@cybermirror.local / user123')

    // Seed lessons if table is empty
    const { data: existingLessons } = await supabase.from('lessons').select('id').limit(1)
    if (!existingLessons || existingLessons.length === 0) {
      await supabase.from('lessons').insert([
        {
          slug: 'phishing-basics',
          title: 'Understanding Phishing',
          description: 'Learn how attackers trick users into taking harmful actions.',
          duration: 5,
          content: {
            sections: [
              { type: 'heading', text: 'What is Phishing?' },
              {
                type: 'paragraph',
                text: 'Phishing uses deceptive messages to obtain credentials, install malware, or steal funds.',
              },
              {
                type: 'list',
                items: [
                  'Unexpected email requesting sensitive information',
                  'Urgent request to reset your password',
                  'Attachments from unknown senders',
                ],
              },
            ],
          },
        },
        {
          slug: 'red-flags',
          title: 'Recognizing Red Flags',
          description: 'Spot suspicious language, links, and sender behavior.',
          duration: 6,
          content: {
            sections: [
              { type: 'heading', text: 'Red Flags' },
              {
                type: 'list',
                items: [
                  'Requests for login credentials via email',
                  'Poor grammar or mismatched branding',
                  'Domains that look almost correct but contain typos',
                ],
              },
            ],
          },
        },
      ])
      console.log('Seeded default lessons.')
    }
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

seed()

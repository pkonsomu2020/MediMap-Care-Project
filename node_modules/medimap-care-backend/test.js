require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment')
  process.exit(1)
}

const supabase = createClient(url, key)

async function main() {
  const { data, error } = await supabase
    .from('users')
    .select('*')

  if (error) {
    console.error('Supabase error:', error)
    process.exit(1)
  }

  console.log(data)
}

main()
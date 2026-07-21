import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')&&!l.startsWith('#')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1).trim()]))
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const { data: m } = await db.from('members').select('id,total_coins,lifetime_coins,current_streak').eq('phone','972522710381').single()
const { data: ci } = await db.from('checkins').select('id,status,coins_awarded,arbox_checkin_id').eq('member_id',m.id).order('created_at',{ascending:false})
console.log('member:', m)
console.log('checkins:', ci)

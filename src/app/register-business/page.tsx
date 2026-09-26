// src/app/register-business/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RegisterBusinessForm from '@/components/RegisterBusinessForm'

export default async function RegisterBusinessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <RegisterBusinessForm />
}
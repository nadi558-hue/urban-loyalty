// Root page – redirects to login (which handles auth check)
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/login')
}

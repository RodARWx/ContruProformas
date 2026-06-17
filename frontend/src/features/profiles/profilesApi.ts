import { apiGet } from '../../lib/api'
import type { Profile } from '../../types/profile'

export async function fetchProfiles(): Promise<Profile[]> {
  return apiGet<Profile[]>('/profiles')
}

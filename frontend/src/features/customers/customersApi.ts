import { apiGet } from '../../lib/api'
import type { Customer } from '../../types/customer'

export async function fetchCustomers(): Promise<Customer[]> {
  return apiGet<Customer[]>('/customers')
}

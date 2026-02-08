import { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api'

const UserContext = createContext()

export function UserProvider({ children }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await api.get('/api/user/info/')
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)

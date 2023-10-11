import '@/styles/globals.css'
import ContextProvider from '@/context/context'
import { QueryClient,QueryClientProvider } from 'react-query'

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
  <QueryClientProvider client={queryClient}>
    <ContextProvider>
      <Component {...pageProps} />
    </ContextProvider>
  </QueryClientProvider>

  )
}

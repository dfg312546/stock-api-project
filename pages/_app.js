import '@/styles/globals.css'
import ContextProvider from '@/context/context'
import { QueryClient,QueryClientProvider } from 'react-query'
import Router from "next/router"
import { useState } from "react"
import TopBarProgress from "react-topbar-progress-indicator"

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  const [progress, setProgress] = useState(false)

  Router.events.on("routeChangeStart", () => {
     setProgress(true) 
  })

  Router.events.on("routeChangeComplete", () => {
     setProgress(false) 
  })
  return (
  <QueryClientProvider client={queryClient}>
    <ContextProvider>
    {progress && <TopBarProgress />}
      <Component {...pageProps} />
    </ContextProvider>
  </QueryClientProvider>

  )
}

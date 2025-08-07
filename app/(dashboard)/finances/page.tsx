// app/(dashboard)/finances/page.tsx
import dynamic from 'next/dynamic'
import React from 'react';

// This line is the key to the fix.
// It tells Next.js to load the 'FinancesClientPage' component only on the client-side (in the browser).
// `ssr: false` explicitly disables Server-Side Rendering for this component,
// which prevents the "window is not defined" error during the build process on Vercel.
const FinancesClientPage = dynamic(() => import('./finances-client-page'), { 
    ssr: false,
    // This provides a nice loading message to the user while the main component is being prepared.
    loading: () => (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Finances & Services</h1>
            <p className="text-gray-500">Loading Financial Services...</p>
        </div>
    )
})

// This is the main page component. It is now very simple.
// Its only job is to render the client-side component.
export default function FinancesPage() {
  return <FinancesClientPage />
}

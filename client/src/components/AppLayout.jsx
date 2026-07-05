import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }} className="bg-gray-950 text-white">
      <Sidebar />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  )
}
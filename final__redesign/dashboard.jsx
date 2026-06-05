// HomePlate — Dashboard composition

const DashboardApp = () => (
  <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-app)', fontFamily: 'var(--font-body)' }}>
    <Sidebar />
    <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>

      <TopBar />

      <div style={{ padding: '24px 40px 60px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* AI Summary — full width */}
        <AISummary />

        {/* Most cooked + Protein ranking */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <MostCooked />
          <ProteinRanking />
        </div>

        {/* Recommended + Streak */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Recommended />
          <StreakCard />
        </div>

      </div>
    </main>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<DashboardApp />);

// HomePlate — Dashboard composition

const DashboardApp = () => (
  <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-app)', fontFamily: 'var(--font-body)' }}>
    <Sidebar />
    <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
      <TopBar />
      <div style={{ padding: '0 32px 60px', maxWidth: 1100, margin: '0 auto' }}>

        {/* AI Summary — full width */}
        <AISummary />

        {/* Week + Today */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18, marginTop: 18 }}>
          <WeekAtAGlance />
          <TodaysMeals />
        </div>

        {/* This week's recipes */}
        <ThisWeekRecipes />

        {/* Most cooked + Pantry + Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginTop: 20 }}>
          <MostCooked />
          <PantryStash />
          <StatsPanel />
        </div>

        {/* Recommended + Streak */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 18 }}>
          <Recommended />
          <StreakCard />
        </div>

      </div>
    </main>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<DashboardApp />);

// HomePlate — Settings page
// Deps: icons.jsx, ds-logo.jsx

const GRAD = 'linear-gradient(90deg, var(--orange), var(--yellow), var(--lime), var(--green))';

// ── App sidebar ───────────────────────────────────────────────────────────────
const SettingsSidebar = () => (
  <aside style={{ width: 220, flexShrink: 0, background: 'var(--sidebar)', borderRight: 'none', display: 'flex', flexDirection: 'column', padding: '24px 16px', height: '100vh', position: 'sticky', top: 0 }}>
    <SidebarLogo />
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[
        { label: 'Dashboard', Icon: IconHome,     href: 'Dashboard.html' },
        { label: 'Recipes',   Icon: IconRecipes,  href: 'Recipes.html'   },
        { label: 'Planner',   Icon: IconPlanner,  href: 'Planner.html'   },
        { label: 'Grocery',   Icon: IconGrocery,  href: 'Grocery.html'   },
        { label: 'Settings',  Icon: IconSettings, active: true           },
      ].map(({ label, Icon, active, href }) => (
        href
          ? <a key={label} href={href} style={{ textDecoration: 'none' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 12, height: 42, width: '100%', padding: '0 12px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 14, background: 'transparent', color: 'rgba(255,255,255,0.55)', textAlign: 'left' }}>
                <Icon size={18} stroke={1.75} />{label}
              </button>
            </a>
          : <button key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, height: 42, padding: '0 12px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: active ? 600 : 400, fontSize: 14, background: active ? 'rgba(255,255,255,0.18)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.55)', width: '100%', textAlign: 'left' }}>
              <Icon size={18} stroke={active ? 2 : 1.75} />{label}
            </button>
      ))}
    </nav>
    <div style={{ marginTop: 'auto', padding: '0 4px' }}>
      <ThemeToggle />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: GRAD, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff' }}>C</span>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: '#fff' }}>Chris</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>HomePlate</div>
        </div>
      </div>
    </div>
  </aside>
);

// ── Shared primitives ─────────────────────────────────────────────────────────
const Toggle = ({ on, onChange }) => (
  <div onClick={() => onChange(!on)} style={{ width: 42, height: 24, borderRadius: 12, cursor: 'pointer', flexShrink: 0, background: on ? 'var(--green)' : 'var(--ink-200)', position: 'relative', transition: 'background 0.2s' }}>
    <div style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.22)', transition: 'left 0.18s' }} />
  </div>
);

const SHead = ({ title, desc }) => (
  <div style={{ marginBottom: 28 }}>
    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, letterSpacing: '-0.02em', color: 'var(--ink-900)', margin: '0 0 5px' }}>{title}</h2>
    {desc && <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-400)', margin: 0, lineHeight: 1.5 }}>{desc}</p>}
  </div>
);

const SettingRow = ({ label, desc, children, last }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '16px 0', borderBottom: last ? 'none' : '1px solid var(--ink-100)' }}>
    <div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', marginBottom: desc ? 2 : 0 }}>{label}</div>
      {desc && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-400)', lineHeight: 1.4 }}>{desc}</div>}
    </div>
    <div style={{ flexShrink: 0 }}>{children}</div>
  </div>
);

// ── Household ─────────────────────────────────────────────────────────────────
const MEMBER_COLORS = ['#2563EB', '#D97757', '#16A34A', '#CA8A04', '#7C3AED', '#0891B2'];

const INIT_MEMBERS = [
  { id: 1, name: 'Chris',   role: 'Parent',      initials: 'C', color: MEMBER_COLORS[0], dietary: '',            approvalTracking: false },
  { id: 2, name: 'Lauren',  role: 'Parent',      initials: 'L', color: MEMBER_COLORS[1], dietary: '',            approvalTracking: false },
  { id: 3, name: 'Rory',    role: '4 years old', initials: 'R', color: MEMBER_COLORS[2], dietary: '',            approvalTracking: true  },
  { id: 4, name: 'Juniper', role: '9 months',    initials: 'J', color: MEMBER_COLORS[3], dietary: 'Purées only', approvalTracking: false },
];

const MemberCard = ({ member, onChange, onDelete }) => {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft]     = React.useState(member);

  const save   = () => { onChange(draft); setEditing(false); };
  const cancel = () => { setDraft(member); setEditing(false); };

  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-xl)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Avatar + name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: member.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: '#fff' }}>{member.initials}</span>
        </div>
        {editing ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <input value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value, initials: e.target.value[0]?.toUpperCase() || d.initials }))}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, border: '1px solid var(--ink-200)', borderRadius: 'var(--r-sm)', padding: '4px 8px', outline: 'none', color: 'var(--ink-900)', width: '100%', boxSizing: 'border-box' }} />
            <input value={draft.role} onChange={e => setDraft(d => ({ ...d, role: e.target.value }))} placeholder="Role or age"
              style={{ fontFamily: 'var(--font-body)', fontSize: 12, border: '1px solid var(--ink-200)', borderRadius: 'var(--r-sm)', padding: '4px 8px', outline: 'none', color: 'var(--ink-500)', width: '100%', boxSizing: 'border-box' }} />
          </div>
        ) : (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, color: 'var(--ink-900)' }}>{member.name}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-400)', marginTop: 1 }}>{member.role}</div>
          </div>
        )}
        <button onClick={() => editing ? cancel() : setEditing(true)}
          style={{ background: 'var(--ink-50)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-sm)', padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--ink-600)', flexShrink: 0 }}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Dietary notes */}
      <div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--ink-400)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Dietary notes</div>
        {editing ? (
          <input value={draft.dietary} onChange={e => setDraft(d => ({ ...d, dietary: e.target.value }))}
            placeholder="e.g. No shellfish, vegetarian…"
            style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-body)', fontSize: 13, border: '1px solid var(--ink-200)', borderRadius: 'var(--r-sm)', padding: '7px 10px', outline: 'none', color: 'var(--ink-900)', background: 'var(--paper)' }} />
        ) : (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: member.dietary ? 'var(--ink-700)' : 'var(--ink-300)', fontStyle: member.dietary ? 'normal' : 'italic' }}>
            {member.dietary || 'None'}
          </div>
        )}
      </div>

      {/* Approval tracking toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink-800)' }}>Meal approval tracking</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-400)', marginTop: 2 }}>Show "{member.name} ✓" on recipes they enjoy</div>
        </div>
        <Toggle on={member.approvalTracking} onChange={val => onChange({ ...member, approvalTracking: val })} />
      </div>

      {/* Save / delete */}
      {editing && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save}
            style={{ flex: 1, height: 34, borderRadius: 'var(--r-sm)', border: 'none', background: 'var(--ink-900)', color: 'var(--bg-app)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            Save changes
          </button>
          <button onClick={() => onDelete(member.id)}
            style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', border: '1px solid var(--ink-200)', background: 'var(--ink-50)', color: 'var(--ink-500)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <IconTrash size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

const HouseholdSection = () => {
  const [members, setMembers] = React.useState(INIT_MEMBERS);
  const nextId = React.useRef(INIT_MEMBERS.length + 1);

  const update = (updated) => setMembers(ms => ms.map(m => m.id === updated.id ? updated : m));
  const remove  = (id)      => setMembers(ms => ms.filter(m => m.id !== id));
  const add     = ()        => {
    const id    = nextId.current++;
    const color = MEMBER_COLORS[(id - 1) % MEMBER_COLORS.length];
    setMembers(ms => [...ms, { id, name: 'New member', role: '', initials: 'N', color, dietary: '', approvalTracking: false }]);
  };

  return (
    <div>
      <SHead title="Household" desc="Manage family members, dietary notes, and whose meal approvals appear on recipes." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        {members.map(m => <MemberCard key={m.id} member={m} onChange={update} onDelete={remove} />)}
      </div>
      <button onClick={add}
        style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 18px', borderRadius: 'var(--r-md)', border: '1.5px dashed var(--ink-200)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--ink-500)' }}>
        <IconPlus size={16} /> Add member
      </button>
    </div>
  );
};

// ── Tags & Filters ────────────────────────────────────────────────────────────
const INIT_TAG_GROUPS = {
  Dinner:    { label: 'Protein', tags: ['Chicken', 'Ground beef', 'Pork', 'Steak', 'Shrimp', 'Salmon'] },
  Lunch:     { label: 'Protein', tags: ['Chicken', 'Shrimp', 'Turkey', 'Vegetarian'] },
  Breakfast: { label: 'Style',   tags: ['Sweet', 'Savory', 'Quick'] },
  Side:      { label: 'Type',    tags: ['Salad', 'Bread', 'Vegetable', 'Pasta'] },
  Snack:     { label: 'Type',    tags: ['Sweet', 'Savory', 'No-cook', 'Make-ahead'] },
  Dessert:   { label: 'Type',    tags: ['Chocolate', 'Baked', 'No-bake'] },
  Beverage:  { label: 'Spirit',  tags: ['Vodka', 'Rum', 'Gin', 'Whiskey', 'Tequila', 'Non-alcoholic'] },
};

const TagGroupCard = ({ cat, group, onChange }) => {
  const [newTag, setNewTag]           = React.useState('');
  const [editingLabel, setEditLabel]  = React.useState(false);

  const addTag = () => {
    const t = newTag.trim();
    if (t && !group.tags.includes(t)) onChange(cat, { ...group, tags: [...group.tags, t] });
    setNewTag('');
  };
  const removeTag = (tag) => onChange(cat, { ...group, tags: group.tags.filter(t => t !== tag) });

  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-xl)', padding: '18px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--ink-900)' }}>{cat}</span>
        <div style={{ width: 1, height: 13, background: 'var(--ink-200)' }} />
        {editingLabel ? (
          <input autoFocus value={group.label}
            onChange={e => onChange(cat, { ...group, label: e.target.value })}
            onBlur={() => setEditLabel(false)}
            onKeyDown={e => e.key === 'Enter' && setEditLabel(false)}
            style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', letterSpacing: '0.07em', textTransform: 'uppercase', border: '1px solid var(--ink-200)', borderRadius: 4, padding: '2px 6px', outline: 'none', width: 80 }} />
        ) : (
          <span onClick={() => setEditLabel(true)}
            title="Click to rename"
            style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--ink-400)', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'text', borderBottom: '1px dashed var(--ink-200)', paddingBottom: 1 }}>
            {group.label}
          </span>
        )}
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, minHeight: 28 }}>
        {group.tags.map(tag => (
          <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 28, padding: '0 8px 0 11px', borderRadius: 'var(--r-pill)', background: 'var(--ink-50)', border: '1px solid var(--ink-100)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--ink-700)' }}>
            {tag}
            <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-300)', display: 'grid', placeItems: 'center', padding: '0 1px', lineHeight: 1 }}>
              <IconClose size={10} />
            </button>
          </span>
        ))}
        {group.tags.length === 0 && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-300)', fontStyle: 'italic' }}>No tags yet</span>
        )}
      </div>

      {/* Add tag input */}
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()}
          placeholder="Add a tag…"
          style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12, border: '1px solid var(--ink-200)', borderRadius: 'var(--r-sm)', padding: '6px 10px', outline: 'none', color: 'var(--ink-900)', background: 'var(--bg-app)' }} />
        <button onClick={addTag}
          style={{ height: 32, padding: '0 12px', borderRadius: 'var(--r-sm)', border: 'none', background: 'var(--ink-900)', color: 'var(--bg-app)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          Add
        </button>
      </div>
    </div>
  );
};

const TagsSection = () => {
  const [groups, setGroups] = React.useState(INIT_TAG_GROUPS);
  const update = (cat, updated) => setGroups(g => ({ ...g, [cat]: updated }));

  return (
    <div>
      <SHead title="Tags & Filters" desc="Control the sub-filter chips that appear in the Cookbook when browsing by category. Click a label (e.g. Protein) to rename it." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {Object.entries(groups).map(([cat, group]) => (
          <TagGroupCard key={cat} cat={cat} group={group} onChange={update} />
        ))}
      </div>
    </div>
  );
};

// ── Appearance ───────────────────────────────────────────────────────────────
const AppearanceSection = () => {
  const getStored = () => localStorage.getItem('hp-theme') || 'light';
  const [mode, setMode] = React.useState(getStored);

  const apply = (t) => {
    setMode(t);
    if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      localStorage.removeItem('hp-theme');
    } else {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('hp-theme', t);
    }
  };

  return (
    <div>
      <SHead title="Appearance" desc="Choose how HomePlate looks. Your preference is saved across all pages." />
      <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-xl)', padding: '4px 24px' }}>
        <SettingRow label="Theme" desc="Light, dark, or follow your system setting" last>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['light', '☀︎ Light'], ['dark', '⏾ Dark'], ['system', '⊙ System']].map(([val, label]) => (
              <button key={val} onClick={() => apply(val)}
                style={{ height: 34, padding: '0 14px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12,
                  background: mode === val ? 'var(--ink-900)' : 'var(--ink-50)',
                  color:      mode === val ? 'var(--bg-app)'  : 'var(--ink-600)',
                  outline:    mode !== val ? '1px solid var(--ink-200)' : 'none',
                }}>{label}</button>
            ))}
          </div>
        </SettingRow>
      </div>

      {/* Preview swatch */}
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[['light', '#F7F8F5', '#FFFFFF', '#20241C'], ['dark', '#0F1510', '#182016', '#ECF2E8']].map(([name, bg, card, text]) => (
          <div key={name} onClick={() => apply(name)}
            style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', border: `2px solid ${mode === name ? 'var(--green)' : 'var(--ink-100)'}`, cursor: 'pointer', transition: 'border-color 0.15s' }}>
            <div style={{ background: bg, padding: '16px 16px 12px' }}>
              <div style={{ width: 40, height: 6, borderRadius: 4, background: 'var(--green-700)', marginBottom: 12 }} />
              <div style={{ background: card, borderRadius: 6, padding: '12px 14px' }}>
                <div style={{ width: '60%', height: 8, borderRadius: 4, background: text, opacity: 0.8, marginBottom: 8 }} />
                <div style={{ width: '40%', height: 6, borderRadius: 4, background: text, opacity: 0.35 }} />
              </div>
            </div>
            <div style={{ background: card, padding: '8px 16px', borderTop: `1px solid ${name === 'dark' ? '#1E2C1A' : '#ECEDE2'}` }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: text, opacity: 0.7, textTransform: 'capitalize' }}>{name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Stores ──────────────────────────────────────────────────────────────────────
const STORE_PALETTES = [
  { bg: 'var(--green-100)',  color: 'var(--green-700)',  border: 'var(--green-200)'  },
  { bg: 'var(--orange-100)', color: 'var(--orange-600)', border: 'var(--orange-200)' },
  { bg: 'oklch(90% 0.06 260)', color: 'oklch(40% 0.12 260)', border: 'oklch(82% 0.08 260)' },
  { bg: 'oklch(92% 0.06 330)', color: 'oklch(42% 0.12 330)', border: 'oklch(84% 0.08 330)' },
  { bg: 'oklch(93% 0.05 200)', color: 'oklch(40% 0.10 200)', border: 'oklch(85% 0.07 200)' },
  { bg: 'oklch(93% 0.05 60)',  color: 'oklch(42% 0.12 60)',  border: 'oklch(85% 0.07 60)'  },
];

const INIT_STORES = [
  { id: 'aldi',   label: 'Aldi',   palette: 0 },
  { id: 'publix', label: 'Publix', palette: 1 },
];

const StoresSection = () => {
  const [stores,   setStores]   = React.useState(INIT_STORES);
  const [newName,  setNewName]  = React.useState('');
  const [editId,   setEditId]   = React.useState(null);
  const [editName, setEditName] = React.useState('');
  const nextPalette = stores.length % STORE_PALETTES.length;

  const addStore = () => {
    const name = newName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    if (stores.find(s => s.id === id)) return;
    setStores(prev => [...prev, { id, label: name, palette: nextPalette }]);
    setNewName('');
  };

  const saveEdit = (id) => {
    const name = editName.trim();
    if (name) setStores(prev => prev.map(s => s.id === id ? { ...s, label: name } : s));
    setEditId(null);
  };

  const remove = (id) => setStores(prev => prev.filter(s => s.id !== id));

  return (
    <div>
      <SHead title="Stores" desc="The stores that appear as tags on grocery list items. Add your regular shops and remove ones you don't use." />

      {/* Store list */}
      <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-xl)', padding: '4px 24px', marginBottom: 14 }}>
        {stores.length === 0 && (
          <div style={{ padding: '20px 0', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-300)', fontStyle: 'italic' }}>No stores yet — add one below.</div>
        )}
        {stores.map((store, i) => {
          const pal = STORE_PALETTES[store.palette % STORE_PALETTES.length];
          const isLast = i === stores.length - 1;
          return (
            <div key={store.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: isLast ? 'none' : '1px solid var(--ink-100)' }}>
              {/* Color badge */}
              <span style={{ display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 12px', borderRadius: 'var(--r-pill)', background: pal.bg, color: pal.color, border: `1px solid ${pal.border}`, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0, minWidth: 70, justifyContent: 'center' }}>
                {store.label}
              </span>

              {/* Name / edit */}
              {editId === store.id ? (
                <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(store.id); if (e.key === 'Escape') setEditId(null); }}
                  style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, border: '1px solid var(--ink-200)', borderRadius: 'var(--r-sm)', padding: '5px 10px', outline: 'none', color: 'var(--ink-900)' }} />
              ) : (
                <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>{store.label}</span>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {editId === store.id ? (
                  <>
                    <button onClick={() => saveEdit(store.id)}
                      style={{ height: 30, padding: '0 12px', borderRadius: 'var(--r-sm)', border: 'none', background: 'var(--ink-900)', color: 'var(--bg-app)', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setEditId(null)}
                      style={{ height: 30, padding: '0 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--ink-200)', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-500)', cursor: 'pointer' }}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => { setEditId(store.id); setEditName(store.label); }}
                    style={{ height: 30, padding: '0 12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--ink-200)', background: 'var(--ink-50)', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--ink-600)', cursor: 'pointer' }}>Rename</button>
                )}
                <button onClick={() => remove(store.id)}
                  style={{ width: 30, height: 30, borderRadius: 'var(--r-sm)', border: '1px solid var(--ink-200)', background: 'var(--ink-50)', color: 'var(--ink-400)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  <IconTrash size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add store */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addStore()}
          placeholder="New store name (e.g. Costco, Trader Joe's…)"
          style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', padding: '9px 14px', outline: 'none', color: 'var(--ink-900)', background: 'var(--paper)' }} />
        <button onClick={addStore}
          style={{ height: 40, padding: '0 18px', borderRadius: 'var(--r-md)', border: 'none', background: 'var(--ink-900)', color: 'var(--bg-app)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconPlus size={15} /> Add store
        </button>
      </div>
    </div>
  );
};

// ── Planner ───────────────────────────────────────────────────────────────────
const PlannerSection = () => {
  const [weekStart, setWeekStart] = React.useState('Sunday');
  const [slots,     setSlots]     = React.useState({ Breakfast: true, Lunch: false, Dinner: true, Sides: true });
  const [reminders, setReminders] = React.useState(true);

  return (
    <div>
      <SHead title="Planner" desc="Defaults for your weekly meal planning view." />
      <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-xl)', padding: '4px 24px' }}>
        <SettingRow label="Week starts on" desc="First day shown in the planner grid">
          <div style={{ display: 'flex', gap: 6 }}>
            {['Sunday', 'Monday'].map(d => (
              <button key={d} onClick={() => setWeekStart(d)}
                style={{ height: 32, padding: '0 14px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, background: weekStart === d ? 'var(--ink-900)' : 'var(--ink-50)', color: weekStart === d ? 'var(--bg-app)' : 'var(--ink-600)', outline: weekStart !== d ? '1px solid var(--ink-200)' : 'none' }}>{d}</button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Default meal slots" desc="Which slots appear on each planner day by default">
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.entries(slots).map(([slot, on]) => (
              <button key={slot} onClick={() => setSlots(s => ({ ...s, [slot]: !s[slot] }))}
                style={{ height: 32, padding: '0 11px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, background: on ? 'var(--green-50)' : 'var(--ink-50)', color: on ? 'var(--green-700)' : 'var(--ink-500)', outline: `1px solid ${on ? 'var(--green-200)' : 'var(--ink-200)'}` }}>{slot}</button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Planning reminder" desc="Remind you to plan the next week every Sunday" last>
          <Toggle on={reminders} onChange={setReminders} />
        </SettingRow>
      </div>
    </div>
  );
};

// ── AI & Recommendations ──────────────────────────────────────────────────────
const AISection = () => {
  const [summary,   setSummary]   = React.useState(true);
  const [threshold, setThreshold] = React.useState(4);
  const [recCount,  setRecCount]  = React.useState(4);
  const [proteinOn, setProteinOn] = React.useState(true);

  return (
    <div>
      <SHead title="AI & Recommendations" desc="Control how HomePlate's weekly summary and recipe suggestions work." />
      <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-xl)', padding: '4px 24px' }}>
        <SettingRow label="Weekly AI summary" desc="Generate a written review of your week's meals every Monday">
          <Toggle on={summary} onChange={setSummary} />
        </SettingRow>
        <SettingRow label="Protein diversity nudge" desc="Flag weeks where you're cooking the same protein 3+ times">
          <Toggle on={proteinOn} onChange={setProteinOn} />
        </SettingRow>
        <SettingRow label="Re-suggest after" desc="Recommend a recipe again after it hasn't been made for this many weeks">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="range" min={1} max={12} value={threshold} onChange={e => setThreshold(+e.target.value)} style={{ width: 110, accentColor: 'var(--green)', cursor: 'pointer' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: 'var(--ink-900)', minWidth: 58 }}>{threshold} {threshold === 1 ? 'week' : 'weeks'}</span>
          </div>
        </SettingRow>
        <SettingRow label="Recommendations shown" desc="How many meals appear in the Recommended section on Dashboard" last>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="range" min={2} max={8} value={recCount} onChange={e => setRecCount(+e.target.value)} style={{ width: 110, accentColor: 'var(--green)', cursor: 'pointer' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: 'var(--ink-900)', minWidth: 18 }}>{recCount}</span>
          </div>
        </SettingRow>
      </div>
    </div>
  );
};

// ── Shell ─────────────────────────────────────────────────────────────────────
const SETTING_SECTIONS = [
  { id: 'household',  label: 'Household'            },
  { id: 'tags',       label: 'Tags & Filters'       },
  { id: 'stores',     label: 'Stores'               },
  { id: 'planner',    label: 'Planner'              },
  { id: 'ai',         label: 'AI & Recommendations' },
  { id: 'appearance', label: 'Appearance'           },
];

const SettingsApp = () => {
  const [active, setActive] = React.useState('household');

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-app)' }}>
      <SettingsSidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Page header */}
        <div style={{ padding: '32px 40px 0' }}>
          <div className="t-eyebrow" style={{ marginBottom: 6 }}>HomePlate</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 72, lineHeight: 0.95, letterSpacing: '-0.03em', color: 'var(--ink-900)', margin: 0 }}>Settings.</h1>
        </div>

        {/* Section nav + content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '28px 40px 0', gap: 0 }}>

          {/* Section nav */}
          <nav style={{ width: 196, flexShrink: 0, paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 2 }}>
            {SETTING_SECTIONS.map(({ id, label }) => (
              <button key={id} onClick={() => setActive(id)}
                style={{ display: 'flex', alignItems: 'center', height: 38, padding: '0 12px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: active === id ? 600 : 400, fontSize: 13, textAlign: 'left', width: '100%', transition: 'background 0.1s',
                  background: active === id ? 'var(--green-700)' : 'transparent',
                  color:      active === id ? '#fff' : 'var(--ink-500)',
                  boxShadow:  active === id ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
                  outline:    'none',
                }}>{label}</button>
            ))}
          </nav>

          {/* Content pane */}
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 60 }}>
            {active === 'household'  && <HouseholdSection />}
            {active === 'tags'       && <TagsSection />}
            {active === 'stores'     && <StoresSection />}
            {active === 'planner'    && <PlannerSection />}
            {active === 'ai'         && <AISection />}
            {active === 'appearance' && <AppearanceSection />}
          </div>
        </div>
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<SettingsApp />);

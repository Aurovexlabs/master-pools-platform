import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import {
  FolderOpen, FileText, MessageCircle, Users,
  ArrowUpRight, Activity, DollarSign, Clock, CheckCircle
} from 'lucide-react'
import { useAdminProjects, useAdminQuotations, useAdminUsers, useConversations } from '../../hooks/useApi'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, subDays, formatDistanceToNow } from 'date-fns'

const f = (d = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: d, ease: [0.22, 1, 0.36, 1] as any }
})

const CHART_COLORS = ['#1E3A8A', '#6366F1', '#10B981', '#EF4444', '#F59E0B']
const PIE_COLORS   = ['#3B82F6', '#6366F1', '#10B981', '#EF4444', '#F59E0B']

const chartData = Array.from({ length: 14 }, (_, i) => ({
  date:   format(subDays(new Date(), 13 - i), 'MMM d'),
  views:  Math.floor(Math.random() * 120 + 20),
  quotes: Math.floor(Math.random() * 8 + 1),
}))

const STATUS_BADGE: Record<string, string> = {
  pending: 'badge badge-gray', reviewing: 'badge badge-blue', quoted: 'badge badge-amber',
  accepted: 'badge badge-green', rejected: 'badge badge-red'
}

export default function AdminDashboard() {
  const { data: projectsData }   = useAdminProjects({ limit: 6 })
  const { data: quotationsData } = useAdminQuotations({ limit: 6 })
  const { data: usersData }      = useAdminUsers()
  const { data: convData }       = useConversations()

  const convs:      any[] = (convData as any) || []
  const quotations: any[] = quotationsData?.quotations || []
  const projects:   any[] = projectsData?.projects || []
  const users:      any[] = (usersData as any)?.users || []

  const openConvs   = convs.filter(c => c.status === 'open')
  const totalUnread = convs.reduce((s, c) => s + (c.unreadByAdmin || 0), 0)

  const totalRevenue = useMemo(() =>
    quotations.filter(q => ['accepted', 'quoted'].includes(q.status) && q.quotedAmount?.amount)
      .reduce((s, q) => s + (q.quotedAmount?.amount ?? 0), 0),
  [quotations])

  const statusCounts = useMemo(() => {
    const m: Record<string, number> = {}
    quotations.forEach(q => { m[q.status] = (m[q.status] || 0) + 1 })
    return Object.entries(m).map(([name, value]) => ({ name, value }))
  }, [quotations])

  const KPI = [
    {
      label: 'Total Projects', icon: FolderOpen, color: 'blue',
      value: projectsData?.pagination?.total ?? 0,
      sub: `${projects.filter(p => p.isPublished).length} published`,
      to: '/admin/projects', change: '+12%',
    },
    {
      label: 'Quotations', icon: FileText, color: 'amber',
      value: quotationsData?.pagination?.total ?? 0,
      sub: `${quotations.filter(q => q.status === 'pending').length} pending`,
      to: '/admin/quotations', change: '+8%',
    },
    {
      label: 'Active Chats', icon: MessageCircle, color: totalUnread > 0 ? 'red' : 'green',
      value: openConvs.length,
      sub: `${totalUnread} unread`,
      to: '/admin/chat', change: totalUnread > 0 ? `${totalUnread} new` : 'All clear',
    },
    {
      label: 'Users', icon: Users, color: 'indigo',
      value: (usersData as any)?.pagination?.total ?? 0,
      sub: `${users.filter(u => u.isActive).length} active`,
      to: '/admin/users', change: '+5%',
    },
    {
      label: 'Pipeline', icon: DollarSign, color: 'amber',
      value: `$${totalRevenue.toLocaleString()}`,
      sub: 'Quoted + accepted',
      to: '/admin/quotations', change: 'USD',
    },
  ]

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    blue:   { bg: 'var(--color-primary-50)',    border: 'var(--color-primary-100)',    text: 'var(--color-primary-700)' },
    amber:  { bg: 'rgba(245,158,11,0.08)',       border: 'rgba(245,158,11,0.2)',        text: 'var(--color-amber-600)' },
    green:  { bg: 'var(--color-accent-50)',      border: 'var(--color-accent-100)',     text: 'var(--color-accent-600)' },
    red:    { bg: 'rgba(239,68,68,0.08)',         border: 'rgba(239,68,68,0.2)',          text: '#DC2626' },
    indigo: { bg: 'var(--color-secondary-50)',   border: 'var(--color-secondary-100)',  text: 'var(--color-secondary-600)' },
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '0.625rem 0.875rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '0.75rem' }}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color, fontWeight: 600, margin: 0 }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Welcome banner */}
      <motion.div {...f(0)} style={{
        padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        background: 'var(--color-sky-800)',
        borderRadius: '16px', boxShadow: '0 4px 16px rgba(30,58,138,0.2)',
      }}>
        <div>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Admin Control Centre</p>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.375rem', color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>MATERPOOLS AND CONTRUCTION Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '0.4375rem', height: '0.4375rem', borderRadius: '50%', background: '#34D399', display: 'inline-block' }} />
            {format(new Date(), 'EEEE, d MMMM yyyy · HH:mm')}
          </p>
        </div>
        {totalUnread > 0 && (
          <Link to="/admin/chat" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)', color: '#fff', textDecoration: 'none',
            fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.15s ease',
          }}>
            <MessageCircle style={{ width: '1rem', height: '1rem' }} /> {totalUnread} Unread
          </Link>
        )}
      </motion.div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }} className="xl:grid-cols-5">
        {KPI.map(({ label, value, sub, icon: Icon, color, to, change }, i) => {
          const c = colorMap[color] || colorMap.blue
          return (
            <motion.div key={label} {...f(i * 0.05)}>
              <Link to={to as any} className="stat-card" style={{ textDecoration: 'none', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg, border: `1px solid ${c.border}` }}>
                    <Icon style={{ width: '1.125rem', height: '1.125rem', color: c.text }} />
                  </div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.1875rem 0.5rem', borderRadius: '999px', background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>{change}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.625rem', color: 'var(--color-text)', letterSpacing: '-0.025em', margin: 0 }}>{value}</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: '0.125rem 0 0' }}>{label}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: 0 }}>{sub}</p>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="lg:grid-cols-3">

        {/* Area chart */}
        <motion.div {...f(0.15)} className="card" style={{ padding: '1.25rem', gridColumn: 'span 2 / span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9375rem', margin: 0 }}>Activity (14 days)</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' }}>Views and quotation requests</p>
            </div>
            <Activity style={{ width: '1rem', height: '1rem', color: 'var(--color-text-tertiary)' }} />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1E3A8A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradQuotes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: 'var(--color-text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="views"  stroke="#1E3A8A" strokeWidth={2} fill="url(#gradViews)"  name="Views" />
              <Area type="monotone" dataKey="quotes" stroke="#6366F1" strokeWidth={2} fill="url(#gradQuotes)" name="Quotes" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div {...f(0.2)} className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>Quote Status</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: '1rem' }}>Distribution by status</p>
          {statusCounts.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                    {statusCounts.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.75rem' }}>
                {statusCounts.map(({ name, value }, i) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{name}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>No data yet</div>
          )}
        </motion.div>
      </div>

      {/* Tables row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="lg:grid-cols-2">

        {/* Recent quotations */}
        <motion.div {...f(0.25)} className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9375rem', margin: 0 }}>Recent Quotations</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' }}>Latest quotation requests</p>
            </div>
            <Link to="/admin/quotations" style={{ color: 'var(--color-primary-700)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 600 }}>
              All <ArrowUpRight style={{ width: '0.875rem', height: '0.875rem' }} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {!quotations.length && (
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No quotations yet.</p>
            )}
            {quotations.slice(0, 5).map((q: any) => (
              <div
                key={q._id}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.5rem', borderRadius: '8px', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-gray-50)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '8px', background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-700)', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                  {q.user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{q.user?.name}</p>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-text-tertiary)' }}>#{q.referenceNumber}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0, textTransform: 'capitalize' }}>{q.poolType} pool · {q.location?.city || 'Zimbabwe'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  {q.quotedAmount?.amount && (
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary-900)' }}>${q.quotedAmount.amount.toLocaleString()}</span>
                  )}
                  <span className={STATUS_BADGE[q.status] || 'badge badge-gray'}>{q.status}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Live feed */}
        <motion.div {...f(0.3)} className="card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9375rem', margin: 0 }}>Live Feed</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' }}>Recent activity</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              ...openConvs.slice(0, 3).map((c: any) => ({
                icon: MessageCircle, label: c.user?.name || 'User',
                sub: c.lastMessage || 'Sent a message', time: c.lastMessageAt,
                color: 'blue', unread: c.unreadByAdmin,
              })),
              ...quotations.filter((q: any) => q.status === 'pending').slice(0, 2).map((q: any) => ({
                icon: FileText, label: q.user?.name || 'User',
                sub: `New ${q.poolType} pool quote`, time: q.createdAt,
                color: 'amber', unread: 0,
              })),
            ]
              .sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
              .slice(0, 7)
              .map(({ icon: Icon, label, sub, time, color, unread }, i) => {
                const c = colorMap[color] || colorMap.blue
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: c.bg, border: `1px solid ${c.border}` }}>
                      <Icon style={{ width: '0.875rem', height: '0.875rem', color: c.text }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{label}</p>
                        {unread > 0 && (
                          <span style={{ width: '1rem', height: '1rem', borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: '0.5625rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</p>
                      <p style={{ fontSize: '0.625rem', color: 'var(--color-text-tertiary)', margin: 0 }}>{time ? formatDistanceToNow(new Date(time)) + ' ago' : ''}</p>
                    </div>
                  </div>
                )
              })}
            {!openConvs.length && !quotations.length && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <Activity style={{ width: '2rem', height: '2rem', color: 'var(--color-gray-200)', margin: '0 auto 0.5rem' }} />
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>No recent activity</p>
              </div>
            )}
          </div>
          <Link to="/admin/chat" className="btn btn-secondary btn-md" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1rem', textDecoration: 'none', gap: '0.5rem' }}>
            <MessageCircle style={{ width: '1rem', height: '1rem' }} /> Open Inbox
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

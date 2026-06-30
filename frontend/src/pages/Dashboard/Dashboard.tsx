/*
 ****************************************************************************************************************************
 * Filename    : Dashboard
 * Description : Main DAM dashboard containing asset management, upload, and user account views, team creation.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

import { useState, useEffect } from 'react'
import { authService } from '../../services'
import { damLogo, assetsIcon, uploadIcon, collectionsIcon } from '../../assets'
import type { AuthUser, AssetItem } from '../../types'
import { useAssets, useTeams } from '../../hooks'
import UploadZone from './components/UploadZone/UploadZone'
import AssetGallery from './components/AssetGallery/AssetGallery'
import AssetPreview from './components/AssetPreview/AssetPreview'
import Teams from './components/Teams/Teams'
import './Dashboard.css'

type DashboardProps = {
  onLogout: () => void
}

type NavKey = 'assets' | 'upload' | 'teams'

type NavItem = {
  key: NavKey
  label: string
  iconSrc: string
}

const NAV_ITEMS: NavItem[] = [
  { key: 'assets', label: 'Assets', iconSrc: assetsIcon },
  { key: 'upload', label: 'Upload', iconSrc: uploadIcon },
  { key: 'teams', label: 'Teams', iconSrc: collectionsIcon },
]

export default function Dashboard({ onLogout }: DashboardProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [activeNav, setActiveNav] = useState<NavKey>('assets')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [previewAsset, setPreviewAsset] = useState<AssetItem | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [assetSource, setAssetSource] = useState<'mine' | 'shared'>('mine')

  const { teams } = useTeams()
  const { assets, isLoading, error, addAssets, removeAsset } = useAssets(
    search,
    typeFilter,
    sortOrder,
    assetSource
  )

  useEffect(() => {
    authService
      .curLoggedInUser()
      .then(setUser)
      .catch(() => onLogout()) // redirect to login if the cookie has expired
  }, [onLogout])

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await authService.logout()
    } finally {
      onLogout()
    }
  }

  function handleUploaded(uploaded: AssetItem[]) {
    addAssets(uploaded)
    setActiveNav('assets')
  }

  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? '?'

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="dashboard-layout">
      {/* Dashboard Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <img src={damLogo} alt="DAM" width={28} height={28} />
          <span className="logo-name">DAM</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ key, label, iconSrc }) => (
            <button
              key={key}
              type="button"
              className={`nav-item${activeNav === key ? ' nav-item--active' : ''}`}
              onClick={() => setActiveNav(key)}
            >
              <span className="nav-icon" aria-hidden="true">
                <img
                  src={iconSrc}
                  alt=""
                  width={16}
                  height={16}
                  className="nav-icon-img"
                />
              </span>
              {label}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar" aria-hidden="true">
              {avatarLetter}
            </div>
            <div className="user-meta">
              <p className="user-email" title={user?.email ?? ''}>
                {user?.email ?? '…'}
              </p>
              <p className="user-role">{user?.role ?? ''}</p>
            </div>
          </div>

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Dashboard Main Content Area */}
      <div className="dashboard-main">
        {/* Top bar */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {NAV_ITEMS.find((n) => n.key === activeNav)?.label}
            </h1>
            <p className="page-date">{today}</p>
          </div>
        </header>

        {/* Scrollable content area */}
        <main className="content-area">
          {activeNav === 'upload' && (
            <UploadZone onUploaded={handleUploaded} teams={teams} />
          )}

          {activeNav === 'assets' && (
            <AssetGallery
              assets={assets}
              isLoading={isLoading}
              error={error}
              onDelete={removeAsset}
              onPreview={setPreviewAsset}
              search={search}
              onSearchChange={setSearch}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
              source={assetSource}
              onSourceChange={setAssetSource}
              currentUserId={user?.userId}
            />
          )}

          {activeNav === 'teams' && <Teams currentUserId={user?.userId} />}
        </main>
      </div>

      <AssetPreview
        asset={previewAsset}
        onClose={() => setPreviewAsset(null)}
      />
    </div>
  )
}

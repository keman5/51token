/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { SiteLogo } from '@/assets/site-logo'
import { useAuthStore } from '@/stores/auth-store'
import { PublicLayout } from '@/components/layout'
import { Footer } from '@/components/layout/components/footer'
import { EXTERNAL_APP_URLS } from '@/lib/external-app-urls'
import { FAQ, Features, Hero, Integrations, Pricing, Stats } from './components'
import { useHomeScrollRestoration } from './hooks'

const homeFooterColumns = [
  {
    title: '资源',
    links: [
      { text: '套餐价格', href: '#pricing' },
      { text: '接入示例', href: '#integrations' },
      { text: '系统状态', href: EXTERNAL_APP_URLS.console },
    ],
  },
  {
    title: '入口',
    links: [
      { text: '登录', href: EXTERNAL_APP_URLS.login },
      { text: '注册', href: EXTERNAL_APP_URLS.register },
      { text: '控制台', href: EXTERNAL_APP_URLS.console },
    ],
  },
]

export function Home() {
  const { auth } = useAuthStore()
  const isAuthenticated = !!auth.user
  useHomeScrollRestoration(true)

  return (
    <PublicLayout
      showMainContainer={false}
      showAuthButtons={false}
      showNotifications={false}
      logo={<SiteLogo className='size-5' />}
      siteName='51token'
      navLinks={[
        { title: '主页', href: '/' },
        { title: '控制台', href: EXTERNAL_APP_URLS.console, external: true },
      ]}
    >
      <Hero isAuthenticated={isAuthenticated} />
      <Stats />
      <Pricing isAuthenticated={isAuthenticated} />
      <Features />
      <Integrations />
      <FAQ />
      <Footer name='51token' columns={homeFooterColumns} />
    </PublicLayout>
  )
}

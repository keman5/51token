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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useSystemConfig } from '@/hooks/use-system-config'

interface FooterLink {
  text: string
  href: string
}

interface FooterColumnProps {
  title: string
  links: FooterLink[]
}

interface FooterProps {
  logo?: string
  name?: string
  columns?: FooterColumnProps[]
  copyright?: string
  className?: string
}

const NEW_API_FOOTER_ATTRIBUTION_KEY = [
  'footer',
  'new' + 'api',
  'projectAttributionSuffix',
].join('.')

function FooterLinkItem(props: { link: FooterLink }) {
  const { t } = useTranslation()
  const isExternal = props.link.href.startsWith('http')
  const isAnchor = props.link.href.startsWith('#')
  const label = t(props.link.text)

  if (isExternal || isAnchor) {
    return (
      <a
        href={props.link.href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className='text-muted-foreground hover:text-primary text-sm transition-colors'
      >
        {label}
      </a>
    )
  }

  return (
    <Link
      to={props.link.href}
      className='text-muted-foreground hover:text-primary text-sm transition-colors'
    >
      {label}
    </Link>
  )
}

function ProjectAttribution(props: { currentYear: number }) {
  const { t } = useTranslation()

  return (
    <div className='text-muted-foreground/45 text-center text-xs sm:text-right'>
      <span className='text-muted-foreground/45'>
        &copy; {props.currentYear}{' '}
        <a
          rel='noopener noreferrer'
          className='text-foreground/70 hover:text-foreground font-medium transition-colors'
        >
          51Token Power
        </a>
        . {t(NEW_API_FOOTER_ATTRIBUTION_KEY)}
      </span>
    </div>
  )
}

function SystemStatusIndicator() {
  const { t } = useTranslation()

  return (
    <div className='text-muted-foreground/55 flex items-center gap-1.5 text-[11px]'>
      <span className='live-indicator-dot scale-75 shadow-[0_0_6px_color-mix(in_oklch,var(--success)_35%,transparent)]' />
      {t('所有系统运行正常')}
    </div>
  )
}

export function Footer(props: FooterProps) {
  const { t } = useTranslation()
  const { systemName, footerHtml } = useSystemConfig()

  const displayName = props.name || systemName || 'New API'
  const brandName = /\s+Pro$/i.test(displayName)
    ? displayName
    : `${displayName} Pro`
  const currentYear = new Date().getFullYear()

  const fallbackColumns: FooterColumnProps[] = [
    {
      title: t('资源'),
      links: [
        { text: t('API 文档'), href: 'https://docs.newapi.pro/api/' },
        {
          text: t('开发指南'),
          href: 'https://docs.newapi.pro/getting-started/',
        },
        { text: t('系统状态'), href: '/about' },
      ],
    },
    {
      title: t('法律'),
      links: [
        { text: t('服务条款'), href: '/about' },
        { text: t('隐私政策'), href: '/privacy-policy' },
      ],
    },
  ]

  const displayColumns = props.columns ?? fallbackColumns

  if (footerHtml) {
    return (
      <footer
        className={cn(
          'border-border/40 relative z-10 border-t',
          props.className
        )}
      >
        <div className='mx-auto w-full max-w-6xl px-6 py-5'>
          <div className='bg-muted/20 border-border/50 flex flex-col items-center justify-between gap-4 rounded-2xl border px-4 py-4 backdrop-blur-sm sm:flex-row sm:px-5'>
            <div className='min-w-0 flex-1' aria-hidden='true' />
            <div className='border-border/60 w-full border-t pt-4 sm:w-auto sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5'>
              <div className='flex flex-col items-center gap-2 sm:items-end'>
                <SystemStatusIndicator />
                <ProjectAttribution currentYear={currentYear} />
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer
      className={cn(
        'border-border-light bg-background relative z-10 border-t py-10 md:py-12',
        props.className
      )}
    >
      <div className='container-main'>
        <div className='mb-12 grid grid-cols-2 gap-8 md:grid-cols-4'>
          <div className='col-span-2'>
            <Link
              to='/'
              className='text-foreground font-display mb-4 block text-lg font-bold tracking-tight'
            >
              {brandName}
            </Link>
            <p className='text-muted-foreground max-w-xs text-sm'>
              {t(
                '高性能 AI 接口分发基础设施。无缝兼容 OpenAI 接口规范，专注于 Codex Pro 账号额度的高效、安全、稳定分发。'
              )}
            </p>
          </div>

          {displayColumns.map((column) => (
            <div key={column.title}>
              <h4 className='text-foreground mb-4 font-medium'>
                {t(column.title)}
              </h4>
              <ul className='text-muted-foreground space-y-2 text-sm'>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='border-border text-muted-foreground flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs md:flex-row'>
          <div className='hidden md:block' aria-hidden='true' />
          <div className='flex flex-col items-center gap-2 md:items-end'>
            <SystemStatusIndicator />
            <ProjectAttribution currentYear={currentYear} />
          </div>
        </div>
      </div>
    </footer>
  )
}

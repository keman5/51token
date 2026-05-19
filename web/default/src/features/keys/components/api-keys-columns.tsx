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
import { useState, type MouseEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Loader2, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getUserGroups } from '@/lib/api'
import { formatQuota, formatTimestampToDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/data-table'
import { GroupBadge } from '@/components/group-badge'
import { StatusBadge } from '@/components/status-badge'
import { resetDueApiKeyQuotaWindows } from '../api'
import { API_KEY_STATUSES } from '../constants'
import { type ApiKey } from '../types'
import {
  ApiKeyCell,
  ModelLimitsCell,
  IpRestrictionsCell,
} from './api-keys-cells'
import { useApiKeys } from './api-keys-provider'
import { DataTableRowActions } from './data-table-row-actions'

function getQuotaProgressColor(percentage: number): string {
  if (percentage <= 10) return '[&_[data-slot=progress-indicator]]:bg-rose-500'
  if (percentage <= 30) return '[&_[data-slot=progress-indicator]]:bg-amber-500'
  return '[&_[data-slot=progress-indicator]]:bg-emerald-500'
}

function useGroupRatios(): Record<string, number> {
  const { data } = useQuery({
    queryKey: ['user-self-groups'],
    queryFn: getUserGroups,
    staleTime: 5 * 60 * 1000,
    select: (res) => {
      if (!res.success || !res.data) return {}
      const ratios: Record<string, number> = {}
      for (const [group, info] of Object.entries(res.data)) {
        if (typeof info.ratio === 'number') {
          ratios[group] = info.ratio
        }
      }
      return ratios
    },
  })

  return data ?? {}
}

function WindowQuotaLine({
  label,
  limit,
  used,
  available,
  expiresAt,
}: {
  label: string
  limit: number
  used: number
  available: number
  expiresAt: number
}) {
  if (limit <= 0) return null
  const percentage = limit > 0 ? (available / limit) * 100 : 0

  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between gap-3 text-xs'>
        <span className='text-muted-foreground'>{label}</span>
        <span className='font-mono tabular-nums'>
          {formatQuota(available)} / {formatQuota(limit)}
        </span>
      </div>
      <Progress
        value={percentage}
        className={cn('h-1', getQuotaProgressColor(percentage))}
      />
      <div className='text-muted-foreground font-mono text-[10px] tabular-nums'>
        {expiresAt > 0 ? formatTimestampToDate(expiresAt) : '-'}
        <span className='ml-2'>-{formatQuota(used)}</span>
      </div>
    </div>
  )
}

function WindowLimitsCell({ apiKey }: { apiKey: ApiKey }) {
  const { t } = useTranslation()
  const { triggerRefresh } = useApiKeys()
  const [isResetting, setIsResetting] = useState(false)
  const hasFiveHourLimit = apiKey.quota_5h_limit > 0
  const hasWeeklyLimit = apiKey.quota_weekly_limit > 0

  if (!hasFiveHourLimit && !hasWeeklyLimit) {
    return (
      <StatusBadge
        label={t('Disabled')}
        variant='neutral'
        copyable={false}
      />
    )
  }

  const handleResetQuotaWindows = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation()
    setIsResetting(true)
    try {
      const result = await resetDueApiKeyQuotaWindows(apiKey.id)
      if (!result.success) {
        toast.error(result.message || t('Unexpected error occurred'))
        return
      }
      if ((result.data?.reset_count ?? 0) > 0) {
        toast.success(result.message || t('5h quota reset'))
      } else {
        toast.info(result.message || t('No 5h quota limit configured'))
      }
      triggerRefresh()
    } catch {
      toast.error(t('Unexpected error occurred'))
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className='flex items-start gap-1.5'>
      <Tooltip>
        <TooltipTrigger render={<div className='w-[190px] space-y-2' />}>
          <WindowQuotaLine
            label='5h'
            limit={apiKey.quota_5h_limit}
            used={apiKey.quota_5h_used}
            available={apiKey.quota_5h_available}
            expiresAt={apiKey.quota_5h_expires_at}
          />
          <WindowQuotaLine
            label={t('Weekly')}
            limit={apiKey.quota_weekly_limit}
            used={apiKey.quota_weekly_used}
            available={apiKey.quota_weekly_available}
            expiresAt={apiKey.quota_weekly_expires_at}
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className='space-y-1 text-xs'>
            {hasFiveHourLimit && (
              <div>
                5h: {formatQuota(apiKey.quota_5h_available)} /{' '}
                {formatQuota(apiKey.quota_5h_limit)}
              </div>
            )}
            {hasWeeklyLimit && (
              <div>
                {t('Weekly')}: {formatQuota(apiKey.quota_weekly_available)} /{' '}
                {formatQuota(apiKey.quota_weekly_limit)}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={handleResetQuotaWindows}
              disabled={isResetting}
              aria-label={t('Reset 5h quota')}
              className='mt-0.5 text-muted-foreground hover:text-foreground'
            />
          }
        >
          {isResetting ? (
            <Loader2 className='size-3.5 animate-spin' />
          ) : (
            <RotateCcw className='size-3.5' />
          )}
        </TooltipTrigger>
        <TooltipContent>{t('Reset 5h quota')}</TooltipContent>
      </Tooltip>
    </div>
  )
}

export function useApiKeysColumns(): ColumnDef<ApiKey>[] {
  const { t } = useTranslation()
  const groupRatios = useGroupRatios()
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
          className='translate-y-[2px]'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
          className='translate-y-[2px]'
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { label: t('Select') },
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Name')} />
      ),
      cell: ({ row }) => (
        <div className='max-w-[200px] truncate font-medium'>
          {row.getValue('name')}
        </div>
      ),
      meta: { label: t('Name'), mobileTitle: true },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Status')} />
      ),
      cell: ({ row }) => {
        const statusConfig = API_KEY_STATUSES[row.getValue('status') as number]
        if (!statusConfig) return null
        return (
          <StatusBadge
            label={t(statusConfig.label)}
            variant={statusConfig.variant}
            showDot={statusConfig.showDot}
            copyable={false}
          />
        )
      },
      filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
      meta: { label: t('Status'), mobileBadge: true },
    },
    {
      id: 'key',
      accessorKey: 'key',
      header: t('API Key'),
      cell: ({ row }) => <ApiKeyCell apiKey={row.original} />,
      enableSorting: false,
      meta: { label: t('API Key') },
    },
    {
      id: 'quota',
      accessorKey: 'remain_quota',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Quota')} />
      ),
      cell: ({ row }) => {
        const apiKey = row.original
        if (apiKey.unlimited_quota) {
          return (
            <StatusBadge
              label={t('Unlimited')}
              variant='neutral'
              copyable={false}
            />
          )
        }

        const used = apiKey.used_quota
        const remaining = apiKey.remain_quota
        const total = used + remaining
        const percentage = total > 0 ? (remaining / total) * 100 : 0

        return (
          <Tooltip>
            <TooltipTrigger render={<div className='w-[150px] space-y-1' />}>
              <div className='flex justify-between text-xs'>
                <span className='font-medium tabular-nums'>
                  {formatQuota(remaining)}
                </span>
                <span className='text-muted-foreground tabular-nums'>
                  {formatQuota(total)}
                </span>
              </div>
              <Progress
                value={percentage}
                className={cn('h-1.5', getQuotaProgressColor(percentage))}
              />
            </TooltipTrigger>
            <TooltipContent>
              <div className='space-y-1 text-xs'>
                <div>
                  {t('Used:')} {formatQuota(used)}
                </div>
                <div>
                  {t('Remaining:')} {formatQuota(remaining)} (
                  {percentage.toFixed(1)}%)
                </div>
                <div>
                  {t('Total:')} {formatQuota(total)}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )
      },
      meta: { label: t('Quota') },
    },
    {
      id: 'window_limits',
      accessorKey: 'quota_5h_limit',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Window Limits')} />
      ),
      cell: ({ row }) => {
        return <WindowLimitsCell apiKey={row.original} />
      },
      enableSorting: false,
      meta: { label: t('Window Limits'), mobileHidden: true },
    },
    {
      accessorKey: 'group',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Group')} />
      ),
      cell: ({ row }) => {
        const apiKey = row.original
        const group = row.getValue('group') as string
        const ratio = group && group !== 'auto' ? groupRatios[group] : undefined

        if (group === 'auto') {
          return (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className='inline-flex items-center gap-1.5 text-xs' />
                }
              >
                <GroupBadge group='auto' />
                {apiKey.cross_group_retry && (
                  <>
                    <span className='text-muted-foreground/30'>·</span>
                    <span className='text-muted-foreground/60'>
                      {t('Cross-group')}
                    </span>
                  </>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <span className='text-xs'>
                  {t(
                    'Automatically selects the best available group with circuit breaker mechanism'
                  )}
                </span>
              </TooltipContent>
            </Tooltip>
          )
        }
        return <GroupBadge group={group} ratio={ratio} />
      },
      meta: { label: t('Group'), mobileHidden: true },
    },
    {
      id: 'model_limits',
      accessorKey: 'model_limits',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Models')} />
      ),
      cell: ({ row }) => <ModelLimitsCell apiKey={row.original} />,
      enableSorting: false,
      meta: { label: t('Models'), mobileHidden: true },
    },
    {
      id: 'allow_ips',
      accessorKey: 'allow_ips',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('IP Restriction')} />
      ),
      cell: ({ row }) => <IpRestrictionsCell apiKey={row.original} />,
      enableSorting: false,
      meta: { label: t('IP Restriction'), mobileHidden: true },
    },
    {
      accessorKey: 'created_time',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Created')} />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground font-mono text-xs tabular-nums'>
          {formatTimestampToDate(row.getValue('created_time'))}
        </span>
      ),
      meta: { label: t('Created'), mobileHidden: true },
    },
    {
      accessorKey: 'accessed_time',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Last Used')} />
      ),
      cell: ({ row }) => {
        const accessedTime = row.getValue('accessed_time') as number
        if (!accessedTime) {
          return <span className='text-muted-foreground text-xs'>-</span>
        }
        return (
          <span className='text-muted-foreground font-mono text-xs tabular-nums'>
            {formatTimestampToDate(accessedTime)}
          </span>
        )
      },
      meta: { label: t('Last Used'), mobileHidden: true },
    },
    {
      accessorKey: 'expired_time',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Expires')} />
      ),
      cell: ({ row }) => {
        const expiredTime = row.getValue('expired_time') as number
        if (expiredTime === -1) {
          return (
            <StatusBadge
              label={t('Never')}
              variant='neutral'
              copyable={false}
            />
          )
        }
        const isExpired = expiredTime * 1000 < Date.now()
        return (
          <span
            className={cn(
              'font-mono text-xs tabular-nums',
              isExpired ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {formatTimestampToDate(expiredTime)}
          </span>
        )
      },
      meta: { label: t('Expires'), mobileHidden: true },
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
      meta: { label: t('Actions') },
      size: 88,
    },
  ]
}

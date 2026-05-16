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
import {
  Activity,
  Code2,
  Lock,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

interface FeaturesProps {
  className?: string
}

export function Features(_props: FeaturesProps) {
  const { t } = useTranslation()

  const features = [
    {
      title: t('100% 协议兼容'),
      description: t(
        '完全兼容 OpenAI 原生接口协议。你的业务代码只需修改 API Base 与 API Key，即可无缝迁移，零学习成本。'
      ),
      icon: Zap,
    },
    {
      title: t('动态负载均衡'),
      description: t(
        '内置高可用账号池管理。系统智能监控各 Codex Pro 账号的请求频率，自动剔除限流账号并重试。'
      ),
      icon: Server,
    },
    {
      title: t('详尽的调用日志'),
      description: t(
        '记录每一次 API 调用的耗时、Token 消耗、IP 来源及响应状态，支持多维度查询与数据导出。'
      ),
      icon: Activity,
    },
    {
      title: t('细粒度权限控制'),
      description: t(
        '为主帐号创建多个子密钥，每个子密钥可单独设置额度、模型权限、IP 白名单及过期时间。'
      ),
      icon: ShieldCheck,
    },
    {
      title: t('多租户与计费隔离'),
      description: t(
        '不同部门或项目组可使用不同的 Key，账单各自独立，额度使用情况清晰可追踪。'
      ),
      icon: Users,
    },
    {
      title: t('数据脱敏与隐私保护'),
      description: t(
        '网关层专注数据流转发与用量统计，避免业务 Prompt 与响应内容在本地落盘。'
      ),
      icon: Lock,
    },
    {
      title: t('流式响应毫无延迟'),
      description: t(
        '核心转发层采用高效的非阻塞 I/O，SSE 流式返回延迟保持在更轻盈的体验区间。'
      ),
      icon: Sparkles,
    },
    {
      title: t('极其简单的运维'),
      description: t(
        '后台提供完善的大盘监控体系，一站式管理所有渠道、用户状态及系统配置。'
      ),
      icon: Code2,
    },
  ]

  return (
    <section className='bg-background border-border/60 relative overflow-hidden border-t py-24'>
      <div
        aria-hidden
        className='bg-primary/5 pointer-events-none absolute top-0 right-0 size-[36rem] translate-x-1/3 -translate-y-1/3 rounded-full blur-3xl'
      />

      <div className='container-main relative z-10'>
        <div className='mb-16 text-center'>
          <h2 className='text-foreground mb-4 text-3xl font-bold tracking-tight md:text-4xl'>
            {t('高可用 AI 服务的核心基础设施')}
          </h2>
          <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
            {t(
              '不止于简单的接口转发，更为团队资源管理、高并发调度与可观测性提供完善的系统保障。'
            )}
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className='panel-card group hover:bg-muted/30 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
            >
              <div className='border-border bg-background group-hover:border-primary/40 mb-6 flex size-12 items-center justify-center rounded-xl border shadow-inner transition-colors'>
                <feature.icon className='text-muted-foreground group-hover:text-foreground size-6 transition-colors' />
              </div>
              <h3 className='text-foreground mb-2 text-lg font-bold'>
                {feature.title}
              </h3>
              <p className='text-muted-foreground text-sm leading-relaxed font-medium'>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

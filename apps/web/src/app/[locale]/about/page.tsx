import { db, settings } from '@furbase/db'
import { getTranslations } from 'next-intl/server'
import Header from '@/components/header'
import { MapPin, Phone, Mail, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export default async function AboutPage() {
  const [config, t] = await Promise.all([
    db.select().from(settings).limit(1).then((r) => r[0] ?? null),
    getTranslations('About'),
  ])

  const contactItems: {
    icon: LucideIcon
    label: string
    value: string | null | undefined
    href?: string
    external?: boolean
  }[] = [
    { icon: MapPin, label: t('address'), value: config?.address },
    { icon: Phone, label: t('phone'), value: config?.phone, href: config?.phone ? `tel:${config.phone}` : undefined },
    { icon: Mail, label: t('email'), value: config?.email, href: config?.email ? `mailto:${config.email}` : undefined },
    {
      icon: Globe,
      label: t('website'),
      value: config?.website?.replace(/^https?:\/\//, ''),
      href: config?.website ?? undefined,
      external: true,
    },
  ].filter((item) => item.value)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header title={config?.name ?? undefined} />

      <main className="max-w-3xl mx-auto px-6 py-12">
        {config?.logo && (
          <img
            src={config.logo}
            alt={config.name}
            className="h-20 w-auto object-contain mb-8"
          />
        )}

        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          {config?.name ?? ''}
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-12">
          {config?.description ?? t('noDescription')}
        </p>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-4">
            {t('contact')}
          </h2>

          <div className="flex flex-col gap-4">
            {contactItems.map(({ icon: Icon, label, value, href, external }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="text-sm text-zinc-800 dark:text-zinc-200 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm text-zinc-800 dark:text-zinc-200">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

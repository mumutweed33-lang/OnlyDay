'use client'

import React from 'react'

interface BrandLogoProps {
  size?: number
  className?: string
}

interface BrandLockupProps {
  size?: number
  titleClassName?: string
  subtitle?: string
  subtitleClassName?: string
  className?: string
}

export function BrandLogo({ size = 40, className = '' }: BrandLogoProps) {
  return (
    <img
      src="/brand-logo.svg"
      alt="OnlyDay"
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  )
}

export function BrandLockup({
  size = 40,
  titleClassName = 'text-xl font-bold text-gradient',
  subtitle,
  subtitleClassName = 'hidden text-[11px] uppercase tracking-[0.24em] text-white/35 md:block',
  className = 'flex items-center gap-3',
}: BrandLockupProps) {
  return (
    <div className={className}>
      <BrandLogo size={size} className="select-none" />
      <div>
        <span className={titleClassName}>OnlyDay</span>
        {subtitle ? <p className={subtitleClassName}>{subtitle}</p> : null}
      </div>
    </div>
  )
}

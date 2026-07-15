'use client'

export default function ConfirmButton({
  confirm,
  className,
  style,
  children,
}: {
  confirm: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <button
      type="submit"
      className={className}
      style={style}
      onClick={(e) => {
        if (!window.confirm(confirm)) e.preventDefault()
      }}
    >
      {children}
    </button>
  )
}

'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  displayValue: string
  setDisplayValue: (value: string) => void
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export function Select({ value = '', onValueChange, children }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [displayValue, setDisplayValue] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Sincronizar com valor externo
  useEffect(() => {
    if (value !== undefined) {
      setDisplayValue(value)
    }
  }, [value])

  // Fechar quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleValueChange = (newValue: string) => {
    setDisplayValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ 
      value: value || displayValue, 
      onValueChange: handleValueChange, 
      open, 
      setOpen,
      displayValue,
      setDisplayValue
    }}>
      <div className="relative" ref={containerRef}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps {
  className?: string
  children: React.ReactNode
}

export function SelectTrigger({ className = '', children }: SelectTriggerProps) {
  const context = useContext(SelectContext)
  if (!context) throw new Error('SelectTrigger must be used within Select')

  const { open, setOpen } = context

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(!open)
  }

  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={handleClick}
      onFocus={(e) => e.preventDefault()}
    >
      {children}
      <svg
        className={`h-4 w-4 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <polyline points="6,9 12,15 18,9" />
      </svg>
    </button>
  )
}

interface SelectValueProps {
  placeholder?: string
  children?: React.ReactNode
}

export function SelectValue({ placeholder, children }: SelectValueProps) {
  const context = useContext(SelectContext)
  if (!context) throw new Error('SelectValue must be used within Select')

  const { value, displayValue } = context
  
  if (children) {
    return <span>{children}</span>
  }
  
  const displayText = value || displayValue || placeholder
  return <span className={!displayText || displayText === placeholder ? 'text-muted-foreground' : ''}>{displayText || placeholder}</span>
}

interface SelectContentProps {
  className?: string
  children: React.ReactNode
}

export function SelectContent({ className = '', children }: SelectContentProps) {
  const context = useContext(SelectContext)
  if (!context) throw new Error('SelectContent must be used within Select')

  const { open } = context

  if (!open) return null

  return (
    <div className={`absolute top-full left-0 right-0 z-50 mt-1 min-w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md ${className}`}>
      <div className="max-h-60 overflow-y-auto p-1">
        {children}
      </div>
    </div>
  )
}

interface SelectItemProps {
  value: string
  className?: string
  children: React.ReactNode
}

export function SelectItem({ value, className = '', children }: SelectItemProps) {
  const context = useContext(SelectContext)
  if (!context) throw new Error('SelectItem must be used within Select')

  const { onValueChange, value: selectedValue } = context
  const isSelected = selectedValue === value

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onValueChange(value)
  }

  return (
    <div
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${isSelected ? 'bg-accent text-accent-foreground' : ''} ${className}`}
      onClick={handleClick}
      role="option"
      aria-selected={isSelected}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <polyline points="20,6 9,17 4,12" />
          </svg>
        </span>
      )}
      <span className={isSelected ? 'pl-6' : ''}>{children}</span>
    </div>
  )
}
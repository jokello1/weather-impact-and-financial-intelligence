import * as React from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Sheet = SheetPrimitive.Root
export const SheetTrigger = SheetPrimitive.Trigger
export const SheetClose = SheetPrimitive.Close
export const SheetPortal = SheetPrimitive.Portal

export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 data-[state=closed]:opacity-0 data-[state=open]:opacity-100',
      className,
    )}
    {...props}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  side?: 'left' | 'right'
}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = 'left', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        'glass-panel fixed inset-y-0 z-50 flex h-dvh max-h-dvh w-[min(320px,90vw)] flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:w-[min(340px,88vw)]',
        side === 'left' &&
          'left-0 data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0',
        side === 'right' &&
          'right-0 data-[state=closed]:translate-x-full data-[state=open]:translate-x-0',
        className,
      )}
      {...props}
    >
      <SheetPrimitive.Close className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/60 lg:right-4 lg:top-4">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 pt-11 [-webkit-overflow-scrolling:touch]">
        {children}
      </div>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

'use client'

import { signIn } from 'next-auth/react'
import { Button } from './ui/button'

export interface SignInButtonProps {
  className?: string
}

export function SignInButton({ className }: SignInButtonProps) {
  function handleClick() {
    signIn('twitch')
  }

  return (
    <Button className={className} onClick={handleClick}>
      Увійти
    </Button>
  )
}

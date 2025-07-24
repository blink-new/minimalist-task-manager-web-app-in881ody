import { useState } from 'react'

type ToastProps = {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export const toast = ({ title, description, variant = 'default' }: ToastProps) => {
  // Simple toast implementation - in a real app you'd use a proper toast library
  const message = description ? `${title}: ${description}` : title
  
  if (variant === 'destructive') {
    console.error(message)
    alert(message) // Simple fallback for demo
  } else {
    console.log(message)
    alert(message) // Simple fallback for demo
  }
}

export const useToast = () => {
  return { toast }
}
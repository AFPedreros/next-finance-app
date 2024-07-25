import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/accounts')({
  component: () => <div>Hello /accounts!</div>
})
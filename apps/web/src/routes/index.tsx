import { createFileRoute } from '@tanstack/react-router'

const App = () => {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: App,
})

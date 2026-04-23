import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App.jsx'

describe('App', () => {
  it('renders the project title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /shadow stack project/i })).toBeInTheDocument()
  })

  it('renders the ready message', () => {
    render(<App />)
    expect(screen.getByText(/ready for development/i)).toBeInTheDocument()
  })
})

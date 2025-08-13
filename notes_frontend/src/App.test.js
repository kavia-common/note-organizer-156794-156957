import { render, screen } from '@testing-library/react';
import App from './App';

test('renders New Note action', () => {
  render(<App />);
  const btn = screen.getByRole('button', { name: /new note/i });
  expect(btn).toBeInTheDocument();
});

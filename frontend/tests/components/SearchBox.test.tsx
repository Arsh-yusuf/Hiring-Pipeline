import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBox } from '../../src/components/search/SearchBox';

describe('SearchBox', () => {
  it('renders search input', () => {
    render(<SearchBox onSearch={() => {}} />);
    const input = screen.getByPlaceholderText(/search candidates/i);
    expect(input).toBeDefined();
  });

  it('calls onSearch when form is submitted', () => {
    const mockSearch = vi.fn();
    render(<SearchBox onSearch={mockSearch} />);
    
    const input = screen.getByPlaceholderText(/search candidates/i);
    const button = screen.getByRole('button');
    
    fireEvent.change(input, { target: { value: 'John Doe' } });
    fireEvent.click(button);
    
    expect(mockSearch).toHaveBeenCalledWith('John Doe');
  });

  it('disables button when input is empty', () => {
    render(<SearchBox onSearch={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveProperty('disabled', true);
  });

  it('enables button when input has value', () => {
    render(<SearchBox onSearch={() => {}} />);
    const input = screen.getByPlaceholderText(/search candidates/i);
    const button = screen.getByRole('button');
    
    fireEvent.change(input, { target: { value: 'test' } });
    expect(button).toHaveProperty('disabled', false);
  });

  it('shows loading state', () => {
    render(<SearchBox onSearch={() => {}} loading={true} />);
    expect(screen.getByText(/searching/i)).toBeDefined();
  });
});
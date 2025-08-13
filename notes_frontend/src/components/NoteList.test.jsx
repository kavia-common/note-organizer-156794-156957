import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NoteList from './NoteList';

describe('NoteList interactions', () => {
  const sampleNote = {
    id: '1',
    title: 'Sample',
    content: 'Some content',
    tags: ['work'],
    updated_at: new Date().toISOString()
  };

  test('clicking delete button calls onDelete with note id', () => {
    const onSelect = jest.fn();
    const onDelete = jest.fn();

    render(
      <NoteList
        notes={[sampleNote]}
        selectedId=""
        onSelect={onSelect}
        onDelete={onDelete}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /delete sample/i });
    fireEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith('1');
    expect(onSelect).not.toHaveBeenCalled();
  });

  test('clicking on the list item (not delete) calls onSelect', () => {
    const onSelect = jest.fn();
    const onDelete = jest.fn();

    render(
      <NoteList
        notes={[sampleNote]}
        selectedId=""
        onSelect={onSelect}
        onDelete={onDelete}
      />
    );

    // Click on the title text area to simulate selecting the card
    const title = screen.getByText(/sample/i);
    fireEvent.click(title);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('1');
    expect(onDelete).not.toHaveBeenCalled();
  });
});

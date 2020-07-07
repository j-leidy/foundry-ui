import React from 'react';
import { render, fireEvent, waitFor, act, configure } from '@testing-library/react';
import Dropdown from '../Dropdown';

configure({ testIdAttribute: 'data-test-id' });

const pokeOptions = [
  { id: 'bulbasaur', optionValue: 'Bulbasaur' },
  { id: 'charmander', optionValue: 'Charmander' },
  { id: 'squirtle', optionValue: 'Squirtle' },
];

const mockedSelectHandler = jest.fn();

describe('Dropdown', () => {
  it('does not display options on initial render', () => {
    const { container } = render(
      <Dropdown onSelect={mockedSelectHandler} name="choosePokemon" options={pokeOptions} />,
    );

    expect(container).toMatchSnapshot();
  });

  it('displays all options when focused', () => {
    const { container, getByTestId, getByText } = render(
      <Dropdown onSelect={mockedSelectHandler} name="choosePokemon" options={pokeOptions} />,
    );
    act(() => {
      fireEvent.focus(getByTestId('choosePokemon-container'));
    });
    expect(container).toMatchSnapshot();
  });

  it('can focus dropdown and select option', async () => {
    const { container, getByTestId, getByText } = render(
      <Dropdown onSelect={mockedSelectHandler} name="choosePokemon" options={pokeOptions} />,
    );

    // TODO - Don't use data-test-id, see if we can use a more semantically meaningful element
    fireEvent.focus(getByTestId('choosePokemon-container'));
    await waitFor(() => getByText('Charmander'));
    act(() => {
      fireEvent.click(getByText('Charmander'));
    });
    expect(container).toMatchSnapshot();
    expect(mockedSelectHandler).toHaveBeenCalled();
  });

  it('selects multiple options when dropdown is multi', async () => {
    const { container, getByTestId, getByText, queryByText } = render(
      <Dropdown onSelect={mockedSelectHandler} multi name="choosePokemon" options={pokeOptions} />,
    );

    getByTestId('choosePokemon-container').focus();
    act(() => {
      fireEvent.click(getByText('Charmander'));
      fireEvent.click(getByText('Squirtle'));
      fireEvent.blur(getByTestId('choosePokemon-container'));
    });
    await waitFor(() => queryByText(/Bulbasaur/) === null);

    expect(container).toMatchSnapshot();
    expect(mockedSelectHandler).toHaveBeenCalledTimes(2);
  });

  it('deselects option when clicking on them twice when dropdown is multi', async () => {
    const { container, getByTestId, getByText, getAllByText } = render(
      <Dropdown onSelect={mockedSelectHandler} multi name="choosePokemon" options={pokeOptions} />,
    );

    act(() => {
      fireEvent.focus(getByTestId('choosePokemon-container'));
    });
    const charOption = getByText('Charmander');
    act(() => {
      fireEvent.click(charOption);
      fireEvent.click(charOption);
      fireEvent.blur(getByTestId('choosePokemon-container'));
    });
    expect(container).toMatchSnapshot();
    expect(mockedSelectHandler).toHaveBeenCalledTimes(2);
  });

  it('closes options when clicking outside', async () => {
    const { container, getByTestId, getByText, queryByText, asFragment } = render(
      <Dropdown onSelect={mockedSelectHandler} name="choosePokemon" options={pokeOptions} />,
    );

    getByTestId('choosePokemon-container').focus();
    await waitFor(() => queryByText('Squirtle') !== null);
    const optionsOutFrag = asFragment();
    expect(optionsOutFrag).toMatchSnapshot();

    act(() => {
      fireEvent.blur(getByTestId('choosePokemon-container'));
    });
    await waitFor(() => queryByText('Squirtle') === null);
    expect(queryByText('Squirtle')).toBeNull();

    const optionsClosedFrag = asFragment();
    expect(optionsClosedFrag).toMatchSnapshot();
  });

  it('can use arrow keys and enter to navigate options', async () => {
    const { container, getByTestId, getByText, queryByText } = render(
      <Dropdown onSelect={mockedSelectHandler} name="choosePokemon" options={pokeOptions} />,
    );
    getByTestId('choosePokemon-container').focus();
    await waitFor(() => expect(queryByText('Bulbasaur')).toNotBeNull());
    act(() => {
      fireEvent.keyDown(document.activeElement, { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.keyDown(document.activeElement, { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.keyDown(document.activeElement, { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.keyDown(document.activeElement, { key: 'ArrowUp', code: 'ArrowUp' });
      fireEvent.keyDown(document.activeElement, { key: 'Enter', code: 'Enter' });
    });

    await waitFor(() => expect(queryByText('Squirtle')).toBeNull());
    await waitFor(() => expect(getByText('Charmander')).toBeInTheDocument());

    expect(container).toMatchSnapshot();
  });

  it('selects options from values prop', () => {
    const { container } = render(
      <Dropdown
        multi
        name="choosePokemon"
        options={pokeOptions}
        values={['bulbasaur', 'charmander']}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});

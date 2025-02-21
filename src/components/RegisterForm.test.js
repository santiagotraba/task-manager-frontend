import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import RegisterForm from './RegisterForm';

// Mock de axios
jest.mock('axios');

const renderComponent = () => {
  render(
    <ChakraProvider>
      <Router>
        <RegisterForm />
      </Router>
    </ChakraProvider>
  );
};

test('renders RegisterForm and submits successfully', async () => {
  axios.post.mockResolvedValue({ data: { message: 'User registered successfully' } });

  renderComponent();

  fireEvent.change(screen.getByPlaceholderText('Username'), {
    target: { value: 'John Doe' },
  });

  fireEvent.change(screen.getByPlaceholderText('Password'), {
    target: { value: 'password123' },
  });

  fireEvent.click(screen.getByText('Register'));

  await waitFor(() =>
    expect(screen.getByText('User registered successfully')).toBeInTheDocument()
  );
});

test('shows error message when registration fails', async () => {
  axios.post.mockRejectedValue({ response: { data: { error: 'Error registering user' } } });

  renderComponent();

  fireEvent.change(screen.getByPlaceholderText('Username'), {
    target: { value: 'John Doe' },
  });

  fireEvent.change(screen.getByPlaceholderText('Password'), {
    target: { value: 'password123' },
  });

  fireEvent.click(screen.getByText('Register'));

  await waitFor(() =>
    expect(screen.getByText('Error registering user')).toBeInTheDocument()
  );
});
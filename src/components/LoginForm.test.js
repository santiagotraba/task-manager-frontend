import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginForm from './LoginForm';

// Mock de axios
jest.mock('axios');

const renderComponent = () => {
  render(
    <ChakraProvider>
      <Router>
        <LoginForm />
      </Router>
    </ChakraProvider>
  );
};

test('renders LoginForm and submits successfully', async () => {
  axios.post.mockResolvedValue({ data: { token: 'fake-token' } });

  renderComponent();

  fireEvent.change(screen.getByPlaceholderText('Username'), {
    target: { value: 'john.doe@example.com' },
  });

  fireEvent.change(screen.getByPlaceholderText('Password'), {
    target: { value: 'password123' },
  });

  fireEvent.click(screen.getByText('Login'));

  // Simula el comportamiento esperado después de un inicio de sesión exitoso
  await waitFor(() =>
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        username: 'john.doe@example.com',
        password: 'password123',
      })
    )
  );
});

test('shows error message when login fails', async () => {
  axios.post.mockRejectedValue({ response: { data: { error: 'Invalid credentials' } } });

  renderComponent();

  fireEvent.change(screen.getByPlaceholderText('Username'), {
    target: { value: 'john.doe@example.com' },
  });

  fireEvent.change(screen.getByPlaceholderText('Password'), {
    target: { value: 'password123' },
  });

  fireEvent.click(screen.getByText('Login'));

  await waitFor(() =>
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  );
});
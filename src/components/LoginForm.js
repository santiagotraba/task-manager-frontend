import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Input, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/auth/login', { username, password })
      .then(response => {
        localStorage.setItem('token', response.data.token);
        onLogin();
        navigate('/tasks'); // Redirigir al usuario a la página de tareas
      })
      .catch(error => {
        console.error(error);
        setError('Invalid credentials');
      });
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={4} borderWidth={1} borderRadius={8} mb={4}>
      <Input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        mb={2}
        required
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        mb={2}
        required
      />
      {error && <Text color="red.500" mb={2}>{error}</Text>}
      <Button type="submit" colorScheme="teal">Login</Button>
    </Box>
  );
};

export default LoginForm;
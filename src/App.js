import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { ChakraProvider, Button, Flex, Box } from '@chakra-ui/react'; // Importa Flex y Box
import { ToastContainer, toast } from 'react-toastify'; // Importa ToastContainer y toast
import 'react-toastify/dist/ReactToastify.css'; // Importa los estilos de react-toastify
import TaskList from './components/TaskList';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ChakraProvider>
      <Router>
        <Flex as="nav" p={4} bg="teal.500" color="white" justifyContent="space-between">
          <Box>
            {/* Muestra el botón de "Registrarse" solo si el usuario no está autenticado */}
            {!isAuthenticated && (
              <Link to="/register">
                <Button colorScheme="teal" variant="outline">
                  Registrarse
                </Button>
              </Link>
            )}
          </Box>
          <Box>
            {/* Muestra el botón de "Cerrar sesión" solo si el usuario está autenticado */}
            {isAuthenticated && (
              <Button onClick={handleLogout} colorScheme="red" variant="outline">
                Cerrar sesión
              </Button>
            )}
          </Box>
        </Flex>
        <Routes>
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/tasks"
            element={
              isAuthenticated ? (
                <TaskList tasks={tasks} setTasks={setTasks} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/tasks" : "/login"} />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/tasks" : "/login"} />} />
        </Routes>
      </Router>
      <ToastContainer /> {/* Agrega ToastContainer aquí */}
    </ChakraProvider>
  );
};

export default App;
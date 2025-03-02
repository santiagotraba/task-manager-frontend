import React, { useState } from "react";
import axios from "axios";
import { Box, Button, Input, Textarea, Text } from "@chakra-ui/react";
import { toast } from "react-toastify";
import { jwtDecode } from 'jwt-decode'; // Importación correcta

const AddTaskForm = ({ onTaskAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  // Función para decodificar el token y obtener el userId
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = jwtDecode(token); // Usa jwtDecode aquí
    return decoded.userId;
  };

  const validate = () => {
    const errors = {};
    if (!title) errors.title = "El título es obligatorio";
    if (!description) errors.description = "La descripción es obligatoria";
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
  
    const userId = getUserIdFromToken(); // Obtén el userId del token
    if (!userId) {
      toast.error("Usuario no autenticado");
      return;
    }
  
    axios
      .post(
        "http://localhost:5000/api/tasks",
        { title, description, userId }, // Incluye el userId en la solicitud
        {
          headers: { Authorization: `Bearer ${localStorage.token}` },
        }
      )
      .then((response) => {
        onTaskAdded(response.data);
        setTitle("");
        setDescription("");
        setErrors({});
        toast.success("Tarea agregada con éxito");
      })
      .catch((error) => {
        console.error(error);
        if (error.response && error.response.status === 401) {
          toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
          // Redirige al usuario a la página de inicio de sesión
          window.location.href = "/login";
        } else {
          toast.error("Error al agregar la tarea");
        }
      });
  };

  return (
    <Box
      as="form"
      onSubmit={(e) => handleSubmit(e)}
      p={4}
      borderWidth={1}
      borderRadius={8}
      mb={4}
    >
      <Input
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        mb={2}
        isInvalid={errors.title}
      />
      {errors.title && <Text color="red.500">{errors.title}</Text>}
      <Textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        mb={2}
        isInvalid={errors.description}
      />
      {errors.description && <Text color="red.500">{errors.description}</Text>}
      <Button type="submit" colorScheme="teal">
        Agregar Tarea
      </Button>
    </Box>
  );
};

export default AddTaskForm;
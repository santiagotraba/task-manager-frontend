import React, { useState } from "react";
import axios from "axios";
import { Box, Button, Input, Textarea, Text } from "@chakra-ui/react";
import { toast } from "react-toastify";

const AddTaskForm = ({ onTaskAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

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

    axios
      .post(
        "http://localhost:5000/api/tasks",
        { title, description },
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
        toast.error("Error al agregar la tarea");
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

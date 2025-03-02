import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Text,
  Input,
  Textarea,
  Select,
  Stack,
} from "@chakra-ui/react";
import AddTaskForm from "./AddTaskForm";
import { toast } from 'react-toastify'; // Importa toast de react-toastify

const TaskList = ({ onLogout }) => {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("date");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tasks', {
          headers: { Authorization: `Bearer ${localStorage.token}` },
        });
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Error al obtener las tareas"); // Usa toast.error aquí
      }
    };

    fetchTasks();
  }, []); // Elimina toast de las dependencias

  const toggleTaskCompletion = async (taskId, completed) => {
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        { completed: !completed }, // Cambia el estado de completado
        config
      );
      setTasks(
        tasks.map((task) => (task._id === taskId ? response.data : task))
      );
      toast.success(
        `Tarea marcada como ${!completed ? "completada" : "pendiente"}` // Mensaje dinámico
      );
    } catch (error) {
      console.error(
        "Error toggling task completion:",
        error.response ? error.response.data : error.message
      );
      toast.error("No se pudo actualizar el estado de la tarea.");
    }
  };

  const deleteTask = async (taskId) => {
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, config);
      setTasks(tasks.filter((task) => task._id !== taskId));
      toast.success("La tarea ha sido eliminada.");
    } catch (error) {
      console.error(
        "Error deleting task:",
        error.response ? error.response.data : error.message
      );
      toast.error("No se pudo eliminar la tarea.");
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setEditingTitle(task.title);
    setEditingDescription(task.description);
  };

  const validate = () => {
    const errors = {};
    if (!editingTitle) errors.title = "El título es obligatorio";
    if (!editingDescription)
      errors.description = "La descripción es obligatoria";
    return errors;
  };

  const saveEditing = async (taskId) => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        { title: editingTitle, description: editingDescription },
        config
      );
      setTasks(
        tasks.map((task) => (task._id === taskId ? response.data : task))
      );
      setEditingTaskId(null);
      setEditingTitle("");
      setEditingDescription("");
      setErrors({});
      toast.success("La tarea ha sido actualizada.");
    } catch (error) {
      console.error(
        "Error saving task:",
        error.response ? error.response.data : error.message
      );
      toast.error("No se pudo actualizar la tarea.");
    }
  };

  const addSubtask = async (taskId) => {
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      const response = await axios.post(
        `http://localhost:5000/api/tasks/${taskId}/subtasks`,
        { title: newSubtaskTitle },
        config
      );
      setTasks(
        tasks.map((task) => (task._id === taskId ? response.data : task))
      );
      setNewSubtaskTitle("");
      toast.success("La nueva subtarea ha sido agregada.");
    } catch (error) {
      console.error(
        "Error adding subtask:",
        error.response ? error.response.data : error.message
      );
      toast.error("No se pudo agregar la subtarea.");
    }
  };

  const toggleSubtaskCompletion = async (taskId, subtaskId, completed) => {
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
  
    console.log("Task ID:", taskId); // Depuración
    console.log("Subtask ID:", subtaskId); // Depuración
  
    try {
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}/subtasks/${subtaskId}`,
        { completed: !completed }, // Envía el nuevo estado de la subtarea
        config
      );
  
      setTasks(
        tasks.map((task) => {
          if (task._id === taskId) {
            const updatedSubtasks = task.subtasks.map((subtask) => {
              if (subtask._id === subtaskId) {
                return response.data.subtasks.find((st) => st._id === subtaskId); // Actualiza la subtarea
              }
              return subtask;
            });
            return {
              ...task,
              subtasks: updatedSubtasks,
            };
          }
          return task;
        })
      );
  
      toast.success("El estado de la subtarea ha sido actualizado.");
    } catch (error) {
      console.error(
        "Error toggling subtask completion:",
        error.response ? error.response.data : error.message
      );
      toast.error("No se pudo actualizar el estado de la subtarea.");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "notCompleted") return !task.completed;
    return true;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    if (sort === "date") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "title") return a.title.localeCompare(b.title);
    return 0;
  });

  const onTaskAdded = (task) => {
    setTasks([...tasks, task]);
  };

  return (
    <Box>
      <Flex mb={4}>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          mr={4}
        >
          <option value="all">Todas</option>
          <option value="completed">Completadas</option>
          <option value="notCompleted">No Completadas</option>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="date">Fecha</option>
          <option value="title">Título</option>
        </Select>
      </Flex>

      <AddTaskForm onTaskAdded={onTaskAdded} />

      <Box mt={6}>
        {sortedTasks.map((task) => (
          <Box
            key={task._id}
            p={4}
            border="1px solid gray"
            borderRadius="md"
            mb={4}
          >
            {editingTaskId === task._id ? (
              <Box>
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  placeholder="Título"
                  mb={2}
                />
                <Textarea
                  value={editingDescription}
                  onChange={(e) => setEditingDescription(e.target.value)}
                  placeholder="Descripción"
                  mb={2}
                />
                {errors.title && <Text color="red.500">{errors.title}</Text>}
                {errors.description && (
                  <Text color="red.500">{errors.description}</Text>
                )}
                <Button
                  onClick={() => saveEditing(task._id)}
                  colorScheme="blue"
                  mr={2}
                >
                  Guardar
                </Button>
                <Button
                  onClick={() => setEditingTaskId(null)}
                  colorScheme="gray"
                >
                  Cancelar
                </Button>
              </Box>
            ) : (
              <Box>
                <Text fontWeight="bold">{task.title}</Text>
                <Text>{task.description}</Text>
                <Text fontSize="sm" color="gray.500">
                  Creada el: {new Date(task.createdAt).toLocaleDateString()}
                </Text>
                <Checkbox
                  isChecked={task.completed}
                  onChange={() =>
                    toggleTaskCompletion(task._id, task.completed)
                  }
                >
                  {task.completed ? "Completada" : "Pendiente"} {/* Etiqueta dinámica */}
                </Checkbox>
                <Button
                  onClick={() => startEditing(task)}
                  colorScheme="yellow"
                  mt={2}
                >
                  Editar
                </Button>
                <Button
                  onClick={() => deleteTask(task._id)}
                  colorScheme="red"
                  mt={2}
                >
                  Eliminar
                </Button>
                <Stack spacing={2} mt={4}>
                  <Input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Nuevo subtarea"
                  />
                  <Button
                    onClick={() => addSubtask(task._id)}
                    colorScheme="teal"
                  >
                    Agregar subtarea
                  </Button>
                  {task.subtasks &&
                    task.subtasks.map((subtask) => (
                      <Box
                        key={subtask._id}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text>{subtask.title}</Text>
                        <Checkbox
                          isChecked={subtask.completed}
                          onChange={() =>
                            toggleSubtaskCompletion(
                              task._id,
                              subtask._id,
                              subtask.completed
                            )
                          }
                        >
                          Completada
                        </Checkbox>
                      </Box>
                    ))}
                </Stack>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default TaskList;
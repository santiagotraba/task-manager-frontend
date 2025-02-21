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
  useToast,
} from "@chakra-ui/react";

import AddTaskForm from "./AddTaskForm";

const TaskList = ({ onLogout }) => {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("date");
  const [tasks, setTasks] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      try {
        const response = await axios.get(
          "http://localhost:5000/api/tasks",
          config
        );
        if (response && response.data) {
          setTasks(response.data);
        } else {
          throw new Error("No tasks data found");
        }
      } catch (error) {
        console.error(
          "Error fetching tasks:",
          error.response ? error.response.data : error.message
        );
        if (error.response && error.response.data.error === "Invalid token") {
          onLogout();
        }
        toast({
          title: "Error",
          description: "Error fetching tasks",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchTasks();
  }, []);

  const toggleTaskCompletion = async (taskId, completed) => {
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        { completed: !completed },
        config
      );
      setTasks(
        tasks.map((task) => (task._id === taskId ? response.data : task))
      );
      toast({
        title: "Tarea actualizada",
        description: "El estado de la tarea ha sido actualizado.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(
        "Error toggling task completion:",
        error.response ? error.response.data : error.message
      );
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la tarea.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(
        "Error deleting task:",
        error.response ? error.response.data : error.message
      );
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
      toast({
        title: "Tarea actualizada",
        description: "La tarea ha sido actualizada.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(
        "Error saving task:",
        error.response ? error.response.data : error.message
      );
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const addTask = async () => {
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
      const response = await axios.post(
        "http://localhost:5000/api/tasks",
        { title: newTaskTitle, description: newTaskDescription },
        config
      );
      setTasks([...tasks, response.data]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      toast({
        title: "Tarea agregada",
        description: "La nueva tarea ha sido agregada.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(
        "Error adding task:",
        error.response ? error.response.data : error.message
      );
      toast({
        title: "Error",
        description: "No se pudo agregar la tarea.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
      toast({
        title: "Subtarea agregada",
        description: "La nueva subtarea ha sido agregada.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(
        "Error adding subtask:",
        error.response ? error.response.data : error.message
      );
      toast({
        title: "Error",
        description: "No se pudo agregar la subtarea.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const toggleSubtaskCompletion = async (taskId, subtaskId, completed) => {
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}/subtasks/${subtaskId}`,
        { completed: !completed },
        config
      );
  
      console.log("Respuesta de la API:", response.data); // Verifica la respuesta de la API
  
      setTasks(
        tasks.map((task) => {
          if (task._id === taskId) {
            const updatedSubtasks = task.subtasks.map((subtask) => {
              if (subtask._id === subtaskId) {
                return response.data; // Subtarea actualizada
              }
              return subtask; // Otras subtareas
            });
  
            console.log("Subtareas actualizadas:", updatedSubtasks); // Verifica las subtareas actualizadas
  
            return {
              ...task,
              subtasks: updatedSubtasks,
            };
          }
          return task; // Otras tareas
        })
      );
  
      console.log("Tareas actualizadas:", tasks); // Verifica las tareas actualizadas
  
      toast({
        title: "Subtarea actualizada",
        description: "El estado de la subtarea ha sido actualizado.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(
        "Error toggling subtask completion:",
        error.response ? error.response.data : error.message
      );
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la subtarea.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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

      {/* <Stack spacing={4}>
        <Input
          placeholder="Nuevo título de tarea"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <Textarea
          placeholder="Nueva descripción de tarea"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
        />
        <Button onClick={addTask} colorScheme="teal">Agregar tarea</Button>
      </Stack> */}

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
                <Checkbox
                  isChecked={task.completed}
                  onChange={() =>
                    toggleTaskCompletion(task._id, task.completed)
                  }
                >
                  Completada
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

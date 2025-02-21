import React from "react";
import { render, screen, fireEvent, waitFor, within  } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import { ChakraProvider } from "@chakra-ui/react";
import TaskList from "./TaskList";
import userEvent from "@testing-library/user-event"; // Asegúrate de importar esto

// Mock de axios
jest.mock("axios");

beforeEach(() => {
  jest.clearAllMocks(); // Limpia los mocks antes de cada test
});

// Mock de console.error
beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn(() => "fake-token"),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    },
    writable: true,
  });
});

const renderComponent = () => {
  render(
    <ChakraProvider>
      <TaskList setTasks={jest.fn()} onLogout={jest.fn()} />
    </ChakraProvider>
  );
};

test("shows error message when adding a task fails", async () => {
  render(
    <ChakraProvider>
      <TaskList setTasks={jest.fn()} onLogout={jest.fn()} />
    </ChakraProvider>
  );

  // Simula un error en la llamada a la API
  axios.post.mockRejectedValue({
    response: { data: { error: "Error adding task" } },
  });

  // Simula la entrada de datos en el formulario
  fireEvent.change(screen.getByPlaceholderText("Título"), {
    target: { value: "New Task" },
  });

  fireEvent.change(screen.getByPlaceholderText("Descripción"), {
    target: { value: "New Description" },
  });

  // Simula el clic en el botón "Agregar Tarea"
  fireEvent.click(screen.getByText("Agregar Tarea"));

  // Espera a que el toast con el mensaje de error aparezca en el DOM
  await waitFor(() => {
    expect(screen.getByText(/Error fetching tasks/i)).toBeInTheDocument();
  });
});

test("adds a task successfully", async () => {
  axios.post.mockResolvedValue({
    data: { _id: '3', title: 'New Task', description: 'New Description', completed: false, subtasks: [] },
  });

  renderComponent();

  fireEvent.change(screen.getByPlaceholderText("Título"), {
    target: { value: "New Task" },
  });

  fireEvent.change(screen.getByPlaceholderText("Descripción"), {
    target: { value: "New Description" },
  });

  fireEvent.click(screen.getByText("Agregar Tarea"));

  await waitFor(() =>
    expect(screen.getByText("New Task")).toBeInTheDocument()
  );
});

test("deletes a task successfully", async () => {
  // Mock de la lista de tareas
  const tasks = [
    {
      _id: "1",
      title: "Task 1",
      description: "Description 1",
      completed: false,
      subtasks: [],
      tags: [],
    },
  ];

  // Mock de la respuesta de la API para obtener las tareas
  axios.get.mockResolvedValue({ data: tasks });

  render(
    <ChakraProvider>
      <TaskList setTasks={jest.fn()} onLogout={jest.fn()} />
    </ChakraProvider>
  );

  // Espera a que las tareas se rendericen en el DOM
  await waitFor(() => {
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  // Mock de la respuesta de la API para eliminar la tarea
  axios.delete.mockResolvedValue({});

  // Busca el botón de eliminar y haz clic en él
  const deleteButtons = screen.getAllByText("Eliminar");
  fireEvent.click(deleteButtons[0]); // Selecciona el primer botón de eliminar

  // Espera a que la tarea desaparezca del DOM
  await waitFor(() => {
    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
  });
});

test("edits a task successfully", async () => {
  // Mock de la lista de tareas
  const tasks = [
    {
      _id: "1",
      title: "Task 1",
      description: "Description 1",
      completed: false,
      subtasks: [],
      tags: [],
    },
  ];

  // Mock de la respuesta de la API para obtener las tareas
  axios.get.mockResolvedValue({ data: tasks });

  render(
    <ChakraProvider>
      <TaskList setTasks={jest.fn()} onLogout={jest.fn()} />
    </ChakraProvider>
  );

  // Espera a que las tareas se rendericen en el DOM
  await waitFor(() => {
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  // Busca el botón de editar y haz clic en él
  const editButtons = screen.getAllByText("Editar");
  fireEvent.click(editButtons[0]); // Selecciona el primer botón de editar

  // Verifica que los campos de edición estén presentes
  const titleInputs = screen.getAllByPlaceholderText("Título");
  const descriptionInputs = screen.getAllByPlaceholderText("Descripción");

  const editTitleInput = titleInputs[1]; // Selecciona el segundo input (el de edición)
  const editDescriptionInput = descriptionInputs[1]; // Selecciona el segundo textarea (el de edición)

  // Simula la edición de la tarea
  fireEvent.change(editTitleInput, {
    target: { value: "Updated Task" },
  });
  fireEvent.change(editDescriptionInput, {
    target: { value: "Updated Description" },
  });

  // Mock de la respuesta de la API para guardar la edición
  axios.put.mockResolvedValue({
    data: {
      _id: "1",
      title: "Updated Task",
      description: "Updated Description",
      completed: false,
      subtasks: [],
      tags: [],
    },
  });

  // Haz clic en el botón de guardar
  fireEvent.click(screen.getByText("Guardar"));

  // Espera a que la tarea actualizada se renderice en el DOM
  await waitFor(() => {
    expect(screen.getByText("Updated Task")).toBeInTheDocument();
    expect(screen.getByText("Updated Description")).toBeInTheDocument();
  });
});

test("adds a subtask successfully", async () => {
  // Mock de la lista de tareas
  const tasks = [
    {
      _id: "1",
      title: "Task 1",
      description: "Description 1",
      completed: false,
      subtasks: [],
      tags: [],
    },
  ];

  // Mock de la respuesta de la API para obtener las tareas
  axios.get.mockResolvedValue({ data: tasks });

  render(
    <ChakraProvider>
      <TaskList setTasks={jest.fn()} onLogout={jest.fn()} />
    </ChakraProvider>
  );

  // Espera a que las tareas se rendericen en el DOM
  await waitFor(() => {
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  // Busca el campo de entrada para agregar una subtarea
  const subtaskInput = screen.getByPlaceholderText("Nuevo subtarea");

  // Simula la entrada de datos en el campo de subtarea
  fireEvent.change(subtaskInput, {
    target: { value: "New Subtask" },
  });

  // Mock de la respuesta de la API para agregar la subtarea
  axios.post.mockResolvedValue({
    data: {
      _id: "1-1",
      title: "New Subtask",
      completed: false,
    },
  });

  // Busca el botón de agregar subtarea y haz clic en él
  const addSubtaskButton = screen.getByText("Agregar subtarea");
  fireEvent.click(addSubtaskButton);

  // Espera a que la subtarea se renderice en el DOM
  await waitFor(() => {
    expect(screen.getByText("New Subtask")).toBeInTheDocument();
  });
});

test("toggles subtask completion", async () => {
  // Mock de la lista de tareas con una subtarea
  const tasks = [
    {
      _id: "1",
      title: "Task 1",
      description: "Description 1",
      completed: false,
      subtasks: [
        {
          _id: "1-1",
          title: "Subtask 1",
          completed: false,
        },
      ],
      tags: [],
    },
  ];

  // Mock de la respuesta de la API para obtener las tareas
  axios.get.mockResolvedValue({ data: tasks });

  render(
    <ChakraProvider>
      <TaskList setTasks={jest.fn()} onLogout={jest.fn()} />
    </ChakraProvider>
  );

  // Espera a que las tareas se rendericen en el DOM
  await waitFor(() => {
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  // Busca el contenedor de la subtarea
  const subtaskContainer = screen.getByText("Subtask 1").closest("div");

  // Busca el checkbox dentro del contenedor de la subtarea
  const subtaskCheckbox = within(subtaskContainer).getByRole("checkbox", {
    name: /Completada/i,
  });

  // Verifica que el checkbox esté desmarcado inicialmente
  expect(subtaskCheckbox).not.toBeChecked();

  // Mock de la respuesta de la API para alternar el estado de la subtarea
  axios.put.mockResolvedValue({
    data: {
      _id: "1-1",
      title: "Subtask 1",
      completed: true, // Simula que la subtarea ahora está completada
    },
  });

  // Simula el clic en el checkbox
  fireEvent.click(subtaskCheckbox);

  // Espera a que la llamada a la API se complete
  await waitFor(() => {
    expect(axios.put).toHaveBeenCalledTimes(1); // Verifica que axios.put fue llamado una vez
  });

  // Espera a que el estado del checkbox cambie
  await waitFor(() => {
    expect(subtaskCheckbox).toBeChecked(); // Verifica que el checkbox esté marcado
  });
});

test("filters completed tasks", async () => {
  renderComponent();

  fireEvent.change(screen.getByDisplayValue("Todas"), {
    target: { value: "completed" },
  });

  await waitFor(() =>
    expect(screen.queryByText("Task 1")).not.toBeInTheDocument()
  );
});

test("sorts tasks by title", async () => {
  renderComponent();

  fireEvent.change(screen.getByDisplayValue("Fecha"), {
    target: { value: "title" },
  });

  await waitFor(() =>
    expect(screen.getAllByText(/Task/)[0]).toHaveTextContent("Task 1")
  );
});

test("shows error message when deleting a task fails", async () => {
  // Mock de la lista de tareas
  const tasks = [
    {
      _id: "1",
      title: "Task 1",
      description: "Description 1",
      completed: false,
      subtasks: [],
      tags: [],
    },
  ];

  // Mock de la respuesta de la API para obtener las tareas
  axios.get.mockResolvedValue({ data: tasks });

  renderComponent();

  // Espera a que las tareas se rendericen en el DOM
  await waitFor(() => {
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  // Mock de la respuesta de la API para eliminar la tarea con error
  axios.delete.mockRejectedValue({
    response: { data: { error: "No se pudo eliminar la tarea." } },
  });

  // Busca el botón de eliminar y haz clic en él
  const deleteButtons = screen.getAllByText("Eliminar");
  fireEvent.click(deleteButtons[0]); // Selecciona el primer botón de eliminar

  // Espera a que el mensaje de error aparezca en el DOM
  await waitFor(() => {
    expect(screen.getByText("No se pudo eliminar la tarea.")).toBeInTheDocument();
  });
});

test("shows error message when editing a task fails", async () => {
  // Mock de la lista de tareas
  const tasks = [
    {
      _id: "1",
      title: "Task 1",
      description: "Description 1",
      completed: false,
      subtasks: [],
      tags: [],
    },
  ];

  // Mock de la respuesta de la API para obtener las tareas
  axios.get.mockResolvedValue({ data: tasks });

  renderComponent();

  // Espera a que las tareas se rendericen en el DOM
  await waitFor(() => {
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  // Busca el botón de editar y haz clic en él
  const editButtons = screen.getAllByText("Editar");
  fireEvent.click(editButtons[0]); // Selecciona el primer botón de editar

  // Verifica que los campos de edición estén presentes
  const titleInputs = screen.getAllByPlaceholderText("Título");
  const descriptionInputs = screen.getAllByPlaceholderText("Descripción");

  const editTitleInput = titleInputs[1]; // Selecciona el segundo input (el de edición)
  const editDescriptionInput = descriptionInputs[1]; // Selecciona el segundo textarea (el de edición)

  // Simula la edición de la tarea
  fireEvent.change(editTitleInput, {
    target: { value: "Updated Task" },
  });
  fireEvent.change(editDescriptionInput, {
    target: { value: "Updated Description" },
  });

  // Mock de la respuesta de la API para guardar la edición con error
  axios.put.mockRejectedValue({
    response: { data: { error: "No se pudo actualizar la tarea." } },
  });

  // Haz clic en el botón de guardar
  fireEvent.click(screen.getByText("Guardar"));

  // Espera a que el mensaje de error aparezca en el DOM
  await waitFor(() => {
    expect(screen.getByText("No se pudo actualizar la tarea.")).toBeInTheDocument();
  });
});

test("shows error message when adding a subtask fails", async () => {
  // Mock de la lista de tareas
  const tasks = [
    {
      _id: "1",
      title: "Task 1",
      description: "Description 1",
      completed: false,
      subtasks: [],
      tags: [],
    },
  ];

  // Mock de la respuesta de la API para obtener las tareas
  axios.get.mockResolvedValue({ data: tasks });

  renderComponent();

  // Espera a que las tareas se rendericen en el DOM
  await waitFor(() => {
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  // Mock de la respuesta de la API para agregar la subtarea con error
  axios.post.mockRejectedValue({
    response: { data: { error: "No se pudo agregar la subtarea." } },
  });

  // Busca el campo de entrada para agregar una subtarea
  const subtaskInput = screen.getByPlaceholderText("Nuevo subtarea");

  // Simula la entrada de datos en el campo de subtarea
  fireEvent.change(subtaskInput, {
    target: { value: "New Subtask" },
  });

  // Busca el botón de agregar subtarea y haz clic en él
  const addSubtaskButton = screen.getByText("Agregar subtarea");
  fireEvent.click(addSubtaskButton);

  // Espera a que el mensaje de error aparezca en el DOM
  await waitFor(() => {
    expect(screen.getByText("No se pudo agregar la subtarea.")).toBeInTheDocument();
  });
});

test("shows error message when toggling subtask completion fails", async () => {
  // Mock de la lista de tareas con una subtarea
  const tasks = [
    {
      _id: "1",
      title: "Task 1",
      description: "Description 1",
      completed: false,
      subtasks: [
        {
          _id: "1-1",
          title: "Subtask 1",
          completed: false,
        },
      ],
      tags: [],
    },
  ];

  // Mock de la respuesta de la API para obtener las tareas
  axios.get.mockResolvedValue({ data: tasks });

  renderComponent();

  // Espera a que las tareas se rendericen en el DOM
  await waitFor(() => {
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  // Busca el contenedor de la subtarea
  const subtaskContainer = screen.getByText("Subtask 1").closest("div");

  // Busca el checkbox dentro del contenedor de la subtarea
  const subtaskCheckbox = within(subtaskContainer).getByRole("checkbox", {
    name: /Completada/i,
  });

  // Verifica que el checkbox esté desmarcado inicialmente
  expect(subtaskCheckbox).not.toBeChecked();

  // Mock de la respuesta de la API para alternar el estado de la subtarea con error
  axios.put.mockRejectedValue({
    response: { data: { error: "No se pudo actualizar el estado de la subtarea." } },
  });

  // Simula el clic en el checkbox
  fireEvent.click(subtaskCheckbox);

  // Espera a que el mensaje de error aparezca en el DOM
  await waitFor(() => {
    expect(screen.getByText("No se pudo actualizar el estado de la subtarea.")).toBeInTheDocument();
  });
});

test("shows error message when fetching tasks fails", async () => {
  // Mock de la respuesta de la API para obtener las tareas con error
  axios.get.mockRejectedValue({
    response: { data: { error: "Error fetching tasks" } },
  });

  renderComponent();

  // Espera a que el mensaje de error aparezca en el DOM
  await waitFor(() => {
    expect(screen.getByText("Error fetching tasks")).toBeInTheDocument();
  });
});

test("shows error message when updating a task fails", async () => {
  // Mock de la lista de tareas
  const tasks = [
    {
      _id: "1",
      title: "Task 1",
      description: "Description 1",
      completed: false,
      subtasks: [],
      tags: [],
    },
  ];

  // Mock de la respuesta de la API para obtener las tareas
  axios.get.mockResolvedValue({ data: tasks });

  renderComponent();

  // Espera a que las tareas se rendericen en el DOM
  await waitFor(() => {
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  // Busca el botón de editar y haz clic en él
  const editButtons = screen.getAllByText("Editar");
  fireEvent.click(editButtons[0]); // Selecciona el primer botón de editar

  // Verifica que los campos de edición estén presentes
  const titleInputs = screen.getAllByPlaceholderText("Título");
  const descriptionInputs = screen.getAllByPlaceholderText("Descripción");

  const editTitleInput = titleInputs[1]; // Selecciona el segundo input (el de edición)
  const editDescriptionInput = descriptionInputs[1]; // Selecciona el segundo textarea (el de edición)

  // Simula la edición de la tarea
  fireEvent.change(editTitleInput, {
    target: { value: "Updated Task" },
  });
  fireEvent.change(editDescriptionInput, {
    target: { value: "Updated Description" },
  });

  // Mock de la respuesta de la API para guardar la edición con error
  axios.put.mockRejectedValue({
    response: { data: { error: "No se pudo actualizar la tarea." } },
  });

  // Haz clic en el botón de guardar
  fireEvent.click(screen.getByText("Guardar"));

  // Espera a que el mensaje de error aparezca en el DOM
  await waitFor(() => {
    expect(screen.getByText("No se pudo actualizar la tarea.")).toBeInTheDocument();
  });
});
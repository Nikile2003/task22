import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'Pending',
    due_date: '',
  });
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('All');

  // Fetch tasks from the backend
  useEffect(() => {
    axios.get('http://localhost:5000/tasks')
      .then(response => {
        setTasks(response.data);
      })
      .catch(error => console.error('Error fetching tasks:', error));
  }, []);

  // Add or Edit a task
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      // Update existing task
      const updatedTask = { ...editingTask, ...newTask }; // Merge changes into editingTask
      axios.put(`http://localhost:5000/tasks/${editingTask.id}`, updatedTask)
        .then(() => {
          setTasks(tasks.map(task =>
            task.id === editingTask.id ? updatedTask : task
          ));
          setEditingTask(null);
          setNewTask({ title: '', description: '', status: 'Pending', due_date: '' });
        })
        .catch(error => console.error('Error updating task:', error));
    } else {
      // Add new task
      axios.post('http://localhost:5000/tasks', newTask)
        .then(response => {
          setTasks([...tasks, { ...newTask, id: response.data.id }]);
          setNewTask({ title: '', description: '', status: 'Pending', due_date: '' });
        })
        .catch(error => console.error('Error adding task:', error));
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Edit a task
  const handleEdit = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      status: task.status,
      due_date: task.due_date,
    });
  };

  // Delete a task
  const handleDelete = (taskId) => {
    axios.delete(`http://localhost:5000/tasks/${taskId}`)
      .then(() => {
        setTasks(tasks.filter(task => task.id !== taskId));
      })
      .catch(error => console.error('Error deleting task:', error));
  };

  // Handle status change for a task
  const handleStatusChange = (taskId, newStatus) => {
    axios.put(`http://localhost:5000/tasks/${taskId}`, { status: newStatus })
      .then(() => {
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      })
      .catch(error => console.error('Error updating task status:', error));
  };

  // Filter tasks based on status
  const filteredTasks = tasks.filter(task => 
    filter === 'All' || task.status === filter
  );

  return (
    <div className="container">
      <h1 className="text-center">Task Management</h1>

      {/* Task Filter */}
      <div className="task-filter">
        <label>Filter by status: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Add or Edit Task Form */}
      <div className="task-form">
        <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={newTask.title}
            onChange={handleChange}
            placeholder="Task Title"
            required
          />
          <textarea
            name="description"
            value={newTask.description}
            onChange={handleChange}
            placeholder="Task Description"
            required
          />
          <input
            type="date"
            name="due_date"
            value={newTask.due_date}
            onChange={handleChange}
            required
          />
          <select
            name="status"
            value={newTask.status}
            onChange={handleChange}
            required
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <button type="submit">{editingTask ? 'Update Task' : 'Add Task'}</button>
        </form>
      </div>

      {/* Task List Table */}
      <div className="task-table-container">
        <h2>Task List</h2>
        <table className="task-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
                <td>{task.due_date}</td>
                <td>
                  <button className="button button-edit" onClick={() => handleEdit(task)}>Edit</button>
                  <button className="button button-delete ml-4" onClick={() => handleDelete(task.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;

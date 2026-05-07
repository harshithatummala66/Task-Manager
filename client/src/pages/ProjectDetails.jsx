import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function ProjectDetails({ user }) {
    const { id } = useParams(); // Get project ID from URL
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', assignedTo: '', dueDate: '' });
    const [newMemberId, setNewMemberId] = useState('');
    const [allUsers, setAllUsers] = useState([]); // Everyone in the DB
    const [projectMembers, setProjectMembers] = useState([]); // Only people in this project

    useEffect(() => {
        fetchTasks();
        fetchProjectMembers(); // New function
        if (user.role === 'Admin') fetchAllUsers(); // Existing function, renamed
    }, []);

    const fetchProjectMembers = async () => {
        const { data } = await api.get(`/projects/${id}/members`);
        setProjectMembers(data);
    };

    const fetchAllUsers = async () => {
        const { data } = await api.get('/users');
        setAllUsers(data);
    };

    const fetchTasks = async () => {
        const { data } = await api.get(`/tasks/${id}`);
        setTasks(data);
    };

    const fetchUsers = async () => {
        const { data } = await api.get('/users');
        setUsers(data);
    };

    const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      // Ensure the full newTask object (which includes dueDate) is sent
      await api.post('/tasks', { 
        title: newTask.title,
        project: id,
        assignedTo: newTask.assignedTo,
        dueDate: newTask.dueDate // 🚨 Ensure this is being sent!
      });
      
      setNewTask({ title: '', assignedTo: '', dueDate: '' });
      fetchTasks();
    } catch (error) {
      alert('Failed to create task');
    }
  };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/projects/${id}/members`, { newMemberId });
            alert('Member added!');
            setNewMemberId('');
            fetchProjectMembers(); // 🔥 REFRESH THIS to update the Task Assignment dropdown
        } catch (error) {
            alert('Error adding member');
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
            fetchTasks();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <Link to="/dashboard" className="text-blue-500 hover:underline mb-4 inline-block">
                    &larr; Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Project Tasks</h1>

                {/* Admin Control Panels - Side by Side */}
                {user.role === 'Admin' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                        {/* 1. Add Task Form */}
                        <form onSubmit={handleCreateTask} className="bg-white p-6 rounded shadow flex flex-col gap-4">
                            <h2 className="font-bold text-gray-700">Create New Task</h2>
                            <input
                                type="text" placeholder="Task Title" required
                                value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                className="p-2 border rounded"
                            />
                            <div className="flex gap-2">
                                <select
                                    required
                                    value={newTask.assignedTo}
                                    onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                    className="p-2 border rounded bg-white flex-1"
                                >
                                    <option value="" disabled>Assign to...</option>
                                    {/* ONLY show people already in the project */}
                                    {projectMembers.map(u => (
                                        <option key={u._id} value={u._id}>{u.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="date" required
                                    value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    className="p-2 border rounded"
                                />
                            </div>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold">
                                Add Task
                            </button>
                        </form>

                        {/* 2. Add Member to Project Form */}
                        <form onSubmit={handleAddMember} className="bg-white p-6 rounded shadow flex flex-col gap-4">
                            <h2 className="font-bold text-gray-700">Add Member to Project</h2>
                            <p className="text-sm text-gray-500">Allow a new user to view this board on their dashboard.</p>
                            <select
                                required
                                value={newMemberId}
                                onChange={e => setNewMemberId(e.target.value)}
                                className="p-2 border rounded bg-white"
                            >
                                <option value="" disabled>Select user...</option>
                                {/* If allUsers is empty, this will show nothing. Let's map it simply first */}
                                {allUsers.length > 0 ? (
                                    allUsers.map(u => (
                                        <option key={u._id} value={u._id}>{u.name}</option>
                                    ))
                                ) : (
                                    <option disabled>Loading users...</option>
                                )}
                            </select>
                            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-bold mt-auto">
                                Add to Project
                            </button>
                        </form>

                    </div>
                )}

                {/* Tasks List */}
                <div className="bg-white rounded shadow p-6">
                    {tasks.length === 0 ? <p className="text-gray-500">No tasks found for this project.</p> : (
                        <ul className="divide-y">
                            {tasks.map(task => (
                                <li key={task._id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg">{task.title}</p>
                                        <p className="text-sm text-gray-500">
                                            Assigned to: <span className="font-semibold">{task.assignedTo?.name || 'Unassigned'}</span>
                                        </p>
                                    </div>

                                    {/* Status Dropdown */}
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                        className={`p-2 rounded border font-semibold ${task.status === 'Done' ? 'bg-green-100 text-green-800' :
                                            task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        <option value="To Do">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
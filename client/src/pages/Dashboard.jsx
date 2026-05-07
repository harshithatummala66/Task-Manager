import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api'; // Ensure this path is correct based on your folder structure

export default function Dashboard({ user }) {
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [newProjectName, setNewProjectName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchMyTasks();
    if (user.role === 'Admin') fetchUsers();
  }, []);

  const fetchProjects = async () => {
    const { data } = await api.get('/projects');
    setProjects(data);
  };

  const fetchMyTasks = async () => {
    const { data } = await api.get('/tasks/my-tasks');
    setMyTasks(data);
  };

  const fetchUsers = async () => {
    const { data } = await api.get('/users');
    // Filter out the current admin so they don't assign themselves as a regular member
    setUsers(data.filter(u => u._id !== user.id && u.role !== 'Admin')); 
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { 
        name: newProjectName, 
        description: 'New Project',
        members: selectedMembers 
      });
      setNewProjectName('');
      setSelectedMembers([]);
      fetchProjects();
    } catch (error) {
      alert('Failed to create project.');
    }
  };

  const handleMemberToggle = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // --- Calculate Dashboard Stats ---
  const totalProjects = projects.length;
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter(t => t.status === 'Done').length;
  
  // Use "Number" comparison for 100% accuracy
  const now = new Date().getTime(); 

  const overdueTasks = myTasks.filter(t => {
    // 1. If no date or already done, it's NOT overdue
    if (!t.dueDate || t.status === 'Done') return false;

    // 2. Convert the DB string into a number of milliseconds
    const deadline = new Date(t.dueDate).getTime();

    // 3. Is the deadline in the past?
    return deadline < now;
  }).length;

return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">

        {/* --- THIS IS THE RESTORED HEADER WITH THE LOGOUT BUTTON --- */}
        <div className="flex justify-between items-center bg-white p-4 rounded shadow mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Team Task Manager</h1>
            <p className="text-gray-500">Welcome, {user.name} <span className="font-bold text-blue-600">({user.role})</span></p>
          </div>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-bold">
            Logout
          </button>
        </div>

        {/* Dashboard Status Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* NEW: Total Projects Card */}
          <div className="bg-white p-4 rounded shadow border-t-4 border-indigo-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Total Projects</h3>
            <p className="text-3xl font-black text-gray-800 mt-2">{totalProjects}</p>
          </div>
          <div className="bg-white p-4 rounded shadow border-t-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Total Tasks</h3>
            <p className="text-3xl font-black text-gray-800 mt-2">{totalTasks}</p>
          </div>
          <div className="bg-white p-4 rounded shadow border-t-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Completed</h3>
            <p className="text-3xl font-black text-gray-800 mt-2">{completedTasks}</p>
          </div>
          <div className="bg-white p-4 rounded shadow border-t-4 border-red-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Overdue</h3>
            <p className="text-3xl font-black text-red-600 mt-2">{overdueTasks}</p>
          </div>
        </div>

        {/* Admin Control Panel */}
        {user.role === 'Admin' && (
          <div className="bg-white p-6 rounded shadow mb-8 border-l-4 border-blue-500">
            <h2 className="text-xl font-bold mb-4">Admin: Create New Project</h2>
            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <input 
                  type="text" placeholder="Project Name" required
                  value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 font-bold">
                  Create Project
                </button>
              </div>
              
              {/* Member Selection */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Assign Team Members:</p>
                <div className="flex flex-wrap gap-3">
                  {users.length === 0 ? <span className="text-sm text-red-500">No members available to assign.</span> : 
                    users.map(u => (
                      <label key={u._id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 border rounded cursor-pointer hover:bg-gray-100">
                        <input 
                          type="checkbox" 
                          checked={selectedMembers.includes(u._id)}
                          onChange={() => handleMemberToggle(u._id)}
                        />
                        {u.name}
                      </label>
                    ))
                  }
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects Column */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-700">Projects</h2>
            <div className="flex flex-col gap-4">
              {projects.length === 0 ? <p className="text-gray-500">No projects found.</p> : (
                projects.map((project) => (
                  <div key={project._id} className="bg-white p-6 rounded shadow">
                    <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                    <Link to={`/project/${project._id}`} className="text-blue-500 hover:underline font-medium block mt-2">
                      View Board &rarr;
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Tasks Column */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-700">My Tasks</h2>
            <div className="flex flex-col gap-4">
              {myTasks.length === 0 ? <p className="text-gray-500">You have no tasks assigned.</p> : (
                myTasks.map((task) => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
                  return (
                    <div key={task._id} className={`bg-white p-4 rounded shadow border-l-4 ${isOverdue ? 'border-red-500' : 'border-green-500'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-800">{task.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">Project: {task.project?.name || 'Unknown'}</p>
                          {isOverdue && <p className="text-xs font-bold text-red-500 mt-1">⚠️ OVERDUE</p>}
                        </div>
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          task.status === 'Done' ? 'bg-green-100 text-green-800' : 
                          task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
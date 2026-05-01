import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';

export async function getDashboard(req, res, next) {
  try {
    const projectQuery = req.user.role === 'Admin' ? {} : { 'members.user': req.user._id };
    const projects = await Project.find(projectQuery).select('_id name status members');
    const projectIds = projects.map((project) => project._id);
    const taskQuery = req.user.role === 'Admin' ? {} : { project: { $in: projectIds } };
    const now = new Date();

    const [tasks, statusCounts, priorityCounts, overdueCount] = await Promise.all([
      Task.find(taskQuery)
        .populate('project', 'name status')
        .populate('assignedTo', 'name email role')
        .sort({ dueDate: 1 })
        .limit(8),
      Task.aggregate([{ $match: taskQuery }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: taskQuery }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.countDocuments({ ...taskQuery, dueDate: { $lt: now }, status: { $ne: 'Done' } })
    ]);

    const totalTasks = statusCounts.reduce((sum, item) => sum + item.count, 0);
    const completedTasks = statusCounts.find((item) => item._id === 'Done')?.count || 0;
    const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      summary: {
        totalProjects: projects.length,
        totalTasks,
        overdueTasks: overdueCount,
        progress
      },
      statusCounts,
      priorityCounts,
      upcomingTasks: tasks
    });
  } catch (error) {
    next(error);
  }
}

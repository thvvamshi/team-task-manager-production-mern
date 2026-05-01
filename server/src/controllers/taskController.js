import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { HttpError, notFound } from '../utils/httpError.js';

function canSeeProject(project, user) {
  return user.role === 'Admin' || project.members.some((member) => member.user.equals(user._id));
}

function canManageProject(project, user) {
  const membership = project.members.find((member) => member.user.equals(user._id));
  return user.role === 'Admin' || membership?.role === 'Admin';
}

async function getAccessibleProject(projectId, user) {
  const project = await Project.findById(projectId);
  if (!project) throw notFound('Project not found');
  if (!canSeeProject(project, user)) throw new HttpError(403, 'Project access required');
  return project;
}

function ensureAssigneeInProject(project, assignedTo) {
  const isMember = project.members.some((member) => member.user.equals(assignedTo));
  if (!isMember) {
    throw new HttpError(400, 'Assigned user must be a member of the project');
  }
}

export async function listTasks(req, res, next) {
  try {
    const { project, status, assignedTo } = req.validated.query;
    const query = {};

    if (project) {
      const accessibleProject = await getAccessibleProject(project, req.user);
      query.project = accessibleProject._id;
    } else if (req.user.role !== 'Admin') {
      const projects = await Project.find({ 'members.user': req.user._id }).select('_id');
      query.project = { $in: projects.map((item) => item._id) };
    }

    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await Task.find(query)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ dueDate: 1 });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    const data = req.validated.body;
    const project = await getAccessibleProject(data.project, req.user);

    if (!canManageProject(project, req.user)) {
      throw new HttpError(403, 'Project admin access required to create tasks');
    }

    ensureAssigneeInProject(project, data.assignedTo);

    const task = await Task.create({
      ...data,
      createdBy: req.user._id
    });

    await task.populate('project', 'name status');
    await task.populate('assignedTo', 'name email role');
    await task.populate('createdBy', 'name email role');
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
}

export async function getTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!task) throw notFound('Task not found');
    if (!canSeeProject(task.project, req.user)) throw new HttpError(403, 'Task access required');

    res.json({ task });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) throw notFound('Task not found');

    const project = await getAccessibleProject(task.project, req.user);
    const isAssignee = task.assignedTo.equals(req.user._id);
    const isManager = canManageProject(project, req.user);
    const updates = req.validated.body;
    const keys = Object.keys(updates);

    if (!isManager) {
      const onlyStatus = keys.length === 1 && keys[0] === 'status';
      if (!isAssignee || !onlyStatus) {
        throw new HttpError(403, 'Members can only update status for their own tasks');
      }
    }

    if (updates.assignedTo) {
      ensureAssigneeInProject(project, updates.assignedTo);
    }

    Object.assign(task, updates);
    await task.save();
    await task.populate('project', 'name status');
    await task.populate('assignedTo', 'name email role');
    await task.populate('createdBy', 'name email role');
    res.json({ task });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) throw notFound('Task not found');

    const project = await getAccessibleProject(task.project, req.user);
    if (!canManageProject(project, req.user)) {
      throw new HttpError(403, 'Project admin access required to delete tasks');
    }

    await task.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

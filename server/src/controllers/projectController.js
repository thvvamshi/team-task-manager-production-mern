import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { HttpError, notFound } from '../utils/httpError.js';

function projectQueryFor(user) {
  if (user.role === 'Admin') return {};
  return { 'members.user': user._id };
}

export async function listProjects(req, res, next) {
  try {
    const projects = await Project.find(projectQueryFor(req.user))
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role')
      .sort({ updatedAt: -1 });

    res.json({ projects });
  } catch (error) {
    next(error);
  }
}

export async function createProject(req, res, next) {
  try {
    const { name, description = '' } = req.validated.body;
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }]
    });

    await project.populate('owner', 'name email role');
    await project.populate('members.user', 'name email role');
    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
}

export async function getProject(req, res, next) {
  try {
    await req.project.populate('owner', 'name email role');
    await req.project.populate('members.user', 'name email role');
    res.json({ project: req.project });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req, res, next) {
  try {
    Object.assign(req.project, req.validated.body);
    await req.project.save();
    await req.project.populate('owner', 'name email role');
    await req.project.populate('members.user', 'name email role');
    res.json({ project: req.project });
  } catch (error) {
    next(error);
  }
}

export async function addProjectMember(req, res, next) {
  try {
    const { userId, role } = req.validated.body;
    const user = await User.findById(userId);

    if (!user) {
      throw notFound('User not found');
    }

    const member = req.project.members.find((item) => item.user.equals(userId));

    if (member) {
      member.role = role;
    } else {
      req.project.members.push({ user: userId, role });
    }

    await req.project.save();
    await req.project.populate('owner', 'name email role');
    await req.project.populate('members.user', 'name email role');
    res.json({ project: req.project });
  } catch (error) {
    next(error);
  }
}

export async function removeProjectMember(req, res, next) {
  try {
    const { userId } = req.validated.params;

    if (req.project.owner.equals(userId)) {
      throw new HttpError(400, 'Project owner cannot be removed');
    }

    req.project.members = req.project.members.filter((member) => !member.user.equals(userId));
    await req.project.save();
    await Task.updateMany({ project: req.project._id, assignedTo: userId }, { assignedTo: req.project.owner });
    await req.project.populate('owner', 'name email role');
    await req.project.populate('members.user', 'name email role');
    res.json({ project: req.project });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req, res, next) {
  try {
    await Task.deleteMany({ project: req.project._id });
    await req.project.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

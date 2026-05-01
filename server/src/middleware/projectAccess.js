import { Project } from '../models/Project.js';
import { HttpError, notFound } from '../utils/httpError.js';

export async function loadProject(req, res, next) {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.project;
    const project = await Project.findById(projectId);

    if (!project) {
      throw notFound('Project not found');
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireProjectMember(req, res, next) {
  const isGlobalAdmin = req.user.role === 'Admin';
  const isMember = req.project.members.some((member) => member.user.equals(req.user._id));

  if (!isGlobalAdmin && !isMember) {
    return next(new HttpError(403, 'Project access required'));
  }

  next();
}

export function requireProjectAdmin(req, res, next) {
  const isGlobalAdmin = req.user.role === 'Admin';
  const membership = req.project.members.find((member) => member.user.equals(req.user._id));
  const isProjectAdmin = membership?.role === 'Admin';

  if (!isGlobalAdmin && !isProjectAdmin) {
    return next(new HttpError(403, 'Project admin access required'));
  }

  next();
}

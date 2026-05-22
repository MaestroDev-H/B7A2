import type { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { pool } from '../../config/db.js';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { sendResponse } from '../../utils/response.js';


export const createIssue = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, type } = req.body;
    const reporter_id = req.user?.id;

    if (!title || title.length > 150) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid title. Max 150 characters.' });
    }
    if (!description || description.length < 20) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Description must be at least 20 characters.' });
    }
    if (!['bug', 'feature_request'].includes(type)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid type.' });
    }

    const result = await pool.query(
      'INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, type, reporter_id]
    );

    sendResponse(res, StatusCodes.CREATED, true, 'Issue created successfully', result.rows[0]);
  } catch (error) {
    next(error);
  }
};


export const getAllIssues = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { sort, type, status } = req.query;

    let queryText = 'SELECT * FROM issues';
    const queryParams: any[] = [];
    const whereClauses: string[] = [];

    if (type) {
      queryParams.push(type);
      whereClauses.push(`type = $${queryParams.length}`);
    }

    if (status) {
      queryParams.push(status);
      whereClauses.push(`status = $${queryParams.length}`);
    }

    if (whereClauses.length > 0) {
      queryText += ' WHERE ' + whereClauses.join(' AND ');
    }

    
    const orderBy = sort === 'oldest' ? 'ASC' : 'DESC';
    queryText += ` ORDER BY created_at ${orderBy}`;

    
    const issuesResult = await pool.query(queryText, queryParams);
    const issues = issuesResult.rows;

    if (issues.length === 0) {
      return res.status(StatusCodes.OK).json({ success: true, data: [] });
    }

    
    const reporterIds = Array.from(new Set(issues.map((issue) => issue.reporter_id)));

   
    const usersResult = await pool.query(
      `SELECT id, name, role FROM users WHERE id = ANY($1)`,
      [reporterIds]
    );

   
    const userMap = new Map();
    usersResult.rows.forEach((user) => {
      userMap.set(user.id, user);
    });

   
    const transformedIssues = issues.map((issue) => {
      const { reporter_id, ...rest } = issue;
      return {
        ...rest,
        reporter: userMap.get(reporter_id) || null,
      };
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: transformedIssues,
    });
  } catch (error) {
    next(error);
  }
};


export const getSingleIssue = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const issueResult = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    
    if (issueResult.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Issue not found' });
    }

    const issue = issueResult.rows[0];
    
    
    const userResult = await pool.query('SELECT id, name, role FROM users WHERE id = $1', [issue.reporter_id]);
    const { reporter_id, ...rest } = issue;

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        ...rest,
        reporter: userResult.rows[0] || null,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const updateIssue = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, type, status } = req.body;
    const currentUser = req.user;

    const issueResult = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    if (issueResult.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Issue not found' });
    }

    const issue = issueResult.rows[0];

   
    if (currentUser?.role === 'contributor') {
      if (issue.reporter_id !== currentUser.id) {
        return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'You can only update your own issues' });
      }
      if (issue.status !== 'open') {
        return res.status(StatusCodes.CONFLICT).json({ success: false, message: 'Contributors can only edit open issues' });
      }
      if (status) {
        return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Contributors cannot change workflow status' });
      }
    }

   
    const updatedTitle = title || issue.title;
    const updatedDescription = description || issue.description;
    const updatedType = type || issue.type;
    const updatedStatus = status || issue.status;

    const updateResult = await pool.query(
      `UPDATE issues 
       SET title = $1, description = $2, type = $3, status = $4
       WHERE id = $5 RETURNING *`,
      [updatedTitle, updatedDescription, updatedType, updatedStatus, id]
    );

    sendResponse(res, StatusCodes.OK, true, 'Issue updated successfully', updateResult.rows[0]);
  } catch (error) {
    next(error);
  }
};


export const deleteIssue = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const issueCheck = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    
    if (issueCheck.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Issue not found' });
    }

    await pool.query('DELETE FROM issues WHERE id = $1', [id]);
    sendResponse(res, StatusCodes.OK, true, 'Issue deleted successfully');
  } catch (error) {
    next(error);
  }
};
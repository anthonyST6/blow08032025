import { Router } from 'express';
import { devAuthService } from '../services/auth.dev';
import { logger } from '../utils/logger';

const router = Router();

// Development login endpoint
router.post('/dev-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const result = await devAuthService.signIn(email, password);
    
    logger.info(`Dev login successful for user: ${email}`);
    
    return res.json({
      success: true,
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (error: any) {
    logger.error(`Dev login failed: ${error.message}`);
    return res.status(401).json({
      success: false,
      error: error.message || 'Invalid credentials',
    });
  }
});

// Development register endpoint
router.post('/dev-register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and display name are required',
      });
    }

    await devAuthService.createUser(email, password, displayName);
    const result = await devAuthService.signIn(email, password);
    
    logger.info(`Dev registration successful for user: ${email}`);
    
    return res.json({
      success: true,
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (error: any) {
    logger.error(`Dev registration failed: ${error.message}`);
    return res.status(400).json({
      success: false,
      error: error.message || 'Registration failed',
    });
  }
});

// Development user info endpoint
router.get('/dev-user/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await devAuthService.getUser(uid);
    
    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    logger.error(`Failed to get user: ${error.message}`);
    res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }
});

// Development list users endpoint (admin only in production)
router.get('/dev-users', async (_req, res) => {
  try {
    const users = await devAuthService.listUsers();
    
    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    logger.error(`Failed to list users: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to list users',
    });
  }
});

export default router;
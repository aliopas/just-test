import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  registerSchema,
  verifyOTPSchema,
  resendOTPSchema,
  loginSchema,
  refreshSchema,
  totpVerifySchema,
  confirmEmailSchema,
  resetPasswordRequestSchema,
  verifyResetTokenSchema,
  updatePasswordSchema,
} from '../schemas/auth.schema';

const authRouter = Router();

// Async error wrapper to catch errors from async route handlers
// Uses type assertion to handle different Request types safely
const asyncHandler = (
  fn: (req: Request, res: Response, next?: NextFunction) => Promise<any> | any
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as any, res, next)).catch(next);
  };
};

authRouter.post('/register', validate(registerSchema), asyncHandler(authController.register as any));
authRouter.post(
  '/verify-otp',
  validate(verifyOTPSchema),
  asyncHandler(authController.verifyOTP as any)
);
authRouter.post(
  '/resend-otp',
  validate(resendOTPSchema),
  asyncHandler(authController.resendOTP as any)
);
authRouter.post(
  '/confirm-email',
  validate(confirmEmailSchema),
  asyncHandler(authController.confirmEmail as any)
);

authRouter.post('/login', validate(loginSchema), asyncHandler(authController.login as any));
authRouter.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh as any));
authRouter.post('/logout', asyncHandler(authController.logout as any));

// 2FA endpoints (require authentication)
authRouter.post('/2fa/setup', authenticate, asyncHandler(authController.setup2FA as any));
authRouter.post(
  '/2fa/verify',
  authenticate,
  validate(totpVerifySchema),
  asyncHandler(authController.verify2FA as any)
);
authRouter.post('/2fa/disable', authenticate, asyncHandler(authController.disable2FA as any));

// Password Reset Endpoints
authRouter.post(
  '/reset-password-request',
  validate(resetPasswordRequestSchema),
  asyncHandler(authController.resetPasswordRequest as any)
);
authRouter.post(
  '/verify-reset-token',
  validate(verifyResetTokenSchema),
  asyncHandler(authController.verifyResetToken as any)
);
authRouter.post(
  '/update-password',
  authenticate,
  validate(updatePasswordSchema),
  asyncHandler(authController.updatePassword as any)
);

export { authRouter };

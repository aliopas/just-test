import { Router } from 'express';
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

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post(
  '/verify-otp',
  validate(verifyOTPSchema),
  authController.verifyOTP
);
authRouter.post(
  '/resend-otp',
  validate(resendOTPSchema),
  authController.resendOTP
);
authRouter.post(
  '/confirm-email',
  validate(confirmEmailSchema),
  authController.confirmEmail
);

authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.post('/refresh', validate(refreshSchema), authController.refresh);
authRouter.post('/logout', authController.logout);

// 2FA endpoints (require authentication)
authRouter.post('/2fa/setup', authenticate, authController.setup2FA);
authRouter.post(
  '/2fa/verify',
  authenticate,
  validate(totpVerifySchema),
  authController.verify2FA
);
authRouter.post('/2fa/disable', authenticate, authController.disable2FA);

// Password Reset Endpoints
authRouter.post(
  '/reset-password-request',
  validate(resetPasswordRequestSchema),
  authController.resetPasswordRequest
);
authRouter.post(
  '/verify-reset-token',
  validate(verifyResetTokenSchema),
  authController.verifyResetToken
);
authRouter.post(
  '/update-password',
  authenticate,
  validate(updatePasswordSchema),
  authController.updatePassword
);

export { authRouter };

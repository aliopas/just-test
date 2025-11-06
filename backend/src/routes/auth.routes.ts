import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import {
  registerSchema,
  verifyOTPSchema,
  resendOTPSchema,
  loginSchema,
  refreshSchema,
  totpVerifySchema,
} from '../schemas/auth.schema';

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/verify-otp', validate(verifyOTPSchema), authController.verifyOTP);
authRouter.post('/resend-otp', validate(resendOTPSchema), authController.resendOTP);

authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.post('/refresh', validate(refreshSchema), authController.refresh);
authRouter.post('/logout', authController.logout);

// 2FA endpoints
authRouter.post('/2fa/setup', authController.setup2FA);
authRouter.post('/2fa/verify', validate(totpVerifySchema), authController.verify2FA);
authRouter.post('/2fa/disable', authController.disable2FA);

export { authRouter };


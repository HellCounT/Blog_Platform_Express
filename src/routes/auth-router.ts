import {Router} from "express";
import {inputValidation, userDataValidator} from "../middleware/data-validation";
import {rateLimiterMiddleware} from "../middleware/rate-limiter-middleware";
import {container} from "../composition-root";
import {AuthControllerClass} from "../controllers/auth-controller";
import {AuthMiddleware} from "../middleware/auth-middleware";

export const authRouter = Router({})

const authController = container.resolve(AuthControllerClass)
const authMiddleware = container.resolve(AuthMiddleware)

authRouter.get('/me', authMiddleware.checkCredentials, authController.getMyInfo.bind(authController))

authRouter.post('/login',
    rateLimiterMiddleware(10, 5),
    userDataValidator.passwordCheck,
    userDataValidator.loginOrEmailCheck,
    inputValidation,
    authController.login.bind(authController))

authRouter.post('/logout',
    authMiddleware.refreshTokenCheck,
    authController.logout.bind(authController))

authRouter.post('/refresh-token',
    authMiddleware.refreshTokenCheck,
    authController.updateRefreshToken.bind(authController))

authRouter.post('/registration',
    //Input validation
    rateLimiterMiddleware(10, 5),
    userDataValidator.loginCheck,
    userDataValidator.passwordCheck,
    userDataValidator.emailCheck,
    userDataValidator.userExistsCheckEmail,
    userDataValidator.userExistsCheckLogin,
    inputValidation,
    //Handlers
    authController.registerUser.bind(authController))

authRouter.post('/registration-confirmation',
    rateLimiterMiddleware(10, 5),
    userDataValidator.codeCheck,
    inputValidation,
    authController.confirmUserEmail.bind(authController))

authRouter.post('/registration-email-resending',
    rateLimiterMiddleware(10, 5),
    userDataValidator.userEmailCheck,
    inputValidation,
    authController.resendActivationCode.bind(authController))

authRouter.post('/password-recovery',
    rateLimiterMiddleware(10, 5),
    userDataValidator.emailCheck,
    inputValidation,
    authController.passwordRecovery.bind(authController))

authRouter.post('/new-password',
    rateLimiterMiddleware(10, 5),
    userDataValidator.newPasswordCheck,
    inputValidation,
    authController.setNewPassword.bind(authController))
import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

const auth = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return res.status(500).json({ message: "You are not allowed..!!" })
        }

        const token = authorizationHeader.startsWith('Bearer ')
            ? authorizationHeader.split(' ')[1]
            : authorizationHeader;

        if (!token) {
            return res.status(500).json({ message: "You are not allowed..!!" })
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret as string) as JwtPayload;
            console.log({ decoded });

            req.user = decoded;

            if (roles.length && !roles.includes(decoded.role as string)) {
                return res.status(500).json({
                    error: "unauthorized!!!"
                })
            }



            next();
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({
                    message: "Invalid or expired token.",
                    error: error.message
                });
            }
            next(error);
        }
    };
};

export default auth;
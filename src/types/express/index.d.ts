import {WithId} from "mongodb";
import {UserInsertDbType} from "./types";

declare global {
    namespace Express {
        export interface Request {
            user?: WithId<UserInsertDbType> | null
        }
    }
}
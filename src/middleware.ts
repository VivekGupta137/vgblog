export interface MiddlewareLocals {
    title?: string;
    [key: string]: unknown;
}

export interface RequestContext {
    locals: MiddlewareLocals;
    [key: string]: unknown;
}

export type NextFunction = () => Response | Promise<Response | void> | void;

export function onRequest(context: RequestContext, next: NextFunction): Response | Promise<Response | void> | void {
    // intercept data from a request
    // optionally, modify the properties in `locals`
    // context.locals.title = "New title";
    console.log("Middleware executed", context.locals.title);

    // return a Response or the result of calling `next()`
    return next();
};
class HttpError extends Error {
    public statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message)
        this.statusCode = statusCode
    }
}
export class BadRequest extends HttpError {
    constructor(message = "Bad Request") {
        super(message, 400)
    }
}
export class NotFound extends HttpError {
    constructor(message = "Not Found") {
        super(message, 404);
    }
}

export class Unauthorized extends HttpError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}

export class Forbidden extends HttpError {
    constructor(message = "Forbidden") {
        super(message, 403);
    }
}

export class Conflict extends HttpError {
    constructor(message = "Conflict") {
        super(message, 409);
    }
}

export class InternalError extends HttpError {
    constructor(message = "Internal Server Error") {
        super(message, 500);
    }
}
export class ManyRequest extends HttpError {
    constructor(message = "Too Many Requests") {
        super(message, 429)
    }
}
class ApiError extends Error {
    data: any
    message: string
    status: boolean
    errors: any
    statusCode: number

    constructor(statusCode: number, message = "Something went wrong", errors = [], stack = "") {
        super(message)
        this.status = statusCode > 400  
        this.message = message
        this.errors = errors
        this.statusCode = statusCode

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export { ApiError }
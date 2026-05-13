using FluentValidation;
using System.Net;
using System.Text.Json;

namespace LojaFullStack.API.Infrastructure.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ocorreu uma exceção não tratada.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var statusCode = exception switch
        {
            ValidationException => HttpStatusCode.BadRequest,
            KeyNotFoundException => HttpStatusCode.NotFound,
            InvalidOperationException => HttpStatusCode.BadRequest,
            _ => HttpStatusCode.InternalServerError
        };

        context.Response.StatusCode = (int)statusCode;

        object responseBody;

        if (exception is ValidationException validationException)
        {
            responseBody = new
            {
                StatusCode = context.Response.StatusCode,
                Message = "Erro de validação.",
                Errors = validationException.Errors.Select(e => e.ErrorMessage)
            };
        }
        else
        {
            responseBody = new
            {
                StatusCode = context.Response.StatusCode,
                Message = exception.Message
            };
        }

        var result = JsonSerializer.Serialize(responseBody);
        return context.Response.WriteAsync(result);
    }
}

<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $levels = [
        //
    ];

    protected $dontReport = [
        //
    ];

    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register()
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $e)
    {
        if ($request->is('api/*') || $request->expectsJson()) {
            return $this->renderApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    protected function renderApiException(Request $request, Throwable $e)
    {
        [$status, $message, $errors] = match (true) {
            $e instanceof InvalidCredentialsException => [401, $e->getMessage(), null],
            $e instanceof AccountLockedException => [423, $e->getMessage(), [
                'locked_until' => $e->lockedUntil?->toIso8601String(),
            ]],
            $e instanceof ValidationException => [422, 'The given data was invalid.', $e->errors()],
            $e instanceof AuthenticationException => [401, 'Unauthenticated.', null],
            $e instanceof AuthorizationException => [403, 'You are not authorized to perform this action.', null],
            $e instanceof ModelNotFoundException => [404, 'Resource not found.', null],
            $e instanceof NotFoundHttpException => [404, 'The requested endpoint does not exist.', null],
            $e instanceof TooManyRequestsHttpException => [429, 'Too many requests. Please slow down and try again shortly.', null],
            default => [
                method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500,
                app()->hasDebugModeEnabled() ? $e->getMessage() : 'Something went wrong. Please try again.',
                null,
            ],
        };

        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        if (app()->hasDebugModeEnabled() && $status === 500) {
            $payload['debug'] = [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ];
        }

        return response()->json($payload, $status);
    }
}

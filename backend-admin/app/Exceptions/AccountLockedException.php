<?php

namespace App\Exceptions;

use Carbon\Carbon;
use Exception;

class AccountLockedException extends Exception
{
    public ?Carbon $lockedUntil;

    public function __construct(?Carbon $lockedUntil = null)
    {
        $this->lockedUntil = $lockedUntil;
        parent::__construct('Account temporarily locked due to too many failed login attempts.', 423);
    }
}

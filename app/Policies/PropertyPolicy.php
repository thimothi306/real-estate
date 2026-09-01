<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;

class PropertyPolicy
{
    public function create(User $user): bool
    {
        return in_array($user->role, [
            User::ROLE_OWNER, User::ROLE_LANDLORD, User::ROLE_BUILDER, User::ROLE_AGENT, User::ROLE_ADMIN,
        ]);
    }

    public function update(User $user, Property $property): bool
    {
        return $user->isAdmin() || $property->isOwnedBy($user);
    }

    public function delete(User $user, Property $property): bool
    {
        return $user->isAdmin() || $property->isOwnedBy($user);
    }

    public function publish(User $user, Property $property): bool
    {
        return $user->isAdmin() || $property->isOwnedBy($user);
    }

    public function moderate(User $user): bool
    {
        return $user->isAdmin();
    }
}

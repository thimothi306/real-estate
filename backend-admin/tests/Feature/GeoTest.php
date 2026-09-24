<?php

namespace Tests\Feature;

use Tests\TestCase;

class GeoTest extends TestCase
{
    public function test_countries_list_is_public_and_includes_india(): void
    {
        $response = $this->getJson('/api/v1/geo/countries');

        $response->assertStatus(200);
        $this->assertContains('India', $response->json('data'));
        $this->assertGreaterThan(100, count($response->json('data')));
    }

    public function test_states_are_returned_for_a_real_country(): void
    {
        $response = $this->getJson('/api/v1/geo/states?country=India');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertContains('Telangana', $data);
        $this->assertContains('Karnataka', $data);
    }

    public function test_states_lookup_is_case_insensitive(): void
    {
        $response = $this->getJson('/api/v1/geo/states?country=india');

        $response->assertStatus(200);
        $this->assertContains('Telangana', $response->json('data'));
    }

    public function test_an_unknown_country_returns_an_empty_list_not_an_error(): void
    {
        $response = $this->getJson('/api/v1/geo/states?country=Nonexistentland');

        $response->assertStatus(200);
        $this->assertSame([], $response->json('data'));
    }

    public function test_states_requires_a_country_param(): void
    {
        $response = $this->getJson('/api/v1/geo/states');

        $response->assertStatus(422);
    }
}

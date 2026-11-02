<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_redirects_to_register_when_users_table_is_empty_on_visiting_home(): void
    {
        $this->assertEquals(0, User::count());

        $response = $this->get('/');

        $response->assertRedirect(route('register'));
    }

    public function test_redirects_to_register_when_users_table_is_empty_on_visiting_login(): void
    {
        $this->assertEquals(0, User::count());

        $response = $this->get(route('login'));

        $response->assertRedirect(route('register'));
    }

    public function test_can_render_register_page_when_users_table_is_empty(): void
    {
        $this->assertEquals(0, User::count());

        $response = $this->get(route('register'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Auth/Register'));
    }

    public function test_first_user_can_register_with_first_and_last_name_and_is_logged_in(): void
    {
        $this->assertEquals(0, User::count());

        $response = $this->post(route('register'), [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'admin@school.com',
            'password' => 'secretPassword123!',
            'password_confirmation' => 'secretPassword123!',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('users', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'name' => 'John Doe',
            'email' => 'admin@school.com',
        ]);

        $user = User::first();
        $this->assertTrue(Hash::check('secretPassword123!', $user->password));
    }

    public function test_cannot_register_if_users_table_is_not_empty(): void
    {
        User::factory()->create([
            'email' => 'existing@school.com',
        ]);

        $this->assertEquals(1, User::count());

        // Visiting registration should redirect to login
        $response = $this->get(route('register'));
        $response->assertRedirect(route('login'));

        // Attempting to post to registration should also redirect to login without creating a user
        $postResponse = $this->post(route('register'), [
            'first_name' => 'Second',
            'last_name' => 'User',
            'email' => 'second@school.com',
            'password' => 'secretPassword123!',
            'password_confirmation' => 'secretPassword123!',
        ]);

        $postResponse->assertRedirect(route('login'));
        $this->assertEquals(1, User::count());
        $this->assertDatabaseMissing('users', ['email' => 'second@school.com']);
    }

    public function test_redirects_to_login_when_users_table_is_not_empty_on_visiting_home(): void
    {
        User::factory()->create();

        $response = $this->get('/');

        $response->assertRedirect(route('login'));
    }

    public function test_can_render_login_page_when_users_table_is_not_empty(): void
    {
        User::factory()->create();

        $response = $this->get(route('login'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Auth/Login'));
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'teacher@school.com',
            'password' => Hash::make('CorrectPassword123!'),
        ]);

        $response = $this->post(route('login'), [
            'email' => 'teacher@school.com',
            'password' => 'CorrectPassword123!',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard'));
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'teacher@school.com',
            'password' => Hash::make('CorrectPassword123!'),
        ]);

        $response = $this->post(route('login'), [
            'email' => 'teacher@school.com',
            'password' => 'WrongPassword!',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('logout'));

        $this->assertGuest();
        $response->assertRedirect(route('login'));
    }
}

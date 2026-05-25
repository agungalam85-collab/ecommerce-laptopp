<form method="POST" action="{{ route('register') }}">
    @csrf
    <input type="text" name="name" placeholder="Nama" required>
    <input type="email" name="email" placeholder="Email" required>
    <input type="password" name="password" placeholder="Password" required>
    <select name="role">
        <option value="customer" selected>Customer</option>
        <option value="admin">Admin</option>
    </select>
    <button type="submit">Register</button>
</form>

@if ($errors->any())
    <div class="text-red-600 mt-2">
        {{ $errors->first() }}
    </div>
@endif

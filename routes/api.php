<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Controllers\{
    AuthController, ProductController, CategoryController, HomeController, UserController,
    AdminController, CartController, CheckoutController, OrderController, BiteshipController,
    ShipperController, ShippingController, MidtransWebhookController, CustomerController,
    AdminOrderController, ImageController, RajaOngkirController, TrendingProductController,
    FonnteController, WishlistController, ReviewController, MidtransController, CustomerOrderController, ChatbotController,ChatController
};

// 🔹 Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:api')->post('/logout', [AuthController::class, 'logout']);

// 🔹 Register customer langsung
Route::post('/register-customer', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:6',
    ]);

    $user = \App\Models\User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => bcrypt($validated['password']),
        'role' => 'customer',
    ]);

    $token = JWTAuth::fromUser($user);

    return response()->json([
        'message' => 'Customer registered successfully',
        'user' => $user,
        'token' => $token,
    ]);
});

// 🔐 Admin-only routes
Route::middleware(['auth:api', RoleMiddleware::class . ':admin'])->group(function () {
    // 🔧 Produk & Kategori
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // 👥 Manajemen User
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // 🙍‍♂️ Profil Admin
    Route::put('/profile', [AdminController::class, 'updateProfile']);
    Route::put('/password', [AdminController::class, 'changePassword']);
    Route::get('/me', [AdminController::class, 'me']);
    Route::post('/avatar', [AdminController::class, 'uploadAvatar']);

    // 📦 Order Admin
    Route::get('/admin/orders', [AdminOrderController::class, 'index']);
    Route::get('/admin/orders/{id}', [AdminOrderController::class, 'show']);
    Route::put('/admin/orders/{id}/shipping-status', [AdminOrderController::class, 'updateShippingStatus']); // ✅ Tambahan penting
    Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']); // ❗️Opsional manual override Midtrans

    // 🖼️ Gambar
    Route::delete('/images/{id}', [ImageController::class, 'destroy']);
});
// 🔐 Customer-only routes
Route::middleware(['auth:api', RoleMiddleware::class . ':customer'])->group(function () {
    Route::get('/customer/info', [CustomerController::class, 'show']);
    Route::post('/customer/info', [CustomerController::class, 'store']);
    Route::put('/customer/info', [CustomerController::class, 'update']);
    Route::put('/customer/password', [CustomerController::class, 'changePassword']);
    Route::post('/customer/avatar', [CustomerController::class, 'uploadAvatar']);
    Route::delete('/customer/account', [CustomerController::class, 'destroy']);

    // OrderController routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/by-id/{order_id}', [OrderController::class, 'showByOrderId']);
    Route::get('/payment-detail/{order_id}', [OrderController::class, 'getPaymentDetail']);
});

// 🔹 Public routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}/products', [CategoryController::class, 'products']);
Route::get('/home', [HomeController::class, 'index']);
Route::get('/search', [ProductController::class, 'search']);
Route::get('/products/recommendations', [ProductController::class, 'recommendations']);
Route::get('/products/{id}/reviews', [ReviewController::class, 'index']);
Route::get('/trending-products', [TrendingProductController::class, 'json']);

// 🔐 Authenticated user routes
Route::middleware('auth:api')->group(function () {
    Route::post('/cart', [CartController::class, 'store']);
    Route::get('/cart', [CartController::class, 'index']);
    Route::get('/cart-count', [CartController::class, 'count']);
    Route::post('/products-by-id', [ProductController::class, 'getByIds']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);
    Route::delete('/cart/clear/{customer_id}', [CartController::class, 'clearByCustomer']);

    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::post('/checkout/midtrans', [CheckoutController::class, 'getSnapToken']);

    Route::post('/reviews', [ReviewController::class, 'store']);

    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);
});

// 🔹 Shipping & Courier
Route::post('/checkout/shipping', [CheckoutController::class, 'calculateShipping']);
Route::get('/shipping/provinces', [ShippingController::class, 'getProvinces']);
Route::get('/shipping/cities/{province}', [ShippingController::class, 'getCities']);
Route::get('/shipping/couriers', [ShippingController::class, 'getCouriers']);
Route::get('/provinces', [RajaOngkirController::class, 'getProvinces']);
Route::get('/cities/{provinceId}', [RajaOngkirController::class, 'getCities']);
Route::get('/districts/{cityId}', [RajaOngkirController::class, 'getDistricts']);
Route::post('/check-ongkir', [RajaOngkirController::class, 'checkOngkir']);

// 🔹 Biteship & Shipper
Route::post('/biteship/order', [BiteshipController::class, 'createOrder']);
Route::get('/test-biteship-key', fn() => response()->json([
    'env' => env('BITESHIP_API_KEY'),
    'config' => config('services.biteship.api_key') ?? 'null'
]));
Route::post('/shipper/order', [ShipperController::class, 'createOrder']);
Route::get('/shipper/rates/test', [ShipperController::class, 'testRates']);

// 🔹 Midtrans
Route::post('/midtrans/webhook', [MidtransWebhookController::class, 'handle']);
Route::get('/debug-midtrans', fn() => response()->json([
    'server_key' => config('midtrans.server_key'),
    'client_key' => config('midtrans.client_key'),
    'is_production' => config('midtrans.is_production'),
]));

// 🔹 Fonnte
Route::get('/fonnte-test', [FonnteController::class, 'sendMessage']);
Route::post('/send-message', [FonnteController::class, 'sendMessage']);
Route::post('/midtrans/callback', [MidtransController::class, 'callback']);

Route::middleware(['auth:api', RoleMiddleware::class . ':customer'])->group(function () {
    Route::get('/orders', [CustomerOrderController::class, 'index']);
    Route::get('/orders/by-id/{order_id}', [CustomerOrderController::class, 'showByOrderId']);
    Route::get('/payment-detail/{order_id}', [CustomerOrderController::class, 'getPaymentDetail']);
});
Route::patch('/order-status', [CheckoutController::class, 'updateStatus']);
Route::put('/admin/orders/{id}/resi', [AdminOrderController::class, 'updateResi']);

Route::post('/chatbot', [ChatbotController::class, 'reply']);

Route::middleware(['auth:api'])->group(function () {
    Route::post('/send-to-admin', [ChatbotController::class, 'sendToAdmin']);
});
Route::post('/fonnte/webhook', [FonnteController::class, 'incoming']);


Route::middleware('auth:api')->group(function () {
    Route::post('/send-to-admin', [ChatController::class, 'sendToAdmin']);
    Route::get('/admin-reply', [ChatController::class, 'getAdminReplies']);
});

// Webhook WA admin
Route::post('/webhook/admin-message', [ChatController::class, 'receiveAdminMessage']);
Route::get('/chat-messages', [ChatController::class, 'getMessages']);

Route::middleware(['auth:api'])->group(function () {
    Route::get('/chat-messages/{customerId}', [FonnteController::class, 'getMessages']);
});

Route::middleware(['auth:api'])->group(function () {
    Route::get('/admin/chat-messages/{customerId}', [FonnteController::class, 'getMessages']);
    Route::post('/admin/chat-reply', [FonnteController::class, 'adminReply']);
    Route::get('/chat-customers', [FonnteController::class, 'chatCustomers']);


});

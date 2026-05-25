<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ShipperService;

class ShipperController extends Controller
{
    protected $shipper;

    public function __construct(ShipperService $shipper)
    {
        $this->shipper = $shipper;
    }

    public function createOrder(Request $request)
    {
        $payload = [
            "consignee" => [
                "name" => "Penerima",
                "phone_number" => "62852280038095"
            ],
            "consigner" => [
                "name" => "Pengirim",
                "phone_number" => "62852280038095"
            ],
            "courier" => [
                "cod" => false,
                "rate_id" => 58,
                "use_insurance" => true
            ],
            "coverage" => "domestic",
            "destination" => [
                "address" => "Jalan Kenangan",
                "area_id" => 12212,
                "lat" => "-6.123123123",
                "lng" => "104.12312312"
            ],
            "external_id" => "KRN1231123121",
            "origin" => [
                "address" => "Jalan Kenangan",
                "area_id" => 12212,
                "lat" => "-6.123123123",
                "lng" => "104.12312312"
            ],
            "package" => [
                "height" => 60,
                "items" => [
                    [
                        "name" => "Baju Baju",
                        "price" => 120000,
                        "qty" => 12
                    ]
                ],
                "length" => 30,
                "package_type" => 2,
                "price" => 1440000,
                "weight" => 1.1231,
                "width" => 40
            ],
            "payment_type" => "postpay"
        ];

        $response = $this->shipper->createOrder($payload);
        return response()->json($response);
    }

    public function testRates()
    {
        $response = $this->shipper->testRates();
        return response()->json($response);
    }
}

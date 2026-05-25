<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ShippingRate;

class ShippingController extends Controller
{
    public function getProvinces()
    {
        $provinces = ShippingRate::select('province')->distinct()->pluck('province');
        return response()->json($provinces);
    }

    public function getCities($province)
    {
        $cities = ShippingRate::where('province', $province)
            ->select('city')->distinct()->pluck('city');
        return response()->json($cities);
    }

    public function getCouriers()
    {
        $couriers = ShippingRate::select('courier')->distinct()->pluck('courier');
        return response()->json($couriers);
    }
}

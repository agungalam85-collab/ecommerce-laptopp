document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const name = localStorage.getItem('customer_name');
  if (name) document.getElementById('customerName').textContent = name;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });

  document.getElementById('shippingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const productIds = JSON.parse(localStorage.getItem('checkoutProductIds') || '[]');

    const payload = {
      shipper_contact_name: "Agung",
      shipper_contact_phone: "08123456789",
      shipper_contact_email: "agung@test.com",
      shipper_organization: "Toko Agung",

      origin_contact_name: "Agung",
      origin_contact_phone: "08123456789",
      origin_address: document.getElementById('origin_address').value,
      origin_note: "Dekat pintu masuk",
      origin_postal_code: parseInt(document.getElementById('origin_postal').value),

      destination_contact_name: document.getElementById('name').value,
      destination_contact_phone: document.getElementById('phone').value,
      destination_contact_email: document.getElementById('email').value,
      destination_address: document.getElementById('address').value,
      destination_note: document.getElementById('note').value,
      destination_postal_code: parseInt(document.getElementById('postal').value),

      courier_company: document.getElementById('courier').value,
      courier_type: document.getElementById('service').value,
      courier_insurance: 500000,
      delivery_type: "now",
      order_note: "Harap hati-hati",
      metadata: {},

      items: [
        {
          name: "Black L",
          description: "White Shirt",
          category: "fashion",
          value: 165000,
          quantity: 1,
          height: 10,
          length: 10,
          weight: 200,
          width: 10
        }
      ],

      product_ids: productIds
    };

    try {
      const res = await fetch('http://localhost:8000/api/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal membuat order');

      alert(`Order berhasil!\nTracking ID: ${data.tracking_id}\nWaybill: ${data.waybill_id}`);
      localStorage.setItem('trackingId', data.tracking_id);
      localStorage.setItem('waybillId', data.waybill_id);
      window.location.href = 'checkout.html';
    } catch (err) {
      alert(err.message);
    }
  });
});

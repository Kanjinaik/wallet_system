<?php

echo "🧪 TESTING DEPOSIT API ENDPOINTS\n";
echo "====================================\n\n";

// Test 1: Direct deposit processing
echo "📝 Test 1: Direct Deposit Processing\n";
echo "-----------------------------------\n";

$depositData = [
    'wallet_id' => 1,
    'amount' => 1000,
    'payment_method' => 'razorpay'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/deposit');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($depositData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Request: POST /deposit\n";
echo "Data: " . json_encode($depositData, JSON_PRETTY_PRINT) . "\n";
echo "HTTP Status: $httpCode\n";
echo "Response: $response\n\n";

// Test 2: Get wallet balance after deposit
echo "💰 Test 2: Check Updated Wallet Balance\n";
echo "---------------------------------------\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/api/wallets');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    'Authorization: Bearer test_token'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Request: GET /api/wallets\n";
echo "HTTP Status: $httpCode\n";
echo "Response: $response\n\n";

echo "✅ Deposit API Test Complete!\n";
echo "===============================\n";
echo "If you see deposit success above, the API is working!\n";
echo "You can now test deposits from the frontend.\n";

?>

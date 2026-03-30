<?php
// Enable CORS
header("Access-Control-Allow-Origin: http://localhost:5173/"); 
header('Access-Control-Allow-Origin: *');// React dev server
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
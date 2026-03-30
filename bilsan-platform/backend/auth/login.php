<?php
// Enable CORS

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
require_once '../config/database.php';

// Get the raw POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Debug logging (remove in production)
error_log("Login attempt: " . print_r($data, true));

if (empty($data['username']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'اسم المستخدم وكلمة المرور مطلوبان']);
    exit;
}

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';
$userType = $data['userType'] ?? 'student';

try {
    // Find user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND user_type = ?");
    $stmt->execute([$username, $userType]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'اسم المستخدم أو كلمة المرور غير صحيحة']);
        exit;
    }

    // Verify password
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'اسم المستخدم أو كلمة المرور غير صحيحة']);
        exit;
    }

    // Start session
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['user_type'] = $user['user_type'];
    $_SESSION['level'] = $user['level'];

    // Return success with user data
    echo json_encode([
        'success' => true,
        'message' => 'تم تسجيل الدخول بنجاح',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'user_type' => $user['user_type'],
            'level' => $user['level'],
            'score' => $user['score'] // إضافة النقاط
        ],
    ]);

} catch(PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'خطأ في قاعدة البيانات']);
    exit;
}
?>
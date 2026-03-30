<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';
$email = $data['email'] ?? '';
$phone = $data['phone'] ?? '';
$userType = $data['userType'] ?? 'student';
$level = $data['level'] ?? 'beginner';
$confirmPassword = $data['confirmPassword'] ?? '';

// Validation
if (empty($username) || empty($password) || empty($email)) {
    echo json_encode(['error' => 'جميع الحقول مطلوبة']);
    exit;
}

if ($password !== $confirmPassword) {
    echo json_encode(['error' => 'كلمة المرور وتأكيدها غير متطابقين']);
    exit;
}

// Check if user exists
$checkStmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$checkStmt->execute([$username, $email]);
if ($checkStmt->fetch()) {
    echo json_encode(['error' => 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل']);
    exit;
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert user
$stmt = $pdo->prepare("INSERT INTO users (username, email, password, phone, user_type, level) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([$username, $email, $hashedPassword, $phone, $userType, $level]);

echo json_encode([
    'success' => true,
    'message' => 'تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول'
]);
?>
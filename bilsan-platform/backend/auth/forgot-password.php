<?php
// Enable CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

// التحقق من أن الطريقة POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// قراءة البيانات المرسلة
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'بيانات غير صالحة']);
    exit;
}

// التحقق من وجود البيانات المطلوبة
if (!isset($data['email']) || !isset($data['new_password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'البريد الإلكتروني وكلمة المرور الجديدة مطلوبان']);
    exit;
}

$email = trim($data['email']);
$newPassword = trim($data['new_password']);

try {
    // التحقق من وجود المستخدم
    $stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode([
            'success' => false,
            'error' => 'البريد الإلكتروني غير مسجل'
        ]);
        exit;
    }

    // التحقق من طول كلمة المرور
    if (strlen($newPassword) < 6) {
        echo json_encode([
            'success' => false,
            'error' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        ]);
        exit;
    }

    // تحديث كلمة المرور
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $result = $updateStmt->execute([$hashedPassword, $user['id']]);

    if ($result) {
        // يمكنك إرسال بريد إلكتروني تأكيدي هنا إذا أردت
        // sendConfirmationEmail($email, $user['username']);
        
        echo json_encode([
            'success' => true,
            'message' => 'تم تغيير كلمة المرور بنجاح'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'فشل في تغيير كلمة المرور'
        ]);
    }
    
} catch(PDOException $e) {
    error_log("Database error in forgot-password: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'خطأ في قاعدة البيانات']);
} catch(Exception $e) {
    error_log("Error in forgot-password: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'حدث خطأ غير متوقع']);
}

// دالة إرسال بريد تأكيد (اختياري)
function sendConfirmationEmail($to, $username) {
    // يمكنك إضافة إرسال بريد تأكيد هنا إذا أردت
    // استخدم PHPMailer أو دالة mail() العادية
    return true;
}
?>
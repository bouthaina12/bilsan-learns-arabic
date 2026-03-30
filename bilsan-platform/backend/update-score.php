<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/database.php';

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (empty($data['user_id']) || !isset($data['points'])) {
    http_response_code(400);
    echo json_encode(['error' => 'معرف المستخدم والنقاط مطلوبان']);
    exit;
}

$userId = $data['user_id'];
$points = (int)$data['points'];

try {
    // Get current score
    $stmt = $pdo->prepare("SELECT score FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $current = $stmt->fetch();
    
    if (!$current) {
        http_response_code(404);
        echo json_encode(['error' => 'المستخدم غير موجود']);
        exit;
    }
    
    $newScore = $current['score'] + $points;
    
    // Update score
    $updateStmt = $pdo->prepare("UPDATE users SET score = ? WHERE id = ?");
    $updateStmt->execute([$newScore, $userId]);
    
    echo json_encode([
        'success' => true,
        'message' => 'تم تحديث النقاط بنجاح',
        'new_score' => $newScore,
        'added_points' => $points
    ]);

} catch(PDOException $e) {
    error_log("Database error in update score: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'خطأ في قاعدة البيانات'
    ]);
}
?>
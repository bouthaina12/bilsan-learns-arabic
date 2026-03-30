<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/database.php';

try {
    // Get all students ordered by score (highest first)
    $stmt = $pdo->prepare("
        SELECT id, username, email, level, user_type, score, 
               DATE(created_at) as join_date
        FROM users 
        WHERE user_type = 'student' 
        ORDER BY score DESC, created_at ASC
    ");
    
    $stmt->execute();
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Add trend indicators (simplified - you might want to calculate based on historical data)
    foreach ($students as &$student) {
        // For now, random trend. You should implement actual trend calculation
        $trends = ['up', 'down', 'stable'];
        $student['trend'] = $trends[rand(0, 2)];
    }

    echo json_encode([
        'success' => true,
        'students' => $students,
        'count' => count($students)
    ]);

} catch(PDOException $e) {
    error_log("Database error in ranking: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'خطأ في قاعدة البيانات'
    ]);
}
?>
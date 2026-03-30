<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/database.php';

// التعامل مع طلبات OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// GET - الحصول على نموذج موجود
if ($method === 'GET') {
    if (!isset($_GET['story_id']) || !isset($_GET['user_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'معرف القصة والمستخدم مطلوبان']);
        exit;
    }

    $story_id = (int)$_GET['story_id'];
    $user_id = (int)$_GET['user_id'];

    try {
        $stmt = $pdo->prepare("SELECT * FROM story_forms WHERE story_id = ? AND user_id = ?");
        $stmt->execute([$story_id, $user_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            echo json_encode([
                'success' => true,
                'data' => $result
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'لم يتم العثور على إجابة'
            ]);
        }
    } catch(PDOException $e) {
        error_log("Database error in GET story-form: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'خطأ في قاعدة البيانات'
        ]);
    }
}

// POST - إنشاء نموذج جديد
elseif ($method === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'بيانات غير صالحة']);
        exit;
    }

    $required_fields = ['story_id', 'user_id', 'liked_words', 'summary_arabic', 'favorite_part', 'desired_changes', 'favorite_paragraph'];
    
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            http_response_code(400);
            echo json_encode(['error' => 'جميع الحقول مطلوبة: ' . $field]);
            exit;
        }
    }

    try {
        // التحقق أولاً من وجود إرسال سابق
        $checkStmt = $pdo->prepare("SELECT id FROM story_forms WHERE story_id = ? AND user_id = ?");
        $checkStmt->execute([$data['story_id'], $data['user_id']]);
        $existing = $checkStmt->fetch();
        
        if ($existing) {
            // إذا كان موجوداً، تحديثه بدلاً من إنشاء جديد
            $stmt = $pdo->prepare("
                UPDATE story_forms 
                SET liked_words = ?, 
                    summary_arabic = ?, 
                    favorite_part = ?, 
                    desired_changes = ?, 
                    favorite_paragraph = ?,
                    submitted_at = NOW()
                WHERE id = ?
            ");
            
            $stmt->execute([
                $data['liked_words'],
                $data['summary_arabic'],
                $data['favorite_part'],
                $data['desired_changes'],
                $data['favorite_paragraph'],
                $existing['id']
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'تم تحديث الإجابة بنجاح',
                'data' => ['id' => $existing['id']],
                'is_update' => true
            ]);
            exit;
        }

        // إدخال البيانات الجديدة
        $stmt = $pdo->prepare("
            INSERT INTO story_forms 
            (story_id, user_id, liked_words, summary_arabic, favorite_part, desired_changes, favorite_paragraph, submitted_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $data['story_id'],
            $data['user_id'],
            $data['liked_words'],
            $data['summary_arabic'],
            $data['favorite_part'],
            $data['desired_changes'],
            $data['favorite_paragraph']
        ]);
        
        $id = $pdo->lastInsertId();
        
        // تحديث نقاط المستخدم فقط للإرسال الأول
        $updateScoreStmt = $pdo->prepare("UPDATE users SET score = score + 50 WHERE id = ?");
        $updateScoreStmt->execute([$data['user_id']]);
        
        // الحصول على النتيجة الجديدة
        $scoreStmt = $pdo->prepare("SELECT score FROM users WHERE id = ?");
        $scoreStmt->execute([$data['user_id']]);
        $newScore = $scoreStmt->fetchColumn();
        
        echo json_encode([
            'success' => true,
            'message' => 'تم حفظ الإجابة بنجاح وإضافة 50 نقطة',
            'data' => ['id' => $id],
            'points_added' => 50,
            'new_score' => $newScore,
            'is_new' => true
        ]);

    } catch(PDOException $e) {
        error_log("Database error in POST story-form: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'خطأ في قاعدة البيانات'
        ]);
    }
}

// PUT - تحديث نموذج موجود (مع معرف النموذج)
elseif ($method === 'PUT') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'معرف النموذج مطلوب']);
        exit;
    }

    $id = (int)$_GET['id'];
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'بيانات غير صالحة']);
        exit;
    }

    $required_fields = ['liked_words', 'summary_arabic', 'favorite_part', 'desired_changes', 'favorite_paragraph'];
    
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            http_response_code(400);
            echo json_encode(['error' => 'جميع الحقول مطلوبة: ' . $field]);
            exit;
        }
    }

    try {
        // التحقق من وجود النموذج
        $checkStmt = $pdo->prepare("SELECT id FROM story_forms WHERE id = ?");
        $checkStmt->execute([$id]);
        
        if (!$checkStmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'النموذج غير موجود']);
            exit;
        }

        // تحديث البيانات - بدون إضافة نقاط
        $stmt = $pdo->prepare("
            UPDATE story_forms 
            SET liked_words = ?, 
                summary_arabic = ?, 
                favorite_part = ?, 
                desired_changes = ?, 
                favorite_paragraph = ?,
                submitted_at = NOW()
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['liked_words'],
            $data['summary_arabic'],
            $data['favorite_part'],
            $data['desired_changes'],
            $data['favorite_paragraph'],
            $id
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'تم تحديث الإجابة بنجاح',
            'is_update' => true
        ]);

    } catch(PDOException $e) {
        error_log("Database error in PUT story-form: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'خطأ في قاعدة البيانات'
        ]);
    }
}

// DELETE - حذف النموذج
elseif ($method === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'معرف النموذج مطلوب']);
        exit;
    }

    $id = (int)$_GET['id'];

    try {
        $stmt = $pdo->prepare("DELETE FROM story_forms WHERE id = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'تم حذف الإجابة بنجاح'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'النموذج غير موجود'
            ]);
        }

    } catch(PDOException $e) {
        error_log("Database error in DELETE story-form: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'خطأ في قاعدة البيانات'
        ]);
    }
}

// أي طلب آخر
else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
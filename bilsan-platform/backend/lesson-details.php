<?php
require_once 'config/database.php';

// تمكين CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

// معالجة طلبات Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// بدء الـ Output Buffering
ob_start();

try {
    // استخراج الـ action من URL أو POST data
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    
    if (empty($action)) {
        // إذا لم يكن هناك action، تحقق من وجود id للحصول على تفاصيل الدرس
        if (isset($_GET['id'])) {
            $action = 'get_lesson_details';
        } else {
            throw new Exception('Action parameter is required');
        }
    }
    
    // توجيه الطلب إلى الدالة المناسبة
    switch ($action) {
        case 'get_lesson_details':
            getLessonDetails();
            break;
        case 'get_questions':
            getLessonQuestions();
            break;
         
        case 'save_quiz_result':
            saveQuizResult();
            break;   
        case 'get_related_lessons':
            getRelatedLessons();
            break;
            
        case 'check_completion':
            checkLessonCompletion();
            break;
            
        case 'mark_complete':
            markLessonComplete();
            break;
            
        case 'get_user_progress':
            getUserProgress();
            break;
            
        case 'get_completed_lessons':
            getCompletedLessons();
            break;
            
        case 'unmark_complete':
            unmarkLessonComplete();
            break;
            
        default:
            throw new Exception('Invalid action');
    }
    
} catch (Exception $e) {
    // تنظيف الـ output buffer
    if (ob_get_length()) ob_end_clean();
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// ======================= الدوال الرئيسية =======================

/**
 * الحصول على تفاصيل درس معين
 */



function getLessonDetails() {
    global $pdo;
    
    if (!isset($_GET['id'])) {
        throw new Exception('Lesson ID is required');
    }
    
    $lessonId = (int)$_GET['id'];
    
    $query = "SELECT * FROM lessons WHERE id = :id";
    $stmt = $pdo->prepare($query);
    $stmt->execute([':id' => $lessonId]);
    
    $lesson = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$lesson) {
        throw new Exception('Lesson not found');
    }
    
    // استخراج YouTube ID
    $lesson['video_id'] = extractYouTubeId($lesson['youtube_url']);
    
    // تنظيف الـ output buffer
    ob_end_clean();
    
    echo json_encode([
        'success' => true,
        'lesson' => $lesson
    ]);
}

/**
 * الحصول على دروس ذات صلة
 */
function getRelatedLessons() {
    global $pdo;
    
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 3;
    $excludeId = isset($_GET['exclude']) ? (int)$_GET['exclude'] : null;
    $level = isset($_GET['level']) ? $_GET['level'] : null;
    
    $query = "SELECT * FROM lessons WHERE id != :exclude";
    $params = [':exclude' => $excludeId ?: 0];
    
    if ($level && in_array($level, ['beginner', 'medium', 'advanced'])) {
        $query .= " AND level = :level";
        $params[':level'] = $level;
    }
    
    $query .= " ORDER BY RAND() LIMIT :limit";
    
    $stmt = $pdo->prepare($query);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // إضافة video_id لكل درس
    foreach ($lessons as &$lesson) {
        $lesson['video_id'] = extractYouTubeId($lesson['youtube_url']);
    }
    
    ob_end_clean();
    
    echo json_encode([
        'success' => true,
        'lessons' => $lessons,
        'count' => count($lessons)
    ]);
}

/**
 * التحقق من إكمال درس معين للمستخدم
 */
function checkLessonCompletion() {
    global $pdo;
    
    if (!isset($_GET['user_id']) || !isset($_GET['lesson_id'])) {
        throw new Exception('User ID and Lesson ID are required');
    }
    
    $userId = (int)$_GET['user_id'];
    $lessonId = (int)$_GET['lesson_id'];
    
    $query = "SELECT status, completed_at FROM completed_lessons 
              WHERE user_id = :user_id AND lesson_id = :lesson_id";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':user_id' => $userId,
        ':lesson_id' => $lessonId
    ]);
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    ob_end_clean();
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'completed' => true,
            'status' => $result['status'],
            'completed_at' => $result['completed_at'],
            'message' => 'Lesson is completed'
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'completed' => false,
            'message' => 'Lesson is not completed'
        ]);
    }
}

/**
 * تحديد درس كمكتمل
 */
function markLessonComplete() {
    global $pdo;
    
    // قراءة البيانات من POST أو GET
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input && isset($_POST['user_id'])) {
            $input = $_POST;
        }
    } else {
        $input = $_GET;
    }
    
    if (!isset($input['user_id']) || !isset($input['lesson_id'])) {
        throw new Exception('User ID and Lesson ID are required');
    }
    
    $userId = (int)$input['user_id'];
    $lessonId = (int)$input['lesson_id'];
    $status = isset($input['status']) ? $input['status'] : 'completed';
    
    // التحقق من وجود الدرس
    $stmt = $pdo->prepare("SELECT id, name FROM lessons WHERE id = ?");
    $stmt->execute([$lessonId]);
    $lesson = $stmt->fetch();
    
    if (!$lesson) {
        throw new Exception('Lesson not found');
    }
    
    // إدخال أو تحديث سجل الإكمال
    $query = "INSERT INTO completed_lessons (user_id, lesson_id, status, completed_at) 
              VALUES (:user_id, :lesson_id, :status, NOW())
              ON DUPLICATE KEY UPDATE 
              status = :status_update, 
              completed_at = NOW()";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':user_id' => $userId,
        ':lesson_id' => $lessonId,
        ':status' => $status,
        ':status_update' => $status
    ]);
    
    // الحصول على وقت الإكمال
    $stmt = $pdo->prepare("SELECT completed_at FROM completed_lessons 
                           WHERE user_id = ? AND lesson_id = ?");
    $stmt->execute([$userId, $lessonId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    ob_end_clean();
    
    echo json_encode([
        'success' => true,
        'message' => 'Lesson marked as completed successfully',
        'lesson_id' => $lessonId,
        'lesson_name' => $lesson['name'],
        'completed_at' => $result['completed_at'],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

/**
 * إزالة درس من المكتملات
 */
function unmarkLessonComplete() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input && isset($_POST['user_id'])) {
        $input = $_POST;
    }
    
    if (!isset($input['user_id']) || !isset($input['lesson_id'])) {
        throw new Exception('User ID and Lesson ID are required');
    }
    
    $userId = (int)$input['user_id'];
    $lessonId = (int)$input['lesson_id'];
    
    $query = "DELETE FROM completed_lessons 
              WHERE user_id = :user_id AND lesson_id = :lesson_id";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':user_id' => $userId,
        ':lesson_id' => $lessonId
    ]);
    
    $deleted = $stmt->rowCount();
    
    ob_end_clean();
    
    echo json_encode([
        'success' => true,
        'message' => $deleted ? 'Lesson removed from completed list' : 'Lesson was not completed',
        'deleted' => $deleted > 0
    ]);
}

/**
 * الحصول على تقدم المستخدم
 */
function getUserProgress() {
    global $pdo;
    
    if (!isset($_GET['user_id'])) {
        throw new Exception('User ID is required');
    }
    
    $userId = (int)$_GET['user_id'];
    
    // عدد الدروس المكتملة
    $completedQuery = "SELECT COUNT(*) as completed_count 
                      FROM completed_lessons 
                      WHERE user_id = :user_id AND status = 'completed'";
    
    $stmt = $pdo->prepare($completedQuery);
    $stmt->execute([':user_id' => $userId]);
    $completed = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // إجمالي عدد الدروس
    $totalQuery = "SELECT COUNT(*) as total_count FROM lessons";
    $totalStmt = $pdo->query($totalQuery);
    $total = $totalStmt->fetch(PDO::FETCH_ASSOC);
    
    // عدد الدروس لكل مستوى
    $levelsQuery = "SELECT 
                    SUM(CASE WHEN l.level = 'beginner' THEN 1 ELSE 0 END) as beginner_completed,
                    SUM(CASE WHEN l.level = 'medium' THEN 1 ELSE 0 END) as medium_completed,
                    SUM(CASE WHEN l.level = 'advanced' THEN 1 ELSE 0 END) as advanced_completed
                    FROM completed_lessons cl
                    JOIN lessons l ON cl.lesson_id = l.id
                    WHERE cl.user_id = :user_id AND cl.status = 'completed'";
    
    $levelsStmt = $pdo->prepare($levelsQuery);
    $levelsStmt->execute([':user_id' => $userId]);
    $levels = $levelsStmt->fetch(PDO::FETCH_ASSOC);
    
    // إجمالي عدد الدروس لكل مستوى
    $totalLevelsQuery = "SELECT 
                        SUM(CASE WHEN level = 'beginner' THEN 1 ELSE 0 END) as total_beginner,
                        SUM(CASE WHEN level = 'medium' THEN 1 ELSE 0 END) as total_medium,
                        SUM(CASE WHEN level = 'advanced' THEN 1 ELSE 0 END) as total_advanced
                        FROM lessons";
    
    $totalLevelsStmt = $pdo->query($totalLevelsQuery);
    $totalLevels = $totalLevelsStmt->fetch(PDO::FETCH_ASSOC);
    
    // آخر 10 دروس مكتملة
    $recentQuery = "SELECT cl.*, l.name as lesson_name, l.level, l.youtube_url
                   FROM completed_lessons cl
                   JOIN lessons l ON cl.lesson_id = l.id
                   WHERE cl.user_id = :user_id AND cl.status = 'completed'
                   ORDER BY cl.completed_at DESC
                   LIMIT 10";
    
    $recentStmt = $pdo->prepare($recentQuery);
    $recentStmt->execute([':user_id' => $userId]);
    $recentLessons = $recentStmt->fetchAll(PDO::FETCH_ASSOC);
    
    ob_end_clean();
    
    echo json_encode([
        'success' => true,
        'progress' => [
            'completed' => (int)$completed['completed_count'],
            'total' => (int)$total['total_count'],
            'percentage' => $total['total_count'] > 0 
                ? round(($completed['completed_count'] / $total['total_count']) * 100, 1)
                : 0
        ],
        'levels' => [
            'beginner' => [
                'completed' => (int)$levels['beginner_completed'],
                'total' => (int)$totalLevels['total_beginner']
            ],
            'medium' => [
                'completed' => (int)$levels['medium_completed'],
                'total' => (int)$totalLevels['total_medium']
            ],
            'advanced' => [
                'completed' => (int)$levels['advanced_completed'],
                'total' => (int)$totalLevels['total_advanced']
            ]
        ],
        'recent_completed' => $recentLessons,
        'last_updated' => date('Y-m-d H:i:s')
    ]);
}

/**
 * الحصول على جميع الدروس المكتملة للمستخدم
 */
function getCompletedLessons() {
    global $pdo;
    
    if (!isset($_GET['user_id'])) {
        throw new Exception('User ID is required');
    }
    
    $userId = (int)$_GET['user_id'];
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $offset = ($page - 1) * $limit;
    
    $query = "SELECT cl.*, l.id as lesson_id, l.name, l.description, 
                     l.level, l.youtube_url, l.created_at as lesson_created
              FROM completed_lessons cl
              JOIN lessons l ON cl.lesson_id = l.id
              WHERE cl.user_id = :user_id AND cl.status = 'completed'
              ORDER BY cl.completed_at DESC
              LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($query);
    $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $completedLessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // إضافة video_id
    foreach ($completedLessons as &$lesson) {
        $lesson['video_id'] = extractYouTubeId($lesson['youtube_url']);
    }
    
    // عدد الصفحات
    $countQuery = "SELECT COUNT(*) as total 
                   FROM completed_lessons 
                   WHERE user_id = :user_id AND status = 'completed'";
    
    $countStmt = $pdo->prepare($countQuery);
    $countStmt->execute([':user_id' => $userId]);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    ob_end_clean();
    
    echo json_encode([
        'success' => true,
        'completed_lessons' => $completedLessons,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total' => (int)$total,
            'total_pages' => ceil($total / $limit)
        ],
        'count' => count($completedLessons)
    ]);
}

/**
 * استخراج YouTube ID من URL
 */
function extractYouTubeId($url) {
    if (empty($url)) return '';
    
    $patterns = [
        '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i',
        '/youtube\.com\/embed\/([^"&?\/\s]{11})/i',
        '/youtube\.com\/watch\?v=([^"&?\/\s]{11})/i',
        '/youtu\.be\/([^"&?\/\s]{11})/i'
    ];
    
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }
    }
    
    return '';
}



/**
 * الحصول على أسئلة الدرس
 */
function getLessonQuestions() {
    global $pdo;
    
    if (!isset($_GET['lesson_id'])) {
        throw new Exception('Lesson ID is required');
    }
    
    $lessonId = (int)$_GET['lesson_id'];
    
    $query = "SELECT * FROM lesson_questions WHERE lesson_id = :lesson_id ORDER BY RAND() LIMIT 3";
    $stmt = $pdo->prepare($query);
    $stmt->execute([':lesson_id' => $lessonId]);
    
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    ob_end_clean();
    
    echo json_encode([
        'success' => true,
        'questions' => $questions,
        'count' => count($questions)
    ]);
}

/**
 * حفظ نتيجة الاختبار
 */
function saveQuizResult() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['user_id']) || !isset($input['lesson_id']) || !isset($input['score'])) {
        throw new Exception('User ID, Lesson ID and Score are required');
    }
    
    $userId = (int)$input['user_id'];
    $lessonId = (int)$input['lesson_id'];
    $score = (int)$input['score'];
    $total = isset($input['total']) ? (int)$input['total'] : 3;
    
    // التحقق من وجود الجدول (اختياري)
    $tableExists = $pdo->query("SHOW TABLES LIKE 'quiz_results'")->rowCount() > 0;
    
   
    
    $percentage = ($score / $total) * 100;
    
    $query = "INSERT INTO quiz_results (user_id, lesson_id, score, total, percentage) 
              VALUES (:user_id, :lesson_id, :score, :total, :percentage)
              ON DUPLICATE KEY UPDATE 
              score = :score_update, 
              total = :total_update, 
              percentage = :percentage_update, 
              completed_at = NOW()";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':user_id' => $userId,
        ':lesson_id' => $lessonId,
        ':score' => $score,
        ':total' => $total,
        ':percentage' => $percentage,
        ':score_update' => $score,
        ':total_update' => $total,
        ':percentage_update' => $percentage
    ]);
    
    ob_end_clean();
    
    echo json_encode([
        'success' => true,
        'message' => 'Quiz result saved successfully',
        'score' => $score,
        'total' => $total,
        'percentage' => $percentage
    ]);
}
?>
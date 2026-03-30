<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/database.php';

$response = ['success' => false, 'message' => '', 'data' => []];

try {
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // الحصول على جميع القصص
        if (isset($_GET['id'])) {
            // الحصول على قصة محددة
            $id = intval($_GET['id']);
            $stmt = $pdo->prepare("SELECT * FROM stories WHERE id = ?");
            $stmt->execute([$id]);
            $story = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($story) {
                $response['success'] = true;
                $response['data'] = $story;
            } else {
                $response['message'] = 'القصة غير موجودة';
            }
        } else {
            // الحصول على جميع القصص مع فلترة
            $category = isset($_GET['category']) ? $_GET['category'] : null;
            $level = isset($_GET['level']) ? $_GET['level'] : null;
            $search = isset($_GET['search']) ? $_GET['search'] : null;
            
            $sql = "SELECT * FROM stories WHERE 1=1";
            $params = [];
            
            if ($category && $category !== 'all') {
                $sql .= " AND category = ?";
                $params[] = $category;
            }
            
            if ($level && $level !== 'all') {
                $sql .= " AND difficulty_level = ?";
                $params[] = $level;
            }
            
            if ($search) {
                $sql .= " AND (title LIKE ? OR description LIKE ?)";
                $searchTerm = "%$search%";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }
            
            $sql .= " ORDER BY created_at DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $stories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $response['success'] = true;
            $response['data'] = $stories;
            $response['total'] = count($stories);
        }
    }
    
    // POST - إضافة قصة جديدة (للمسؤول)
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['title'], $data['pdf_path'])) {
            $stmt = $conn->prepare("
                INSERT INTO stories 
                (title, description, pdf_path, cover_image, category, difficulty_level, pages_count, audio_file) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $result = $stmt->execute([
                $data['title'],
                $data['description'] ?? '',
                $data['pdf_path'],
                $data['cover_image'] ?? '',
                $data['category'] ?? 'عام',
                $data['difficulty_level'] ?? 'easy',
                $data['pages_count'] ?? 0,
                $data['audio_file'] ?? ''
            ]);
            
            if ($result) {
                $response['success'] = true;
                $response['message'] = 'تمت إضافة القصة بنجاح';
                $response['id'] = $conn->lastInsertId();
            } else {
                $response['message'] = 'فشل في إضافة القصة';
            }
        } else {
            $response['message'] = 'البيانات غير مكتملة';
        }
    }
    
    // PUT - تحديث القصة
    elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        parse_str(file_get_contents("php://input"), $put_vars);
        $data = $put_vars;
        
        if (isset($data['id'])) {
            $id = intval($data['id']);
            $fields = [];
            $params = [];
            
            if (isset($data['title'])) {
                $fields[] = "title = ?";
                $params[] = $data['title'];
            }
            if (isset($data['description'])) {
                $fields[] = "description = ?";
                $params[] = $data['description'];
            }
            if (isset($data['pdf_path'])) {
                $fields[] = "pdf_path = ?";
                $params[] = $data['pdf_path'];
            }
            if (isset($data['cover_image'])) {
                $fields[] = "cover_image = ?";
                $params[] = $data['cover_image'];
            }
            if (isset($data['category'])) {
                $fields[] = "category = ?";
                $params[] = $data['category'];
            }
            if (isset($data['difficulty_level'])) {
                $fields[] = "difficulty_level = ?";
                $params[] = $data['difficulty_level'];
            }
            if (isset($data['pages_count'])) {
                $fields[] = "pages_count = ?";
                $params[] = $data['pages_count'];
            }
            
            if (!empty($fields)) {
                $sql = "UPDATE stories SET " . implode(', ', $fields) . " WHERE id = ?";
                $params[] = $id;
                
                $stmt = $pdo->prepare($sql);
                $result = $stmt->execute($params);
                
                if ($result) {
                    $response['success'] = true;
                    $response['message'] = 'تم تحديث القصة بنجاح';
                } else {
                    $response['message'] = 'فشل في تحديث القصة';
                }
            }
        }
    }
    
    // DELETE - حذف القصة
    elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        parse_str(file_get_contents("php://input"), $delete_vars);
        $id = isset($delete_vars['id']) ? intval($delete_vars['id']) : 0;
        
        if ($id > 0) {
            $stmt = $pdo->prepare("DELETE FROM stories WHERE id = ?");
            $result = $stmt->execute([$id]);
            
            if ($result) {
                $response['success'] = true;
                $response['message'] = 'تم حذف القصة بنجاح';
            } else {
                $response['message'] = 'فشل في حذف القصة';
            }
        } else {
            $response['message'] = 'معرف غير صالح';
        }
    }
    
} catch (PDOException $e) {
    $response['message'] = 'خطأ في قاعدة البيانات: ' . $e->getMessage();
} catch (Exception $e) {
    $response['message'] = 'خطأ: ' . $e->getMessage();
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
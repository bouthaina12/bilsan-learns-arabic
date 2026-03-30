<?php

require_once 'config/database.php';

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
// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers AFTER we've captured any errors
$headers_sent = headers_sent();
if (!$headers_sent) {
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");
}


// Get all output so far (including errors)
$output = ob_get_clean();

try {
   
    
    // Test query
    $stmt = $pdo->query("SELECT * FROM lessons");
    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // If there was any output before (errors), include it
    if ($output) {
        echo json_encode([
            'success' => false,
            'error' => 'PHP output detected before JSON',
            'output' => $output,
            'lessons_count' => count($lessons)
        ]);
    } else {
        // Process lessons
        foreach ($lessons as &$lesson) {
            $url = $lesson['youtube_url'];
            $video_id = '';
            
            // Extract YouTube ID
            if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i', $url, $matches)) {
                $video_id = $matches[1];
            }
            $lesson['video_id'] = $video_id;
        }
        
        echo json_encode([
            'success' => true,
            'lessons' => $lessons,
            'total' => count($lessons),
            'debug' => [
                'database' => 'connected',
                'table' => 'exists',
                'rows' => count($lessons)
            ]
        ]);
    }
    
} catch (PDOException $e) {
    // Database error
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'message' => $e->getMessage(),
        'output' => $output
    ]);
} catch (Exception $e) {
    // General error
    echo json_encode([
        'success' => false,
        'error' => 'General error',
        'message' => $e->getMessage(),
        'output' => $output
    ]);
}
?>
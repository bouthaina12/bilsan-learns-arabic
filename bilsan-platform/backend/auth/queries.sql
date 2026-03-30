-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    youtube_url VARCHAR(500) NOT NULL,
    description TEXT,
    level ENUM('beginner', 'medium', 'advanced') DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample lessons
INSERT INTO lessons (name, youtube_url, description, level) VALUES
('حرف الألف - تعلم النطق الصحيح', 'https://www.youtube.com/watch?v=qqH6zk-n2vw', 'تعلم نطق حرف الألف بالطريقة الصحيحة', 'beginner'),
('حرف الباء مع أمثلة عملية', 'https://www.youtube.com/watch?v=qqH6zk-n2vw', 'تعلم حرف الباء من خلال أمثلة عملية', 'beginner'),
('حرف التاء والثاء - الفرق بينهما', 'https://www.youtube.com/watch?v=qqH6zk-n2vw', 'تعرف على الفرق بين حرف التاء والثاء', 'beginner'),
('قراءة الجمل البسيطة', 'https://www.youtube.com/watch?v=qqH6zk-n2vw', 'تعلم قراءة الجمل البسيطة باللغة العربية', 'medium'),
('المفرد والجمع', 'https://www.youtube.com/watch?v=qqH6zk-n2vw', 'تعلم تحويل الكلمات من مفرد إلى جمع', 'medium')
;



-- قم بتنفيذ هذا في phpMyAdmin أو MySQL
CREATE TABLE completed_lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    status ENUM('completed', 'in_progress') DEFAULT 'completed',
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_lesson (user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE lesson_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT NOT NULL,
  question_text TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  correct_answer ENUM('A', 'B') NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX (lesson_id),
  CONSTRAINT fk_lesson_questions_lesson
    FOREIGN KEY (lesson_id)
    REFERENCES lessons(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- إنشاء جدول القصص
CREATE TABLE stories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    pdf_path VARCHAR(500) NOT NULL,
    cover_image VARCHAR(500),
    category VARCHAR(100),
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    pages_count INT DEFAULT 0,
    audio_file,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- إضافة بعض القصص الافتراضية
INSERT INTO stories (title, description, pdf_path, cover_image, category, difficulty_level, pages_count) VALUES
('الفيلة لي لي', 'قصة عن فيلة صغيرة تتعلم التعاون', 'elephant-lili.pdf', 'elephant-cover.jpg', 'حيوانات', 'easy', 12),
('مغامرات في الغابة', 'مغامرات ملك الغابة مع أصدقائه', 'jungle-adventures.pdf', 'jungle-cover.jpg', 'مغامرات', 'easy', 16),
('الكنز المفقود', 'بحث عن كنز في جزيرة نائية', 'lost-treasure.pdf', 'treasure-cover.jpg', 'مغامرات', 'medium', 20),
('الأصدقاء الصغار', 'قصة عن صداقة الحيوانات في المزرعة', 'little-friends.pdf', 'farm-cover.jpg', 'حيوانات', 'easy', 14),
('رحلة إلى الفضاء', 'مغامرة بين الكواكب والنجوم', 'space-journey.pdf', 'space-cover.jpg', 'علمية', 'medium', 18);



DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  user_type VARCHAR(50),
  level VARCHAR(50),
  score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  email VARCHAR(150) NOT NULL,
  reset_token VARCHAR(255) NOT NULL,
  verification_code VARCHAR(10),
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  reset_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX (email),
  INDEX (user_id),
  INDEX (reset_token),

  CONSTRAINT fk_password_resets_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE story_forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  story_id INT NOT NULL,
  user_id INT NOT NULL,
  liked_words TEXT,
  summary_arabic TEXT,
  favorite_part TEXT,
  desired_changes TEXT,
  favorite_paragraph TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX (story_id),
  INDEX (user_id),

  CONSTRAINT fk_story_forms_story
    FOREIGN KEY (story_id)
    REFERENCES stories(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_story_forms_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



/*
mtp : test123***
$2y$10$PNGfYmfwCMnLVwGDDLQDH.2fwUmyUCnR9hFFMxyV7az39GV5WKjia

*/
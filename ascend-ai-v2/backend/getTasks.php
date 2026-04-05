<?php
// ============================================
// ASCEND AI — Get Tasks
// ============================================

require_once 'db.php';
header('Content-Type: application/json');

$userId = requireAuth();
$db     = getDB();
$limit  = isset($_GET['limit']) ? (int) $_GET['limit'] : 1000;
$limit  = max(1, min(1000, $limit));

$stmt = $db->prepare('
    SELECT id, title, completed, xp_reward, created_at
    FROM tasks
    WHERE user_id = ?
    ORDER BY completed ASC, created_at DESC
    LIMIT ?
');
$stmt->execute([$userId, $limit]);
$tasks = $stmt->fetchAll();

jsonResponse(['success' => true, 'tasks' => $tasks]);

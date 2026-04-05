<?php
// ============================================
// ASCEND AI — Add Task
// ============================================

require_once 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$userId = requireAuth();
$input  = getInput();
$title  = trim($input['title'] ?? '');

if (!$title) {
    jsonResponse(['success' => false, 'message' => 'Task title is required.']);
}
if (strlen($title) > 255) {
    jsonResponse(['success' => false, 'message' => 'Title too long (max 255 chars).']);
}

$db       = getDB();
$xpReward = 10; // XP per task

$stmt = $db->prepare('INSERT INTO tasks (user_id, title, completed, xp_reward, created_at) VALUES (?, ?, 0, ?, NOW())');
$stmt->execute([$userId, $title, $xpReward]);
$taskId = (int) $db->lastInsertId();

jsonResponse([
    'success'   => true,
    'message'   => 'Task added!',
    'task_id'   => $taskId,
    'xp_reward' => $xpReward,
]);

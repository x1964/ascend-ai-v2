<?php
// ============================================
// ASCEND AI — Update Task (toggle complete)
// ============================================

require_once 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$userId    = requireAuth();
$input     = getInput();
$taskId    = (int) ($input['id']        ?? 0);
$completed = (bool) ($input['completed'] ?? false);

if (!$taskId) {
    jsonResponse(['success' => false, 'message' => 'Task ID is required.']);
}

$db = getDB();

// Verify task belongs to user
$stmt = $db->prepare('SELECT id, completed, xp_reward FROM tasks WHERE id = ? AND user_id = ?');
$stmt->execute([$taskId, $userId]);
$task = $stmt->fetch();

if (!$task) {
    jsonResponse(['success' => false, 'message' => 'Task not found.'], 404);
}

// Update task
$db->prepare('UPDATE tasks SET completed = ?, updated_at = NOW() WHERE id = ?')
   ->execute([$completed ? 1 : 0, $taskId]);

// Award / revoke XP
$wasCompleted = (bool) $task['completed'];
if ($completed && !$wasCompleted) {
    // Just completed → award XP
    $db->prepare('UPDATE users SET xp = xp + ? WHERE id = ?')
       ->execute([$task['xp_reward'], $userId]);
} elseif (!$completed && $wasCompleted) {
    // Un-completed → revoke XP
    $db->prepare('UPDATE users SET xp = GREATEST(0, xp - ?) WHERE id = ?')
       ->execute([$task['xp_reward'], $userId]);
}

// Return updated XP
$stmt = $db->prepare('SELECT xp FROM users WHERE id = ?');
$stmt->execute([$userId]);
$newXp = (int) $stmt->fetchColumn();

jsonResponse([
    'success'   => true,
    'completed' => $completed,
    'new_xp'    => $newXp,
    'xp_delta'  => $completed ? $task['xp_reward'] : -$task['xp_reward'],
]);

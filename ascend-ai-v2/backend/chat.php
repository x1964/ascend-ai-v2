<?php
// ============================================
// ASCEND AI — AI Chat (OpenAI GPT)
// ============================================

require_once 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$userId = requireAuth();
$input  = getInput();
$userMessage = trim($input['message'] ?? '');
$history     = $input['history'] ?? [];

if (!$userMessage) {
    jsonResponse(['success' => false, 'message' => 'Message is required.']);
}

// --- Get OpenAI API key ---
// Priority: DB setting > session-stored key
// The key is passed from the frontend via a separate header or stored server-side.
// For MVP, we read from a server-side config file or the DB user_settings table.
$db   = getDB();
$stmt = $db->prepare('SELECT openai_key FROM user_settings WHERE user_id = ?');
$stmt->execute([$userId]);
$row = $stmt->fetch();
$apiKey = $row['openai_key'] ?? '';

if (!$apiKey) {
    jsonResponse([
        'success' => false,
        'message' => 'No OpenAI API key found. Please add your key in Profile → Settings.'
    ]);
}

// --- Build messages array ---
$systemPrompt = 'You are ASCEND, an elite AI productivity coach. You help users level up their focus, habits, and goals. Be encouraging, concise, and actionable. Use motivational but not cheesy language. Format key points clearly.';

$messages = [['role' => 'system', 'content' => $systemPrompt]];

// Add history (last 10 messages to keep context window manageable)
$recentHistory = array_slice($history, -10);
foreach ($recentHistory as $msg) {
    $role    = $msg['role']    ?? '';
    $content = $msg['content'] ?? '';
    if (in_array($role, ['user', 'assistant']) && $content) {
        $messages[] = ['role' => $role, 'content' => $content];
    }
}

// Append current user message
$messages[] = ['role' => 'user', 'content' => $userMessage];

// --- Call OpenAI API ---
$payload = json_encode([
    'model'       => 'gpt-4o-mini',
    'messages'    => $messages,
    'max_tokens'  => 600,
    'temperature' => 0.75,
]);

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ],
    CURLOPT_TIMEOUT        => 30,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    jsonResponse(['success' => false, 'message' => 'Network error: ' . $curlErr]);
}

$decoded = json_decode($response, true);

if ($httpCode !== 200) {
    $errMsg = $decoded['error']['message'] ?? 'OpenAI API error.';
    jsonResponse(['success' => false, 'message' => $errMsg]);
}

$reply = $decoded['choices'][0]['message']['content'] ?? '';

if (!$reply) {
    jsonResponse(['success' => false, 'message' => 'Empty response from AI.']);
}

jsonResponse(['success' => true, 'reply' => $reply]);

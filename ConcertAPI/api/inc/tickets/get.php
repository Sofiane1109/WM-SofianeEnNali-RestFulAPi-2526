<?php
// --- "get" alle tickets  

$sql = "SELECT id, bezoeker_id, concert_id, aantal FROM tickets";

$result = $conn->query($sql);

if (!$result) {
    $response['code'] = 7;
    $response['status'] = $api_response_code[$response['code']]['HTTP Response'];
    $response['data'] = $conn->error;
    deliver_response($response);
}

$response['data'] = getJsonObjFromResult($result);

$result->free();
$conn->close();

deliver_JSONresponse($response);
exit;
?>

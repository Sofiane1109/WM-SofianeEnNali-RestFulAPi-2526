<?php
// --- "update" een bezoeker  

// Zijn de nodige parameters meegegeven in de request?
check_required_fields(["id","voornaam","familienaam","geboortedatum","emailadres"]);

if(!$stmt = $conn->prepare("
    UPDATE bezoekers 
    SET voornaam = ?, familienaam = ?, geboortedatum = ?, emailadres = ?
    WHERE id = ?
")){
    die('{"error":"Prepared Statement failed on prepare",
         "errNo":' . json_encode($conn->errno) . ',
         "mysqlError":' . json_encode($conn->error) . ',
         "status":"fail"}');
}

// bind parameters ( s = string, i = integer )
if(!$stmt->bind_param("ssssi",
    htmlentities($postvars['voornaam']),
    htmlentities($postvars['familienaam']),
    htmlentities($postvars['geboortedatum']),
    htmlentities($postvars['emailadres']),
    $postvars['id']
)){
    die('{"error":"Prepared Statement bind failed on bind",
         "errNo":' . json_encode($conn->errno) . ',
         "mysqlError":' . json_encode($conn->error) . ',
         "status":"fail"}');
}

$stmt->execute();

if($conn->affected_rows == 0) {
    // update failed
    $stmt->close();
    die('{"error":"Prepared Statement failed on execute : no rows affected",
         "errNo":' . json_encode($conn->errno) . ',
         "mysqlError":' . json_encode($conn->error) . ',
         "status":"fail"}');
}

// update successful
$stmt->close();

die('{"data":"ok","message":"Record updated successfully","status":200}');
?>

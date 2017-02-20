<?php
//ini_set('display_errors', 1);

function died($error) {
  $json = json_encode($error);
  echo $json;
  die();
}
 
if($_SERVER['REQUEST_METHOD'] === 'POST') {

    $email_to = "jelicich.e@gmail.com";
    $email_subject = "Mensaje web";
  
    // validation
    if(!isset($_POST['name']) ||  
      !isset($_POST['email']) || 
      !isset($_POST['message'])) {
        $e = array('status' => 'fail' , 'msg' => '<p>There is a problem with your form</p>' );
        died($a);       
    }
 
    $name = $_POST['name']; 
    $email_from = $_POST['email'];  
    $message = $_POST['message']; 

    $error_message = "";
  
    if(empty($name)) {
      $error_message .= '<li>Tell me your name ;)</li>';
    }

    $email_exp = '/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/';
 
    if(!preg_match($email_exp,$email_from)) {
      $error_message .= '<li>According to my regex the email address is not valid :(</li>';
    }
 
    if(strlen($message) < 2) {
      $error_message .= '<li>The message field can\'t be empty :o</li>';
    }
 
    if(strlen($error_message) > 0) {
      
      $error = array('status' => 'fail' , 'msg' => '<div class="error-form"><p>Please, take a look to the following errors:</p><ul>' . $error_message . '</ul></div>');
      
      died($error);
    }else{
      $email_message = "Mensaje Web.\n\n";
   
      function clean_string($string) {
        $bad = array("content-type","bcc:","to:","cc:","href");
        return str_replace($bad,"",$string);
      }
   
      $email_message .= "Nombre: ".clean_string($name)."\n";
      $email_message .= "Email: ".clean_string($email_from)."\n";
      $email_message .= "Mensaje: ".clean_string($message)."\n";

      // create email headers  
      $headers = 'From: '.$email_from."\r\n".
      'Reply-To: '.$email_from."\r\n" .
      'X-Mailer: PHP/' . phpversion();
      @mail($email_to, $email_subject, $email_message, $headers);

      $ok = array('status' => 'ok', 'msg' => '<p>Thanks for your message!</p>');
      died($ok);
    }
} else {
    $e = array('status' => 'fail' , 'msg' => 'method should be post' );
    died($e);
}


 
?>
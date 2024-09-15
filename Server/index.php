<!-- show warning -->
<?php
$webAlert = json_decode(file_get_contents('Data/Alert.json'), true);
if ($webAlert) {
  $notice[] = array(
    'content' => $webAlert,
    'pref' => array(
      'type' => 'Alert'
    )
  );
}

if ($notice) {
  echo "<div class='alert-wrapper'>";
  echo "<div class='alert-container'>";
  foreach (array_reverse($notice) as $noti) {
    alert($noti["pref"]["type"], $noti["content"][$lang == 1 ? 0 : 1]);
  }
  echo "</div>";
  echo "</div>";

  // create js to move to next alert every 5 seconds or on click
  // make alert-container transform 100vw to the left
  echo "
  <script>
    const alertContainer = document.querySelector('.alert-container');
    let alertIndex = 0;
    let alertTimeout;
    const alerts = document.querySelectorAll('.alert-box');
    const alertWrapper = document.querySelector('.alert-wrapper');

    console.log(alerts);

    function nextAlert() {
      alertIndex++;
      if (alertIndex >= alerts.length) alertIndex = 0;
      alertContainer.style.transform = 'translateX(-' + alertIndex + '00vw)';
      clearTimeout(alertTimeout);
      alertTimeout = setTimeout(nextAlert, 5000);
    }

    alertTimeout = setTimeout(nextAlert, 5000);

    alertContainer.addEventListener('click', nextAlert);
  </script>
  ";

}
?>



<!-- <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3579541618707661" data-ad-slot="8668958470"
  data-ad-format="auto" data-full-width-responsive="true"></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script> -->







</html>